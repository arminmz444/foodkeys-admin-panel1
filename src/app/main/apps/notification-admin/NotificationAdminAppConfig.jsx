import { lazy } from 'react';
import { Navigate } from 'react-router-dom';

const NotificationAdminOutlet = lazy(() => import('./NotificationAdminOutlet'));
const NotificationChannelsPage = lazy(() => import('./channels/NotificationChannelsPage'));
const NotificationConfigsPage = lazy(() => import('./configs/NotificationConfigsPage'));
const NotificationConstraintsPage = lazy(() => import('./constraints/NotificationConstraintsPage'));
const InternalEventsPage = lazy(() => import('./events/InternalEventsPage'));

const NotificationAdminAppConfig = {
	settings: {
		layout: {
			config: {
				navbar: { display: true },
				toolbar: { display: true },
				footer: { display: false },
				leftSidePanel: { display: true }
			}
		}
	},
	routes: [
		{
			path: 'apps/notification-admin',
			element: <NotificationAdminOutlet />,
			children: [
				{ path: '', element: <Navigate to="channels" /> },
				{ path: 'channels', element: <NotificationChannelsPage /> },
				{ path: 'configs', element: <NotificationConfigsPage /> },
				{ path: 'constraints', element: <NotificationConstraintsPage /> },
				{ path: 'events', element: <InternalEventsPage /> }
			]
		}
	]
};

export default NotificationAdminAppConfig;
