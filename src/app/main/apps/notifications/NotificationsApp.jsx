import { useEffect } from 'react';
import FuseLoading from '@fuse/core/FuseLoading';
import FusePageSimple from '@fuse/core/FusePageSimple/FusePageSimple';
import Typography from '@mui/material/Typography';
import Masonry from 'react-masonry-css';
import { useAppDispatch, useAppSelector } from 'app/store/hooks';
import { useNavigate } from 'react-router-dom';
import NotificationApi, { useArchiveNotificationMutation, useGetNotificationsQuery } from './NotificationApi';
import NotificationCard from './NotificationCard';
import NotificationsAppHeader from './NotificationsAppHeader';
import { clearPendingUpdates, selectHasPendingUpdates } from './models/notificationSlice';
import { mapNotificationFromApi } from './utils/notificationUtils';

function NotificationsApp() {
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const hasPendingUpdates = useAppSelector(selectHasPendingUpdates);
	const [archiveNotification] = useArchiveNotificationMutation();
	const { data: notificationsResponse, isLoading } = useGetNotificationsQuery({
		pageNumber: 1,
		pageSize: 20
	});

	useEffect(() => {
		if (hasPendingUpdates) {
			dispatch(NotificationApi.util.invalidateTags([{ type: 'NotificationsList', id: 'LIST' }]));
			dispatch(clearPendingUpdates());
		}
	}, [dispatch, hasPendingUpdates]);

	const finalNotifications = (notificationsResponse?.data || []).map(mapNotificationFromApi);

	function handleDismiss(id) {
		archiveNotification(id);
	}

	function handleNotificationClick(item) {
		if (item?.id) {
			navigate(`/apps/notifications/${item.id}`);
		}
	}

	if (isLoading) {
		return <FuseLoading />;
	}

	return (
		<FusePageSimple
			header={<NotificationsAppHeader />}
			content={
				<div className="flex flex-col w-full p-24 mt-24">
					<Masonry
						breakpointCols={{
							default: 4,
							960: 3,
							600: 2,
							480: 1
						}}
						className="my-masonry-grid flex w-full"
						columnClassName="my-masonry-grid_column flex flex-col p-8"
					>
						{finalNotifications.length > 0 &&
							finalNotifications.map((notification) => (
								<NotificationCard
									key={notification.id}
									className="mb-16 cursor-pointer"
									item={notification}
									onClose={handleDismiss}
									onClick={() => handleNotificationClick(notification)}
								/>
							))}
					</Masonry>
					{finalNotifications.length === 0 && (
						<div className="flex flex-1 items-center justify-center p-16">
							<Typography
								className="text-center text-24"
								color="text.secondary"
							>
								شما هیچ پیامی ندارید
							</Typography>
						</div>
					)}
				</div>
			}
		/>
	);
}

export default NotificationsApp;
