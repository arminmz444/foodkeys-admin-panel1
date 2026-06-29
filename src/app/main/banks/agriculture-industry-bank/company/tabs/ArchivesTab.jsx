import { useState, useEffect, useMemo } from 'react';
import {
  Typography,
  Paper,
  Tabs,
  Tab,
  Box,
  CircularProgress,
  Grid,
  Button,
  Alert,
  Snackbar,
  Divider,
  Dialog,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  IconButton,
  Tooltip,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  InputAdornment,
  Menu,
  Avatar,
  useTheme,
  alpha,
} from '@mui/material';
import {
  History as HistoryIcon,
  Compare as CompareIcon,
  Add as AddIcon,
  GridView as GridViewIcon,
  ViewTimeline as TimelineViewIcon,
  Search as SearchIcon,
  Sort as SortIcon,
  Inventory as ArchiveIcon,
  ArrowDownward as ArrowDownIcon,
  ArrowUpward as ArrowUpIcon,
  CalendarToday as CalendarIcon,
  SortByAlpha as SortAlphaIcon,
  Category as CategoryIcon,
  Close as CloseIcon,
  FolderOff as EmptyIcon,
} from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns-jalali';
import ArchiveCard from 'src/app/main/apps/archive/ArchiveCard';
import {
  useGetArchivesByEntityQuery,
  useCreateArchiveTaskMutation,
  useProcessArchiveTaskMutation,
  useDeleteArchiveMutation,
  useGetArchiveTypesQuery,
} from 'src/app/main/apps/archive/store/archiveApi';
import ArchiveCompareDialog from 'src/app/main/apps/archive/ArchiveCompareDialog';
import RollbackDialog from 'src/app/main/apps/archive/RollbackDialog';
import ArchiveDetailsDialog from 'src/app/main/apps/archive/ArchiveDetailsDialog';
import ConfirmDialog from 'src/app/main/apps/archive/ConfirmDialog';
import { ErrorBoundary } from 'react-error-boundary';
import ErrorFallback from 'src/app/shared-components/ErrorFallback';

const archiveTypeLabels = {
  MANUAL: 'آرشیو دستی',
  AUTOMATIC_BACKUP: 'پشتیبان خودکار',
  AUTOMATIC_ROLLBACK: 'بازگشت خودکار',
  BEFORE_UPDATE: 'قبل از بروزرسانی',
  AFTER_UPDATE: 'بعد از بروزرسانی',
};

const sortOptions = [
  { value: 'date-desc', label: 'جدیدترین', icon: <ArrowDownIcon fontSize="small" /> },
  { value: 'date-asc', label: 'قدیمی‌ترین', icon: <ArrowUpIcon fontSize="small" /> },
  { value: 'name-asc', label: 'نام (الف-ی)', icon: <SortAlphaIcon fontSize="small" /> },
  { value: 'name-desc', label: 'نام (ی-الف)', icon: <SortAlphaIcon fontSize="small" /> },
  { value: 'type', label: 'نوع آرشیو', icon: <CategoryIcon fontSize="small" /> },
];

function formatDateJalali(dateString) {
  if (!dateString) return '-';
  try {
    return format(new Date(dateString), 'yyyy/MM/dd - HH:mm');
  } catch {
    return dateString;
  }
}

function TimelineItem({ archive, index, onView, onRollback, onDelete, compareMode, selected, onSelect }) {
  const theme = useTheme();
  const isSelected = selected;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          position: 'relative',
          pb: 3,
          '&:last-child': { pb: 0 },
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
          <Avatar
            sx={{
              width: 40,
              height: 40,
              bgcolor: isSelected
                ? theme.palette.primary.main
                : index === 0
                  ? theme.palette.success.main
                  : alpha(theme.palette.primary.main, 0.15),
              color: isSelected || index === 0 ? 'white' : theme.palette.primary.main,
              cursor: compareMode ? 'pointer' : 'default',
              border: isSelected ? `3px solid ${theme.palette.primary.dark}` : 'none',
              transition: 'all 0.2s',
              '&:hover': compareMode ? { transform: 'scale(1.1)' } : {},
            }}
            onClick={compareMode ? onSelect : undefined}
          >
            <ArchiveIcon sx={{ fontSize: 20 }} />
          </Avatar>
          <Box
            sx={{
              width: 2,
              flexGrow: 1,
              bgcolor: alpha(theme.palette.primary.main, 0.15),
              mt: 1,
              minHeight: 20,
            }}
          />
        </Box>

        <Paper
          variant="outlined"
          sx={{
            flex: 1,
            p: 2,
            cursor: 'pointer',
            borderRadius: 2,
            border: isSelected ? `2px solid ${theme.palette.primary.main}` : '1px solid',
            borderColor: isSelected ? 'primary.main' : 'divider',
            bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.04) : index === 0 ? alpha(theme.palette.success.main, 0.03) : 'background.paper',
            transition: 'all 0.2s',
            '&:hover': {
              borderColor: 'primary.main',
              boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.12)}`,
            },
          }}
          onClick={compareMode ? onSelect : () => onView(archive.id)}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Box>
              <Typography variant="subtitle1" fontWeight={600}>{archive.name || 'بدون نام'}</Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                <Chip
                  label={archiveTypeLabels[archive.archiveType || archive.metadata?.archiveType] || archive.archiveType || archive.metadata?.archiveType || '-'}
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ height: 22 }}
                />
                {index === 0 && (
                  <Chip label="آخرین نسخه" size="small" color="success" sx={{ height: 22 }} />
                )}
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {!compareMode && (
                <>
                  <Tooltip title="بازگشت">
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); onRollback(archive.id); }}>
                      <HistoryIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="حذف">
                    <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); onDelete(archive.id); }}>
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </>
              )}
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 3, mt: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <CalendarIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                {formatDateJalali(archive.createdAt)}
              </Typography>
            </Box>
            {archive.createdBy && (
              <Typography variant="caption" color="text.secondary">
                ایجاد کننده: {archive.createdBy}
              </Typography>
            )}
          </Box>

          {archive.description && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {archive.description}
            </Typography>
          )}
        </Paper>
      </Box>
    </motion.div>
  );
}

function EmptyState() {
  const theme = useTheme();
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
      <Paper
        sx={{
          py: 8,
          px: 4,
          textAlign: 'center',
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.03)} 0%, ${alpha(theme.palette.secondary.main, 0.03)} 100%)`,
          border: `1px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
          borderRadius: 3,
        }}
      >
        <EmptyIcon sx={{ fontSize: 80, color: alpha(theme.palette.primary.main, 0.2), mb: 2 }} />
        <Typography variant="h6" color="text.secondary" fontWeight={600}>
          هیچ آرشیوی یافت نشد
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, maxWidth: 400, mx: 'auto' }}>
          هنوز هیچ آرشیوی برای این شرکت ایجاد نشده است. با کلیک بر روی دکمه "ایجاد آرشیو جدید" اولین آرشیو خود را بسازید.
        </Typography>
      </Paper>
    </motion.div>
  );
}

function ArchivesTab() {
  const { companyId } = useParams();
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedArchives, setSelectedArchives] = useState([]);
  const [compareMode, setCompareMode] = useState(false);
  const [compareDialogOpen, setCompareDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [rollbackDialogOpen, setRollbackDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedArchiveId, setSelectedArchiveId] = useState(null);
  const [selectedArchive, setSelectedArchive] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [viewMode, setViewMode] = useState('grid');
  const [searchText, setSearchText] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');
  const [sortMenuAnchor, setSortMenuAnchor] = useState(null);
  const [archiveTaskData, setArchiveTaskData] = useState({
    name: '',
    description: '',
    entityName: 'Company',
    entityId: companyId,
    archiveType: 'MANUAL',
  });

  const { data: companyArchives, isLoading: isLoadingArchives, refetch } = useGetArchivesByEntityQuery({
    entityType: 'Company',
    entityId: companyId,
    page: 0,
    size: 100,
  });
  const { data: archiveTypes, isLoading: isLoadingTypes } = useGetArchiveTypesQuery();
  const [createArchiveTask, { isLoading: isCreating }] = useCreateArchiveTaskMutation();
  const [processArchiveTask, { isLoading: isProcessing }] = useProcessArchiveTaskMutation();
  const [deleteArchive] = useDeleteArchiveMutation();

  useEffect(() => {
    setSelectedArchives([]);
    setCompareMode(false);
  }, [companyArchives]);

  const filteredAndSortedArchives = useMemo(() => {
    if (!companyArchives?.data) return [];

    let result = [...companyArchives.data];

    if (activeTab > 0 && archiveTypes?.[activeTab - 1]) {
      const archiveTypeName = archiveTypes[activeTab - 1].value;
      result = result.filter(a => a.metadata?.archiveType === archiveTypeName || a.archiveType === archiveTypeName);
    }

    if (searchText.trim()) {
      const search = searchText.trim().toLowerCase();
      result = result.filter(a =>
        (a.name || '').toLowerCase().includes(search) ||
        (a.description || '').toLowerCase().includes(search) ||
        (a.createdBy || '').toLowerCase().includes(search) ||
        (a.archiveType || a.metadata?.archiveType || '').toLowerCase().includes(search)
      );
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'date-asc':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'name-asc':
          return (a.name || '').localeCompare(b.name || '', 'fa');
        case 'name-desc':
          return (b.name || '').localeCompare(a.name || '', 'fa');
        case 'type':
          return (a.archiveType || a.metadata?.archiveType || '').localeCompare(b.archiveType || b.metadata?.archiveType || '');
        default:
          return 0;
      }
    });

    return result;
  }, [companyArchives, activeTab, archiveTypes, searchText, sortBy]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setSelectedArchives([]);
  };

  const handleArchiveSelection = (archiveId) => {
    if (!compareMode) {
      handleViewArchive(archiveId);
      return;
    }
    setSelectedArchives((prev) => {
      if (prev.includes(archiveId)) return prev.filter((id) => id !== archiveId);
      if (prev.length >= 2) return [prev[1], archiveId];
      return [...prev, archiveId];
    });
  };

  const handleViewArchive = (archiveId) => {
    setSelectedArchiveId(archiveId);
    setSelectedArchive(companyArchives.data.find((a) => a.id === archiveId));
    setDetailsDialogOpen(true);
  };

  const handleToggleCompareMode = () => {
    setCompareMode((prev) => !prev);
    setSelectedArchives([]);
  };

  const handleOpenCompareDialog = () => {
    if (selectedArchives.length !== 2) {
      showSnackbar('لطفاً دو آرشیو برای مقایسه انتخاب کنید', 'warning');
      return;
    }
    setCompareDialogOpen(true);
  };

  const handleOpenCreateDialog = () => {
    setArchiveTaskData({
      name: `آرشیو شرکت ${companyId}`,
      description: 'آرشیو دستی ایجاد شده توسط کاربر',
      entityName: 'Company',
      entityId: companyId,
      archiveType: 'MANUAL',
    });
    setCreateDialogOpen(true);
  };

  const handleOpenRollbackDialog = (archiveId) => {
    setSelectedArchiveId(archiveId);
    setSelectedArchive(companyArchives.data.find((a) => a.id === archiveId));
    setRollbackDialogOpen(true);
  };

  const handleOpenDeleteDialog = (archiveId) => {
    setSelectedArchiveId(archiveId);
    setSelectedArchive(companyArchives.data.find((a) => a.id === archiveId));
    setDeleteDialogOpen(true);
  };

  const handleCreateArchiveTask = async () => {
    try {
      const createResponse = await createArchiveTask(archiveTaskData).unwrap();
      const taskId = createResponse?.id || createResponse?.data?.id;

      if (!taskId) {
        showSnackbar('خطا: شناسه وظیفه آرشیو دریافت نشد', 'error');
        return;
      }

      try {
        await processArchiveTask(taskId).unwrap();
        showSnackbar('آرشیو شرکت با موفقیت ایجاد شد', 'success');
        setCreateDialogOpen(false);
        setTimeout(() => refetch(), 500);
      } catch (processError) {
        showSnackbar(`خطا در پردازش آرشیو: ${processError.message || 'خطای ناشناخته'}`, 'error');
      }
    } catch (error) {
      showSnackbar(`خطا در ایجاد آرشیو: ${error.message || 'خطای ناشناخته'}`, 'error');
    }
  };

  const handleDeleteArchive = async () => {
    try {
      await deleteArchive(selectedArchiveId).unwrap();
      showSnackbar('آرشیو با موفقیت حذف شد', 'success');
      setDeleteDialogOpen(false);
      setTimeout(() => refetch(), 500);
    } catch (error) {
      showSnackbar(`خطا در حذف آرشیو: ${error.message || 'خطای ناشناخته'}`, 'error');
    }
  };

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  if (isLoadingArchives || isLoadingTypes) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8, flexDirection: 'column', gap: 2 }}>
        <CircularProgress />
        <Typography variant="body2" color="text.secondary">در حال بارگذاری آرشیوها...</Typography>
      </Box>
    );
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div className="w-full">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Paper
            sx={{
              mb: 3,
              overflow: 'hidden',
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Box
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                px: 3,
                py: 2,
                color: 'white',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <ArchiveIcon sx={{ fontSize: 28 }} />
                  <Typography variant="h6" fontWeight={700}>مدیریت آرشیو شرکت</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant={compareMode ? 'contained' : 'outlined'}
                    size="small"
                    startIcon={<CompareIcon />}
                    onClick={handleToggleCompareMode}
                    sx={{
                      color: 'white',
                      borderColor: alpha('#fff', 0.5),
                      bgcolor: compareMode ? alpha('#fff', 0.2) : 'transparent',
                      '&:hover': { borderColor: 'white', bgcolor: alpha('#fff', 0.15) },
                    }}
                  >
                    {compareMode ? 'لغو مقایسه' : 'مقایسه'}
                  </Button>
                  {compareMode && selectedArchives.length === 2 && (
                    <Button
                      variant="contained"
                      size="small"
                      onClick={handleOpenCompareDialog}
                      sx={{ bgcolor: alpha('#fff', 0.25), '&:hover': { bgcolor: alpha('#fff', 0.35) } }}
                    >
                      مقایسه انتخاب شده‌ها
                    </Button>
                  )}
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={handleOpenCreateDialog}
                    sx={{ bgcolor: alpha('#fff', 0.2), '&:hover': { bgcolor: alpha('#fff', 0.3) } }}
                  >
                    آرشیو جدید
                  </Button>
                </Box>
              </Box>

              {compareMode && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                  <Typography variant="body2" sx={{ mt: 1, opacity: 0.85 }}>
                    {selectedArchives.length === 0
                      ? 'دو آرشیو را برای مقایسه انتخاب کنید'
                      : selectedArchives.length === 1
                        ? 'یک آرشیو دیگر انتخاب کنید'
                        : 'دو آرشیو انتخاب شد - آماده مقایسه'}
                  </Typography>
                </motion.div>
              )}
            </Box>

            <Box sx={{ px: 2, pt: 1 }}>
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                indicatorColor="primary"
                textColor="primary"
              >
                <Tab label="همه آرشیوها" />
                {archiveTypes?.map((type) => (
                  <Tab key={type.value} label={type.label} />
                ))}
              </Tabs>
            </Box>
          </Paper>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
          <Paper
            variant="outlined"
            sx={{
              mb: 3,
              p: 2,
              display: 'flex',
              gap: 2,
              alignItems: 'center',
              flexWrap: 'wrap',
              borderRadius: 2,
            }}
          >
            <TextField
              size="small"
              placeholder="جستجو در آرشیوها..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              sx={{ minWidth: 250, flex: 1 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: searchText && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchText('')}>
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Tooltip title="مرتب‌سازی">
                <IconButton onClick={(e) => setSortMenuAnchor(e.currentTarget)} color={sortBy !== 'date-desc' ? 'primary' : 'default'}>
                  <SortIcon />
                </IconButton>
              </Tooltip>
              <Menu
                anchorEl={sortMenuAnchor}
                open={Boolean(sortMenuAnchor)}
                onClose={() => setSortMenuAnchor(null)}
              >
                {sortOptions.map((opt) => (
                  <MenuItem
                    key={opt.value}
                    selected={sortBy === opt.value}
                    onClick={() => { setSortBy(opt.value); setSortMenuAnchor(null); }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {opt.icon}
                      <Typography variant="body2">{opt.label}</Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Menu>

              <Divider orientation="vertical" flexItem />

              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(e, v) => v && setViewMode(v)}
                size="small"
              >
                <ToggleButton value="grid">
                  <Tooltip title="نمای شبکه‌ای">
                    <GridViewIcon fontSize="small" />
                  </Tooltip>
                </ToggleButton>
                <ToggleButton value="timeline">
                  <Tooltip title="نمای خط زمانی">
                    <TimelineViewIcon fontSize="small" />
                  </Tooltip>
                </ToggleButton>
              </ToggleButtonGroup>

              <Chip
                label={`${filteredAndSortedArchives.length} آرشیو`}
                size="small"
                color="primary"
                variant="outlined"
              />
            </Box>
          </Paper>
        </motion.div>

        <AnimatePresence mode="wait">
          {filteredAndSortedArchives.length === 0 ? (
            <EmptyState key="empty" />
          ) : viewMode === 'grid' ? (
            <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Grid container spacing={2}>
                {filteredAndSortedArchives.map((archive, index) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={archive.id}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.04 }}
                    >
                      <ArchiveCard
                        archive={archive}
                        selected={selectedArchives.includes(archive.id)}
                        compareMode={compareMode}
                        compareFirst={compareMode && selectedArchives[0] === archive.id}
                        compareSecond={compareMode && selectedArchives[1] === archive.id}
                        onSelect={() => handleArchiveSelection(archive.id)}
                        onView={() => handleViewArchive(archive.id)}
                        onRollback={() => handleOpenRollbackDialog(archive.id)}
                        onDelete={() => handleOpenDeleteDialog(archive.id)}
                      />
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            </motion.div>
          ) : (
            <motion.div key="timeline" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Box sx={{ maxWidth: 800, mx: 'auto' }}>
                {filteredAndSortedArchives.map((archive, index) => (
                  <TimelineItem
                    key={archive.id}
                    archive={archive}
                    index={index}
                    onView={handleViewArchive}
                    onRollback={handleOpenRollbackDialog}
                    onDelete={handleOpenDeleteDialog}
                    compareMode={compareMode}
                    selected={selectedArchives.includes(archive.id)}
                    onSelect={() => handleArchiveSelection(archive.id)}
                  />
                ))}
              </Box>
            </motion.div>
          )}
        </AnimatePresence>

        {compareDialogOpen && selectedArchives.length === 2 && (
          <ArchiveCompareDialog
            firstArchiveId={selectedArchives[0]}
            secondArchiveId={selectedArchives[1]}
            onClose={() => setCompareDialogOpen(false)}
            onShowSnackbar={showSnackbar}
          />
        )}

        {selectedArchive && detailsDialogOpen && (
          <ArchiveDetailsDialog
            open={detailsDialogOpen}
            onClose={() => setDetailsDialogOpen(false)}
            archive={selectedArchive}
            onRollback={() => {
              setDetailsDialogOpen(false);
              handleOpenRollbackDialog(selectedArchive.id);
            }}
            onDelete={() => {
              setDetailsDialogOpen(false);
              handleOpenDeleteDialog(selectedArchive.id);
            }}
          />
        )}

        <Dialog
          open={createDialogOpen}
          onClose={() => setCreateDialogOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { borderRadius: 3 } }}
        >
          <Box
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              px: 3,
              py: 2,
              color: 'white',
            }}
          >
            <Typography variant="h6" fontWeight={700}>ایجاد آرشیو جدید</Typography>
            <Typography variant="body2" sx={{ opacity: 0.85 }}>یک نسخه پشتیبان از وضعیت فعلی شرکت ایجاد کنید</Typography>
          </Box>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, my: 2 }}>
              <TextField
                label="نام آرشیو"
                fullWidth
                value={archiveTaskData.name}
                onChange={(e) => setArchiveTaskData((prev) => ({ ...prev, name: e.target.value }))}
                required
              />
              <TextField
                label="توضیحات"
                fullWidth
                multiline
                rows={3}
                value={archiveTaskData.description}
                onChange={(e) => setArchiveTaskData((prev) => ({ ...prev, description: e.target.value }))}
              />
              <FormControl fullWidth required>
                <InputLabel>نوع آرشیو</InputLabel>
                <Select
                  value={archiveTaskData.archiveType}
                  label="نوع آرشیو"
                  onChange={(e) => setArchiveTaskData((prev) => ({ ...prev, archiveType: e.target.value }))}
                >
                  {archiveTypes?.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setCreateDialogOpen(false)} color="inherit">
              انصراف
            </Button>
            <Button
              onClick={handleCreateArchiveTask}
              color="primary"
              variant="contained"
              disabled={isCreating || isProcessing || !archiveTaskData.name}
              sx={{ borderRadius: 2, minWidth: 120 }}
            >
              {isCreating || isProcessing ? <CircularProgress size={24} /> : 'ایجاد آرشیو'}
            </Button>
          </DialogActions>
        </Dialog>

        {selectedArchive && (
          <RollbackDialog
            open={rollbackDialogOpen}
            onClose={() => setRollbackDialogOpen(false)}
            archiveId={selectedArchiveId}
            archiveName={selectedArchive?.name}
            onSuccess={(message) => {
              showSnackbar(message, 'success');
              setRollbackDialogOpen(false);
              setTimeout(() => refetch(), 500);
            }}
            onError={(message) => {
              showSnackbar(message, 'error');
              setRollbackDialogOpen(false);
            }}
          />
        )}

        <ConfirmDialog
          open={deleteDialogOpen}
          title="حذف آرشیو"
          content={`آیا از حذف آرشیو "${selectedArchive?.name}" اطمینان دارید؟ این عملیات غیرقابل بازگشت است.`}
          confirmText="حذف"
          cancelText="انصراف"
          confirmColor="error"
          onConfirm={handleDeleteArchive}
          onCancel={() => setDeleteDialogOpen(false)}
        />

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled">
            {snackbar.message}
          </Alert>
        </Snackbar>
      </div>
    </ErrorBoundary>
  );
}

export default ArchivesTab;
