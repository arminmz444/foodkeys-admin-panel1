import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
	Paper,
	Typography,
	Button,
	IconButton,
	Switch,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
	FormControlLabel,
	Chip,
	MenuItem,
	Pagination,
	Box,
	Tooltip,
	useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import FuseLoading from '@fuse/core/FuseLoading';
import { enqueueSnackbar } from 'notistack';
import AdminPageHeader from '../components/AdminPageHeader';
import { EmptyState, StatCard, StatsRow } from '../components/AdminUi';
import {
	useGetNotificationConfigsQuery,
	useCreateNotificationConfigMutation,
	useUpdateNotificationConfigMutation,
	useDeleteNotificationConfigMutation,
	useToggleNotificationConfigMutation,
	useGetTriggerKeysQuery,
	useGetEventTypesQuery,
	useGetNotificationChannelsQuery
} from '../store/notificationAdminApi';

const emptyForm = {
	triggerKey: '',
	channelId: '',
	messageTemplate: '',
	titleTemplate: '',
	subject: '',
	notificationType: '',
	notificationTopic: '',
	cronExpression: '',
	triggeredAtEvent: '',
	descheduleCondition: '',
	active: true,
	priority: 'MEDIUM'
};

const priorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

function NotificationConfigsPage() {
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('md'));
	const [page, setPage] = useState(1);
	const pageSize = 10;

	const { data, isLoading, isFetching, refetch } = useGetNotificationConfigsQuery({
		pageNumber: page,
		pageSize
	});
	const { data: triggerKeys = [] } = useGetTriggerKeysQuery();
	const { data: eventTypes = [] } = useGetEventTypesQuery();
	const { data: channels = [] } = useGetNotificationChannelsQuery();

	const [createConfig, { isLoading: creating }] = useCreateNotificationConfigMutation();
	const [updateConfig, { isLoading: updating }] = useUpdateNotificationConfigMutation();
	const [deleteConfig, { isLoading: deleting }] = useDeleteNotificationConfigMutation();
	const [toggleConfig] = useToggleNotificationConfigMutation();

	const [dialogOpen, setDialogOpen] = useState(false);
	const [editing, setEditing] = useState(null);
	const [form, setForm] = useState(emptyForm);
	const [deleteId, setDeleteId] = useState(null);

	const configs = data?.data || [];
	const totalPages = data?.totalPages || 1;
	const totalElements = data?.totalElements ?? configs.length;
	const activeCount = useMemo(() => configs.filter((c) => c.active).length, [configs]);

	const setField = (key) => (e) =>
		setForm((f) => ({
			...f,
			[key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value
		}));

	const openCreate = () => {
		setEditing(null);
		setForm(emptyForm);
		setDialogOpen(true);
	};

	const openEdit = (config) => {
		setEditing(config);
		setForm({
			triggerKey: config.triggerKey || '',
			channelId: config.channelId || '',
			messageTemplate: config.messageTemplate || '',
			titleTemplate: config.titleTemplate || '',
			subject: config.subject || '',
			notificationType: config.notificationType || '',
			notificationTopic: config.notificationTopic || '',
			cronExpression: config.cronExpression || '',
			triggeredAtEvent: config.triggeredAtEvent || '',
			descheduleCondition: config.descheduleCondition || '',
			active: config.active !== false,
			priority: config.priority || 'MEDIUM'
		});
		setDialogOpen(true);
	};

	const buildPayload = () => ({
		...form,
		channelId: form.channelId ? Number(form.channelId) : null,
		triggerKey: form.triggerKey || null,
		triggeredAtEvent: form.triggeredAtEvent || null
	});

	const handleSave = async () => {
		if (!form.channelId) {
			enqueueSnackbar('انتخاب کانال الزامی است', { variant: 'warning' });
			return;
		}
		try {
			if (editing) {
				await updateConfig({ id: editing.id, ...buildPayload() }).unwrap();
				enqueueSnackbar('پیکربندی به‌روزرسانی شد', { variant: 'success' });
			} else {
				await createConfig(buildPayload()).unwrap();
				enqueueSnackbar('پیکربندی ایجاد شد', { variant: 'success' });
			}
			setDialogOpen(false);
		} catch (err) {
			enqueueSnackbar(err?.data?.message || 'خطا در ذخیره', { variant: 'error' });
		}
	};

	const handleToggle = async (id) => {
		try {
			await toggleConfig(id).unwrap();
		} catch {
			enqueueSnackbar('خطا در تغییر وضعیت', { variant: 'error' });
		}
	};

	const handleDelete = async () => {
		try {
			await deleteConfig(deleteId).unwrap();
			enqueueSnackbar('پیکربندی حذف شد', { variant: 'success' });
			setDeleteId(null);
		} catch {
			enqueueSnackbar('خطا در حذف', { variant: 'error' });
		}
	};

	const priorityColor = (p) => {
		if (p === 'CRITICAL' || p === 'HIGH') return 'error';
		if (p === 'MEDIUM') return 'warning';
		return 'default';
	};

	if (isLoading) return <FuseLoading />;

	return (
		<div className="w-full max-w-7xl mx-auto p-12 md:p-24 lg:p-32">
			<AdminPageHeader
				title="پیکربندی اعلان‌ها"
				subtitle="قوانین تریگر، قالب پیام و زمان‌بندی اعلان‌های سیستم"
				icon="heroicons-outline:cog"
				gradient="from-blue-500 to-indigo-600"
				onRefresh={refetch}
				isRefreshing={isFetching}
				actions={
					<Button
						variant="contained"
						startIcon={<FuseSvgIcon size={18}>heroicons-outline:plus</FuseSvgIcon>}
						onClick={openCreate}
						className="rounded-xl"
					>
						پیکربندی جدید
					</Button>
				}
			/>

			<StatsRow>
				<StatCard label="کل پیکربندی‌ها" value={totalElements} icon="heroicons-outline:collection" color="blue" />
				<StatCard label="فعال (صفحه)" value={activeCount} icon="heroicons-outline:lightning-bolt" color="emerald" />
			</StatsRow>

			{configs.length === 0 ? (
				<EmptyState
					title="پیکربندی‌ای وجود ندارد"
					description="اولین قانون اعلان را تعریف کنید"
					icon="heroicons-outline:cog"
				/>
			) : (
				<div className="flex flex-col gap-12">
					{configs.map((config, index) => (
						<motion.div
							key={config.id}
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: index * 0.04 }}
						>
							<Paper
								elevation={0}
								className="p-16 md:p-20 rounded-2xl border border-gray-100 dark:border-gray-700"
							>
								<div className="flex flex-col md:flex-row md:items-center gap-12 justify-between">
									<div className="min-w-0 flex-1">
										<div className="flex flex-wrap items-center gap-8 mb-8">
											<Typography className="font-bold">
												{config.triggerKey || config.triggeredAtEvent || `#${config.id}`}
											</Typography>
											{config.channelCode && (
												<Chip size="small" label={config.channelCode} variant="outlined" />
											)}
											{config.priority && (
												<Chip
													size="small"
													label={config.priority}
													color={priorityColor(config.priority)}
												/>
											)}
											<Chip
												size="small"
												label={config.active ? 'فعال' : 'غیرفعال'}
												color={config.active ? 'success' : 'default'}
											/>
										</div>
										<Typography variant="body2" className="text-gray-500 line-clamp-2">
											{config.titleTemplate || config.subject || config.messageTemplate || '—'}
										</Typography>
										{config.cronExpression && (
											<Typography variant="caption" className="text-gray-400 mt-4 block font-mono">
												cron: {config.cronExpression}
											</Typography>
										)}
									</div>
									<div className="flex items-center gap-4 flex-shrink-0">
										<Switch
											checked={!!config.active}
											onChange={() => handleToggle(config.id)}
											size="small"
										/>
										<Tooltip title="ویرایش">
											<IconButton size="small" onClick={() => openEdit(config)}>
												<FuseSvgIcon size={18}>heroicons-outline:pencil</FuseSvgIcon>
											</IconButton>
										</Tooltip>
										<Tooltip title="حذف">
											<IconButton
												size="small"
												color="error"
												onClick={() => setDeleteId(config.id)}
											>
												<FuseSvgIcon size={18}>heroicons-outline:trash</FuseSvgIcon>
											</IconButton>
										</Tooltip>
									</div>
								</div>
							</Paper>
						</motion.div>
					))}
				</div>
			)}

			{totalPages > 1 && (
				<Box className="flex justify-center mt-24">
					<Pagination
						count={totalPages}
						page={page}
						onChange={(_, v) => setPage(v)}
						color="primary"
						shape="rounded"
						size={isMobile ? 'small' : 'medium'}
					/>
				</Box>
			)}

			<Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
				<DialogTitle>{editing ? 'ویرایش پیکربندی' : 'پیکربندی جدید'}</DialogTitle>
				<DialogContent className="grid grid-cols-1 md:grid-cols-2 gap-16 pt-8!">
					<TextField
						select
						label="کلید تریگر"
						value={form.triggerKey}
						onChange={setField('triggerKey')}
						fullWidth
					>
						<MenuItem value="">—</MenuItem>
						{triggerKeys.map((key) => (
							<MenuItem key={key} value={key}>
								{key}
							</MenuItem>
						))}
					</TextField>
					<TextField
						select
						label="کانال"
						value={form.channelId}
						onChange={setField('channelId')}
						fullWidth
						required
					>
						{channels.map((ch) => (
							<MenuItem key={ch.id} value={ch.id}>
								{ch.name} ({ch.code})
							</MenuItem>
						))}
					</TextField>
					<TextField
						select
						label="رویداد تریگر"
						value={form.triggeredAtEvent}
						onChange={setField('triggeredAtEvent')}
						fullWidth
					>
						<MenuItem value="">—</MenuItem>
						{eventTypes.map((t) => (
							<MenuItem key={t} value={t}>
								{t}
							</MenuItem>
						))}
					</TextField>
					<TextField
						select
						label="اولویت"
						value={form.priority}
						onChange={setField('priority')}
						fullWidth
					>
						{priorities.map((p) => (
							<MenuItem key={p} value={p}>
								{p}
							</MenuItem>
						))}
					</TextField>
					<TextField
						label="قالب عنوان"
						value={form.titleTemplate}
						onChange={setField('titleTemplate')}
						fullWidth
					/>
					<TextField
						label="موضوع"
						value={form.subject}
						onChange={setField('subject')}
						fullWidth
					/>
					<TextField
						label="نوع اعلان"
						value={form.notificationType}
						onChange={setField('notificationType')}
						fullWidth
					/>
					<TextField
						label="تاپیک"
						value={form.notificationTopic}
						onChange={setField('notificationTopic')}
						fullWidth
					/>
					<TextField
						label="عبارت Cron"
						value={form.cronExpression}
						onChange={setField('cronExpression')}
						fullWidth
						className="md:col-span-2"
					/>
					<TextField
						label="قالب پیام"
						value={form.messageTemplate}
						onChange={setField('messageTemplate')}
						fullWidth
						multiline
						minRows={3}
						className="md:col-span-2"
					/>
					<TextField
						label="شرط لغو زمان‌بندی"
						value={form.descheduleCondition}
						onChange={setField('descheduleCondition')}
						fullWidth
						className="md:col-span-2"
					/>
					<FormControlLabel
						control={<Switch checked={form.active} onChange={setField('active')} />}
						label="فعال"
					/>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setDialogOpen(false)}>انصراف</Button>
					<Button variant="contained" onClick={handleSave} disabled={creating || updating}>
						ذخیره
					</Button>
				</DialogActions>
			</Dialog>

			<Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
				<DialogTitle>حذف پیکربندی</DialogTitle>
				<DialogContent>
					<Typography>آیا از حذف این پیکربندی اطمینان دارید؟</Typography>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setDeleteId(null)}>انصراف</Button>
					<Button color="error" variant="contained" onClick={handleDelete} disabled={deleting}>
						حذف
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
}

export default NotificationConfigsPage;
