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
import Checkbox from '@mui/material/Checkbox';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Autocomplete from '@mui/material/Autocomplete';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import {
	HiOutlineSearch,
	HiOutlinePlus,
	HiOutlineTrash,
	HiOutlineRefresh,
	HiOutlineLink,
	HiOutlineCog,
	HiOutlineMenu,
	HiOutlineCheck
} from 'react-icons/hi';
import { enqueueSnackbar } from 'notistack';
import { getServerFile } from 'src/utils/string-utils';
import {
	useGetRelatedServicesEnrichedQuery,
	useAddRelatedServicesBatchMutation,
	useRemoveRelatedServiceMutation,
	useReorderRelatedServicesMutation,
	useLazySearchServicesForRelatedQuery,
	useSearchServicesForRelatedQuery
} from './store/relatedEntityApi';

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

function RelatedServiceCard({ service, onRemove, isRemoving, index }) {
	const logoUrl = service.logo ? getServerFile(service.logo) : null;
	const serviceName = service.name || service.relatedEntityName || `خدمت #${service.id}`;

	return (
		<motion.div
			layout
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
			transition={{ duration: 0.3, delay: index * 0.03 }}
			whileHover={{ scale: 1.02 }}
			className="relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-16 hover:border-indigo-300 dark:hover:border-indigo-500 hover:shadow-lg transition-all duration-300"
			style={{ marginBottom: '12px' }}
		>
			<div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg z-10">
				<span className="text-white text-sm font-bold">{service.displayOrder || index + 1}</span>
			</div>

			<div className="flex items-center gap-12">
				<div className="cursor-grab active:cursor-grabbing flex items-center text-gray-400 hover:text-indigo-500 transition-colors p-8 -ml-8 touch-none">
					<HiOutlineMenu size={24} />
				</div>

				<Avatar
					src={logoUrl}
					alt={serviceName}
					className="w-56 h-56 rounded-lg border-2 border-gray-100 dark:border-gray-700 flex-shrink-0"
					sx={{ bgcolor: 'rgba(99, 102, 241, 0.1)' }}
				>
					<HiOutlineCog size={28} className="text-indigo-500" />
				</Avatar>

				<div className="flex-1 min-w-0">
					<Typography variant="subtitle1" className="font-semibold text-gray-800 dark:text-gray-100 mb-4">
						{serviceName}
					</Typography>
					<div className="flex items-center gap-8 flex-wrap">
						<Chip
							size="small"
							label={`شناسه: ${service.id || service.relatedEntityIdLong}`}
							variant="outlined"
							sx={{
								borderColor: 'divider',
								fontSize: '0.7rem',
								height: 22
							}}
						/>
						{service.subCategoryName && (
							<Chip
								size="small"
								label={service.subCategoryName}
								sx={{
									bgcolor: 'rgba(99, 102, 241, 0.1)',
									color: '#6366f1',
									fontSize: '0.7rem',
									height: 22
								}}
							/>
						)}
						{service.description && (
							<Chip
								size="small"
								label={service.description.length > 30 ? `${service.description.slice(0, 30)}...` : service.description}
								sx={{
									bgcolor: 'rgba(168, 85, 247, 0.1)',
									color: '#a855f7',
									fontSize: '0.7rem',
									height: 22
								}}
							/>
						)}
					</div>
				</div>

				<Tooltip title="حذف از لیست مرتبط">
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
	sourceServiceId,
	existingRelatedIds,
	onAddSuccess
}) {
	const [searchTerm, setSearchTerm] = useState('');
	const [selectedServices, setSelectedServices] = useState([]);
	const [allServices, setAllServices] = useState([]);
	const [currentPage, setCurrentPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);
	const [isLoadingMore, setIsLoadingMore] = useState(false);
	const scrollContainerRef = useRef(null);

	const [triggerSearch, { isLoading: isSearching }] = useLazySearchServicesForRelatedQuery();
	const [addRelatedServices, { isLoading: isAdding }] = useAddRelatedServicesBatchMutation();

	const loadServices = useCallback(async (page, search = '', reset = false) => {
		setIsLoadingMore(true);
		try {
			const result = await triggerSearch({
				search,
				pageNumber: page,
				pageSize: 5
			}).unwrap();

			const filtered = (result.data || []).filter(
				(service) => service.id !== sourceServiceId && !existingRelatedIds.includes(service.id)
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
	}, [sourceServiceId, existingRelatedIds, triggerSearch]);

	useEffect(() => {
		if (open && sourceServiceId && searchTerm.trim().length > 0) {
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
	}, [searchTerm, open, sourceServiceId, loadServices]);

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

	const handleAddRelated = async () => {
		if (selectedServices.length === 0) return;

		try {
			await addRelatedServices({
				serviceId: sourceServiceId,
				relatedServiceIds: selectedServices.map((s) => s.id)
			}).unwrap();

			enqueueSnackbar(`${selectedServices.length} خدمت به لیست مرتبط اضافه شد`, {
				variant: 'success'
			});

			setSelectedServices([]);
			setSearchTerm('');
			setAllServices([]);
			onAddSuccess?.();
			onClose();
		} catch (error) {
			enqueueSnackbar('خطا در افزودن به لیست مرتبط', {
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
					<div className="p-8 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10">
						<HiOutlinePlus size={24} className="text-indigo-500" />
					</div>
					<div>
						<Typography variant="h6" className="font-semibold">افزودن خدمت مرتبط</Typography>
						<Typography variant="caption" className="text-gray-500">خدمات مرتبط را جستجو و انتخاب کنید</Typography>
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
							className="mt-12 p-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800"
						>
							<Typography variant="body2" className="text-indigo-600 dark:text-indigo-400 font-medium">
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
								{searchTerm ? 'لطفاً عبارت دیگری را امتحان کنید' : 'برای یافتن و افزودن خدمت مرتبط، نام خدمت را جستجو کنید'}
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
													border: isSelected ? '2px solid #6366f1' : '2px solid transparent',
													bgcolor: isSelected ? 'rgba(99, 102, 241, 0.04)' : 'transparent',
													'&:hover': {
														bgcolor: isSelected ? 'rgba(99, 102, 241, 0.08)' : 'action.hover'
													},
													transition: 'all 0.2s'
												}}
											>
												<Checkbox
													checked={isSelected}
													sx={{
														color: '#d1d5db',
														'&.Mui-checked': {
															color: '#6366f1'
														}
													}}
												/>
												<ListItemAvatar>
													<Avatar
														src={logoUrl}
														sx={{
															bgcolor: 'rgba(99, 102, 241, 0.1)',
															width: 48,
															height: 48
														}}
													>
														<HiOutlineCog size={24} className="text-indigo-500" />
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
																	bgcolor: 'rgba(99, 102, 241, 0.1)',
																	color: '#6366f1'
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
													<HiOutlineCheck size={24} className="text-indigo-500 flex-shrink-0" />
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
					onClick={handleAddRelated}
					disabled={selectedServices.length === 0 || isAdding}
					startIcon={isAdding ? <CircularProgress size={16} /> : <HiOutlinePlus />}
					sx={{
						background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
						'&:hover': {
							background: 'linear-gradient(135deg, #4f46e5 0%, #9333ea 100%)'
						}
					}}
				>
					افزودن {selectedServices.length > 0 && `(${selectedServices.length})`}
				</Button>
			</DialogActions>
		</Dialog>
	);
}

function ServiceRelatedSection() {
	const [sourceService, setSourceService] = useState(null);
	const [searchInput, setSearchInput] = useState('');
	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
	const [relatedServices, setRelatedServices] = useState([]);
	const [removingId, setRemovingId] = useState(null);

	const {
		data: servicesData,
		isLoading: isServicesLoading,
		isFetching: isServicesFetching
	} = useSearchServicesForRelatedQuery(
		{ search: searchInput, pageNumber: 1, pageSize: 20 },
		{ skip: searchInput.length < 2 }
	);

	const {
		data: relatedData,
		isLoading: isRelatedLoading,
		isFetching: isRelatedFetching,
		refetch: refetchRelated
	} = useGetRelatedServicesEnrichedQuery(
		sourceService?.id,
		{ skip: !sourceService?.id }
	);

	const [removeRelatedService] = useRemoveRelatedServiceMutation();
	const [reorderRelatedServices, { isLoading: isReordering }] = useReorderRelatedServicesMutation();

	const serviceOptions = servicesData?.data || [];

	useEffect(() => {
		if (relatedData) {
			setRelatedServices(relatedData);
		}
	}, [relatedData]);

	useEffect(() => {
		setRelatedServices([]);
	}, [sourceService]);

	const handleRemoveRelated = async (service) => {
		if (!sourceService?.id) return;

		setRemovingId(service.id);
		try {
			await removeRelatedService({
				serviceId: sourceService.id,
				relatedServiceId: service.id
			}).unwrap();

			enqueueSnackbar('خدمت از لیست مرتبط حذف شد', { variant: 'success' });
		} catch (error) {
			enqueueSnackbar('خطا در حذف از لیست مرتبط', { variant: 'error' });
		} finally {
			setRemovingId(null);
		}
	};

	const handleReorder = async (newOrder) => {
		const oldOrder = [...relatedServices];
		setRelatedServices(newOrder);

		if (!sourceService?.id || isReordering) return;

		try {
			await reorderRelatedServices({
				serviceId: sourceService.id,
				orderedServiceIds: newOrder.map((s) => s.id)
			}).unwrap();
		} catch (error) {
			setRelatedServices(oldOrder);
			enqueueSnackbar('خطا در تغییر ترتیب', { variant: 'error' });
		}
	};

	const existingRelatedIds = relatedServices.map((s) => s.id);
	const totalElements = relatedServices.length;

	return (
		<div className="space-y-24">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
			>
				<Typography variant="subtitle2" className="mb-8 font-semibold text-gray-700 dark:text-gray-300">
					خدمت مبدأ
				</Typography>
				<Autocomplete
					value={sourceService}
					onChange={(event, newValue) => setSourceService(newValue)}
					options={serviceOptions}
					getOptionLabel={(option) => option.name || option.title || ''}
					isOptionEqualToValue={(option, value) => option.id === value?.id}
					loading={isServicesLoading || isServicesFetching}
					noOptionsText={searchInput.length < 2 ? 'حداقل ۲ کاراکتر وارد کنید' : 'خدمتی یافت نشد'}
					loadingText="در حال جستجو..."
					filterOptions={(x) => x}
					onInputChange={(event, value) => setSearchInput(value)}
					PaperComponent={StyledPaper}
					renderInput={(params) => (
						<TextField
							{...params}
							placeholder="جستجو و انتخاب خدمت..."
							InputProps={{
								...params.InputProps,
								startAdornment: (
									<InputAdornment position="start">
										<HiOutlineCog size={20} className="text-gray-400" />
									</InputAdornment>
								),
								endAdornment: (
									<>
										{(isServicesLoading || isServicesFetching) ? <CircularProgress color="inherit" size={20} /> : null}
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
								<Avatar
									src={option.logo ? getServerFile(option.logo) : undefined}
									sx={{
										width: 40,
										height: 40,
										bgcolor: 'rgba(99, 102, 241, 0.1)'
									}}
								>
									<HiOutlineCog size={20} className="text-indigo-500" />
								</Avatar>
								<div className="flex-1 min-w-0">
									<Typography variant="body1" className="font-medium truncate">
										{option.name || option.title}
									</Typography>
									{option.subCategoryName && (
										<Typography variant="caption" className="text-gray-500 truncate block">
											{option.subCategoryName}
										</Typography>
									)}
								</div>
								<Chip
									label={`#${option.id}`}
									size="small"
									sx={{
										height: 20,
										fontSize: '0.65rem',
										bgcolor: 'rgba(99, 102, 241, 0.1)',
										color: '#6366f1'
									}}
								/>
							</div>
						</Box>
					)}
				/>
			</motion.div>

			{sourceService && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					className="flex flex-wrap items-center justify-between gap-12 p-16 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700"
				>
					<div className="flex items-center gap-12">
						<HiOutlineLink size={20} className="text-indigo-500" />
						<Typography variant="body2" className="text-gray-600 dark:text-gray-400">
							{totalElements} خدمت مرتبط با "{sourceService.name || sourceService.title}"
						</Typography>
					</div>

					<div className="flex items-center gap-8">
						<Tooltip title="بازخوانی لیست">
							<IconButton
								onClick={() => refetchRelated()}
								disabled={isRelatedFetching}
								className="text-gray-500 hover:text-indigo-500"
							>
								<HiOutlineRefresh size={20} className={isRelatedFetching ? 'animate-spin' : ''} />
							</IconButton>
						</Tooltip>

						<Button
							variant="contained"
							startIcon={<HiOutlinePlus />}
							onClick={() => setIsAddDialogOpen(true)}
							sx={{
								background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
								'&:hover': {
									background: 'linear-gradient(135deg, #4f46e5 0%, #9333ea 100%)'
								}
							}}
						>
							افزودن خدمت مرتبط
						</Button>
					</div>
				</motion.div>
			)}

			{!sourceService ? (
				<Alert
					severity="info"
					className="rounded-xl"
					sx={{
						bgcolor: 'background.paper',
						border: '1px solid',
						borderColor: 'info.light',
					}}
				>
					<Typography>لطفاً یک خدمت را جستجو و انتخاب کنید تا خدمات مرتبط با آن نمایش داده شوند.</Typography>
				</Alert>
			) : isRelatedLoading ? (
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
			) : relatedServices.length === 0 ? (
				<motion.div
					initial={{ opacity: 0, scale: 0.9 }}
					animate={{ opacity: 1, scale: 1 }}
					className="text-center py-48"
				>
					<div className="w-80 h-80 mx-auto mb-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
						<HiOutlineLink size={40} className="text-gray-300 dark:text-gray-600" />
					</div>
					<Typography variant="h6" className="text-gray-500 mb-8">
						هنوز خدمت مرتبطی اضافه نشده است
					</Typography>
					<Typography variant="body2" className="text-gray-400 mb-24">
						با کلیک روی دکمه زیر، خدمات مرتبط را اضافه کنید
					</Typography>
					<Button
						variant="outlined"
						startIcon={<HiOutlinePlus />}
						onClick={() => setIsAddDialogOpen(true)}
						sx={{
							borderColor: '#6366f1',
							color: '#6366f1',
							'&:hover': {
								borderColor: '#4f46e5',
								bgcolor: 'rgba(99, 102, 241, 0.04)'
							}
						}}
					>
						افزودن اولین خدمت مرتبط
					</Button>
				</motion.div>
			) : (
				<Reorder.Group
					axis="y"
					values={relatedServices}
					onReorder={handleReorder}
					className="space-y-0"
					style={{ listStyle: 'none', padding: 0, margin: 0 }}
				>
					<AnimatePresence mode="popLayout">
						{relatedServices.map((service, index) => (
							<Reorder.Item
								key={service.id}
								value={service}
								style={{
									zIndex: relatedServices.length - index,
									position: 'relative'
								}}
							>
								<RelatedServiceCard
									service={service}
									index={index}
									onRemove={handleRemoveRelated}
									isRemoving={removingId === service.id}
								/>
							</Reorder.Item>
						))}
					</AnimatePresence>
				</Reorder.Group>
			)}

			<AddServicesDialog
				open={isAddDialogOpen}
				onClose={() => setIsAddDialogOpen(false)}
				sourceServiceId={sourceService?.id}
				existingRelatedIds={existingRelatedIds}
				onAddSuccess={() => refetchRelated()}
			/>
		</div>
	);
}

export default ServiceRelatedSection;
