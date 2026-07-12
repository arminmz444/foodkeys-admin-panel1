import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
	Tooltip
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import FuseLoading from '@fuse/core/FuseLoading';
import { enqueueSnackbar } from 'notistack';
import AdminPageHeader from '../components/AdminPageHeader';
import { EmptyState, StatCard, StatsRow } from '../components/AdminUi';
import {
	useGetNotificationChannelsQuery,
	useCreateNotificationChannelMutation,
	useUpdateNotificationChannelMutation,
	useDeleteNotificationChannelMutation
} from '../store/notificationAdminApi';

const emptyForm = {
	code: '',
	name: '',
	description: '',
	enabled: true,
	defaultSettings: '{}'
};

function NotificationChannelsPage() {
	const { data: channels = [], isLoading, isFetching, refetch } =
		useGetNotificationChannelsQuery();
	const [createChannel, { isLoading: creating }] = useCreateNotificationChannelMutation();
	const [updateChannel, { isLoading: updating }] = useUpdateNotificationChannelMutation();
	const [deleteChannel, { isLoading: deleting }] = useDeleteNotificationChannelMutation();

	const [dialogOpen, setDialogOpen] = useState(false);
	const [editing, setEditing] = useState(null);
	const [form, setForm] = useState(emptyForm);
	const [deleteId, setDeleteId] = useState(null);

	const enabledCount = useMemo(
		() => channels.filter((c) => c.enabled).length,
		[channels]
	);

	const openCreate = () => {
		setEditing(null);
		setForm(emptyForm);
		setDialogOpen(true);
	};

	const openEdit = (channel) => {
		setEditing(channel);
		setForm({
			code: channel.code || '',
			name: channel.name || '',
			description: channel.description || '',
			enabled: channel.enabled !== false,
			defaultSettings: JSON.stringify(channel.defaultSettings || {}, null, 2)
		});
		setDialogOpen(true);
	};

	const handleSave = async () => {
		if (!form.name.trim() || (!editing && !form.code.trim())) {
			enqueueSnackbar('کد و نام کانال الزامی است', { variant: 'warning' });
			return;
		}

		let defaultSettings = {};
		try {
			defaultSettings = form.defaultSettings?.trim()
				? JSON.parse(form.defaultSettings)
				: {};
		} catch {
			enqueueSnackbar('فرمت JSON تنظیمات پیش‌فرض نامعتبر است', { variant: 'error' });
			return;
		}

		try {
			if (editing) {
				await updateChannel({
					id: editing.id,
					name: form.name.trim(),
					description: form.description.trim(),
					enabled: form.enabled,
					defaultSettings
				}).unwrap();
				enqueueSnackbar('کانال به‌روزرسانی شد', { variant: 'success' });
			} else {
				await createChannel({
					code: form.code.trim().toUpperCase(),
					name: form.name.trim(),
					description: form.description.trim(),
					enabled: form.enabled,
					defaultSettings
				}).unwrap();
				enqueueSnackbar('کانال ایجاد شد', { variant: 'success' });
			}
			setDialogOpen(false);
		} catch (err) {
			enqueueSnackbar(err?.data?.message || 'خطا در ذخیره کانال', { variant: 'error' });
		}
	};

	const handleToggle = async (channel) => {
		try {
			await updateChannel({
				id: channel.id,
				name: channel.name,
				description: channel.description,
				enabled: !channel.enabled,
				defaultSettings: channel.defaultSettings || {}
			}).unwrap();
		} catch {
			enqueueSnackbar('خطا در تغییر وضعیت', { variant: 'error' });
		}
	};

	const handleDelete = async () => {
		try {
			await deleteChannel(deleteId).unwrap();
			enqueueSnackbar('کانال حذف شد', { variant: 'success' });
			setDeleteId(null);
		} catch {
			enqueueSnackbar('خطا در حذف کانال', { variant: 'error' });
		}
	};

	if (isLoading) return <FuseLoading />;

	return (
		<div className="w-full max-w-7xl mx-auto p-12 md:p-24 lg:p-32">
			<AdminPageHeader
				title="کانال‌های اعلان"
				subtitle="مدیریت کانال‌های ارسال اعلان (ایمیل، پیامک، پوش و ...)"
				icon="heroicons-outline:rss"
				gradient="from-teal-500 to-cyan-600"
				onRefresh={refetch}
				isRefreshing={isFetching}
				actions={
					<Button
						variant="contained"
						color="primary"
						startIcon={<FuseSvgIcon size={18}>heroicons-outline:plus</FuseSvgIcon>}
						onClick={openCreate}
						className="rounded-xl"
					>
						کانال جدید
					</Button>
				}
			/>

			<StatsRow>
				<StatCard label="کل کانال‌ها" value={channels.length} icon="heroicons-outline:collection" color="teal" />
				<StatCard label="فعال" value={enabledCount} icon="heroicons-outline:check-circle" color="emerald" />
				<StatCard
					label="غیرفعال"
					value={channels.length - enabledCount}
					icon="heroicons-outline:pause"
					color="slate"
				/>
			</StatsRow>

			{channels.length === 0 ? (
				<EmptyState
					icon="heroicons-outline:rss"
					title="کانالی تعریف نشده"
					description="اولین کانال اعلان را ایجاد کنید"
				/>
			) : (
				<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-16">
					<AnimatePresence mode="popLayout">
						{channels.map((channel, index) => (
							<motion.div
								key={channel.id}
								layout
								initial={{ opacity: 0, y: 16 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, scale: 0.95 }}
								transition={{ delay: index * 0.04 }}
							>
								<Paper
									elevation={0}
									className="p-20 rounded-2xl border border-gray-100 dark:border-gray-700 h-full flex flex-col"
								>
									<div className="flex items-start justify-between gap-8 mb-12">
										<div className="min-w-0">
											<Typography className="font-bold truncate">{channel.name}</Typography>
											<Chip
												size="small"
												label={channel.code}
												className="mt-8 font-mono"
												variant="outlined"
											/>
										</div>
										<FormControlLabel
											control={
												<Switch
													checked={!!channel.enabled}
													onChange={() => handleToggle(channel)}
													size="small"
												/>
											}
											label=""
										/>
									</div>
									<Typography
										variant="body2"
										className="text-gray-500 flex-1 mb-16 line-clamp-3"
									>
										{channel.description || 'بدون توضیحات'}
									</Typography>
									<div className="flex justify-end gap-4">
										<Tooltip title="ویرایش">
											<IconButton size="small" onClick={() => openEdit(channel)}>
												<FuseSvgIcon size={18}>heroicons-outline:pencil</FuseSvgIcon>
											</IconButton>
										</Tooltip>
										<Tooltip title="حذف">
											<IconButton
												size="small"
												color="error"
												onClick={() => setDeleteId(channel.id)}
											>
												<FuseSvgIcon size={18}>heroicons-outline:trash</FuseSvgIcon>
											</IconButton>
										</Tooltip>
									</div>
								</Paper>
							</motion.div>
						))}
					</AnimatePresence>
				</div>
			)}

			<Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
				<DialogTitle>{editing ? 'ویرایش کانال' : 'ایجاد کانال جدید'}</DialogTitle>
				<DialogContent className="flex flex-col gap-16 pt-8!">
					{!editing && (
						<TextField
							label="کد کانال"
							value={form.code}
							onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
							fullWidth
							required
							helperText="مثلاً EMAIL، SMS، PUSH"
						/>
					)}
					<TextField
						label="نام"
						value={form.name}
						onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
						fullWidth
						required
					/>
					<TextField
						label="توضیحات"
						value={form.description}
						onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
						fullWidth
						multiline
						minRows={2}
					/>
					<TextField
						label="تنظیمات پیش‌فرض (JSON)"
						value={form.defaultSettings}
						onChange={(e) => setForm((f) => ({ ...f, defaultSettings: e.target.value }))}
						fullWidth
						multiline
						minRows={3}
						InputProps={{ className: 'font-mono text-sm' }}
					/>
					<FormControlLabel
						control={
							<Switch
								checked={form.enabled}
								onChange={(e) => setForm((f) => ({ ...f, enabled: e.target.checked }))}
							/>
						}
						label="فعال"
					/>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setDialogOpen(false)}>انصراف</Button>
					<Button
						variant="contained"
						onClick={handleSave}
						disabled={creating || updating}
					>
						ذخیره
					</Button>
				</DialogActions>
			</Dialog>

			<Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
				<DialogTitle>حذف کانال</DialogTitle>
				<DialogContent>
					<Typography>آیا از حذف این کانال اطمینان دارید؟</Typography>
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

export default NotificationChannelsPage;
