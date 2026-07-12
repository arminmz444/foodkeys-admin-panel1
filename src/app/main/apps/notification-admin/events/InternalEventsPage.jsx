import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
	Paper,
	Typography,
	Chip,
	TextField,
	MenuItem,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Pagination,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	Box,
	useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import FuseLoading from '@fuse/core/FuseLoading';
import AdminPageHeader from '../components/AdminPageHeader';
import { EmptyState, StatCard, StatsRow } from '../components/AdminUi';
import {
	useGetInternalEventsQuery,
	useGetInternalEventQuery,
	useGetEventTypesQuery
} from '../store/notificationAdminApi';

function formatDate(value) {
	if (!value) return '—';
	try {
		return new Date(value).toLocaleString('fa-IR');
	} catch {
		return String(value);
	}
}

function InternalEventsPage() {
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('md'));
	const [page, setPage] = useState(1);
	const [eventType, setEventType] = useState('');
	const [selectedId, setSelectedId] = useState(null);
	const pageSize = 20;

	const { data: eventTypes = [] } = useGetEventTypesQuery();
	const { data, isLoading, isFetching, refetch } = useGetInternalEventsQuery({
		eventType,
		pageNumber: page,
		pageSize
	});
	const { data: detail, isFetching: detailLoading } = useGetInternalEventQuery(selectedId, {
		skip: !selectedId
	});

	const rows = data?.data || [];
	const totalPages = data?.totalPages || 1;
	const totalElements = data?.totalElements ?? rows.length;
	const processedCount = useMemo(
		() => rows.filter((r) => r.processed).length,
		[rows]
	);

	if (isLoading) return <FuseLoading />;

	return (
		<div className="w-full max-w-7xl mx-auto p-12 md:p-24 lg:p-32">
			<AdminPageHeader
				title="رویدادهای داخلی"
				subtitle="لاگ رویدادهای سیستم که تریگر اعلان‌ها را فعال می‌کنند"
				icon="heroicons-outline:lightning-bolt"
				gradient="from-emerald-500 to-teal-600"
				onRefresh={refetch}
				isRefreshing={isFetching}
			/>

			<StatsRow>
				<StatCard
					label="کل رویدادها"
					value={totalElements}
					icon="heroicons-outline:collection"
					color="emerald"
				/>
				<StatCard
					label="پردازش‌شده (صفحه)"
					value={processedCount}
					icon="heroicons-outline:check-circle"
					color="blue"
				/>
				<StatCard
					label="در انتظار (صفحه)"
					value={rows.length - processedCount}
					icon="heroicons-outline:clock"
					color="amber"
				/>
			</StatsRow>

			<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
				<Paper
					elevation={0}
					className="p-16 mb-16 rounded-2xl border border-gray-100 dark:border-gray-700"
				>
					<TextField
						select
						size="small"
						label="نوع رویداد"
						value={eventType}
						onChange={(e) => {
							setEventType(e.target.value);
							setPage(1);
						}}
						sx={{ minWidth: { xs: '100%', sm: 280 } }}
					>
						<MenuItem value="">همه</MenuItem>
						{eventTypes.map((t) => (
							<MenuItem key={t} value={t}>
								{t}
							</MenuItem>
						))}
					</TextField>
				</Paper>

				{rows.length === 0 ? (
					<EmptyState
						title="رویدادی یافت نشد"
						description="هنوز رویدادی ثبت نشده یا فیلتر نتیجه‌ای ندارد"
						icon="heroicons-outline:lightning-bolt"
					/>
				) : isMobile ? (
					<div className="flex flex-col gap-12">
						<AnimatePresence mode="popLayout">
							{rows.map((row, index) => (
								<motion.div
									key={row.id}
									initial={{ opacity: 0, y: 8 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: index * 0.03 }}
								>
									<Paper
										elevation={0}
										className="p-16 rounded-2xl border border-gray-100 dark:border-gray-700 cursor-pointer"
										onClick={() => setSelectedId(row.id)}
									>
										<div className="flex justify-between gap-8 mb-8">
											<Typography className="font-semibold truncate">
												{row.eventType}
											</Typography>
											<Chip
												size="small"
												label={row.processed ? 'پردازش‌شده' : 'در انتظار'}
												color={row.processed ? 'success' : 'warning'}
											/>
										</div>
										<Typography variant="body2" className="text-gray-500">
											#{row.id} · کاربر: {row.userId ?? '—'}
										</Typography>
										<Typography variant="caption" className="text-gray-400">
											{formatDate(row.validFrom || row.createdAt)}
										</Typography>
									</Paper>
								</motion.div>
							))}
						</AnimatePresence>
					</div>
				) : (
					<TableContainer
						component={Paper}
						elevation={0}
						className="rounded-2xl border border-gray-100 dark:border-gray-700"
					>
						<Table>
							<TableHead>
								<TableRow>
									<TableCell>شناسه</TableCell>
									<TableCell>نوع رویداد</TableCell>
									<TableCell>کاربر</TableCell>
									<TableCell>وضعیت</TableCell>
									<TableCell>زمان</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{rows.map((row) => (
									<TableRow
										key={row.id}
										hover
										className="cursor-pointer"
										onClick={() => setSelectedId(row.id)}
									>
										<TableCell>{row.id}</TableCell>
										<TableCell>
											<Typography variant="body2" className="font-mono text-sm">
												{row.eventType}
											</Typography>
										</TableCell>
										<TableCell>{row.userId ?? '—'}</TableCell>
										<TableCell>
											<Chip
												size="small"
												label={row.processed ? 'پردازش‌شده' : 'در انتظار'}
												color={row.processed ? 'success' : 'warning'}
											/>
										</TableCell>
										<TableCell>{formatDate(row.validFrom || row.createdAt)}</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</TableContainer>
				)}

				{totalPages > 1 && (
					<Box className="flex justify-center mt-24">
						<Pagination
							count={totalPages}
							page={page}
							onChange={(_, v) => setPage(v)}
							color="primary"
							shape="rounded"
						/>
					</Box>
				)}
			</motion.div>

			<Dialog
				open={!!selectedId}
				onClose={() => setSelectedId(null)}
				maxWidth="md"
				fullWidth
			>
				<DialogTitle>جزئیات رویداد #{selectedId}</DialogTitle>
				<DialogContent>
					{detailLoading && !detail ? (
						<div className="py-32 flex justify-center">
							<FuseLoading />
						</div>
					) : detail ? (
						<div className="flex flex-col gap-12 pt-8">
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
								{[
									['نوع', detail.eventType],
									['کاربر', detail.userId],
									['شرکت', detail.companyId],
									['اشتراک', detail.subscriptionId],
									['زیردسته', detail.subcategoryId],
									['سرویس', detail.serviceId],
									['درخواست', detail.requestId],
									['پرداخت', detail.paymentId],
									['موجودیت', detail.entityType],
									['شناسه موجودیت', detail.entityId],
									['از', formatDate(detail.validFrom)],
									['تا', formatDate(detail.validTo)],
									['پردازش', detail.processed ? 'بله' : 'خیر'],
									['زمان پردازش', formatDate(detail.processedAt)]
								].map(([label, value]) => (
									<div key={label}>
										<Typography variant="caption" className="text-gray-500">
											{label}
										</Typography>
										<Typography className="font-medium break-all">
											{value ?? '—'}
										</Typography>
									</div>
								))}
							</div>
							<div>
								<Typography variant="caption" className="text-gray-500">
									داده‌های رویداد (JSON)
								</Typography>
								<Paper
									elevation={0}
									className="p-12 mt-4 rounded-xl bg-gray-50 dark:bg-gray-900 overflow-auto max-h-320"
								>
									<pre className="text-xs m-0 font-mono whitespace-pre-wrap break-all">
										{JSON.stringify(detail.eventData || {}, null, 2)}
									</pre>
								</Paper>
							</div>
						</div>
					) : null}
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setSelectedId(null)}>بستن</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
}

export default InternalEventsPage;
