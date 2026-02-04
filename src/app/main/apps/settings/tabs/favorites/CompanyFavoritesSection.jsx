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
	HiOutlineOfficeBuilding,
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
	useGetFavoriteCompaniesQuery,
	useAddBatchCompanyFavoritesMutation,
	useRemoveCompanyFavoriteMutation,
	useReorderCompanyFavoritesMutation,
	useLazySearchCompaniesQuery
} from './store/favoritesApi';

// Custom styled Paper for dropdowns
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

// Favorite Company Card Component with improved drag handle
function FavoriteCompanyCard({ company, onRemove, isRemoving, index }) {
	// Use entityLogo and entityName from the API response
	const logoUrl = company.entityLogo ? getServerFile(company.entityLogo) : null;
	const companyName = company.entityName || `شرکت #${company.entityId}`;
	
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
			{/* Order Badge */}
			<div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg z-10">
				<span className="text-white text-sm font-bold">{company.displayOrder || index + 1}</span>
			</div>

			<div className="flex items-center gap-12">
				{/* Drag Handle */}
				<div className="cursor-grab active:cursor-grabbing flex items-center text-gray-400 hover:text-rose-500 transition-colors p-8 -ml-8 touch-none">
					<HiOutlineMenu size={24} />
				</div>

				{/* Company Logo */}
				<Avatar
					src={logoUrl}
					alt={companyName}
					className="w-56 h-56 rounded-lg border-2 border-gray-100 dark:border-gray-700 flex-shrink-0"
					sx={{ bgcolor: 'rgba(244, 63, 94, 0.1)' }}
				>
					<HiOutlineOfficeBuilding size={28} className="text-rose-500" />
				</Avatar>

				{/* Company Info */}
				<div className="flex-1 min-w-0">
					<Typography variant="subtitle1" className="font-semibold text-gray-800 dark:text-gray-100 mb-4">
						{companyName}
					</Typography>
					<div className="flex items-center gap-8 flex-wrap">
						<Chip 
							size="small" 
							label={`شناسه: ${company.entityId}`}
							variant="outlined"
							sx={{ 
								borderColor: 'divider',
								fontSize: '0.7rem',
								height: 22
							}}
						/>
						{company.displayOrder && (
							<Chip 
								size="small" 
								label={`ترتیب: ${company.displayOrder}`}
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

				{/* Remove Button */}
				<Tooltip title="حذف از علاقه‌مندی‌ها">
					<IconButton
						size="small"
						onClick={(e) => {
							e.stopPropagation();
							onRemove(company);
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

// Add Companies Dialog Component with infinite scroll
function AddCompaniesDialog({ 
	open, 
	onClose, 
	subCategoryId, 
	existingFavoriteIds,
	onAddSuccess 
}) {
	const [searchTerm, setSearchTerm] = useState('');
	const [selectedCompanies, setSelectedCompanies] = useState([]);
	const [allCompanies, setAllCompanies] = useState([]);
	const [currentPage, setCurrentPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);
	const [isLoadingMore, setIsLoadingMore] = useState(false);
	const scrollContainerRef = useRef(null);

	const [triggerSearch, { isLoading: isSearching }] = useLazySearchCompaniesQuery();
	const [addBatchFavorites, { isLoading: isAdding }] = useAddBatchCompanyFavoritesMutation();

	// Load companies
	const loadCompanies = useCallback(async (page, search = '', reset = false) => {
		if (!subCategoryId) return;
		
		setIsLoadingMore(true);
		try {
			const result = await triggerSearch({
				subCategoryId,
				search: search,
				pageNumber: page,
				pageSize: 5
			}).unwrap();
			
			const filtered = (result.data || []).filter(
				company => !existingFavoriteIds.includes(company.id)
			);
			
			if (reset) {
				setAllCompanies(filtered);
			} else {
				setAllCompanies(prev => [...prev, ...filtered]);
			}
			
			// Check if there are more pages
			const totalPages = result.totalPages || 1;
			setHasMore(page < totalPages);
		} catch (error) {
			console.error('Search error:', error);
		} finally {
			setIsLoadingMore(false);
		}
	}, [subCategoryId, existingFavoriteIds, triggerSearch]);

	// Initial load and search change
	useEffect(() => {
		if (open && subCategoryId) {
			const timer = setTimeout(() => {
				setCurrentPage(1);
				setAllCompanies([]);
				loadCompanies(1, searchTerm, true);
			}, 300);
			return () => clearTimeout(timer);
		}
	}, [searchTerm, open, subCategoryId, loadCompanies]);

	// Scroll handler for infinite scroll
	const handleScroll = useCallback((e) => {
		const bottom = e.target.scrollHeight - e.target.scrollTop <= e.target.clientHeight + 50;
		
		if (bottom && hasMore && !isLoadingMore && !isSearching) {
			const nextPage = currentPage + 1;
			setCurrentPage(nextPage);
			loadCompanies(nextPage, searchTerm, false);
		}
	}, [hasMore, isLoadingMore, isSearching, currentPage, searchTerm, loadCompanies]);

	// Toggle company selection
	const toggleCompanySelection = (company) => {
		setSelectedCompanies(prev => {
			const isSelected = prev.some(c => c.id === company.id);
			if (isSelected) {
				return prev.filter(c => c.id !== company.id);
			}
			return [...prev, company];
		});
	};

	// Add selected companies as favorites
	const handleAddFavorites = async () => {
		if (selectedCompanies.length === 0) return;

		try {
			await addBatchFavorites({
				subCategoryId,
				companyIds: selectedCompanies.map(c => c.id)
			}).unwrap();
			
			enqueueSnackbar(`${selectedCompanies.length} شرکت به علاقه‌مندی‌ها اضافه شد`, {
				variant: 'success'
			});
			
			setSelectedCompanies([]);
			setSearchTerm('');
			setAllCompanies([]);
			onAddSuccess?.();
			onClose();
		} catch (error) {
			enqueueSnackbar('خطا در افزودن به علاقه‌مندی‌ها', {
				variant: 'error'
			});
		}
	};

	const handleClose = () => {
		setSelectedCompanies([]);
		setSearchTerm('');
		setAllCompanies([]);
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
						<Typography variant="h6" className="font-semibold">افزودن شرکت به علاقه‌مندی‌ها</Typography>
						<Typography variant="caption" className="text-gray-500">شرکت‌های مورد نظر را جستجو و انتخاب کنید</Typography>
					</div>
				</div>
			</DialogTitle>
			
			<DialogContent className="p-0">
				{/* Search Input */}
				<div className="p-16 border-b sticky top-0 bg-white dark:bg-gray-800 z-10">
					<TextField
						fullWidth
						placeholder="جستجوی شرکت..."
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

					{/* Selected Count */}
					{selectedCompanies.length > 0 && (
						<motion.div
							initial={{ opacity: 0, y: -10 }}
							animate={{ opacity: 1, y: 0 }}
							className="mt-12 p-12 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800"
						>
							<Typography variant="body2" className="text-rose-600 dark:text-rose-400 font-medium">
								{selectedCompanies.length} شرکت انتخاب شده
							</Typography>
						</motion.div>
					)}
				</div>

				{/* Companies List with Infinite Scroll */}
				<div 
					ref={scrollContainerRef}
					onScroll={handleScroll}
					className="overflow-y-auto"
					style={{ maxHeight: 400, minHeight: 300 }}
				>
					{allCompanies.length === 0 && !isSearching ? (
						<Box className="text-center py-48 text-gray-500">
							<HiOutlineOfficeBuilding size={48} className="mx-auto mb-8 opacity-30" />
							<Typography>
								{searchTerm ? 'شرکتی یافت نشد' : 'برای جستجو تایپ کنید'}
							</Typography>
						</Box>
					) : (
						<List sx={{ p: 2 }}>
							<AnimatePresence>
								{allCompanies.map((company, index) => {
									const isSelected = selectedCompanies.some(c => c.id === company.id);
									const logoUrl = company.logo ? getServerFile(company.logo) : null;
									
									return (
										<motion.div
											key={company.id}
											initial={{ opacity: 0, x: -20 }}
											animate={{ opacity: 1, x: 0 }}
											exit={{ opacity: 0, x: 20 }}
											transition={{ delay: index * 0.02 }}
										>
											<ListItemButton
												onClick={() => toggleCompanySelection(company)}
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
														<HiOutlineOfficeBuilding size={24} className="text-rose-500" />
													</Avatar>
												</ListItemAvatar>
												<ListItemText
													primary={
														<div className="flex items-center gap-8 mb-4">
															<Typography variant="subtitle2" className="font-semibold">
																{company.companyName || company.name || company.title}
															</Typography>
															<Chip 
																label={`#${company.id}`}
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
															{company.primaryBrand && (
																<Typography variant="caption" className="text-gray-600 dark:text-gray-400">
																	برند: {company.primaryBrand}
																</Typography>
															)}
															{company.subCategory && (
																<Typography variant="caption" className="text-gray-500">
																	{company.subCategory}
																</Typography>
															)}
															{company.companyStatusFa && (
																<Chip 
																	label={company.companyStatusFa}
																	size="small"
																	color={
																		company.companyStatus === 'PUBLISHED' ? 'success' :
																		company.companyStatus === 'VERIFIED' ? 'info' :
																		company.companyStatus === 'PENDING' ? 'warning' :
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
											{index < allCompanies.length - 1 && <Divider sx={{ my: 0.5 }} />}
										</motion.div>
									);
								})}
							</AnimatePresence>
							
							{/* Loading More Indicator */}
							{isLoadingMore && (
								<Box className="flex justify-center py-16">
									<CircularProgress size={24} />
								</Box>
							)}
							
							{/* End of List */}
							{!hasMore && allCompanies.length > 0 && (
								<Typography 
									variant="caption" 
									className="text-center block py-16 text-gray-500"
								>
									همه شرکت‌ها نمایش داده شدند
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
					disabled={selectedCompanies.length === 0 || isAdding}
					startIcon={isAdding ? <CircularProgress size={16} /> : <HiOutlinePlus />}
					sx={{
						background: 'linear-gradient(135deg, #f43f5e 0%, #ec4899 100%)',
						'&:hover': {
							background: 'linear-gradient(135deg, #e11d48 0%, #db2777 100%)'
						}
					}}
				>
					افزودن {selectedCompanies.length > 0 && `(${selectedCompanies.length})`}
				</Button>
			</DialogActions>
		</Dialog>
	);
}

// Main Component
function CompanyFavoritesSection() {
	const [category, setCategory] = useState(null);
	const [subCategory, setSubCategory] = useState(null);
	const [pagination, setPagination] = useState({ pageNumber: 1, pageSize: 12 });
	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
	const [favorites, setFavorites] = useState([]);
	const [removingId, setRemovingId] = useState(null);

	// Category options query
	const { 
		data: categoriesData, 
		isLoading: isCategoriesLoading 
	} = useGetCategoryOptionsQuery({
		pageNumber: 1,
		pageSize: 50
	});

	// Subcategories query
	const { 
		data: subCategoriesData, 
		isLoading: isSubCategoriesLoading,
		isFetching: isSubCategoriesFetching 
	} = useGetBundleSubCategoriesQuery(
		{ categoryId: category?.value, pageNumber: 1, pageSize: 50 },
		{ skip: !category?.value }
	);

	// Favorites query
	const { 
		data: favoritesData, 
		isLoading: isFavoritesLoading,
		isFetching: isFavoritesFetching,
		refetch: refetchFavorites
	} = useGetFavoriteCompaniesQuery(
		{ subCategoryId: subCategory?.subCategoryId, pageNumber: pagination.pageNumber, pageSize: pagination.pageSize },
		{ skip: !subCategory?.subCategoryId }
	);

	// Mutations
	const [removeCompanyFavorite] = useRemoveCompanyFavoriteMutation();
	const [reorderFavorites, { isLoading: isReordering }] = useReorderCompanyFavoritesMutation();

	// Categories list for autocomplete
	const categoryOptions = categoriesData?.data || [];
	
	// Subcategories list for autocomplete
	const subCategoryOptions = subCategoriesData?.data || [];

	// Update local favorites when data changes
	useEffect(() => {
		if (favoritesData?.data) {
			setFavorites(favoritesData.data);
		}
	}, [favoritesData]);

	// Reset subcategory when category changes
	useEffect(() => {
		setSubCategory(null);
		setFavorites([]);
	}, [category]);

	// Handle remove favorite
	const handleRemoveFavorite = async (company) => {
		if (!subCategory?.subCategoryId) return;
		
		setRemovingId(company.entityId);
		try {
			await removeCompanyFavorite({
				companyId: company.entityId,
				subCategoryId: subCategory.subCategoryId
			}).unwrap();
			
			enqueueSnackbar('شرکت از علاقه‌مندی‌ها حذف شد', { variant: 'success' });
		} catch (error) {
			enqueueSnackbar('خطا در حذف از علاقه‌مندی‌ها', { variant: 'error' });
		} finally {
			setRemovingId(null);
		}
	};

	// Handle reorder (drag and drop)
	const handleReorder = async (newOrder) => {
		const oldOrder = [...favorites];
		setFavorites(newOrder);
		
		if (!subCategory?.subCategoryId || isReordering) return;
		
		try {
			await reorderFavorites({
				subCategoryId: subCategory.subCategoryId,
				companyIds: newOrder.map(f => f.entityId)
			}).unwrap();
		} catch (error) {
			// Revert on error
			setFavorites(oldOrder);
			enqueueSnackbar('خطا در تغییر ترتیب', { variant: 'error' });
		}
	};

	// Handle page change
	const handlePageChange = (event, value) => {
		setPagination(prev => ({ ...prev, pageNumber: value }));
	};

	const existingFavoriteIds = favorites.map(f => f.entityId);
	const totalPages = favoritesData?.totalPages || 1;
	const totalElements = favoritesData?.totalElements || 0;

	return (
		<div className="space-y-24">
			{/* Filters Section */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className="grid grid-cols-1 md:grid-cols-2 gap-16"
			>
				{/* Category Select */}
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

				{/* SubCategory Select */}
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
						noOptionsText={category ? "زیرمجموعه یافت نشد" : "ابتدا دسته‌بندی را انتخاب کنید"}
						loadingText="در حال بارگذاری..."
						PaperComponent={StyledPaper}
						renderInput={(params) => (
							<TextField
								{...params}
								placeholder={category ? "انتخاب زیرمجموعه..." : "ابتدا دسته‌بندی را انتخاب کنید"}
								InputProps={{
									...params.InputProps,
									startAdornment: (
										<InputAdornment position="start">
											<HiOutlineOfficeBuilding size={20} className="text-gray-400" />
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
										<HiOutlineOfficeBuilding size={20} className="text-blue-500" />
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

			{/* Actions Bar */}
			{subCategory && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					className="flex flex-wrap items-center justify-between gap-12 p-16 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700"
				>
					<div className="flex items-center gap-12">
						<HiOutlineStar size={20} className="text-amber-500" />
						<Typography variant="body2" className="text-gray-600 dark:text-gray-400">
							{totalElements} شرکت در علاقه‌مندی‌ها
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
							افزودن شرکت
						</Button>
					</div>
				</motion.div>
			)}

			{/* Content Section */}
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
					<Typography>لطفاً یک دسته‌بندی و زیرمجموعه انتخاب کنید تا شرکت‌های منتخب نمایش داده شوند.</Typography>
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
						هنوز شرکتی به علاقه‌مندی‌ها اضافه نشده است
					</Typography>
					<Typography variant="body2" className="text-gray-400 mb-24">
						با کلیک روی دکمه زیر، شرکت‌های مورد نظر خود را اضافه کنید
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
						افزودن اولین شرکت
					</Button>
				</motion.div>
			) : (
				<>
					{/* Reorderable Favorites List */}
					<Reorder.Group
						axis="y"
						values={favorites}
						onReorder={handleReorder}
						className="space-y-0"
						style={{ listStyle: 'none', padding: 0, margin: 0 }}
					>
						<AnimatePresence mode="popLayout">
							{favorites.map((company, index) => (
								<Reorder.Item
									key={company.id || company.entityId}
									value={company}
									style={{ 
										zIndex: favorites.length - index,
										position: 'relative'
									}}
								>
									<FavoriteCompanyCard
										company={company}
										index={index}
										onRemove={handleRemoveFavorite}
										isRemoving={removingId === company.entityId}
									/>
								</Reorder.Item>
							))}
						</AnimatePresence>
					</Reorder.Group>

					{/* Pagination */}
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

			{/* Add Companies Dialog */}
			<AddCompaniesDialog
				open={isAddDialogOpen}
				onClose={() => setIsAddDialogOpen(false)}
				subCategoryId={subCategory?.subCategoryId}
				existingFavoriteIds={existingFavoriteIds}
				onAddSuccess={() => refetchFavorites()}
			/>
		</div>
	);
}

export default CompanyFavoritesSection;
