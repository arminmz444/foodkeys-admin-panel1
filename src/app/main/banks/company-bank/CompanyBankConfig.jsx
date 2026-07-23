import { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import CompanyRequestsPage from './requests/CompanyRequestsPage';

// The company detail page is category-agnostic (it fetches by companyId), so we
// reuse the existing, fully-featured implementation from the food-industry bank.
const Company = lazy(() => import('../food-industry-bank/company/Company'));
const Companies = lazy(() => import('./companies/Companies'));
const CompanyBank = lazy(() => import('./CompanyBank'));

/**
 * The generic Company Bank configuration.
 *
 * A single route tree serves every dynamically generated COMPANY category at
 * `banks/company/:categoryId/*`. The `:categoryId` param is used to fetch the
 * company list and requests (see `CompanyBankApi`).
 */
const CompanyBankConfig = {
	settings: {
		layout: {}
	},
	routes: [
		{
			path: 'banks/:categoryId',
			element: <CompanyBank />,
			children: [
				{
					path: '',
					element: <Navigate to="company/list" />
				},
				{
					path: 'company',
					element: <Navigate to="company/list" />
				},
				{
					path: 'company/list',
					element: <Companies />
				},
				{
					path: 'company/:companyId/*',
					element: <Company />
				},
				{
					path: 'request/*',
					element: <CompanyRequestsPage />
				}
			]
		}
	]
};

export default CompanyBankConfig;
