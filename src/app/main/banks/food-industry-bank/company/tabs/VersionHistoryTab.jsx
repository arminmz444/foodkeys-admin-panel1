import { useState, useMemo } from 'react';
import {
  Typography,
  Paper,
  Box,
  CircularProgress,
  Button,
  Alert,
  Snackbar,
  Dialog,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Chip,
  Avatar,
  Checkbox,
  useTheme,
  alpha,
} from '@mui/material';
import {
  RestoreFromTrash as RestoreIcon,
  History as HistoryIcon,
  Visibility as ViewIcon,
  CalendarToday as CalendarIcon,
  CompareArrows as CompareIcon,
  Inventory as ArchiveIcon,
  Person as PersonIcon,
  InsertDriveFile as FileIcon,
  Storage as StorageIcon,
  CheckCircle as CheckCircleIcon,
  FolderOff as EmptyIcon,
} from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns-jalali';
import { motion } from 'framer-motion';
import {
  useGetArchivesByEntityQuery,
  useRollbackToArchiveMutation,
} from 'src/app/main/apps/archive/store/archiveApi';
import { ErrorBoundary } from 'react-error-boundary';
import ErrorFallback from 'src/app/shared-components/ErrorFallback';
import ArchiveDetailsDialog from 'src/app/main/apps/archive/ArchiveDetailsDialog';
import ArchiveCompareDialog from 'src/app/main/apps/archive/ArchiveCompareDialog';

const archiveTypeLabels = {
  MANUAL: 'آرشیو دستی',
  AUTOMATIC_BACKUP: 'پشتیبان خودکار',
  AUTOMATIC_ROLLBACK: 'بازگشت خودکار',
  BEFORE_UPDATE: 'قبل از بروزرسانی',
  AFTER_UPDATE: 'بعد از بروزرسانی',
};

const archiveTypeColors = {
  MANUAL: 'primary',
  AUTOMATIC_BACKUP: 'info',
  AUTOMATIC_ROLLBACK: 'secondary',
  BEFORE_UPDATE: 'warning',
  AFTER_UPDATE: 'success',
};

function formatDateJalali(dateString) {
  if (!dateString) return '-';
  try {
    return format(new Date(dateString), 'yyyy/MM/dd - HH:mm');
  } catch {
    return dateString;
  }
}

function parseFileMetadata(metadata) {
  if (!metadata?.fileMetadata) return { fileCount: 0, totalSize: 0 };
  try {
    const files = typeof metadata.fileMetadata === 'string'
      ? JSON.parse(metadata.fileMetadata)
      : metadata.fileMetadata;
    const fileArr = Array.isArray(files) ? files : [files];
    const totalSize = fileArr.reduce((sum, f) => sum + (f.fileSize || f.size || 0), 0);
    return { fileCount: fileArr.length, totalSize };
  } catch {
    return { fileCount: 0, totalSize: 0 };
  }
}

function formatFileSize(bytes) {
  if (!bytes || Number.isNaN(Number(bytes))) return '-';
  const num = Number(bytes);
  if (num < 1024) return `${num} بایت`;
  if (num < 1024 * 1024) return `${(num / 1024).toFixed(1)} کیلوبایت`;
  return `${(num / (1024 * 1024)).toFixed(1)} مگابایت`;
}

function TimelineVersionItem({ archive, index, isLatest, onView, onRestore, compareMode, isSelected, onToggleSelect }) {
  const theme = useTheme();
  const archiveType = archive.archiveType || archive.metadata?.archiveType;
  const { fileCount, totalSize } = parseFileMetadata(archive.metadata);

  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
    >
      <Box sx={{ display: 'flex', gap: 2.5, position: 'relative' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, pt: 0.5 }}>
          <Box sx={{ position: 'relative' }}>
            <Avatar
              sx={{
                width: 44,
                height: 44,
                bgcolor: isLatest
                  ? theme.palette.success.main
                  : isSelected
                    ? theme.palette.primary.main
                    : alpha(theme.palette.primary.main, 0.12),
                color: isLatest || isSelected ? 'white' : theme.palette.primary.main,
                transition: 'all 0.25s',
                cursor: compareMode ? 'pointer' : 'default',
                border: isSelected ? `3px solid ${theme.palette.primary.dark}` : isLatest ? `3px solid ${theme.palette.success.dark}` : 'none',
                '&:hover': compareMode ? { transform: 'scale(1.1)', boxShadow: `0 0 12px ${alpha(theme.palette.primary.main, 0.3)}` } : {},
              }}
              onClick={compareMode ? onToggleSelect : undefined}
            >
              {isLatest ? <CheckCircleIcon /> : <ArchiveIcon sx={{ fontSize: 20 }} />}
            </Avatar>
            {compareMode && (
              <Checkbox
                checked={isSelected}
                onChange={onToggleSelect}
                size="small"
                sx={{
                  position: 'absolute',
                  top: -8,
                  right: -8,
                  bgcolor: 'background.paper',
                  borderRadius: '50%',
                  p: 0,
                  '& .MuiSvgIcon-root': { fontSize: 18 },
                }}
              />
            )}
          </Box>
          <Box
            sx={{
              width: 3,
              flexGrow: 1,
              mt: 1,
              mb: -0.5,
              minHeight: 30,
              background: `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.25)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
              borderRadius: 2,
            }}
          />
        </Box>

        <Paper
          variant="outlined"
          sx={{
            flex: 1,
            mb: 2.5,
            borderRadius: 2.5,
            overflow: 'hidden',
            border: isSelected
              ? `2px solid ${theme.palette.primary.main}`
              : isLatest
                ? `1px solid ${alpha(theme.palette.success.main, 0.4)}`
                : '1px solid',
            borderColor: isSelected ? 'primary.main' : isLatest ? alpha(theme.palette.success.main, 0.4) : 'divider',
            bgcolor: isSelected
              ? alpha(theme.palette.primary.main, 0.03)
              : isLatest
                ? alpha(theme.palette.success.main, 0.02)
                : 'background.paper',
            transition: 'all 0.25s',
            '&:hover': {
              borderColor: theme.palette.primary.main,
              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.1)}`,
            },
          }}
        >
          <Box sx={{ px: 2.5, py: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
                  <Typography variant="subtitle1" fontWeight={700}>{archive.name || 'بدون نام'}</Typography>
                  <Chip
                    label={archiveTypeLabels[archiveType] || archiveType || '-'}
                    size="small"
                    color={archiveTypeColors[archiveType] || 'default'}
                    sx={{ height: 22, fontSize: 11 }}
                  />
                  {isLatest && (
                    <Chip label="نسخه فعلی" size="small" color="success" sx={{ height: 22, fontSize: 11 }} />
                  )}
                </Box>

                {archive.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {archive.description}
                  </Typography>
                )}

                <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mt: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <CalendarIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary">
                      {formatDateJalali(archive.createdAt)}
                    </Typography>
                  </Box>
                  {archive.createdBy && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <PersonIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary">
                        {archive.createdBy}
                      </Typography>
                    </Box>
                  )}
                  {fileCount > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <FileIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary">
                        {fileCount} فایل
                      </Typography>
                    </Box>
                  )}
                  {totalSize > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <StorageIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary">
                        {formatFileSize(totalSize)}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0, ml: 1 }}>
                <Tooltip title="مشاهده جزئیات">
                  <IconButton size="small" onClick={() => onView(archive.id)} color="primary">
                    <ViewIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                {!isLatest && (
                  <Tooltip title="بازگشت به این نسخه">
                    <IconButton size="small" onClick={() => onRestore(archive.id)} color="warning">
                      <RestoreIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </Box>
          </Box>
        </Paper>
      </Box>
    </motion.div>
  );
}

function VersionHistoryTab() {
  const { companyId } = useParams();
  const theme = useTheme();
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [compareDialogOpen, setCompareDialogOpen] = useState(false);
  const [selectedArchiveId, setSelectedArchiveId] = useState(null);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const { data: archives, isLoading, refetch } = useGetArchivesByEntityQuery({
    entityType: 'Company',
    entityId: companyId,
    page: 0,
    size: 100,
  });
  const [rollbackToArchive, { isLoading: isRestoring }] = useRollbackToArchiveMutation();

  const sortedArchives = useMemo(() => {
    if (!archives?.data) return [];
    return [...archives.data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [archives]);

  const handleViewArchive = (archiveId) => {
    setSelectedArchiveId(archiveId);
    setSelectedVersion(sortedArchives.find((a) => a.id === archiveId));
    setDetailsDialogOpen(true);
  };

  const handleOpenRestoreDialog = (archiveId) => {
    setSelectedArchiveId(archiveId);
    setSelectedVersion(sortedArchives.find((a) => a.id === archiveId));
    setRestoreDialogOpen(true);
  };

  const handleRestoreVersion = async () => {
    try {
      await rollbackToArchive({
        archiveId: selectedArchiveId,
        reason: 'بازگشت به نسخه قبلی',
      }).unwrap();
      showSnackbar('بازگشت به نسخه قبلی با موفقیت انجام شد', 'success');
      setRestoreDialogOpen(false);
      setTimeout(() => refetch(), 500);
    } catch (error) {
      showSnackbar(`خطا در بازگشت به نسخه قبلی: ${error.message || 'خطای ناشناخته'}`, 'error');
    }
  };

  const handleToggleCompareMode = () => {
    setCompareMode((prev) => !prev);
    setSelectedForCompare([]);
  };

  const handleToggleCompareSelect = (archiveId) => {
    setSelectedForCompare((prev) => {
      if (prev.includes(archiveId)) return prev.filter((id) => id !== archiveId);
      if (prev.length >= 2) return [prev[1], archiveId];
      return [...prev, archiveId];
    });
  };

  const handleOpenCompareDialog = () => {
    if (selectedForCompare.length !== 2) {
      showSnackbar('لطفاً دو نسخه برای مقایسه انتخاب کنید', 'warning');
      return;
    }
    setCompareDialogOpen(true);
  };

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8, flexDirection: 'column', gap: 2 }}>
        <CircularProgress />
        <Typography variant="body2" color="text.secondary">در حال بارگذاری تاریخچه نسخه‌ها...</Typography>
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
                background: `linear-gradient(135deg, ${theme.palette.info.dark} 0%, ${theme.palette.primary.dark} 100%)`,
                px: 3,
                py: 2.5,
                color: 'white',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <HistoryIcon sx={{ fontSize: 28 }} />
                  <Box>
                    <Typography variant="h6" fontWeight={700}>تاریخچه نسخه‌های شرکت</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.85 }}>
                      {sortedArchives.length > 0
                        ? `${sortedArchives.length} نسخه ثبت شده`
                        : 'هیچ نسخه‌ای ثبت نشده'}
                    </Typography>
                  </Box>
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
                    {compareMode ? 'لغو مقایسه' : 'مقایسه نسخه‌ها'}
                  </Button>
                  {compareMode && selectedForCompare.length === 2 && (
                    <Button
                      variant="contained"
                      size="small"
                      onClick={handleOpenCompareDialog}
                      sx={{ bgcolor: alpha('#fff', 0.25), '&:hover': { bgcolor: alpha('#fff', 0.35) } }}
                    >
                      مقایسه انتخاب شده‌ها
                    </Button>
                  )}
                </Box>
              </Box>

              {compareMode && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                  <Typography variant="body2" sx={{ mt: 1, opacity: 0.85 }}>
                    {selectedForCompare.length === 0
                      ? 'دو نسخه را برای مقایسه انتخاب کنید'
                      : selectedForCompare.length === 1
                        ? 'یک نسخه دیگر انتخاب کنید'
                        : 'دو نسخه انتخاب شد - آماده مقایسه'}
                  </Typography>
                </motion.div>
              )}
            </Box>
          </Paper>
        </motion.div>

        {!sortedArchives || sortedArchives.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
            <Paper
              sx={{
                py: 8,
                px: 4,
                textAlign: 'center',
                background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.03)} 0%, ${alpha(theme.palette.primary.main, 0.03)} 100%)`,
                border: `1px dashed ${alpha(theme.palette.info.main, 0.3)}`,
                borderRadius: 3,
              }}
            >
              <EmptyIcon sx={{ fontSize: 80, color: alpha(theme.palette.info.main, 0.2), mb: 2 }} />
              <Typography variant="h6" color="text.secondary" fontWeight={600}>
                هیچ تاریخچه‌ای برای این شرکت ثبت نشده است
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, maxWidth: 400, mx: 'auto' }}>
                با ایجاد آرشیو از تب آرشیوها، تاریخچه نسخه‌ها به‌صورت خودکار در اینجا نمایش داده می‌شود.
              </Typography>
            </Paper>
          </motion.div>
        ) : (
          <Box sx={{ maxWidth: 850, mx: 'auto' }}>
            {sortedArchives.map((archive, index) => (
              <TimelineVersionItem
                key={archive.id}
                archive={archive}
                index={index}
                isLatest={index === 0}
                onView={handleViewArchive}
                onRestore={handleOpenRestoreDialog}
                compareMode={compareMode}
                isSelected={selectedForCompare.includes(archive.id)}
                onToggleSelect={() => handleToggleCompareSelect(archive.id)}
              />
            ))}
          </Box>
        )}

        {selectedVersion && detailsDialogOpen && (
          <ArchiveDetailsDialog
            open={detailsDialogOpen}
            onClose={() => setDetailsDialogOpen(false)}
            archive={selectedVersion}
            onRollback={() => {
              setDetailsDialogOpen(false);
              handleOpenRestoreDialog(selectedVersion.id);
            }}
          />
        )}

        {compareDialogOpen && selectedForCompare.length === 2 && (
          <ArchiveCompareDialog
            firstArchiveId={selectedForCompare[0]}
            secondArchiveId={selectedForCompare[1]}
            onClose={() => setCompareDialogOpen(false)}
            onShowSnackbar={showSnackbar}
          />
        )}

        <Dialog
          open={restoreDialogOpen}
          onClose={() => setRestoreDialogOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { borderRadius: 3 } }}
        >
          <Box
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.warning.main} 0%, ${theme.palette.warning.dark} 100%)`,
              px: 3,
              py: 2,
              color: 'white',
            }}
          >
            <Typography variant="h6" fontWeight={700}>بازگشت به نسخه قبلی</Typography>
          </Box>
          <DialogContent>
            <Alert severity="warning" sx={{ mb: 2 }}>
              با این کار، اطلاعات فعلی شرکت با اطلاعات نسخه انتخاب شده جایگزین خواهد شد. آیا اطمینان دارید؟
            </Alert>
            {selectedVersion && (
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">نسخه انتخاب شده:</Typography>
                <Typography variant="body1" fontWeight={600} sx={{ mt: 0.5 }}>{selectedVersion.name}</Typography>
                <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    تاریخ: {formatDateJalali(selectedVersion.createdAt)}
                  </Typography>
                  <Chip
                    label={archiveTypeLabels[selectedVersion.archiveType || selectedVersion.metadata?.archiveType] || '-'}
                    size="small"
                    variant="outlined"
                  />
                </Box>
              </Paper>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setRestoreDialogOpen(false)} color="inherit">
              انصراف
            </Button>
            <Button
              onClick={handleRestoreVersion}
              color="error"
              variant="contained"
              disabled={isRestoring}
              sx={{ borderRadius: 2, minWidth: 150 }}
            >
              {isRestoring ? <CircularProgress size={24} /> : 'بازگشت به نسخه قبلی'}
            </Button>
          </DialogActions>
        </Dialog>

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

export default VersionHistoryTab;
