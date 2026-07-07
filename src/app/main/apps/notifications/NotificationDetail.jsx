import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import FuseLoading from '@fuse/core/FuseLoading';
import FusePageSimple from '@fuse/core/FusePageSimple/FusePageSimple';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useAppDispatch, useAppSelector } from 'app/store/hooks';
import NotificationCard from './NotificationCard';
import NotificationApi, {
	useArchiveNotificationMutation,
	useGetNotificationQuery,
	useMarkNotificationAsReadMutation
} from './NotificationApi';
import {
	clearPendingUpdates,
	markPreviewNotificationAsRead,
	selectHasPendingUpdates
} from './models/notificationSlice';
import { mapNotificationFromApi } from './utils/notificationUtils';

function NotificationDetail() {
	const { id } = useParams();
	const navigate = useNavigate();
	const dispatch = useAppDispatch();
	const hasPendingUpdates = useAppSelector(selectHasPendingUpdates);
	const { data: notification, isLoading, isError } = useGetNotificationQuery(id, { skip: !id });
	const [markAsRead] = useMarkNotificationAsReadMutation();
	const [archiveNotification] = useArchiveNotificationMutation();

	useEffect(() => {
		if (!id) {
			return;
		}

		if (hasPendingUpdates) {
			dispatch(NotificationApi.util.invalidateTags([{ type: 'NotificationsList', id: 'LIST' }]));
			dispatch(clearPendingUpdates());
		}

		markAsRead(id);
		dispatch(markPreviewNotificationAsRead(id));
	}, [dispatch, hasPendingUpdates, id, markAsRead]);

	if (isLoading) {
		return <FuseLoading />;
	}

	if (isError || !notification) {
		return (
			<div className="flex flex-col items-center justify-center p-32">
				<Typography
					className="mb-16 text-center text-24"
					color="text.secondary"
				>
					اعلان مورد نظر یافت نشد
				</Typography>
				<Button
					variant="contained"
					color="secondary"
					onClick={() => navigate('/apps/notifications')}
				>
					بازگشت به لیست اعلان‌ها
				</Button>
			</div>
		);
	}

	const item = mapNotificationFromApi(notification);

	return (
		<FusePageSimple
			header={
				<div className="flex w-full container p-24 md:p-32 pb-0 md:pb-0">
					<div className="flex flex-col flex-auto">
						<Typography className="text-3xl font-semibold tracking-tight leading-8">جزئیات اعلان</Typography>
						<Typography
							className="font-medium tracking-tight"
							color="text.secondary"
						>
							مشاهده جزئیات کامل اعلان
						</Typography>
					</div>
					<div className="flex items-center space-x-12">
						<Button onClick={() => navigate('/apps/notifications')}>بازگشت</Button>
						<Button
							variant="contained"
							color="secondary"
							onClick={() => {
								archiveNotification(id).then(() => navigate('/apps/notifications'));
							}}
						>
							بایگانی
						</Button>
					</div>
				</div>
			}
			content={
				<div className="flex w-full p-24">
					<NotificationCard
						className="w-full max-w-640"
						item={item}
					/>
				</div>
			}
		/>
	);
}

export default NotificationDetail;
