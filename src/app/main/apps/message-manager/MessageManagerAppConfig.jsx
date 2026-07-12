import { lazy } from 'react';
import { Navigate } from 'react-router-dom';

const MessageManagerOutlet = lazy(() => import('./MessageManagerOutlet.jsx'));
const MessageManagerApp = lazy(() => import('./MessageManagerApp.jsx'));
const MessagingHistoryPage = lazy(() => import('./history/MessagingHistoryPage.jsx'));

const MessageManagerAppConfig = {
	settings: {
		layout: {
			config: {
				navbar: { display: true },
				toolbar: { display: true },
				footer: { display: false },
				leftSidePanel: { display: true },
				rightSidePanel: { display: false }
			}
		}
	},
	routes: [
		{
			path: 'apps/message-manager',
			element: <MessageManagerOutlet />,
			children: [
				{ path: '', element: <Navigate to="templates" /> },
				{ path: 'templates', element: <MessageManagerApp /> },
				{ path: 'run/*', element: <Navigate to="/apps/message-manager/templates" replace /> },
				{ path: 'history', element: <MessagingHistoryPage /> }
			]
		}
	]
};

export default MessageManagerAppConfig;
