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
	HiOutlineCog,
	HiOutlineMenu,
	HiOutlineCheck,
	HiOutlineExternalLink,
	HiOutlineX
} from 'react-icons/hi';
import { enqueueSnackbar } from 'notistack';
import { Link } from 'react-router-dom';
import {
	useGetAllRelatedEntitiesQuery,
	useAddRelatedEntitiesMutation,
	useRemoveRelatedEntitiesMutation,
	useReorderRelatedEntitiesMutation,
	useGetRelatedCompaniesEnrichedQuery,
	useAddRelatedCompaniesBatchMutation,
	useRemoveRelatedCompanyMutation,
	useReorderRelatedCompaniesMutation
} from 'src/app/main/apps/settings/tabs/related-entities/store/relatedEntityApi';
import { useLazyGetServicesQuery } from '../../ServicesBankApi';

const ENTITY_TYPE = 'SERVICE';

// Labels/config for each relation type so the same component can render
// related, rival and sub-company management tabs for services.
const RELATION_CONFIG = {
	related: {
		title: 'سرویس‌های مرتبط',
		subtitle: (name) => `مدیریت سرویس‌های مرتبط با "${name}"`,
		count: (n) => `${n} سرویس مرتبط`,
		addButton: 'افزودن سرویس مرتبط',
		addFirst: 'افزودن اولین سرویس مرتبط',
		empty: 'هنوز سرویس مرتبطی اضافه نشده است',
		dialogTitle: 'افزودن سرویس مرتبط',
		removed: 'سرویس از لیست مرتبط حذف شد',
		removeError: 'خطا در حذف از لیست مرتبط',
		addedTpl: (n) => `${n} سرویس به لیست مرتبط اضافه شد`,
		addError: 'خطا در افزودن به لیست مرتبط'
	},
	rival: {
		title: 'سرویس‌های رقیب',
		subtitle: (name) => `مدیریت سرویس‌های رقیب با "${name}"`,
		count: (n) => `${n} سرویس رقیب`,
		addButton: 'افزودن سرویس رقیب',
		addFirst: 'افزودن اولین سرویس رقیب',
		empty: 'هنوز سرویس رقیبی اضافه نشده است',
		dialogTitle: 'افزودن سرویس رقیب',
		removed: 'سرویس از لیست رقبا حذف شد',
		removeError: 'خطا در حذف از لیست رقبا',
		addedTpl: (n) => `${n} سرویس به لیست رقبا اضافه شد`,
		addError: 'خطا در افزودن به لیست رقبا'
	},
	'sub-company': {
		title: 'سرویس‌های زیرمجموعه',
		subtitle: (name) => `مدیریت سرویس‌های زیرمجموعه "${name}"`,
		count: (n) => `${n} سرویس زیرمجموعه`,
		addButton: 'افزودن سرویس زیرمجموعه',
		addFirst: 'افزودن اولین سرویس زیرمجموعه',
		empty: 'هنوز سرویس زیرمجموعه‌ای اضافه نشده است',
		dialogTitle: 'افزودن سرویس زیرمجموعه',
		removed: 'سرویس از لیست زیرمجموعه‌ها حذف شد',
		removeError: 'خطا در حذف از لیست زیرمجموعه‌ها',
		addedTpl: (n) => `${n} سرویس به لیست زیرمجموعه‌ها اضافه شد`,
		addError: 'خطا در افزودن به لیست زیرمجموعه‌ها'
	}
};

function RelatedServiceCard({ service, onRemove, isRemoving, index }) {
	const serviceName = service.name || service.relatedEntityName || `سرویس #${service.relatedEntityId || service.id}`;
	const relatedId = service.relatedEntityId || service.relatedEntityIdLong || service.id;

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
				<div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg z-10">
					<span className="text-white text-sm font-bold">{service.displayOrder || index + 1}</span>
				</div>

				<div className="flex items-center gap-12">
					<div className="cursor-grab active:cursor-grabbing flex items-center text-gray-400 hover:text-indigo-500 transition-colors p-8 -ml-8 touch-none">
						<HiOutlineMenu size={24} />
					</div>

					<Avatar
						sx={{
							width: 56,
							height: 56,
							borderRadius: 2,
							border: '2px solid',
							borderColor: 'divider',
							bgcolor: 'rgba(99, 102, 241, 0.1)'
						}}
					>
						<HiOutlineCog size={28} className="text-indigo-500" />
					</Avatar>

					<div className="flex-1 min-w-0">
						<Typography variant="subtitle1" className="font-semibold mb-4" sx={{ color: 'text.primary' }}>
							{serviceName}
						</Typography>
						<div className="flex items-center gap-8 flex-wrap">
							<Chip
								size="small"
								label={`#${relatedId}`}
								variant="outlined"
								sx={{
									borderColor: 'divider',
									fontSize: '0.7rem',
									height: 22
								}}
							/>
							{service.subCategory && (
								<Chip
									size="small"
									label={service.subCategory}
									sx={{
										bgcolor: 'rgba(99, 102, 241, 0.1)',
										color: 'primary.main',
										fontSize: '0.7rem',
										height: 22
									}}
								/>
							)}
							{service.ranking != null && (
								<Chip
									size="small"
									label={`رتبه: ${service.ranking}/${service.rankingAll || '?'}`}
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

					<div className="flex items-center gap-4">
						<Tooltip title="مشاهده جزئیات سرویس">
							<IconButton
								component={Link}
								to={`/banks/service/${relatedId}/details`}
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
									onRemove(service);
								}}
								disabled={isRemoving}
								className="text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
							>
								{isRemoving ? <CircularProgress size={18} /> : <HiOutlineTrash size={20} />}
							</IconButton>
						</Tooltip>
					</div>
				</div>
			</Paper>
		</motion.div>
	);
}

function AddServicesDialog({
	open,
	onClose,
	sourceServiceId,
	existingRelatedIds,
	onAddSuccess,
	relationType = 'related',
	labels = RELATION_CONFIG.related
}) {
	const [searchTerm, setSearchTerm] = useState('');
	const [selectedServices, setSelectedServices] = useState([]);
	const [allServices, setAllServices] = useState([]);
	const [currentPage, setCurrentPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);
	const [isLoadingMore, setIsLoadingMore] = useState(false);
	const scrollContainerRef = useRef(null);

	const [triggerSearch, { isLoading: isSearching }] = useLazyGetServicesQuery();
	const [addRelatedEntities, { isLoading: isAddingRelated }] = useAddRelatedEntitiesMutation();
	const [addRivalBatch, { isLoading: isAddingBatch }] = useAddRelatedCompaniesBatchMutation();
	const isAdding = isAddingRelated || isAddingBatch;

	const loadServices = useCallback(
		async (page, search = '', reset = false) => {
			setIsLoadingMore(true);
			try {
				const result = await triggerSearch({
					search,
					pageNumber: page,
					pageSize: 5
				}).unwrap();

				const list = result?.data || [];
				const filtered = (Array.isArray(list) ? list : []).filter(
					(service) =>
						String(service.id) !== String(sourceServiceId) &&
						!existingRelatedIds.map(String).includes(String(service.id))
				);

				if (reset) {
					setAllServices(filtered);
				} else {
					setAllServices((prev) => [...prev, ...filtered]);
				}

				const totalPages = result?.pagination?.totalPages || result?.totalPages || 1;
				setHasMore(page < totalPages);
			} catch (error) {
				console.error('Search error:', error);
			} finally {
				setIsLoadingMore(false);
			}
		},
		[sourceServiceId, existingRelatedIds, triggerSearch]
	);

	useEffect(() => {
		if (open && sourceServiceId && searchTerm.trim().length > 0) {
			const timer = setTimeout(() => {
				setCurrentPage(1);
				setAllServices([]);
				loadServices(1, searchTerm, true);
			}, 300);
			return () => clearTimeout(timer);
		}

		if (open && searchTerm.trim().length === 0) {
			setAllServices([]);
			setCurrentPage(1);
			setHasMore(true);
		}
	}, [searchTerm, open, sourceServiceId, loadServices]);

	const handleScroll = useCallback(
		(e) => {
			const bottom = e.target.scrollHeight - e.target.scrollTop <= e.target.clientHeight + 50;

			if (bottom && hasMore && !isLoadingMore && !isSearching) {
				const nextPage = currentPage + 1;
				setCurrentPage(nextPage);
				loadServices(nextPage, searchTerm, false);
			}
		},
		[hasMore, isLoadingMore, isSearching, currentPage, searchTerm, loadServices]
	);

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
			if (relationType === 'related') {
				await addRelatedEntities({
					entityType: ENTITY_TYPE,
					sourceEntityId: sourceServiceId,
					relatedEntityIds: selectedServices.map((s) => s.id)
				}).unwrap();
			} else {
				await addRivalBatch({
					companyId: sourceServiceId,
					relatedCompanyIds: selectedServices.map((s) => s.id),
					relationType
				}).unwrap();
			}

			enqueueSnackbar(labels.addedTpl(selectedServices.length), {
				variant: 'success'
			});

			setSelectedServices([]);
			setSearchTerm('');
			setAllServices([]);
			onAddSuccess?.();
			onClose();
		} catch (error) {
			enqueueSnackbar(labels.addError, {
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
			<DialogTitle sx={{ borderBottom: 1, borderColor: 'divider', pb: 2 }}>
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-12">
						<div className="p-8 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10">
							<HiOutlinePlus size={24} className="text-indigo-500" />
						</div>
						<div>
							<Typography variant="h6" className="font-semibold">
								{labels.dialogTitle}
							</Typography>
							<Typography variant="caption" sx={{ color: 'text.secondary' }}>
								سرویس‌ها را جستجو و انتخاب کنید
							</Typography>
						</div>
					</div>
					<IconButton onClick={handleClose} size="small">
						<HiOutlineX size={20} />
					</IconButton>
				</div>
			</DialogTitle>

			<DialogContent className="p-0">
				<Box
					sx={{
						p: 2,
						borderBottom: 1,
						borderColor: 'divider',
						position: 'sticky',
						top: 0,
						bgcolor: 'background.paper',
						zIndex: 10
					}}
				>
					<TextField
						fullWidth
						placeholder="جستجوی سرویس..."
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

					<AnimatePresence>
						{selectedServices.length > 0 && (
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
										{selectedServices.length} سرویس انتخاب شده
									</Typography>
								</Paper>
							</motion.div>
						)}
					</AnimatePresence>
				</Box>

				<div
					ref={scrollContainerRef}
					onScroll={handleScroll}
					className="overflow-y-auto"
					style={{ maxHeight: 400, minHeight: 300 }}
				>
					{allServices.length === 0 && !isSearching ? (
						<Box className="text-center py-48">
							<HiOutlineSearch size={48} className="mx-auto mb-8 opacity-30" />
							<Typography variant="h6" sx={{ color: 'text.primary', mb: 1 }}>
								{searchTerm ? 'سرویسی یافت نشد' : 'جستجوی سرویس'}
							</Typography>
							<Typography variant="body2" sx={{ color: 'text.secondary' }}>
								{searchTerm
									? 'لطفاً عبارت دیگری را امتحان کنید'
									: 'برای یافتن و افزودن سرویس مرتبط، نام سرویس را جستجو کنید'}
							</Typography>
						</Box>
					) : (
						<List sx={{ p: 2 }}>
							<AnimatePresence>
								{allServices.map((service, index) => {
									const isSelected = selectedServices.some((s) => s.id === service.id);

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
														sx={{
															bgcolor: 'primary.lighter',
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
																	bgcolor: 'primary.lighter',
																	color: 'primary.main'
																}}
															/>
														</div>
													}
													secondary={
														service.description ? (
															<Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap>
																{service.description}
															</Typography>
														) : null
													}
												/>
												{isSelected && <HiOutlineCheck size={24} className="text-indigo-500 flex-shrink-0" />}
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
								<Typography variant="caption" className="text-center block py-16" sx={{ color: 'text.secondary' }}>
									همه سرویس‌ها نمایش داده شدند
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

function RelatedServicesTab({ isDraft = false, relationType = 'related' }) {
	const labels = RELATION_CONFIG[relationType] || RELATION_CONFIG.related;
	const isRelated = relationType === 'related';
	const { watch } = useFormContext();
	const serviceId = watch('id');
	const serviceName = watch('name');
	const isSavedService = Boolean(serviceId) && !isDraft;

	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
	const [relatedServices, setRelatedServices] = useState([]);
	const [removingId, setRemovingId] = useState(null);

	// Related uses the generic entity API; rival/sub-company use company endpoints.
	const relatedQuery = useGetAllRelatedEntitiesQuery(
		{ entityType: ENTITY_TYPE, sourceEntityId: serviceId },
		{ skip: !isSavedService || !isRelated }
	);
	const companyQuery = useGetRelatedCompaniesEnrichedQuery(
		{ companyId: serviceId, relationType },
		{ skip: !isSavedService || isRelated }
	);

	const {
		data: relatedData,
		isLoading: isRelatedLoading,
		isFetching: isRelatedFetching,
		refetch: refetchRelated
	} = isRelated ? relatedQuery : companyQuery;

	const [removeRelatedEntities] = useRemoveRelatedEntitiesMutation();
	const [reorderRelatedEntities, { isLoading: isReorderingEntities }] = useReorderRelatedEntitiesMutation();
	const [removeRelatedCompany] = useRemoveRelatedCompanyMutation();
	const [reorderRelatedCompanies, { isLoading: isReorderingCompanies }] = useReorderRelatedCompaniesMutation();
	const isReordering = isReorderingEntities || isReorderingCompanies;

	useEffect(() => {
		if (relatedData) {
			setRelatedServices(Array.isArray(relatedData) ? relatedData : []);
		}
	}, [relatedData]);

	const getRelatedId = (service) => service.relatedEntityId || service.relatedEntityIdLong || service.id;

	const handleRemoveRelated = async (service) => {
		if (!serviceId) return;

		const relatedId = getRelatedId(service);
		setRemovingId(relatedId);
		try {
			if (isRelated) {
				await removeRelatedEntities({
					entityType: ENTITY_TYPE,
					sourceEntityId: serviceId,
					relatedEntityIds: [relatedId]
				}).unwrap();
			} else {
				await removeRelatedCompany({
					companyId: serviceId,
					relatedCompanyId: relatedId,
					relationType
				}).unwrap();
			}

			enqueueSnackbar(labels.removed, { variant: 'success' });
			refetchRelated();
		} catch (error) {
			enqueueSnackbar(labels.removeError, { variant: 'error' });
		} finally {
			setRemovingId(null);
		}
	};

	const handleReorder = async (newOrder) => {
		const oldOrder = [...relatedServices];
		setRelatedServices(newOrder);

		if (!serviceId || isReordering) return;

		try {
			if (isRelated) {
				await reorderRelatedEntities({
					entityType: ENTITY_TYPE,
					sourceEntityId: serviceId,
					orderedRelatedEntityIds: newOrder.map((s) => getRelatedId(s))
				}).unwrap();
			} else {
				await reorderRelatedCompanies({
					companyId: serviceId,
					orderedCompanyIds: newOrder.map((s) => getRelatedId(s)),
					relationType
				}).unwrap();
			}
		} catch (error) {
			setRelatedServices(oldOrder);
			enqueueSnackbar('خطا در تغییر ترتیب', { variant: 'error' });
		}
	};

	const existingRelatedIds = relatedServices.map((s) => getRelatedId(s));
	const totalElements = relatedServices.length;

	if (!isSavedService) {
		return (
			<Alert severity="warning" className="rounded-xl">
				<Typography>لطفاً ابتدا سرویس را ذخیره کنید تا بتوانید سرویس‌های مرتبط را مدیریت کنید.</Typography>
			</Alert>
		);
	}

	return (
		<div className="space-y-24">
			<motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
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
									{labels.title}
								</Typography>
								<Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
									{labels.subtitle(serviceName)}
								</Typography>
							</div>
						</div>

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
									{labels.count(totalElements)}
								</Typography>
							</div>

							<div className="flex items-center gap-8">
								<Tooltip title="بازخوانی لیست">
									<IconButton onClick={() => refetchRelated()} disabled={isRelatedFetching} size="small">
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
									{labels.addButton}
								</Button>
							</div>
						</Paper>
					</CardContent>
				</Card>
			</motion.div>

			{isRelatedLoading ? (
				<div className="space-y-12">
					{[...Array(4)].map((_, i) => (
						<Skeleton key={i} variant="rounded" height={88} className="rounded-xl" animation="wave" />
					))}
				</div>
			) : relatedServices.length === 0 ? (
				<motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
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
							{labels.empty}
						</Typography>
						<Typography variant="body2" sx={{ color: 'text.disabled', mb: 3 }}>
							با کلیک روی دکمه زیر، سرویس‌ها را اضافه کنید
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
							{labels.addFirst}
						</Button>
					</Paper>
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
								key={getRelatedId(service)}
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
									isRemoving={removingId === getRelatedId(service)}
								/>
							</Reorder.Item>
						))}
					</AnimatePresence>
				</Reorder.Group>
			)}

			<AddServicesDialog
				open={isAddDialogOpen}
				onClose={() => setIsAddDialogOpen(false)}
				sourceServiceId={serviceId}
				existingRelatedIds={existingRelatedIds}
				onAddSuccess={() => refetchRelated()}
				relationType={relationType}
				labels={labels}
			/>
		</div>
	);
}

export default RelatedServicesTab;
