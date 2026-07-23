import { useState, useEffect, useCallback, useRef } from 'react';
import Typography from '@mui/material/Typography';
import { motion, AnimatePresence } from 'framer-motion';
import FuseLoading from '@fuse/core/FuseLoading';
import Button from '@mui/material/Button';
import { Input, Fab, CircularProgress, Zoom } from '@mui/material';
import _ from '@lodash';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import FuseUtils from '@fuse/utils';
import ServiceItem from '../components/ServiceItem';
import NewServiceItem from '../components/NewServiceItem';
import ServiceFilterDrawer from '../components/ServiceFilterDrawer';
import ActiveFilters from '../components/ActiveFilters';
import { useGetServicesQuery, useGetServiceSubcategoryOptionsQuery } from '../ServicesBankApi';

const PAGE_SIZE = 10;

function Services() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [filterParams, setFilterParams] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [accumulatedServices, setAccumulatedServices] = useState([]);
  const [showFab, setShowFab] = useState(false);
  const topRef = useRef(null);
  const sentinelRef = useRef(null);

  const { data: subcategoryOptionsData } = useGetServiceSubcategoryOptionsQuery(4);
  const subcategoryOptions = Array.isArray(subcategoryOptionsData)
    ? subcategoryOptionsData
    : subcategoryOptionsData?.data || [];
  const { data: responseData, isLoading, isFetching } = useGetServicesQuery({
    pageSize: PAGE_SIZE,
    pageNumber: currentPage,
    search: debouncedSearchQuery,
    filters: filterParams,
  });

  const apiServices = responseData?.data || [];
  const pagination = responseData?.pagination || {};
  const totalPages = pagination.totalPages || 1;
  const totalElements = pagination.totalElements || 0;
  const hasMore = currentPage < totalPages;

  // Accumulate services from each page
  useEffect(() => {
    if (apiServices.length > 0) {
      setAccumulatedServices((prev) => {
        if (currentPage === 1) {
          return apiServices;
        }
        // Avoid duplicates
        const existingIds = new Set(prev.map((s) => s.id));
        const newItems = apiServices.filter((s) => !existingIds.has(s.id));
        return [...prev, ...newItems];
      });
    } else if (currentPage === 1) {
      setAccumulatedServices([]);
    }
  }, [apiServices, currentPage]);

  // Reset to page 1 when search or filters change
  useEffect(() => {
    setCurrentPage(1);
    setAccumulatedServices([]);
  }, [debouncedSearchQuery, filterParams]);

  const [draftServices, setDraftServices] = useState(() => {
    return JSON.parse(localStorage.getItem('draftServices')) || [];
  });

  const allServices = [...draftServices, ...accumulatedServices];

  // Debounced search effect
  useEffect(() => {
    const debouncedSearch = _.debounce((query) => {
      setDebouncedSearchQuery(query);
    }, 500);

    debouncedSearch(searchQuery);

    return () => {
      debouncedSearch.cancel();
    };
  }, [searchQuery]);

  const handleSearchChange = useCallback((event) => {
    setSearchQuery(event.target.value);
  }, []);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isFetching) {
          setCurrentPage((prev) => prev + 1);
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(sentinel);

    return () => {
      observer.unobserve(sentinel);
    };
  }, [hasMore, isFetching]);

  // Show/hide FAB based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      setShowFab(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollToTopAndCreateDraft = () => {
    // Create the draft
    const draftId = `draft-${FuseUtils.generateGUID()}`;
    const newDraft = {
      id: draftId,
      name: '',
      ranking: 0,
      subCategoryId: null,
      description: '',
      serviceData: {},
      serviceAdditionalData: {},
      updatedAt: new Date().toISOString(),
      isDraft: true,
      icon: 'heroicons-outline:plus',
    };

    const existingDrafts = JSON.parse(localStorage.getItem('draftServices')) || [];
    const updatedDrafts = [...existingDrafts, newDraft];
    localStorage.setItem('draftServices', JSON.stringify(updatedDrafts));
    setDraftServices(updatedDrafts);

    // Scroll to top with smooth animation
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleDraftCreated = () => {
    const drafts = JSON.parse(localStorage.getItem('draftServices')) || [];
    setDraftServices(drafts);
  };

  const handleRemoveDraft = (draftId) => {
    const drafts = JSON.parse(localStorage.getItem('draftServices')) || [];
    const updated = drafts.filter((draft) => draft.id !== draftId);
    localStorage.setItem('draftServices', JSON.stringify(updated));
    setDraftServices(updated);
  };

  const handleClearDrafts = () => {
    localStorage.removeItem('draftServices');
    setDraftServices([]);
  };

  const [filterOpen, setFilterOpen] = useState(false);
  const handleOpenFilter = () => setFilterOpen(true);
  const handleCloseFilter = () => setFilterOpen(false);
  const handleApplyFilters = (filters) => {
    setFilterParams(filters);
  };

  const handleRemoveFilter = (filterKey) => {
    const newFilters = { ...filterParams };
    delete newFilters[filterKey];
    setFilterParams(newFilters);
  };

  const handleClearAllFilters = () => {
    setFilterParams({});
  };

  const containerVariants = { show: { transition: { staggerChildren: 0.04 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  if (isLoading && currentPage === 1) {
    return <FuseLoading />;
  }

  return (
    <div className="flex flex-col items-center container p-8 sm:p-16" ref={topRef}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 0.1 } }}
      >
        <Typography variant="h4" className="mt-8 mb-32 text-center font-extrabold">
          سرویس‌های ثبت‌شده در بانک خدمات
        </Typography>
      </motion.div>

      <div className="w-full flex flex-col sm:flex-row items-center justify-between mb-8">
        <div className="flex flex-1 items-center space-x-2 space-x-reverse me-4">
          <Input
            type="text"
            placeholder='جستجوی سرویس '
            value={searchQuery}
            onChange={handleSearchChange}
            className="flex-1 p-2 border-t-0 border-l-0 border-r-0 border border-gray-300 rounded me-4"
          />
          <Button variant="contained" color="primary" onClick={handleOpenFilter}>
            فیلترها
          </Button>
        </div>
        {draftServices.length > 0 && (
          <Button variant="outlined" color="error" onClick={handleClearDrafts} className="mt-4 ms-4 sm:mt-0">
            پاک کردن پیش‌نویس‌ها
          </Button>
        )}
      </div>

      <ActiveFilters
        filters={filterParams}
        onRemoveFilter={handleRemoveFilter}
        onClearAll={handleClearAllFilters}
      />

      <ServiceFilterDrawer
        open={filterOpen}
        onClose={handleCloseFilter}
        onApplyFilters={handleApplyFilters}
        subcategoryOptions={subcategoryOptions || []}
      />

      {/* Pagination info */}
      <div className="w-full flex justify-between items-center mt-8 mb-4 px-4">
        <Typography variant="body2" color="text.secondary">
          {`نمایش ${accumulatedServices.length} از ${totalElements} سرویس`}
        </Typography>
        {isFetching && currentPage > 1 && (
          <Typography variant="body2" color="text.secondary">
            در حال بارگذاری...
          </Typography>
        )}
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-8 w-full"
      >
        {/* NewServiceItem as first item */}
        <motion.div
          variants={itemVariants}
          className="min-w-full sm:min-w-224 min-h-360"
        >
          <NewServiceItem onDraftCreated={handleDraftCreated} />
        </motion.div>

        {/* All services */}
        {allServices.map((service) => (
          <motion.div
            key={service.id}
            variants={itemVariants}
            className="min-h-80"
          >
            <ServiceItem service={service} onRemoveDraft={handleRemoveDraft} />
          </motion.div>
        ))}
      </motion.div>

      {/* Sentinel element for infinite scroll */}
      <div ref={sentinelRef} className="w-full h-10 flex justify-center items-center mt-16">
        {isFetching && currentPage > 1 && (
          <CircularProgress size={32} color="secondary" />
        )}
        {!hasMore && accumulatedServices.length > 0 && (
          <Typography variant="body2" color="text.secondary" className="py-16">
            تمام سرویس‌ها بارگذاری شدند
          </Typography>
        )}
      </div>

      {/* Floating Action Button - left side */}
      <AnimatePresence>
        {showFab && (
          <Zoom in={showFab}>
            <Fab
              color="secondary"
              variant="extended"
              onClick={handleScrollToTopAndCreateDraft}
              sx={{
                position: 'fixed',
                bottom: 32,
                right: 32,
                zIndex: 1000,
                fontWeight: 700,
                fontSize: '1.05rem',
                px: 2,
                boxShadow: 6,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: 10,
                },
              }}
            >
              <FuseSvgIcon size={20} sx={{ mr: 1 }}>
                heroicons-outline:plus
              </FuseSvgIcon>
              ایجاد سرویس جدید (پیش‌نویس)
            </Fab>
          </Zoom>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Services;
