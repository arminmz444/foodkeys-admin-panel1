import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
	Paper,
	Typography,
	Chip,
	TextField,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Pagination,
	InputAdornment,
	useMediaQuery,
	Box
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import FuseLoading from '@fuse/core/FuseLoading';
import { useGetMessagingHistoryQuery } from '../store/templatesApi';
import AdminPageHeader from '../../notification-admin/components/AdminPageHeader';
import { EmptyState, StatCard, StatsRow } from '../../notification-admin/components/AdminUi';

function formatDate(value) {
	if (!value) return '—';
	try {
		return new Date(value).toLocaleString('fa-IR');
	} catch {
		return String(value);
	}
}

function mediumLabel(medium) {
	const map = {
		EMAIL: 'ایمیل',
		SMS: 'پیامک',
		WHATSAPP: 'واتساپ',
		TELEGRAM: 'تلگرام',
		BALE: 'بله',
		PUSH: 'پوش'
	};
	return map[medium] || medium || '—';
}

function MessagingHistoryPage() {
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('md'));
	const [page, setPage] = useState(1);
	const [userIdFilter, setUserIdFilter] = useState('');
	const pageSize = 20;

	const queryArgs = useMemo(
		() => ({
			pageNumber: page,
			pageSize,
			...(userIdFilter.trim() ? { userId: Number(userIdFilter.trim()) } : {})
		}),
		[page, userIdFilter]
	);

	const { data, isLoading, isFetching, refetch } = useGetMessagingHistoryQuery(queryArgs);

	const rows = data?.data || [];
	const totalPages = data?.totalPages || 1;
	const totalElements = data?.totalElements ?? rows.length;
	const successCount = rows.filter((r) => r.success).length;
	const failCount = rows.filter((r) => !r.success).length;

	if (isLoading) {
		return <FuseLoading />;
	}

	return (
		<div className="w-full max-w-7xl mx-auto p-12 md:p-24 lg:p-32">
			<AdminPageHeader
				title="تاریخچه ارسال پیام"
				subtitle="سوابق ارسال ایمیل، پیامک و سایر رسانه‌ها"
				icon="heroicons-outline:clock"
				gradient="from-indigo-500 to-blue-600"
				onRefresh={refetch}
				isRefreshing={isFetching}
			/>

			<StatsRow>
				<StatCard
					label="کل رکوردها"
					value={totalElements}
					icon="heroicons-outline:collection"
					color="blue"
				/>
				<StatCard
					label="موفق (صفحه)"
					value={successCount}
					icon="heroicons-outline:check-circle"
					color="emerald"
				/>
				<StatCard
					label="ناموفق (صفحه)"
					value={failCount}
					icon="heroicons-outline:x-circle"
					color="rose"
				/>
			</StatsRow>

			<motion.div
				initial={{ opacity: 0, y: 12 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.1 }}
			>
				<Paper
					elevation={0}
					className="p-16 mb-16 rounded-2xl border border-gray-100 dark:border-gray-700"
				>
					<TextField
						size="small"
						label="فیلتر شناسه کاربر"
						value={userIdFilter}
						onChange={(e) => {
							setUserIdFilter(e.target.value.replace(/\D/g, ''));
							setPage(1);
						}}
						placeholder="مثلاً ۱۲۳"
						InputProps={{
							startAdornment: (
								<InputAdornment position="start">
									<FuseSvgIcon size={18}>heroicons-outline:user</FuseSvgIcon>
								</InputAdornment>
							)
						}}
						sx={{ minWidth: { xs: '100%', sm: 240 } }}
					/>
				</Paper>

				{rows.length === 0 ? (
					<EmptyState
						icon="heroicons-outline:inbox"
						title="سابقه‌ای یافت نشد"
						description="هنوز پیامی ارسال نشده یا فیلتر نتیجه‌ای ندارد"
					/>
				) : isMobile ? (
					<div className="flex flex-col gap-12">
						<AnimatePresence mode="popLayout">
							{rows.map((row, index) => (
								<motion.div
									key={`${row.recipient}-${row.sentAt}-${index}`}
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0 }}
									transition={{ delay: index * 0.03 }}
								>
									<Paper
										elevation={0}
										className="p-16 rounded-2xl border border-gray-100 dark:border-gray-700"
									>
										<div className="flex items-start justify-between gap-8 mb-8">
											<Typography className="font-semibold truncate">
												{row.username || row.recipient || '—'}
											</Typography>
											<Chip
												size="small"
												label={row.success ? 'موفق' : 'ناموفق'}
												color={row.success ? 'success' : 'error'}
											/>
										</div>
										<Typography variant="body2" className="text-gray-500 mb-4">
											گیرنده: {row.recipient || '—'}
										</Typography>
										<div className="flex flex-wrap gap-8 items-center">
											<Chip size="small" variant="outlined" label={mediumLabel(row.medium)} />
											<Typography variant="caption" className="text-gray-400">
												{formatDate(row.sentAt)}
											</Typography>
										</div>
										{row.errorMessage && (
											<Typography variant="caption" className="text-red-500 mt-8 block">
												{row.errorMessage}
											</Typography>
										)}
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
									<TableCell>کاربر</TableCell>
									<TableCell>گیرنده</TableCell>
									<TableCell>رسانه</TableCell>
									<TableCell>وضعیت</TableCell>
									<TableCell>زمان ارسال</TableCell>
									<TableCell>خطا</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{rows.map((row, index) => (
									<TableRow key={`${row.recipient}-${row.sentAt}-${index}`} hover>
										<TableCell>{row.username || '—'}</TableCell>
										<TableCell>
											<Typography variant="body2" className="font-mono text-sm">
												{row.recipient || '—'}
											</Typography>
										</TableCell>
										<TableCell>
											<Chip size="small" label={mediumLabel(row.medium)} variant="outlined" />
										</TableCell>
										<TableCell>
											<Chip
												size="small"
												label={row.success ? 'موفق' : 'ناموفق'}
												color={row.success ? 'success' : 'error'}
											/>
										</TableCell>
										<TableCell>{formatDate(row.sentAt)}</TableCell>
										<TableCell>
											<Typography
												variant="caption"
												className="text-red-500 max-w-xs truncate block"
											>
												{row.errorMessage || '—'}
											</Typography>
										</TableCell>
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
							onChange={(_, value) => setPage(value)}
							color="primary"
							shape="rounded"
						/>
					</Box>
				)}
			</motion.div>
		</div>
	);
}

export default MessagingHistoryPage;
