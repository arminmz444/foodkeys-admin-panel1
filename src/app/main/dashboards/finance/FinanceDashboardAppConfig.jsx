import { lazy } from 'react';
import { Navigate } from 'react-router-dom';

const FinanceDashboardApp = lazy(() => import('./FinanceDashboardApp'));
const TransactionsTable = lazy(() => import('./components/TransactionsTable'));
const PaymentsTable = lazy(() => import('./components/PaymentsTable'));
const Invoice = lazy(() => import('./components/Invoice'));

/**
 * The finance dashboard app config.
 */
const FinanceDashboardAppConfig = {
  settings: {
    layout: {
      config: {}
    }
  },
  routes: [
    {
      path: 'dashboards/finance',
      element: <FinanceDashboardApp />
    },
    {
      path: 'dashboards/finance/transactions',
      element: <TransactionsTable />
    },
    {
      path: 'dashboards/finance/payments',
      element: <PaymentsTable />
    },
    {
      path: 'dashboards/finance/invoice/:invoiceId',
      element: <Invoice />
    },
    {
      path: 'dashboards/finance',
      element: <Navigate to="/dashboards/finance" />
    }
  ]
};

export default FinanceDashboardAppConfig;
