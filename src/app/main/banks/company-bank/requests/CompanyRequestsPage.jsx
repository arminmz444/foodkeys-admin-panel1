// Generic company requests page (per COMPANY category)
import { useState, useEffect, useCallback } from 'react';
import { debounce } from 'lodash';
import { useParams } from 'react-router-dom';
import FusePageSimple from '@fuse/core/FusePageSimple';
import {
  Typography,
  IconButton,
  CircularProgress,
  Box,
  Tabs,
  Tab,
  Paper,
  TextField,
  InputAdornment,
  Button
} from '@mui/material';
import { Filter, RefreshCw, Search, FileText, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { showMessage } from '@fuse/core/FuseMessage/fuseMessageSlice';
import { useAppDispatch as useDispatch } from 'app/store/hooks';
import FilterDrawer from '../../food-industry-bank/requests/components/FilterDrawer';
import RequestCard from '../../food-industry-bank/requests/components/RequestCard';
import EmptyState from '../../food-industry-bank/requests/components/EmptyState';
import { useGetCompanyRequestsByCategoryQuery } from '../CompanyBankApi';

export default function CompanyRequests() {
  const dispatch = useDispatch();
  const { categoryId } = useParams();

  const [filters, setFilters] = useState({
    status: null,
    type: null,
    search: ''
  });
  const [searchInput, setSearchInput] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 12
  });

  // State to accumulate all loaded items
  const [allRequests, setAllRequests] = useState([]);
  const [totalRequests, setTotalRequests] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const {
    data,
    isLoading,
    error,
    refetch,
    isFetching
  } = useGetCompanyRequestsByCategoryQuery({
    ...pagination,
    ...filters,
    categoryId,
    requestStatus: filters.status,
    sort: JSON.stringify({ createdAt: 'desc' }) // Default sorting by creation date
  });

  // Reset pagination and clear accumulated data when filters or category change
  useEffect(() => {
    setPagination(prev => ({ ...prev, pageNumber: 1 }));
    setAllRequests([]);
    setTotalRequests(0);
    setTotalPages(0);
  }, [filters, categoryId]);

  // Update accumulated data when new data arrives
  useEffect(() => {
    if (data) {
      if (pagination.pageNumber === 1) {
        setAllRequests(data.data || []);
      } else {
        setAllRequests(prev => {
          const existingIds = new Set(prev.map(item => item.requestId));
          const newItems = (data.data || []).filter(item => !existingIds.has(item.requestId));
          return [...prev, ...newItems];
        });
      }
      setTotalRequests(data.totalElements || 0);
      setTotalPages(data.totalPages || 0);
    }
  }, [data, pagination.pageNumber]);

  const debouncedSearch = useCallback(
    debounce((searchValue) => {
      setFilters(prev => ({ ...prev, search: searchValue }));
    }, 500),
    []
  );

  const handleSearchInputChange = ({ target: { value } }) => {
    setSearchInput(value);
    debouncedSearch(value);
  };

  const handleStatusChange = (status) => {
    setFilters(prev => ({ ...prev, status }));
  };

  const handleSearch = () => {
    debouncedSearch.cancel();
    setFilters(prev => ({ ...prev, search: searchInput }));
  };

  const handleSearchClear = () => {
    setSearchInput('');
    setFilters(prev => ({ ...prev, search: '' }));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      debouncedSearch.cancel();
      setFilters(prev => ({ ...prev, search: searchInput }));
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);

    if (newValue === 0) {
      handleStatusChange(null);
    } else if (newValue === 1) {
      handleStatusChange(1); // PENDING
    } else if (newValue === 2) {
      handleStatusChange(2); // APPROVED
    } else if (newValue === 3) {
      handleStatusChange(3); // REJECTED
    }
  };

  useEffect(() => {
    if (error) {
      dispatch(showMessage({
        message: 'خطا در بارگذاری اطلاعات. لطفا دوباره تلاش کنید.',
        variant: 'error'
      }));
    }
  }, [error, dispatch]);

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const handleLoadMore = () => {
    if (totalPages > pagination.pageNumber) {
      setPagination(prev => ({ ...prev, pageNumber: prev.pageNumber + 1 }));
    }
  };

  const requests = allRequests;
  const hasMore = totalPages > pagination.pageNumber;

  const header = (
    <div className="flex flex-col w-full">
      <div className="flex justify-between items-center px-24 py-16">
        <Typography variant="h5" className="font-semibold">
          درخواست‌های شرکت
        </Typography>
        <div className="flex space-x-2">
          <IconButton onClick={() => setDrawerOpen(true)} size="small">
            <Filter />
          </IconButton>
          <IconButton
            onClick={() => refetch()}
            size="small"
            disabled={isLoading || isFetching}
          >
            {isFetching ? (
              <CircularProgress size={20} />
            ) : (
              <RefreshCw />
            )}
          </IconButton>
        </div>
      </div>

      <Paper className="mx-24 mb-16 p-32 flex flex-col sm:flex-row items-center justify-between gap-2">
        <TextField
          placeholder="جستجو در درخواست‌ها..."
          variant="outlined"
          size="small"
          value={searchInput}
          onChange={handleSearchInputChange}
          onKeyPress={handleKeyPress}
          fullWidth
          sx={{ maxWidth: 400 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={20} />
              </InputAdornment>
            ),
            endAdornment: searchInput && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={handleSearchClear}>
                  <X size={16} />
                </IconButton>
              </InputAdornment>
            )
          }}
        />

        <div className="flex gap-2">
          <Button
            variant="outlined"
            size="small"
            startIcon={<FileText size={16} />}
            disabled={isLoading || isFetching}
          >
            گزارش
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={handleSearch}
            disabled={isLoading || isFetching}
          >
            جستجو
          </Button>
        </div>
      </Paper>

      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        indicatorColor="primary"
        textColor="primary"
        variant="scrollable"
        scrollButtons="auto"
        className="px-24 border-b border-gray-200"
      >
        <Tab label="همه" />
        <Tab
          label={
            <div className="flex items-center">
              <span>در انتظار</span>
            </div>
          }
        />
        <Tab label="تایید شده" />
        <Tab label="رد شده" />
      </Tabs>
    </div>
  );

  const renderContent = () => {
    if (isLoading && allRequests.length === 0) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <EmptyState
            message="خطا در بارگذاری اطلاعات"
            onRefresh={refetch}
          />
        </Box>
      );
    }

    if (requests.length === 0) {
      return (
        <EmptyState
          message="هیچ درخواستی یافت نشد"
          onReset={() => setFilters({ status: null, type: null, search: '' })}
          onRefresh={refetch}
        />
      );
    }

    return (
      <>
        <Typography variant="body2" color="text.secondary" className="mb-4">
          نمایش {requests.length} درخواست از {totalRequests} درخواست
        </Typography>

        <div className="w-full flex justify-center">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, minmax(320px, 400px))',
              gap: '24px',
              maxWidth: 'fit-content'
            }}
          >
            {requests.map(request => (
              <motion.div
                key={request.requestId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <RequestCard
                  request={request}
                  onActionComplete={refetch}
                />
              </motion.div>
            ))}
          </div>
        </div>

        {hasMore && (
          <Box display="flex" justifyContent="center" mt={4}>
            <Button
              variant="outlined"
              onClick={handleLoadMore}
              disabled={isFetching}
              startIcon={isFetching ? <CircularProgress size={20} /> : null}
            >
              بارگذاری بیشتر
            </Button>
          </Box>
        )}

        {isFetching && allRequests.length > 0 && (
          <Box display="flex" justifyContent="center" mt={2}>
            <CircularProgress size={24} />
          </Box>
        )}
      </>
    );
  };

  const content = (
    <div className="min-h-screen">
      <div className="px-24 pt-24 pb-24">
        {renderContent()}
      </div>
    </div>
  );

  return (
    <>
      <FusePageSimple
        header={header}
        content={content}
        className="bg-gray-50 min-h-screen"
      />
      <FilterDrawer
        open={drawerOpen}
        filters={filters}
        onClose={() => setDrawerOpen(false)}
        onApply={setFilters}
        isLoading={isLoading}
      />
    </>
  );
}
