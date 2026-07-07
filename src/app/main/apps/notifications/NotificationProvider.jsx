import useNotificationManager from './hooks/useNotificationManager';

function NotificationProvider({ children }) {
	useNotificationManager();
	return children;
}

export default NotificationProvider;
