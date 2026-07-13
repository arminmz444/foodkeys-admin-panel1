import FuseUtils from '@fuse/utils';
import FuseLoading from '@fuse/core/FuseLoading';
import { Navigate } from 'react-router-dom';
import settingsConfig from 'app/configs/settingsConfig';
import SignInConfig from '../main/sign-in/SignInConfig';
import SignOutConfig from '../main/sign-out/SignOutConfig';
import Error404Page from '../main/404/Error404Page';
import PagesConfigs from '../main/pages/pagesConfigs';
import DashboardsConfigs from '../main/dashboards/dashboardsConfigs';
import AppsConfigs from '../main/apps/appsConfigs';
import banksConfigs from '../main/banks/banksConfigs';
import CategoriesConfig from '../main/category/CategoriesConfig';
import BundlesConfig from '../main/bundle/BundlesConfig.jsx';
import miniAppPageConfig from '../main/miniapps/miniAppPageConfig';
import NewsletterConfig from '../main/newsletter/NewsletterConfig';

const routeConfigs = [
	SignOutConfig,
	SignInConfig,
	CategoriesConfig,
	BundlesConfig,
	NewsletterConfig,
	miniAppPageConfig,
	...PagesConfigs,
	...DashboardsConfigs,
	...AppsConfigs,
	...banksConfigs
];
/**
 * The routes of the application.
 */
const routes = [
	...FuseUtils.generateRoutesFromConfigs(routeConfigs, settingsConfig.defaultAuth),
	{
		path: '/',
		element: <Navigate to="/" replace />,
		auth: settingsConfig.defaultAuth
	},
	{
		path: 'loading',
		element: <FuseLoading />
	},
	{
		path: '404',
		element: <Error404Page />
	},
	{
		path: '*',
		element: <Navigate to="404" />
	}
];
export default routes;
