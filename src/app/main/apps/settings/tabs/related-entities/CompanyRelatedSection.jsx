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
	HiOutlineOfficeBuilding,
	HiOutlineMenu,
	HiOutlineCheck
} from 'react-icons/hi';
import { enqueueSnackbar } from 'notistack';
import { getServerFile } from 'src/utils/string-utils';
import { 
	useGetRelatedCompaniesEnrichedQuery,
	useAddRelatedCompaniesBatchMutation,
	useRemoveRelatedCompanyMutation,
	useReorderRelatedCompaniesMutation,
	useLazySearchCompaniesForRelatedQuery,
	useSearchCompaniesForRelatedQuery
} from './store/relatedEntityApi';

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

// Related Company Card Component
function RelatedCompanyCard({ company, onRemove, isRemoving, index }) {
	const logoUrl = company.logo ? getServerFile(company.logo) : null;
	const companyName = company.companyName || company.relatedEntityName || `شرکت #${company.id}`;
	
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
			{/* Order Badge */}
			<div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg z-10">
				<span className="text-white text-sm font-bold">{company.displayOrder || index + 1}</span>
			</div>

			<div className="flex items-center gap-12">
				{/* Drag Handle */}
				<div className="cursor-grab active:cursor-grabbing flex items-center text-gray-400 hover:text-indigo-500 transition-colors p-8 -ml-8 touch-none">
					<HiOutlineMenu size={24} />
				</div>

				{/* Company Logo */}
				<Avatar
					src={logoUrl}
					alt={companyName}
					className="w-56 h-56 rounded-lg border-2 border-gray-100 dark:border-gray-700 flex-shrink-0"
					sx={{ bgcolor: 'rgba(99, 102, 241, 0.1)' }}
				>
					<HiOutlineOfficeBuilding size={28} className="text-indigo-500" />
				</Avatar>

				{/* Company Info */}
				<div className="flex-1 min-w-0">
					<Typography variant="subtitle1" className="font-semibold text-gray-800 dark:text-gray-100 mb-4">
						{companyName}
					</Typography>
					<div className="flex items-center gap-8 flex-wrap">
						<Chip 
							size="small" 
							label={`شناسه: ${company.id || company.relatedEntityIdLong}`}
							variant="outlined"
							sx={{ 
								borderColor: 'divider',
								fontSize: '0.7rem',
								height: 22
							}}
						/>
						{company.subCategory && (
							<Chip 
								size="small" 
								label={company.subCategory}
								sx={{ 
									bgcolor: 'rgba(99, 102, 241, 0.1)', 
									color: '#6366f1',
									fontSize: '0.7rem',
									height: 22
								}}
							/>
						)}
						{company.primaryBrand && (
							<Chip 
								size="small" 
								label={company.primaryBrand}
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

				{/* Remove Button */}
				<Tooltip title="حذف از لیست مرتبط">
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
	sourceCompanyId,
	existingRelatedIds,
	onAddSuccess 
}) {
	const [searchTerm, setSearchTerm] = useState('');
	const [selectedCompanies, setSelectedCompanies] = useState([]);
	const [allCompanies, setAllCompanies] = useState([]);
	const [currentPage, setCurrentPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);
	const [isLoadingMore, setIsLoadingMore] = useState(false);
	const scrollContainerRef = useRef(null);

	const [triggerSearch, { isLoading: isSearching }] = useLazySearchCompaniesForRelatedQuery();
	const [addRelatedCompanies, { isLoading: isAdding }] = useAddRelatedCompaniesBatchMutation();

	// Load companies
	const loadCompanies = useCallback(async (page, search = '', reset = false) => {
		setIsLoadingMore(true);
		try {
			const result = await triggerSearch({
				search: search,
				pageNumber: page,
				pageSize: 5
			}).unwrap();
			
			// Filter out the source company and already related companies
			const filtered = (result.data || []).filter(
				company => company.id !== sourceCompanyId && !existingRelatedIds.includes(company.id)
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
	}, [sourceCompanyId, existingRelatedIds, triggerSearch]);

	// Initial load and search change
	useEffect(() => {
		if (open && sourceCompanyId && searchTerm.trim().length > 0) {
			const timer = setTimeout(() => {
				setCurrentPage(1);
				setAllCompanies([]);
				loadCompanies(1, searchTerm, true);
			}, 300);
			return () => clearTimeout(timer);
		} else if (open && searchTerm.trim().length === 0) {
			setAllCompanies([]);
			setCurrentPage(1);
			setHasMore(true);
		}
	}, [searchTerm, open, sourceCompanyId, loadCompanies]);

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

	// Add selected companies as related
	const handleAddRelated = async () => {
		if (selectedCompanies.length === 0) return;

		try {
			await addRelatedCompanies({
				companyId: sourceCompanyId,
				relatedCompanyIds: selectedCompanies.map(c => c.id)
			}).unwrap();
			
			enqueueSnackbar(`${selectedCompanies.length} شرکت به لیست مرتبط اضافه شد`, {
				variant: 'success'
			});
			
			setSelectedCompanies([]);
			setSearchTerm('');
			setAllCompanies([]);
			onAddSuccess?.();
			onClose();
		} catch (error) {
			enqueueSnackbar('خطا در افزودن به لیست مرتبط', {
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
					<div className="p-8 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10">
						<HiOutlinePlus size={24} className="text-indigo-500" />
					</div>
					<div>
						<Typography variant="h6" className="font-semibold">افزودن شرکت مرتبط</Typography>
						<Typography variant="caption" className="text-gray-500">شرکت‌های مرتبط را جستجو و انتخاب کنید</Typography>
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
							className="mt-12 p-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800"
						>
							<Typography variant="body2" className="text-indigo-600 dark:text-indigo-400 font-medium">
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
						<Box className="text-center py-48">
							<HiOutlineSearch size={48} className="mx-auto mb-8 opacity-30" />
							<Typography variant="h6" className="font-semibold mb-8">
								{searchTerm ? 'شرکتی یافت نشد' : 'جستجوی شرکت'}
							</Typography>
							<Typography variant="body2" className="text-gray-500">
								{searchTerm ? 'لطفاً عبارت دیگری را امتحان کنید' : 'برای یافتن و افزودن شرکت مرتبط، نام شرکت را جستجو کنید'}
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
														<HiOutlineOfficeBuilding size={24} className="text-indigo-500" />
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
																	bgcolor: 'rgba(99, 102, 241, 0.1)',
																	color: '#6366f1'
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
													<HiOutlineCheck size={24} className="text-indigo-500 flex-shrink-0" />
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
					onClick={handleAddRelated}
					disabled={selectedCompanies.length === 0 || isAdding}
					startIcon={isAdding ? <CircularProgress size={16} /> : <HiOutlinePlus />}
					sx={{
						background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
						'&:hover': {
							background: 'linear-gradient(135deg, #4f46e5 0%, #9333ea 100%)'
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
function CompanyRelatedSection() {
	const [sourceCompany, setSourceCompany] = useState(null);
	const [searchInput, setSearchInput] = useState('');
	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
	const [relatedCompanies, setRelatedCompanies] = useState([]);
	const [removingId, setRemovingId] = useState(null);

	// Search companies for source selection
	const { 
		data: companiesData, 
		isLoading: isCompaniesLoading,
		isFetching: isCompaniesFetching
	} = useSearchCompaniesForRelatedQuery(
		{ search: searchInput, pageNumber: 1, pageSize: 20 },
		{ skip: searchInput.length < 2 }
	);

	// Related companies query
	const { 
		data: relatedData, 
		isLoading: isRelatedLoading,
		isFetching: isRelatedFetching,
		refetch: refetchRelated
	} = useGetRelatedCompaniesEnrichedQuery(
		sourceCompany?.id,
		{ skip: !sourceCompany?.id }
	);

	// Mutations
	const [removeRelatedCompany] = useRemoveRelatedCompanyMutation();
	const [reorderRelatedCompanies, { isLoading: isReordering }] = useReorderRelatedCompaniesMutation();

	// Company options for autocomplete
	const companyOptions = companiesData?.data || [];

	// Update local related companies when data changes
	useEffect(() => {
		if (relatedData) {
			setRelatedCompanies(relatedData);
		}
	}, [relatedData]);

	// Reset related companies when source changes
	useEffect(() => {
		setRelatedCompanies([]);
	}, [sourceCompany]);

	// Handle remove related
	const handleRemoveRelated = async (company) => {
		if (!sourceCompany?.id) return;
		
		setRemovingId(company.id);
		try {
			await removeRelatedCompany({
				companyId: sourceCompany.id,
				relatedCompanyId: company.id
			}).unwrap();
			
			enqueueSnackbar('شرکت از لیست مرتبط حذف شد', { variant: 'success' });
		} catch (error) {
			enqueueSnackbar('خطا در حذف از لیست مرتبط', { variant: 'error' });
		} finally {
			setRemovingId(null);
		}
	};

	// Handle reorder (drag and drop)
	const handleReorder = async (newOrder) => {
		const oldOrder = [...relatedCompanies];
		setRelatedCompanies(newOrder);
		
		if (!sourceCompany?.id || isReordering) return;
		
		try {
			await reorderRelatedCompanies({
				companyId: sourceCompany.id,
				orderedCompanyIds: newOrder.map(c => c.id)
			}).unwrap();
		} catch (error) {
			// Revert on error
			setRelatedCompanies(oldOrder);
			enqueueSnackbar('خطا در تغییر ترتیب', { variant: 'error' });
		}
	};

	const existingRelatedIds = relatedCompanies.map(c => c.id);
	const totalElements = relatedCompanies.length;

	return (
		<div className="space-y-24">
			{/* Source Company Selection */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
			>
				<Typography variant="subtitle2" className="mb-8 font-semibold text-gray-700 dark:text-gray-300">
					شرکت مبدأ
				</Typography>
				<Autocomplete
					value={sourceCompany}
					onChange={(event, newValue) => setSourceCompany(newValue)}
					options={companyOptions}
					getOptionLabel={(option) => option.companyName || option.name || ''}
					isOptionEqualToValue={(option, value) => option.id === value?.id}
					loading={isCompaniesLoading || isCompaniesFetching}
					noOptionsText={searchInput.length < 2 ? "حداقل ۲ کاراکتر وارد کنید" : "شرکتی یافت نشد"}
					loadingText="در حال جستجو..."
					filterOptions={(x) => x}
					onInputChange={(event, value) => setSearchInput(value)}
					PaperComponent={StyledPaper}
					renderInput={(params) => (
						<TextField
							{...params}
							placeholder="جستجو و انتخاب شرکت..."
							InputProps={{
								...params.InputProps,
								startAdornment: (
									<InputAdornment position="start">
										<HiOutlineOfficeBuilding size={20} className="text-gray-400" />
									</InputAdornment>
								),
								endAdornment: (
									<>
										{(isCompaniesLoading || isCompaniesFetching) ? <CircularProgress color="inherit" size={20} /> : null}
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
									<HiOutlineOfficeBuilding size={20} className="text-indigo-500" />
								</Avatar>
								<div className="flex-1 min-w-0">
									<Typography variant="body1" className="font-medium truncate">
										{option.companyName || option.name}
									</Typography>
									{option.subCategory && (
										<Typography variant="caption" className="text-gray-500 truncate block">
											{option.subCategory}
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

			{/* Actions Bar */}
			{sourceCompany && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					className="flex flex-wrap items-center justify-between gap-12 p-16 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700"
				>
					<div className="flex items-center gap-12">
						<HiOutlineLink size={20} className="text-indigo-500" />
						<Typography variant="body2" className="text-gray-600 dark:text-gray-400">
							{totalElements} شرکت مرتبط با "{sourceCompany.companyName || sourceCompany.name}"
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
							افزودن شرکت مرتبط
						</Button>
					</div>
				</motion.div>
			)}

			{/* Content Section */}
			{!sourceCompany ? (
				<Alert 
					severity="info" 
					className="rounded-xl"
					sx={{
						bgcolor: 'background.paper',
						border: '1px solid',
						borderColor: 'info.light',
					}}
				>
					<Typography>لطفاً یک شرکت را جستجو و انتخاب کنید تا شرکت‌های مرتبط با آن نمایش داده شوند.</Typography>
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
			) : relatedCompanies.length === 0 ? (
				<motion.div
					initial={{ opacity: 0, scale: 0.9 }}
					animate={{ opacity: 1, scale: 1 }}
					className="text-center py-48"
				>
					<div className="w-80 h-80 mx-auto mb-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
						<HiOutlineLink size={40} className="text-gray-300 dark:text-gray-600" />
					</div>
					<Typography variant="h6" className="text-gray-500 mb-8">
						هنوز شرکت مرتبطی اضافه نشده است
					</Typography>
					<Typography variant="body2" className="text-gray-400 mb-24">
						با کلیک روی دکمه زیر، شرکت‌های مرتبط را اضافه کنید
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
						افزودن اولین شرکت مرتبط
					</Button>
				</motion.div>
			) : (
				<>
					{/* Reorderable Related List */}
					<Reorder.Group
						axis="y"
						values={relatedCompanies}
						onReorder={handleReorder}
						className="space-y-0"
						style={{ listStyle: 'none', padding: 0, margin: 0 }}
					>
						<AnimatePresence mode="popLayout">
							{relatedCompanies.map((company, index) => (
								<Reorder.Item
									key={company.id}
									value={company}
									style={{ 
										zIndex: relatedCompanies.length - index,
										position: 'relative'
									}}
								>
									<RelatedCompanyCard
										company={company}
										index={index}
										onRemove={handleRemoveRelated}
										isRemoving={removingId === company.id}
									/>
								</Reorder.Item>
							))}
						</AnimatePresence>
					</Reorder.Group>
				</>
			)}

			{/* Add Companies Dialog */}
			<AddCompaniesDialog
				open={isAddDialogOpen}
				onClose={() => setIsAddDialogOpen(false)}
				sourceCompanyId={sourceCompany?.id}
				existingRelatedIds={existingRelatedIds}
				onAddSuccess={() => refetchRelated()}
			/>
		</div>
	);
}

export default CompanyRelatedSection;
