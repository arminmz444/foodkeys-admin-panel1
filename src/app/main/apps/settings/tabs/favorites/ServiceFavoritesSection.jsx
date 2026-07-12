import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Skeleton from '@mui/material/Skeleton';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';
import Pagination from '@mui/material/Pagination';
import Checkbox from '@mui/material/Checkbox';
import List from '@mui/material/List';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';
import Autocomplete from '@mui/material/Autocomplete';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import {
	HiOutlineSearch,
	HiOutlinePlus,
	HiOutlineTrash,
	HiOutlineRefresh,
	HiOutlineStar,
	HiOutlineCog,
	HiOutlineMenu,
	HiOutlineCheck,
	HiOutlineHeart,
	HiOutlineFolder
} from 'react-icons/hi';
import { enqueueSnackbar } from 'notistack';
import { useGetBundleSubCategoriesQuery } from '../bundles/store/bundleApi';
import { useGetCategoryOptionsQuery } from 'src/app/main/category/CategoriesApi';
import { getServerFile } from 'src/utils/string-utils';
import {
	useGetFavoriteServicesQuery,
	useAddBatchServiceFavoritesMutation,
	useRemoveServiceFavoriteMutation,
	useReorderServiceFavoritesMutation,
	useLazySearchServicesQuery
} from './store/favoritesApi';

const StyledPaper = (props) => (
	<Paper
		{...props}
		elevation={8}
		sx={{
			borderRadius: 2,
			mt: 1,
			maxHeight: 300,
			overflow: 'auto',
			bgcolor: 'background.paper',
			border: '1px solid',
			borderColor: 'divider',
			'& .MuiAutocomplete-listbox': {
				p: 1,
			},
			'& .MuiAutocomplete-option': {
				borderRadius: 1,
				m: 0.5,
				'&[aria-selected="true"]': {
					bgcolor: 'primary.lighter',
				},
				'&.Mui-focused': {
					bgcolor: 'action.hover',
				}
			}
		}}
	/>
);

const serviceStatusLabels = {
	0: 'در انتظار تایید',
	1: 'تایید شده',
	2: 'رد شده',
	3: 'آرشیو شده',
	4: 'حذف شده',
	5: 'ویرایش شده',
	6: 'منتشر شده',
	7: 'بازبینی',
	8: 'ثبت اولیه'
};

function FavoriteServiceCard({ service, onRemove, isRemoving, index }) {
	const logoUrl = service.entityLogo ? getServerFile(service.entityLogo) : null;
	const serviceName = service.entityName || `خدمت #${service.entityId}`;

	return (
		<motion.div
			layout
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
			transition={{ duration: 0.3, delay: index * 0.03 }}
			whileHover={{ scale: 1.02 }}
			className="relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-16 hover:border-rose-300 dark:hover:border-rose-500 hover:shadow-lg transition-all duration-300"
			style={{ marginBottom: '12px' }}
		>
			<div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg z-10">
				<span className="text-white text-sm font-bold">{service.displayOrder || index + 1}</span>
			</div>

			<div className="flex items-center gap-12">
				<div className="cursor-grab active:cursor-grabbing flex items-center text-gray-400 hover:text-rose-500 transition-colors p-8 -ml-8 touch-none">
					<HiOutlineMenu size={24} />
				</div>

				<Avatar
					src={logoUrl}
					alt={serviceName}
					className="w-56 h-56 rounded-lg border-2 border-gray-100 dark:border-gray-700 flex-shrink-0"
					sx={{ bgcolor: 'rgba(244, 63, 94, 0.1)' }}
				>
					<HiOutlineCog size={28} className="text-rose-500" />
				</Avatar>

				<div className="flex-1 min-w-0">
					<Typography variant="subtitle1" className="font-semibold text-gray-800 dark:text-gray-100 mb-4">
						{serviceName}
					</Typography>
					<div className="flex items-center gap-8 flex-wrap">
						<Chip
							size="small"
							label={`شناسه: ${service.entityId}`}
							variant="outlined"
							sx={{
								borderColor: 'divider',
								fontSize: '0.7rem',
								height: 22
							}}
						/>
						{service.displayOrder && (
							<Chip
								size="small"
								label={`ترتیب: ${service.displayOrder}`}
								sx={{
									bgcolor: 'rgba(244, 63, 94, 0.1)',
									color: '#f43f5e',
									fontSize: '0.7rem',
									height: 22
								}}
							/>
						)}
					</div>
				</div>

				<Tooltip title="حذف از علاقه‌مندی‌ها">
					<IconButton
						size="small"
						onClick={(e) => {
							e.stopPropagation();
							onRemove(service);
						}}
						disabled={isRemoving}
						className="text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all flex-shrink-0"
					>
						{isRemoving ? (
							<CircularProgress size={18} />
						) : (
							<HiOutlineTrash size={20} />
						)}
					</IconButton>
				</Tooltip>
			</div>
		</motion.div>
	);
}

function AddServicesDialog({
	open,
	onClose,
	subCategoryId,
	existingFavoriteIds,
	onAddSuccess
}) {
	const [searchTerm, setSearchTerm] = useState('');
	const [selectedServices, setSelectedServices] = useState([]);
	const [allServices, setAllServices] = useState([]);
	const [currentPage, setCurrentPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);
	const [isLoadingMore, setIsLoadingMore] = useState(false);
	const scrollContainerRef = useRef(null);

	const [triggerSearch, { isLoading: isSearching }] = useLazySearchServicesQuery();
	const [addBatchFavorites, { isLoading: isAdding }] = useAddBatchServiceFavoritesMutation();

	const loadServices = useCallback(async (page, search = '', reset = false) => {
		if (!subCategoryId) return;

		setIsLoadingMore(true);
		try {
			const result = await triggerSearch({
				subCategoryId,
				search,
				pageNumber: page,
				pageSize: 5
			}).unwrap();

			const filtered = (result.data || []).filter(
				(service) => !existingFavoriteIds.includes(service.id)
			);

			if (reset) {
				setAllServices(filtered);
			} else {
				setAllServices((prev) => [...prev, ...filtered]);
			}

			const totalPages = result.totalPages || 1;
			setHasMore(page < totalPages);
		} catch (error) {
			console.error('Search error:', error);
		} finally {
			setIsLoadingMore(false);
		}
	}, [subCategoryId, existingFavoriteIds, triggerSearch]);

	useEffect(() => {
		if (open && subCategoryId && searchTerm.trim().length > 0) {
			const timer = setTimeout(() => {
				setCurrentPage(1);
				setAllServices([]);
				loadServices(1, searchTerm, true);
			}, 300);
			return () => clearTimeout(timer);
		} else if (open && searchTerm.trim().length === 0) {
			setAllServices([]);
			setCurrentPage(1);
			setHasMore(true);
		}
	}, [searchTerm, open, subCategoryId, loadServices]);

	const handleScroll = useCallback((e) => {
		const bottom = e.target.scrollHeight - e.target.scrollTop <= e.target.clientHeight + 50;

		if (bottom && hasMore && !isLoadingMore && !isSearching) {
			const nextPage = currentPage + 1;
			setCurrentPage(nextPage);
			loadServices(nextPage, searchTerm, false);
		}
	}, [hasMore, isLoadingMore, isSearching, currentPage, searchTerm, loadServices]);

	const toggleServiceSelection = (service) => {
		setSelectedServices((prev) => {
			const isSelected = prev.some((s) => s.id === service.id);
			if (isSelected) {
				return prev.filter((s) => s.id !== service.id);
			}
			return [...prev, service];
		});
	};

	const handleAddFavorites = async () => {
		if (selectedServices.length === 0) return;

		try {
			await addBatchFavorites({
				subCategoryId,
				serviceIds: selectedServices.map((s) => s.id)
			}).unwrap();

			enqueueSnackbar(`${selectedServices.length} خدمت به علاقه‌مندی‌ها اضافه شد`, {
				variant: 'success'
			});

			setSelectedServices([]);
			setSearchTerm('');
			setAllServices([]);
			onAddSuccess?.();
			onClose();
		} catch (error) {
			enqueueSnackbar('خطا در افزودن به علاقه‌مندی‌ها', {
				variant: 'error'
			});
		}
	};

	const handleClose = () => {
		setSelectedServices([]);
		setSearchTerm('');
		setAllServices([]);
		setCurrentPage(1);
		setHasMore(true);
		onClose();
	};

	return (
		<Dialog
			open={open}
			onClose={handleClose}
			maxWidth="md"
			fullWidth
			PaperProps={{
				sx: {
					borderRadius: 3,
					minHeight: 600
				}
			}}
		>
			<DialogTitle className="border-b" sx={{ pb: 2 }}>
				<div className="flex items-center gap-12">
					<div className="p-8 rounded-xl bg-gradient-to-br from-rose-500/10 to-pink-500/10">
						<HiOutlinePlus size={24} className="text-rose-500" />
					</div>
					<div>
						<Typography variant="h6" className="font-semibold">افزودن خدمت به علاقه‌مندی‌ها</Typography>
						<Typography variant="caption" className="text-gray-500">خدمات مورد نظر را جستجو و انتخاب کنید</Typography>
					</div>
				</div>
			</DialogTitle>

			<DialogContent className="p-0">
				<div className="p-16 border-b sticky top-0 bg-white dark:bg-gray-800 z-10">
					<TextField
						fullWidth
						placeholder="جستجوی خدمت..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						InputProps={{
							startAdornment: (
								<InputAdornment position="start">
									<HiOutlineSearch size={20} className="text-gray-400" />
								</InputAdornment>
							),
							endAdornment: isSearching && currentPage === 1 && (
								<InputAdornment position="end">
									<CircularProgress size={20} />
								</InputAdornment>
							)
						}}
						sx={{
							'& .MuiOutlinedInput-root': {
								borderRadius: 2
							}
						}}
					/>

					{selectedServices.length > 0 && (
						<motion.div
							initial={{ opacity: 0, y: -10 }}
							animate={{ opacity: 1, y: 0 }}
							className="mt-12 p-12 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800"
						>
							<Typography variant="body2" className="text-rose-600 dark:text-rose-400 font-medium">
								{selectedServices.length} خدمت انتخاب شده
							</Typography>
						</motion.div>
					)}
				</div>

				<div
					ref={scrollContainerRef}
					onScroll={handleScroll}
					className="overflow-y-auto"
					style={{ maxHeight: 400, minHeight: 300 }}
				>
					{allServices.length === 0 && !isSearching ? (
						<Box className="text-center py-48">
							<HiOutlineSearch size={48} className="mx-auto mb-8 opacity-30" />
							<Typography variant="h6" className="font-semibold mb-8">
								{searchTerm ? 'خدمتی یافت نشد' : 'جستجوی خدمت'}
							</Typography>
							<Typography variant="body2" className="text-gray-500">
								{searchTerm ? 'لطفاً عبارت دیگری را امتحان کنید' : 'برای یافتن و افزودن خدمت به علاقه‌مندی‌ها، نام خدمت را جستجو کنید'}
							</Typography>
						</Box>
					) : (
						<List sx={{ p: 2 }}>
							<AnimatePresence>
								{allServices.map((service, index) => {
									const isSelected = selectedServices.some((s) => s.id === service.id);
									const logoUrl = service.logo ? getServerFile(service.logo) : null;

									return (
										<motion.div
											key={service.id}
											initial={{ opacity: 0, x: -20 }}
											animate={{ opacity: 1, x: 0 }}
											exit={{ opacity: 0, x: 20 }}
											transition={{ delay: index * 0.02 }}
										>
											<ListItemButton
												onClick={() => toggleServiceSelection(service)}
												selected={isSelected}
												sx={{
													borderRadius: 2,
													mb: 1,
													border: isSelected ? '2px solid #f43f5e' : '2px solid transparent',
													bgcolor: isSelected ? 'rgba(244, 63, 94, 0.04)' : 'transparent',
													'&:hover': {
														bgcolor: isSelected ? 'rgba(244, 63, 94, 0.08)' : 'action.hover'
													},
													transition: 'all 0.2s'
												}}
											>
												<Checkbox
													checked={isSelected}
													sx={{
														color: '#d1d5db',
														'&.Mui-checked': {
															color: '#f43f5e'
														}
													}}
												/>
												<ListItemAvatar>
													<Avatar
														src={logoUrl}
														sx={{
															bgcolor: 'rgba(244, 63, 94, 0.1)',
															width: 48,
															height: 48
														}}
													>
														<HiOutlineCog size={24} className="text-rose-500" />
													</Avatar>
												</ListItemAvatar>
												<ListItemText
													primary={
														<div className="flex items-center gap-8 mb-4">
															<Typography variant="subtitle2" className="font-semibold">
																{service.name || service.title}
															</Typography>
															<Chip
																label={`#${service.id}`}
																size="small"
																sx={{
																	height: 20,
																	fontSize: '0.65rem',
																	bgcolor: 'rgba(244, 63, 94, 0.1)',
																	color: '#f43f5e'
																}}
															/>
														</div>
													}
													secondary={
														<div className="flex flex-col gap-4">
															{service.subCategoryName && (
																<Typography variant="caption" className="text-gray-500">
																	{service.subCategoryName}
																</Typography>
															)}
															{service.description && (
																<Typography variant="caption" className="text-gray-600 dark:text-gray-400 line-clamp-1">
																	{service.description}
																</Typography>
															)}
															{service.status !== undefined && (
																<Chip
																	label={serviceStatusLabels[service.status] || 'نامشخص'}
																	size="small"
																	color={
																		service.status === 6 ? 'success' :
																		service.status === 1 ? 'info' :
																		service.status === 0 ? 'warning' :
																		'default'
																	}
																	sx={{
																		height: 18,
																		fontSize: '0.65rem',
																		width: 'fit-content'
																	}}
																/>
															)}
														</div>
													}
												/>
												{isSelected && (
													<HiOutlineCheck size={24} className="text-rose-500 flex-shrink-0" />
												)}
											</ListItemButton>
											{index < allServices.length - 1 && <Divider sx={{ my: 0.5 }} />}
										</motion.div>
									);
								})}
							</AnimatePresence>

							{isLoadingMore && (
								<Box className="flex justify-center py-16">
									<CircularProgress size={24} />
								</Box>
							)}

							{!hasMore && allServices.length > 0 && (
								<Typography
									variant="caption"
									className="text-center block py-16 text-gray-500"
								>
									همه خدمات نمایش داده شدند
								</Typography>
							)}
						</List>
					)}
				</div>
			</DialogContent>

			<DialogActions className="p-16 border-t">
				<Button onClick={handleClose} color="inherit">
					انصراف
				</Button>
				<Button
					variant="contained"
					onClick={handleAddFavorites}
					disabled={selectedServices.length === 0 || isAdding}
					startIcon={isAdding ? <CircularProgress size={16} /> : <HiOutlinePlus />}
					sx={{
						background: 'linear-gradient(135deg, #f43f5e 0%, #ec4899 100%)',
						'&:hover': {
							background: 'linear-gradient(135deg, #e11d48 0%, #db2777 100%)'
						}
					}}
				>
					افزودن {selectedServices.length > 0 && `(${selectedServices.length})`}
				</Button>
			</DialogActions>
		</Dialog>
	);
}

function ServiceFavoritesSection() {
	const [category, setCategory] = useState(null);
	const [subCategory, setSubCategory] = useState(null);
	const [pagination, setPagination] = useState({ pageNumber: 1, pageSize: 12 });
	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
	const [favorites, setFavorites] = useState([]);
	const [removingId, setRemovingId] = useState(null);

	const {
		data: categoriesData,
		isLoading: isCategoriesLoading
	} = useGetCategoryOptionsQuery({
		pageNumber: 1,
		pageSize: 50
	});

	const {
		data: subCategoriesData,
		isLoading: isSubCategoriesLoading,
		isFetching: isSubCategoriesFetching
	} = useGetBundleSubCategoriesQuery(
		{ categoryId: category?.value, pageNumber: 1, pageSize: 50 },
		{ skip: !category?.value }
	);

	const {
		data: favoritesData,
		isLoading: isFavoritesLoading,
		isFetching: isFavoritesFetching,
		refetch: refetchFavorites
	} = useGetFavoriteServicesQuery(
		{ subCategoryId: subCategory?.subCategoryId, pageNumber: pagination.pageNumber, pageSize: pagination.pageSize },
		{ skip: !subCategory?.subCategoryId }
	);

	const [removeServiceFavorite] = useRemoveServiceFavoriteMutation();
	const [reorderFavorites, { isLoading: isReordering }] = useReorderServiceFavoritesMutation();

	const categoryOptions = (categoriesData?.data || []).filter(c => c.value !== 1 && c.value !== 2);;
	const subCategoryOptions = subCategoriesData?.data || [];

	useEffect(() => {
		if (favoritesData?.data) {
			setFavorites(favoritesData.data);
		}
	}, [favoritesData]);

	useEffect(() => {
		setSubCategory(null);
		setFavorites([]);
	}, [category]);

	const handleRemoveFavorite = async (service) => {
		if (!subCategory?.subCategoryId) return;

		setRemovingId(service.entityId);
		try {
			await removeServiceFavorite({
				serviceId: service.entityId,
				subCategoryId: subCategory.subCategoryId
			}).unwrap();

			enqueueSnackbar('خدمت از علاقه‌مندی‌ها حذف شد', { variant: 'success' });
		} catch (error) {
			enqueueSnackbar('خطا در حذف از علاقه‌مندی‌ها', { variant: 'error' });
		} finally {
			setRemovingId(null);
		}
	};

	const handleReorder = async (newOrder) => {
		const oldOrder = [...favorites];
		setFavorites(newOrder);

		if (!subCategory?.subCategoryId || isReordering) return;

		try {
			await reorderFavorites({
				subCategoryId: subCategory.subCategoryId,
				serviceIds: newOrder.map((f) => f.entityId)
			}).unwrap();
		} catch (error) {
			setFavorites(oldOrder);
			enqueueSnackbar('خطا در تغییر ترتیب', { variant: 'error' });
		}
	};

	const handlePageChange = (event, value) => {
		setPagination((prev) => ({ ...prev, pageNumber: value }));
	};

	const existingFavoriteIds = favorites.map((f) => f.entityId);
	const totalPages = favoritesData?.totalPages || 1;
	const totalElements = favoritesData?.totalElements || 0;

	return (
		<div className="space-y-24">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className="grid grid-cols-1 md:grid-cols-2 gap-16"
			>
				<div>
					<Typography variant="subtitle2" className="mb-8 font-semibold text-gray-700 dark:text-gray-300">
						دسته‌بندی
					</Typography>
					<Autocomplete
						value={category}
						onChange={(event, newValue) => setCategory(newValue)}
						options={categoryOptions}
						getOptionLabel={(option) => option.label || option.title || ''}
						isOptionEqualToValue={(option, value) => option.value === value?.value}
						loading={isCategoriesLoading}
						noOptionsText="دسته‌بندی یافت نشد"
						loadingText="در حال بارگذاری..."
						PaperComponent={StyledPaper}
						renderInput={(params) => (
							<TextField
								{...params}
								placeholder="انتخاب دسته‌بندی..."
								InputProps={{
									...params.InputProps,
									startAdornment: (
										<InputAdornment position="start">
											<HiOutlineFolder size={20} className="text-gray-400" />
										</InputAdornment>
									),
									endAdornment: (
										<>
											{isCategoriesLoading ? <CircularProgress color="inherit" size={20} /> : null}
											{params.InputProps.endAdornment}
										</>
									),
								}}
								sx={{
									'& .MuiOutlinedInput-root': {
										borderRadius: 2,
										bgcolor: 'background.paper',
										'&:hover .MuiOutlinedInput-notchedOutline': {
											borderColor: 'primary.main',
										},
										'&.Mui-focused .MuiOutlinedInput-notchedOutline': {
											borderColor: 'primary.main',
										}
									}
								}}
							/>
						)}
						renderOption={(props, option) => (
							<Box component="li" {...props} sx={{ py: 1.5, px: 2 }}>
								<div className="flex items-center gap-12">
									<div className="w-40 h-40 rounded-lg bg-gradient-to-br from-rose-100 to-pink-100 dark:from-rose-900/30 dark:to-pink-900/30 flex items-center justify-center">
										<HiOutlineFolder size={20} className="text-rose-500" />
									</div>
									<div>
										<Typography variant="body1" className="font-medium">
											{option.label || option.title}
										</Typography>
										{option.description && (
											<Typography variant="caption" className="text-gray-500">
												{option.description}
											</Typography>
										)}
									</div>
								</div>
							</Box>
						)}
					/>
				</div>

				<div>
					<Typography variant="subtitle2" className="mb-8 font-semibold text-gray-700 dark:text-gray-300">
						زیرمجموعه
					</Typography>
					<Autocomplete
						value={subCategory}
						onChange={(event, newValue) => setSubCategory(newValue)}
						options={subCategoryOptions}
						getOptionLabel={(option) => option.title || option.subCategoryName || ''}
						isOptionEqualToValue={(option, value) => option.subCategoryId === value?.subCategoryId}
						loading={isSubCategoriesLoading || isSubCategoriesFetching}
						disabled={!category}
						noOptionsText={category ? 'زیرمجموعه یافت نشد' : 'ابتدا دسته‌بندی را انتخاب کنید'}
						loadingText="در حال بارگذاری..."
						PaperComponent={StyledPaper}
						renderInput={(params) => (
							<TextField
								{...params}
								placeholder={category ? 'انتخاب زیرمجموعه...' : 'ابتدا دسته‌بندی را انتخاب کنید'}
								InputProps={{
									...params.InputProps,
									startAdornment: (
										<InputAdornment position="start">
											<HiOutlineCog size={20} className="text-gray-400" />
										</InputAdornment>
									),
									endAdornment: (
										<>
											{(isSubCategoriesLoading || isSubCategoriesFetching) ? <CircularProgress color="inherit" size={20} /> : null}
											{params.InputProps.endAdornment}
										</>
									),
								}}
								sx={{
									'& .MuiOutlinedInput-root': {
										borderRadius: 2,
										bgcolor: 'background.paper',
										'&:hover .MuiOutlinedInput-notchedOutline': {
											borderColor: 'primary.main',
										},
										'&.Mui-focused .MuiOutlinedInput-notchedOutline': {
											borderColor: 'primary.main',
										}
									}
								}}
							/>
						)}
						renderOption={(props, option) => (
							<Box component="li" {...props} sx={{ py: 1.5, px: 2 }}>
								<div className="flex items-center gap-12 w-full">
									<div className="w-40 h-40 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center flex-shrink-0">
										<HiOutlineCog size={20} className="text-blue-500" />
									</div>
									<div className="flex-1 min-w-0">
										<Typography variant="body2" className="font-medium truncate">
											{option.title || option.subCategoryName}
										</Typography>
									</div>
								</div>
							</Box>
						)}
					/>
				</div>
			</motion.div>

			{subCategory && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					className="flex flex-wrap items-center justify-between gap-12 p-16 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700"
				>
					<div className="flex items-center gap-12">
						<HiOutlineStar size={20} className="text-amber-500" />
						<Typography variant="body2" className="text-gray-600 dark:text-gray-400">
							{totalElements} خدمت در علاقه‌مندی‌ها
						</Typography>
					</div>

					<div className="flex items-center gap-8">
						<Tooltip title="بازخوانی لیست">
							<IconButton
								onClick={() => refetchFavorites()}
								disabled={isFavoritesFetching}
								className="text-gray-500 hover:text-rose-500"
							>
								<HiOutlineRefresh size={20} className={isFavoritesFetching ? 'animate-spin' : ''} />
							</IconButton>
						</Tooltip>

						<Button
							variant="contained"
							startIcon={<HiOutlinePlus />}
							onClick={() => setIsAddDialogOpen(true)}
							sx={{
								background: 'linear-gradient(135deg, #f43f5e 0%, #ec4899 100%)',
								'&:hover': {
									background: 'linear-gradient(135deg, #e11d48 0%, #db2777 100%)'
								}
							}}
						>
							افزودن خدمت
						</Button>
					</div>
				</motion.div>
			)}

			{!subCategory ? (
				<Alert
					severity="info"
					className="rounded-xl"
					sx={{
						bgcolor: 'background.paper',
						border: '1px solid',
						borderColor: 'info.light',
					}}
				>
					<Typography>لطفاً یک دسته‌بندی و زیرمجموعه انتخاب کنید تا خدمات منتخب نمایش داده شوند.</Typography>
				</Alert>
			) : isFavoritesLoading ? (
				<div className="space-y-12">
					{[...Array(6)].map((_, i) => (
						<Skeleton
							key={i}
							variant="rounded"
							height={88}
							className="rounded-xl"
							animation="wave"
						/>
					))}
				</div>
			) : favorites.length === 0 ? (
				<motion.div
					initial={{ opacity: 0, scale: 0.9 }}
					animate={{ opacity: 1, scale: 1 }}
					className="text-center py-48"
				>
					<div className="w-80 h-80 mx-auto mb-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
						<HiOutlineHeart size={40} className="text-gray-300 dark:text-gray-600" />
					</div>
					<Typography variant="h6" className="text-gray-500 mb-8">
						هنوز خدمتی به علاقه‌مندی‌ها اضافه نشده است
					</Typography>
					<Typography variant="body2" className="text-gray-400 mb-24">
						با کلیک روی دکمه زیر، خدمات مورد نظر خود را اضافه کنید
					</Typography>
					<Button
						variant="outlined"
						startIcon={<HiOutlinePlus />}
						onClick={() => setIsAddDialogOpen(true)}
						sx={{
							borderColor: '#f43f5e',
							color: '#f43f5e',
							'&:hover': {
								borderColor: '#e11d48',
								bgcolor: 'rgba(244, 63, 94, 0.04)'
							}
						}}
					>
						افزودن اولین خدمت
					</Button>
				</motion.div>
			) : (
				<>
					<Reorder.Group
						axis="y"
						values={favorites}
						onReorder={handleReorder}
						className="space-y-0"
						style={{ listStyle: 'none', padding: 0, margin: 0 }}
					>
						<AnimatePresence mode="popLayout">
							{favorites.map((service, index) => (
								<Reorder.Item
									key={service.id || service.entityId}
									value={service}
									style={{
										zIndex: favorites.length - index,
										position: 'relative'
									}}
								>
									<FavoriteServiceCard
										service={service}
										index={index}
										onRemove={handleRemoveFavorite}
										isRemoving={removingId === service.entityId}
									/>
								</Reorder.Item>
							))}
						</AnimatePresence>
					</Reorder.Group>

					{totalPages > 1 && (
						<Box className="flex justify-center mt-24">
							<Pagination
								count={totalPages}
								page={pagination.pageNumber}
								onChange={handlePageChange}
								color="primary"
								shape="rounded"
								sx={{
									'& .MuiPaginationItem-root': {
										'&.Mui-selected': {
											background: 'linear-gradient(135deg, #f43f5e 0%, #ec4899 100%)',
											color: 'white'
										}
									}
								}}
							/>
						</Box>
					)}
				</>
			)}

			<AddServicesDialog
				open={isAddDialogOpen}
				onClose={() => setIsAddDialogOpen(false)}
				subCategoryId={subCategory?.subCategoryId}
				existingFavoriteIds={existingFavoriteIds}
				onAddSuccess={() => refetchFavorites()}
			/>
		</div>
	);
}

export default ServiceFavoritesSection;
