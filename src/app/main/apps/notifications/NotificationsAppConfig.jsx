import { lazy } from 'react';

const NotificationsApp = lazy(() => import('./NotificationsApp'));
const NotificationDetail = lazy(() => import('./NotificationDetail'));

const NotificationsAppConfig = {
	settings: {
		layout: {
			config: {}
		}
	},
	routes: [
		{
			path: 'apps/notifications',
			children: [
				{
					path: '',
					element: <NotificationsApp />,
					exact: true
				},
				{
					path: ':id',
					element: <NotificationDetail />
				}
			]
		}
	]
};

export default NotificationsAppConfig;
