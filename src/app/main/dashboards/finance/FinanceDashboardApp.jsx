import { useState, useMemo, useCallback } from 'react';
import FusePageSimple from '@fuse/core/FusePageSimple';
import { motion } from 'framer-motion';
import FinanceDashboardAppHeader from './FinanceDashboardAppHeader';
import { FinanceDashboardWidgets } from './components';
import { useGetFinanceDashboardWidgetsQuery } from './FinanceDashboardApi';
import { buildWidgetQueryParams, getDateParams } from './financeDashboardUtils';

const container = {
  show: {
    transition: {
      staggerChildren: 0.04,
    },
  },
};

const initialDates = getDateParams(30);

const DEFAULT_FILTERS = {
  dateRange: '30d',
  dateFrom: initialDates.dateFrom || '',
  dateTo: initialDates.dateTo || '',
  status: '',
  user: '',
  transactionType: 'all',
  granularity: 'DAILY',
};

/**
 * The finance dashboard app.
 */
function FinanceDashboardApp() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const queryParams = useMemo(() => buildWidgetQueryParams(filters), [filters]);

  const { data: widgets, isLoading, refetch, isFetching } = useGetFinanceDashboardWidgetsQuery(queryParams);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleFiltersChange = useCallback((nextFilters) => {
    setFilters(nextFilters);
  }, []);

  return (
    <FusePageSimple
      header={
        <FinanceDashboardAppHeader
          onRefresh={handleRefresh}
          isRefreshing={isFetching}
          appliedFilters={widgets?.appliedFilters}
          summary={widgets?.summary}
        />
      }
      content={
        <div className="w-full py-24 px-24 md:px-32 pb-24">
          <motion.div
            className="w-full"
            variants={container}
            initial="hidden"
            animate="show"
          >
            <FinanceDashboardWidgets
              widgets={widgets}
              isLoading={isLoading}
              isFetching={isFetching}
              filters={filters}
              onFiltersChange={handleFiltersChange}
            />
          </motion.div>
        </div>
      }
      scroll="content"
    />
  );
}

export default FinanceDashboardApp;
