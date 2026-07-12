import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
	Paper,
	Typography,
	Button,
	IconButton,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
	MenuItem,
	Chip,
	Tooltip
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import FuseLoading from '@fuse/core/FuseLoading';
import { enqueueSnackbar } from 'notistack';
import AdminPageHeader from '../components/AdminPageHeader';
import { EmptyState, StatCard, StatsRow } from '../components/AdminUi';
import {
	useGetNotificationConstraintsQuery,
	useUpdateNotificationConstraintMutation
} from '../store/notificationAdminApi';

const priorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const overloadActions = [
	'ONLY_KEEP_THRESHOLD_PRIORITY',
	'DROP_LOW_PRIORITY',
	'QUEUE',
	'REJECT_NEW'
];

function NotificationConstraintsPage() {
	const { data: constraints = [], isLoading, isFetching, refetch } =
		useGetNotificationConstraintsQuery();
	const [updateConstraint, { isLoading: saving }] = useUpdateNotificationConstraintMutation();

	const [editing, setEditing] = useState(null);
	const [form, setForm] = useState({});

	const openEdit = (constraint) => {
		setEditing(constraint);
		setForm({
			minPriority: constraint.minPriority || 'LOW',
			overloadThreshold: constraint.overloadThreshold ?? 1000,
			overloadAction: constraint.overloadAction || 'ONLY_KEEP_THRESHOLD_PRIORITY',
			thresholdPriority: constraint.thresholdPriority || 'HIGH',
			maxRecords: constraint.maxRecords ?? 10000,
			maxBodySize: constraint.maxBodySize ?? 4096
		});
	};

	const setField = (key) => (e) =>
		setForm((f) => ({
			...f,
			[key]: e.target.value
		}));

	const handleSave = async () => {
		try {
			await updateConstraint({
				id: editing.id,
				minPriority: form.minPriority,
				overloadThreshold: Number(form.overloadThreshold),
				overloadAction: form.overloadAction,
				thresholdPriority: form.thresholdPriority,
				maxRecords: Number(form.maxRecords),
				maxBodySize: Number(form.maxBodySize),
				validityRules: editing.validityRules || [],
				adminContacts: editing.adminContacts || {}
			}).unwrap();
			enqueueSnackbar('محدودیت به‌روزرسانی شد', { variant: 'success' });
			setEditing(null);
		} catch (err) {
			enqueueSnackbar(err?.data?.message || 'خطا در ذخیره', { variant: 'error' });
		}
	};

	if (isLoading) return <FuseLoading />;

	return (
		<div className="w-full max-w-7xl mx-auto p-12 md:p-24 lg:p-32">
			<AdminPageHeader
				title="محدودیت‌های اعلان"
				subtitle="آستانه‌های overload، اولویت حداقل و محدودیت حجم برای هر کانال"
				icon="heroicons-outline:shield-check"
				gradient="from-amber-500 to-orange-600"
				onRefresh={refetch}
				isRefreshing={isFetching}
			/>

			<StatsRow>
				<StatCard
					label="تعداد محدودیت‌ها"
					value={constraints.length}
					icon="heroicons-outline:shield-check"
					color="amber"
				/>
			</StatsRow>

			{constraints.length === 0 ? (
				<EmptyState
					title="محدودیتی تعریف نشده"
					description="محدودیت‌ها معمولاً همراه با کانال‌ها ایجاد می‌شوند"
					icon="heroicons-outline:shield-check"
				/>
			) : (
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
					<AnimatePresence mode="popLayout">
						{constraints.map((constraint, index) => {
							const channelName =
								constraint.channel?.name ||
								constraint.channel?.code ||
								`کانال #${constraint.channel?.id || constraint.id}`;

							return (
								<motion.div
									key={constraint.id}
									layout
									initial={{ opacity: 0, y: 14 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: index * 0.05 }}
								>
									<Paper
										elevation={0}
										className="p-20 rounded-2xl border border-gray-100 dark:border-gray-700 h-full"
									>
										<div className="flex items-start justify-between gap-8 mb-16">
											<div>
												<Typography className="font-bold">{channelName}</Typography>
												{constraint.channel?.code && (
													<Chip
														size="small"
														label={constraint.channel.code}
														variant="outlined"
														className="mt-8"
													/>
												)}
											</div>
											<Tooltip title="ویرایش">
												<IconButton size="small" onClick={() => openEdit(constraint)}>
													<FuseSvgIcon size={18}>heroicons-outline:pencil</FuseSvgIcon>
												</IconButton>
											</Tooltip>
										</div>

										<div className="grid grid-cols-2 gap-12">
											<div>
												<Typography variant="caption" className="text-gray-500">
													حداقل اولویت
												</Typography>
												<Typography className="font-semibold">
													{constraint.minPriority}
												</Typography>
											</div>
											<div>
												<Typography variant="caption" className="text-gray-500">
													آستانه overload
												</Typography>
												<Typography className="font-semibold">
													{constraint.overloadThreshold}
												</Typography>
											</div>
											<div>
												<Typography variant="caption" className="text-gray-500">
													اقدام overload
												</Typography>
												<Typography className="font-semibold text-sm break-all">
													{constraint.overloadAction}
												</Typography>
											</div>
											<div>
												<Typography variant="caption" className="text-gray-500">
													اولویت آستانه
												</Typography>
												<Typography className="font-semibold">
													{constraint.thresholdPriority}
												</Typography>
											</div>
											<div>
												<Typography variant="caption" className="text-gray-500">
													حداکثر رکورد
												</Typography>
												<Typography className="font-semibold">
													{constraint.maxRecords}
												</Typography>
											</div>
											<div>
												<Typography variant="caption" className="text-gray-500">
													حداکثر حجم بدنه
												</Typography>
												<Typography className="font-semibold">
													{constraint.maxBodySize}
												</Typography>
											</div>
										</div>
									</Paper>
								</motion.div>
							);
						})}
					</AnimatePresence>
				</div>
			)}

			<Dialog open={!!editing} onClose={() => setEditing(null)} maxWidth="sm" fullWidth>
				<DialogTitle>ویرایش محدودیت</DialogTitle>
				<DialogContent className="flex flex-col gap-16 pt-8!">
					<TextField
						select
						label="حداقل اولویت"
						value={form.minPriority || ''}
						onChange={setField('minPriority')}
						fullWidth
					>
						{priorities.map((p) => (
							<MenuItem key={p} value={p}>
								{p}
							</MenuItem>
						))}
					</TextField>
					<TextField
						label="آستانه overload"
						type="number"
						value={form.overloadThreshold ?? ''}
						onChange={setField('overloadThreshold')}
						fullWidth
					/>
					<TextField
						select
						label="اقدام overload"
						value={form.overloadAction || ''}
						onChange={setField('overloadAction')}
						fullWidth
					>
						{overloadActions.map((a) => (
							<MenuItem key={a} value={a}>
								{a}
							</MenuItem>
						))}
					</TextField>
					<TextField
						select
						label="اولویت آستانه"
						value={form.thresholdPriority || ''}
						onChange={setField('thresholdPriority')}
						fullWidth
					>
						{priorities.map((p) => (
							<MenuItem key={p} value={p}>
								{p}
							</MenuItem>
						))}
					</TextField>
					<TextField
						label="حداکثر رکورد"
						type="number"
						value={form.maxRecords ?? ''}
						onChange={setField('maxRecords')}
						fullWidth
					/>
					<TextField
						label="حداکثر حجم بدنه"
						type="number"
						value={form.maxBodySize ?? ''}
						onChange={setField('maxBodySize')}
						fullWidth
					/>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setEditing(null)}>انصراف</Button>
					<Button variant="contained" onClick={handleSave} disabled={saving}>
						ذخیره
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
}

export default NotificationConstraintsPage;
