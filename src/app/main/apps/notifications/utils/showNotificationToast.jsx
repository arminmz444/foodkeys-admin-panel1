import { closeSnackbar, enqueueSnackbar } from 'notistack';
import NotificationTemplate from '../NotificationTemplate';
import { mapNotificationFromApi } from './notificationUtils';

export default function showNotificationToast(notification) {
	const item = mapNotificationFromApi(notification);

	enqueueSnackbar(item.title, {
		key: String(item.id),
		content: (
			<NotificationTemplate
				item={item}
				onClose={() => {
					closeSnackbar(String(item.id));
				}}
			/>
		)
	});
}
