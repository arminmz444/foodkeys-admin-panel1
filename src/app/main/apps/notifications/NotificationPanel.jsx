import FuseScrollbars from '@fuse/core/FuseScrollbars';
import { styled } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import Typography from '@mui/material/Typography';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from 'app/store/hooks';
import { useLocation, useNavigate } from 'react-router-dom';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import Button from '@mui/material/Button';
import NotificationCard from './NotificationCard';
import {
	closeNotificationPanel,
	selectNotificationPanelState,
	toggleNotificationPanel
} from './notificationPanelSlice';
import NotificationApi, { useMarkNotificationAsReadMutation } from './NotificationApi';
import {
	clearPendingUpdates,
	markPreviewNotificationAsRead,
	selectHasPendingUpdates,
	selectPreviewNotifications
} from './models/notificationSlice';

const StyledSwipeableDrawer = styled(SwipeableDrawer)(({ theme }) => ({
	'& .MuiDrawer-paper': {
		backgroundColor: theme.palette.background.default,
		width: 320
	}
}));

function NotificationPanel() {
	const location = useLocation();
	const navigate = useNavigate();
	const dispatch = useAppDispatch();
	const state = useAppSelector(selectNotificationPanelState);
	const notifications = useAppSelector(selectPreviewNotifications);
	const hasPendingUpdates = useAppSelector(selectHasPendingUpdates);
	const [markAsRead] = useMarkNotificationAsReadMutation();

	useEffect(() => {
		if (state) {
			dispatch(closeNotificationPanel());
		}
	}, [location, dispatch]);

	function handleClose() {
		dispatch(closeNotificationPanel());
	}

	function handleNotificationClick(item) {
		if (!item?.id) {
			return;
		}

		if (hasPendingUpdates && !item.read) {
			dispatch(NotificationApi.util.invalidateTags([{ type: 'NotificationsList', id: 'LIST' }]));
			dispatch(clearPendingUpdates());
		}

		markAsRead(item.id);
		dispatch(markPreviewNotificationAsRead(item.id));
		dispatch(closeNotificationPanel());
		navigate(`/apps/notifications/${item.id}`);
	}

	function handleViewAll() {
		dispatch(closeNotificationPanel());

		if (hasPendingUpdates) {
			dispatch(NotificationApi.util.invalidateTags([{ type: 'NotificationsList', id: 'LIST' }]));
			dispatch(clearPendingUpdates());
		}

		navigate('/apps/notifications');
	}

	return (
		<StyledSwipeableDrawer
			open={state}
			anchor="right"
			onOpen={() => {}}
			onClose={() => dispatch(toggleNotificationPanel())}
			disableSwipeToOpen
		>
			<IconButton
				className="absolute right-0 top-0 z-999 m-4"
				onClick={handleClose}
				size="large"
			>
				<FuseSvgIcon color="action">heroicons-outline:x</FuseSvgIcon>
			</IconButton>

			<FuseScrollbars className="flex flex-col p-16 h-full">
				{notifications?.length > 0 ? (
					<div className="flex flex-auto flex-col">
						<div className="mb-24 flex items-end justify-between pt-136">
							<Typography className="text-28 font-semibold leading-none">پیام‌ها و اعلانات</Typography>
							<Typography
								className="cursor-pointer text-12 underline"
								color="secondary"
								onClick={handleViewAll}
							>
								مشاهده همه
							</Typography>
						</div>
						{notifications.map((item) => (
							<NotificationCard
								key={item.id}
								className="mb-16 cursor-pointer"
								item={item}
								onClick={() => handleNotificationClick(item)}
							/>
						))}
					</div>
				) : (
					<div className="flex flex-1 items-center justify-center p-16">
						<Typography
							className="text-center text-24"
							color="text.secondary"
						>
							هیچ پیام جدیدی ندارید
						</Typography>
					</div>
				)}
				<div className="flex items-center justify-center py-16">
					<Button
						size="small"
						variant="outlined"
						onClick={handleViewAll}
					>
						رفتن به صفحه اعلان‌ها
					</Button>
				</div>
			</FuseScrollbars>
		</StyledSwipeableDrawer>
	);
}

export default NotificationPanel;
