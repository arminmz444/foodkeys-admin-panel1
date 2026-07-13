import { lazy } from 'react';

const ServiceBank = lazy(() => import('./ServicesBank'));
const Services = lazy(() => import('./services/Services'));
const ServiceSubCategories = lazy(() => import('./subcategories/SubCategories'));
const ServiceSchemaCreator = lazy(() => import('./subcategories/ServiceSchemaCreator'));
const ServiceDetails = lazy(() => import('./services/ServiceDetails'));
const CreateServiceSchemaForm = lazy(
	() => import('@/app/main/banks/services/service-schemas/CreateServiceSchemaForm.jsx')
);
const ServiceRequestsPage = lazy(() => import('./requests/ServiceRequestsPage'));

/**
 * The Services Industry Bank configuration.
 */
const ServicesBankConfig = {
	settings: {
		layout: {}
	},
	routes: [
		{
			path: 'banks/service',
			element: <ServiceBank />,
			children: [
				{
					path: ':id/details',
					element: <ServiceDetails />,
				},
				{
					path: '',
					element: <Services />
				},
				{
					path: 'subcategory',
					element: <ServiceSubCategories />
				},
				{
					path: 'subcategory/:id/schema',
					element: <ServiceSchemaCreator />
				},
				{
					path: 'schema',
					element: <CreateServiceSchemaForm />
				},
				{
					path: 'requests',
					element: <ServiceRequestsPage />
				}
			]
		}
	]
};
export default ServicesBankConfig;
