import { useState, useEffect, useCallback, useRef } from 'react';
import { useFormContext } from 'react-hook-form';
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
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { 
	HiOutlineSearch, 
	HiOutlinePlus, 
	HiOutlineTrash,
	HiOutlineRefresh,
	HiOutlineLink,
	HiOutlineOfficeBuilding,
	HiOutlineMenu,
	HiOutlineCheck,
	HiOutlineExternalLink,
	HiOutlineX
} from 'react-icons/hi';
import { enqueueSnackbar } from 'notistack';
import { Link } from 'react-router-dom';
import { getServerFile } from 'src/utils/string-utils';
import { 
	useGetRelatedCompaniesEnrichedQuery,
	useAddRelatedCompaniesBatchMutation,
	useRemoveRelatedCompanyMutation,
	useReorderRelatedCompaniesMutation,
	useLazySearchCompaniesForRelatedQuery
} from '../../main/apps/settings/tabs/related-entities/store/relatedEntityApi';

// Related Company Card Component
function RelatedCompanyCard({ company, onRemove, isRemoving, index, bankType }) {
	const logoUrl = company.logo ? getServerFile(company.logo) : null;
	const companyName = company.companyName || company.relatedEntityName || `شرکت #${company.id}`;
	
	// Determine link path based on bank type
	const getLinkPath = () => {
		if (bankType === 'agriculture') {
			return `/banks/agriculture-industry-bank/company/${company.id}`;
		}
		return `/banks/food-industry-bank/company/${company.id}`;
	};
	
	return (
		<motion.div
			layout
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
			transition={{ duration: 0.3, delay: index * 0.03 }}
			whileHover={{ scale: 1.01 }}
			className="relative"
			style={{ marginBottom: '12px' }}
		>
			<Paper
				elevation={0}
				sx={{
					bgcolor: 'background.paper',
					border: '1px solid',
					borderColor: 'divider',
					borderRadius: 3,
					p: 2,
					transition: 'all 0.3s ease',
					'&:hover': {
						borderColor: 'primary.main',
						boxShadow: 2
					}
				}}
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
						sx={{ 
							width: 56, 
							height: 56, 
							borderRadius: 2,
							border: '2px solid',
							borderColor: 'divider',
							bgcolor: 'rgba(99, 102, 241, 0.1)'
						}}
					>
						<HiOutlineOfficeBuilding size={28} className="text-indigo-500" />
					</Avatar>

					{/* Company Info */}
					<div className="flex-1 min-w-0">
						<Typography 
							variant="subtitle1" 
							className="font-semibold mb-4"
							sx={{ color: 'text.primary' }}
						>
							{companyName}
						</Typography>
						<div className="flex items-center gap-8 flex-wrap">
							<Chip 
								size="small" 
								label={`#${company.id || company.relatedEntityIdLong}`}
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
										color: 'primary.main',
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
							{company.ranking && (
								<Chip 
									size="small" 
									label={`رتبه: ${company.ranking}/${company.rankingAll || '?'}`}
									sx={{ 
										bgcolor: 'rgba(245, 158, 11, 0.1)', 
										color: '#f59e0b',
										fontSize: '0.7rem',
										height: 22
									}}
								/>
							)}
						</div>
					</div>

					{/* Actions */}
					<div className="flex items-center gap-4">
						<Tooltip title="مشاهده جزئیات شرکت">
							<IconButton
								component={Link}
								to={getLinkPath()}
								size="small"
								className="text-gray-400 hover:text-indigo-500 transition-all"
							>
								<HiOutlineExternalLink size={20} />
							</IconButton>
						</Tooltip>
						
						<Tooltip title="حذف از لیست مرتبط">
							<IconButton
								size="small"
								onClick={(e) => {
									e.stopPropagation();
									onRemove(company);
								}}
								disabled={isRemoving}
								className="text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
							>
								{isRemoving ? (
									<CircularProgress size={18} />
								) : (
									<HiOutlineTrash size={20} />
								)}
							</IconButton>
						</Tooltip>
					</div>
				</div>
			</Paper>
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
			<DialogTitle sx={{ borderBottom: 1, borderColor: 'divider', pb: 2 }}>
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-12">
						<div className="p-8 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10">
							<HiOutlinePlus size={24} className="text-indigo-500" />
						</div>
						<div>
							<Typography variant="h6" className="font-semibold">افزودن شرکت مرتبط</Typography>
							<Typography variant="caption" sx={{ color: 'text.secondary' }}>شرکت‌های مرتبط را جستجو و انتخاب کنید</Typography>
						</div>
					</div>
					<IconButton onClick={handleClose} size="small">
						<HiOutlineX size={20} />
					</IconButton>
				</div>
			</DialogTitle>
			
			<DialogContent className="p-0">
				{/* Search Input */}
				<Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', position: 'sticky', top: 0, bgcolor: 'background.paper', zIndex: 10 }}>
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
					<AnimatePresence>
						{selectedCompanies.length > 0 && (
							<motion.div
								initial={{ opacity: 0, height: 0 }}
								animate={{ opacity: 1, height: 'auto' }}
								exit={{ opacity: 0, height: 0 }}
							>
								<Paper
									elevation={0}
									sx={{
										mt: 1.5,
										p: 1.5,
										borderRadius: 2,
										bgcolor: 'primary.lighter',
										border: '1px solid',
										borderColor: 'primary.light'
									}}
								>
									<Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 500 }}>
										{selectedCompanies.length} شرکت انتخاب شده
									</Typography>
								</Paper>
							</motion.div>
						)}
					</AnimatePresence>
				</Box>

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
							<Typography variant="h6" sx={{ color: 'text.primary', mb: 1 }}>
								{searchTerm ? 'شرکتی یافت نشد' : 'جستجوی شرکت'}
							</Typography>
							<Typography variant="body2" sx={{ color: 'text.secondary' }}>
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
													border: '2px solid',
													borderColor: isSelected ? 'primary.main' : 'transparent',
													bgcolor: isSelected ? 'primary.lighter' : 'transparent',
													'&:hover': {
														bgcolor: isSelected ? 'primary.lighter' : 'action.hover'
													},
													transition: 'all 0.2s'
												}}
											>
												<Checkbox
													checked={isSelected}
													sx={{
														color: 'grey.400',
														'&.Mui-checked': {
															color: 'primary.main'
														}
													}}
												/>
												<ListItemAvatar>
													<Avatar 
														src={logoUrl}
														sx={{ 
															bgcolor: 'primary.lighter',
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
																	bgcolor: 'primary.lighter',
																	color: 'primary.main'
																}}
															/>
														</div>
													}
													secondary={
														<div className="flex flex-col gap-4">
															{company.primaryBrand && (
																<Typography variant="caption" sx={{ color: 'text.secondary' }}>
																	برند: {company.primaryBrand}
																</Typography>
															)}
															{company.subCategory && (
																<Typography variant="caption" sx={{ color: 'text.secondary' }}>
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
									className="text-center block py-16"
									sx={{ color: 'text.secondary' }}
								>
									همه شرکت‌ها نمایش داده شدند
								</Typography>
							)}
						</List>
					)}
				</div>
			</DialogContent>

			<DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
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
function RelatedCompaniesTab({ bankType = 'food' }) {
	const { watch } = useFormContext();
	const companyId = watch('id');
	const companyName = watch('companyName') || watch('name');
	
	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
	const [relatedCompanies, setRelatedCompanies] = useState([]);
	const [removingId, setRemovingId] = useState(null);

	// Related companies query
	const { 
		data: relatedData, 
		isLoading: isRelatedLoading,
		isFetching: isRelatedFetching,
		refetch: refetchRelated
	} = useGetRelatedCompaniesEnrichedQuery(
		companyId,
		{ skip: !companyId }
	);

	// Mutations
	const [removeRelatedCompany] = useRemoveRelatedCompanyMutation();
	const [reorderRelatedCompanies, { isLoading: isReordering }] = useReorderRelatedCompaniesMutation();

	// Update local related companies when data changes
	useEffect(() => {
		if (relatedData) {
			setRelatedCompanies(relatedData);
		}
	}, [relatedData]);

	// Handle remove related
	const handleRemoveRelated = async (company) => {
		if (!companyId) return;
		
		setRemovingId(company.id);
		try {
			await removeRelatedCompany({
				companyId: companyId,
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
		
		if (!companyId || isReordering) return;
		
		try {
			await reorderRelatedCompanies({
				companyId: companyId,
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

	if (!companyId) {
		return (
			<Alert severity="warning" className="rounded-xl">
				<Typography>لطفاً ابتدا شرکت را ذخیره کنید تا بتوانید شرکت‌های مرتبط را مدیریت کنید.</Typography>
			</Alert>
		);
	}

	return (
		<div className="space-y-24">
			{/* Header Card */}
			<motion.div
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
			>
				<Card
					elevation={0}
					sx={{
						bgcolor: 'background.paper',
						border: '1px solid',
						borderColor: 'divider',
						borderRadius: 3,
						overflow: 'visible'
					}}
				>
					<CardContent>
						<div className="flex items-center gap-16 mb-16">
							<div className="p-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
								<HiOutlineLink size={28} className="text-white" />
							</div>
							<div>
								<Typography variant="h5" className="font-bold" sx={{ color: 'text.primary' }}>
									شرکت‌های مرتبط
								</Typography>
								<Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
									مدیریت شرکت‌های مرتبط با "{companyName}"
								</Typography>
							</div>
						</div>

						{/* Actions Bar */}
						<Paper
							elevation={0}
							sx={{
								p: 2,
								borderRadius: 2,
								bgcolor: 'action.hover',
								display: 'flex',
								flexWrap: 'wrap',
								alignItems: 'center',
								justifyContent: 'space-between',
								gap: 2
							}}
						>
							<div className="flex items-center gap-12">
								<HiOutlineLink size={20} className="text-indigo-500" />
								<Typography variant="body2" sx={{ color: 'text.secondary' }}>
									{totalElements} شرکت مرتبط
								</Typography>
							</div>
							
							<div className="flex items-center gap-8">
								<Tooltip title="بازخوانی لیست">
									<IconButton 
										onClick={() => refetchRelated()}
										disabled={isRelatedFetching}
										size="small"
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
						</Paper>
					</CardContent>
				</Card>
			</motion.div>

			{/* Content Section */}
			{isRelatedLoading ? (
				<div className="space-y-12">
					{[...Array(4)].map((_, i) => (
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
				>
					<Paper
						elevation={0}
						sx={{
							p: 6,
							borderRadius: 3,
							textAlign: 'center',
							border: '2px dashed',
							borderColor: 'divider'
						}}
					>
						<div className="w-80 h-80 mx-auto mb-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
							<HiOutlineLink size={40} className="text-gray-300 dark:text-gray-600" />
						</div>
						<Typography variant="h6" sx={{ color: 'text.secondary', mb: 1 }}>
							هنوز شرکت مرتبطی اضافه نشده است
						</Typography>
						<Typography variant="body2" sx={{ color: 'text.disabled', mb: 3 }}>
							با کلیک روی دکمه زیر، شرکت‌های مرتبط را اضافه کنید
						</Typography>
						<Button
							variant="outlined"
							startIcon={<HiOutlinePlus />}
							onClick={() => setIsAddDialogOpen(true)}
							sx={{
								borderColor: 'primary.main',
								color: 'primary.main',
								'&:hover': {
									borderColor: 'primary.dark',
									bgcolor: 'primary.lighter'
								}
							}}
						>
							افزودن اولین شرکت مرتبط
						</Button>
					</Paper>
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
										bankType={bankType}
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
				sourceCompanyId={companyId}
				existingRelatedIds={existingRelatedIds}
				onAddSuccess={() => refetchRelated()}
			/>
		</div>
	);
}

export default RelatedCompaniesTab;
