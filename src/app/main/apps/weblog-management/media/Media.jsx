import { useState, useCallback } from 'react';
import Typography from '@mui/material/Typography';
import { motion, AnimatePresence } from 'framer-motion';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Link } from 'react-router-dom';
import { alpha, useTheme } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import Tooltip from '@mui/material/Tooltip';
import { useDropzone } from 'react-dropzone';
import { useGetWeblogMediaQuery, useUploadWeblogMediaMutation, useDeleteWeblogMediaMutation, useUpdateWeblogMediaMutation } from '../WeblogApi';
import FuseLoading from '@fuse/core/FuseLoading';
import { enqueueSnackbar } from 'notistack';

const pageVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 100, damping: 15 } }
};

function MediaItem({ media, onDelete, onEdit, onSelect }) {
  const [isHovered, setIsHovered] = useState(false);
  const theme = useTheme();

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -8 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Paper
        className="overflow-hidden cursor-pointer rounded-2xl"
        sx={{
          transition: 'all 0.3s ease',
          border: '1px solid',
          borderColor: isHovered ? 'primary.main' : 'divider',
          boxShadow: isHovered ? `0 20px 40px -15px ${alpha(theme.palette.primary.main, 0.25)}` : 'none'
        }}
        onClick={() => onSelect(media)}
      >
        <Box className="relative aspect-square overflow-hidden" sx={{ backgroundColor: (theme) => alpha(theme.palette.grey[500], 0.05) }}>
          <img
            src={media.url}
            alt={media.alt || media.filename}
            className="w-full h-full object-cover transition-transform duration-500"
            style={{ transform: isHovered ? 'scale(1.1)' : 'scale(1)' }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          
          {/* Gradient Overlay */}
          <Box
            className="absolute inset-0 transition-opacity duration-300"
            sx={{
              background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)',
              opacity: isHovered ? 1 : 0
            }}
          />
          
          {/* Action Buttons */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-12 right-12 flex gap-8"
              >
                <Tooltip title="ویرایش">
                  <IconButton
                    size="small"
                    onClick={(e) => { e.stopPropagation(); onEdit(media); }}
                    sx={{
                      backgroundColor: 'white',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                      '&:hover': { backgroundColor: 'primary.main', color: 'white' }
                    }}
                  >
                    <FuseSvgIcon size={16}>heroicons-outline:pencil</FuseSvgIcon>
                  </IconButton>
                </Tooltip>
                <Tooltip title="حذف">
                  <IconButton
                    size="small"
                    onClick={(e) => { e.stopPropagation(); onDelete(media); }}
                    sx={{
                      backgroundColor: 'white',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                      '&:hover': { backgroundColor: 'error.main', color: 'white' }
                    }}
                  >
                    <FuseSvgIcon size={16}>heroicons-outline:trash</FuseSvgIcon>
                  </IconButton>
                </Tooltip>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* File Info Overlay */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-0 left-0 right-0 p-12"
              >
                <Typography className="text-white text-sm font-medium truncate">
                  {media.filename}
                </Typography>
                <div className="flex items-center gap-8 mt-4">
                  <Typography variant="caption" className="text-white/70">
                    {formatFileSize(media.size)}
                  </Typography>
                  {media.width && media.height && (
                    <Typography variant="caption" className="text-white/70">
                      {media.width}×{media.height}
                    </Typography>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Box>
      </Paper>
    </motion.div>
  );
}

function Media() {
  const theme = useTheme();
  const [page, setPage] = useState(1);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editData, setEditData] = useState({ alt: '' });
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const { data: mediaResponse, isLoading, isFetching } = useGetWeblogMediaQuery({ page, limit: 24 });
  const [uploadMedia] = useUploadWeblogMediaMutation();
  const [deleteMedia] = useDeleteWeblogMediaMutation();
  const [updateMedia] = useUpdateWeblogMediaMutation();

  const mediaList = mediaResponse?.data || [];
  const pagination = mediaResponse?.pagination || {};

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    for (let i = 0; i < acceptedFiles.length; i++) {
      const file = acceptedFiles[i];
      setUploadProgress(((i + 1) / acceptedFiles.length) * 100);

      try {
        await uploadMedia({ file }).unwrap();
        enqueueSnackbar(`${file.name} آپلود شد`, { variant: 'success' });
      } catch (error) {
        enqueueSnackbar(`خطا در آپلود ${file.name}`, { variant: 'error' });
      }
    }

    setUploading(false);
    setUploadProgress(0);
  }, [uploadMedia]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/gif': ['.gif'],
      'image/webp': ['.webp'],
      'image/svg+xml': ['.svg']
    },
    maxSize: 5 * 1024 * 1024 // 5MB
  });

  const handleDelete = async (media) => {
    if (!window.confirm('آیا از حذف این فایل مطمئن هستید؟')) return;

    try {
      await deleteMedia(media.id).unwrap();
      enqueueSnackbar('فایل حذف شد', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('خطا در حذف فایل', { variant: 'error' });
    }
  };

  const handleEdit = (media) => {
    setSelectedMedia(media);
    setEditData({ alt: media.alt || '' });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    try {
      await updateMedia({ id: selectedMedia.id, alt: editData.alt }).unwrap();
      enqueueSnackbar('اطلاعات فایل بروزرسانی شد', { variant: 'success' });
      setEditDialogOpen(false);
    } catch (error) {
      enqueueSnackbar('خطا در بروزرسانی', { variant: 'error' });
    }
  };

  const handleSelect = (media) => {
    setSelectedMedia(media);
  };

  if (isLoading) {
    return <FuseLoading />;
  }

  return (
    <motion.div
      className="w-full min-h-full"
      variants={pageVariants}
      initial="hidden"
      animate="show"
    >
      {/* Modern Header */}
      <Box
        className="relative overflow-hidden"
        sx={{
          background: (theme) => `linear-gradient(135deg, ${alpha(theme.palette.info.dark, 0.05)} 0%, ${alpha(theme.palette.primary.dark, 0.08)} 100%)`,
        }}
      >
        <Box className="absolute -top-40 -right-40 w-[200px] h-[200px] rounded-full opacity-10" sx={{ background: (theme) => theme.palette.info.main }} />
        <Box className="absolute -bottom-20 -left-20 w-[150px] h-[150px] rounded-full opacity-5" sx={{ background: (theme) => theme.palette.primary.main }} />
        
        <div className="relative flex flex-col sm:flex-row space-y-16 sm:space-y-0 w-full items-center justify-between py-24 sm:py-32 px-24 md:px-32">
          <div className="flex flex-col items-center sm:items-start">
            <motion.div variants={itemVariants}>
              <Button
                component={Link}
                to="/apps/weblog/dashboard"
                className="mb-8 rounded-lg"
                sx={{ color: 'text.secondary', '&:hover': { backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.08) } }}
                size="small"
                startIcon={<FuseSvgIcon size={16}>{theme.direction === 'ltr' ? 'heroicons-outline:arrow-sm-left' : 'heroicons-outline:arrow-sm-right'}</FuseSvgIcon>}
              >
                داشبورد وبلاگ
              </Button>
            </motion.div>
            
            <motion.div variants={itemVariants} className="flex items-center gap-16">
              <Box
                className="hidden sm:flex items-center justify-center w-56 h-56 rounded-2xl"
                sx={{
                  background: (theme) => `linear-gradient(135deg, ${theme.palette.info.main}, ${theme.palette.info.dark})`,
                  boxShadow: (theme) => `0 8px 24px -8px ${alpha(theme.palette.info.main, 0.4)}`
                }}
              >
                <FuseSvgIcon className="text-white" size={28}>heroicons-outline:photograph</FuseSvgIcon>
              </Box>
              <div>
                <Typography className="text-2xl md:text-3xl font-extrabold tracking-tight">کتابخانه رسانه</Typography>
                <Typography variant="body2" className="text-gray-500 mt-4">مدیریت و آپلود تصاویر و فایل‌های وبلاگ</Typography>
              </div>
            </motion.div>
          </div>
          
          <motion.div variants={itemVariants}>
            <Chip
              label={`${pagination.total || 0} فایل`}
              sx={{
                backgroundColor: (theme) => alpha(theme.palette.info.main, 0.15),
                color: 'info.main',
                fontWeight: 600,
                fontSize: '0.9rem',
                height: 36,
                borderRadius: '12px'
              }}
              icon={<FuseSvgIcon size={18}>heroicons-outline:photograph</FuseSvgIcon>}
            />
          </motion.div>
        </div>
      </Box>

      {/* Content */}
      <div className="p-24 md:p-32 space-y-24">
        {/* Modern Upload Zone */}
        <motion.div variants={itemVariants}>
          <Paper
            {...getRootProps()}
            className="p-32 md:p-48 rounded-2xl cursor-pointer transition-all duration-300"
            sx={{
              border: '2px dashed',
              borderColor: isDragActive ? 'primary.main' : 'divider',
              backgroundColor: isDragActive ? (theme) => alpha(theme.palette.primary.main, 0.05) : 'background.paper',
              '&:hover': {
                borderColor: 'primary.main',
                backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.02)
              }
            }}
          >
            <input {...getInputProps()} />
            <div className="text-center">
              <motion.div
                animate={{ y: isDragActive ? -10 : 0 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Box
                  className="w-80 h-80 rounded-full flex items-center justify-center mx-auto mb-20"
                  sx={{
                    background: (theme) => isDragActive 
                      ? `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`
                      : `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)}, ${alpha(theme.palette.info.main, 0.05)})`,
                    transition: 'all 0.3s ease'
                  }}
                >
                  <FuseSvgIcon size={40} className={isDragActive ? 'text-white' : 'text-info-500'}>
                    heroicons-outline:cloud-upload
                  </FuseSvgIcon>
                </Box>
              </motion.div>
              <Typography className="text-xl font-bold mb-8">
                {isDragActive ? '🎉 فایل‌ها را رها کنید!' : 'فایل‌ها را اینجا بکشید'}
              </Typography>
              <Typography className="text-gray-500 mb-16">یا روی این ناحیه کلیک کنید</Typography>
              <div className="flex flex-wrap justify-center gap-8">
                {['JPEG', 'PNG', 'GIF', 'WebP', 'SVG'].map((format) => (
                  <Chip key={format} label={format} size="small" variant="outlined" sx={{ borderRadius: '8px' }} />
                ))}
              </div>
              <Typography variant="caption" className="text-gray-400 mt-12 block">حداکثر حجم: 5 مگابایت</Typography>
            </div>
          </Paper>

          {uploading && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-16">
              <Paper className="p-16 rounded-xl" sx={{ backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.05) }}>
                <div className="flex items-center gap-16">
                  <Box className="w-48 h-48 rounded-xl flex items-center justify-center" sx={{ backgroundColor: 'primary.main' }}>
                    <FuseSvgIcon className="text-white animate-pulse" size={24}>heroicons-outline:cloud-upload</FuseSvgIcon>
                  </Box>
                  <div className="flex-1">
                    <Typography className="font-medium mb-8">در حال آپلود...</Typography>
                    <LinearProgress
                      variant="determinate"
                      value={uploadProgress}
                      sx={{ height: 8, borderRadius: 4, backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1) }}
                    />
                  </div>
                  <Typography className="font-bold text-primary-500">{Math.round(uploadProgress)}%</Typography>
                </div>
              </Paper>
            </motion.div>
          )}
        </motion.div>

        {/* Media Grid */}
        {mediaList.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-16">
            {mediaList.map((media) => (
              <MediaItem key={media.id} media={media} onDelete={handleDelete} onEdit={handleEdit} onSelect={handleSelect} />
            ))}
          </div>
        ) : (
          <motion.div variants={itemVariants}>
            <Paper className="text-center py-64 rounded-2xl" sx={{ backgroundColor: 'background.paper' }}>
              <Box className="w-96 h-96 rounded-full flex items-center justify-center mx-auto mb-24" sx={{ backgroundColor: (theme) => alpha(theme.palette.grey[500], 0.1) }}>
                <FuseSvgIcon className="text-gray-400" size={48}>heroicons-outline:photograph</FuseSvgIcon>
              </Box>
              <Typography className="text-xl font-bold text-gray-500 mb-8">کتابخانه رسانه خالی است</Typography>
              <Typography className="text-gray-400">اولین فایل خود را آپلود کنید</Typography>
            </Paper>
          </motion.div>
        )}

        {/* Modern Pagination */}
        {pagination.total > 0 && (
          <motion.div variants={itemVariants}>
            <Paper className="flex flex-col sm:flex-row items-center justify-between p-20 rounded-2xl gap-16" sx={{ backgroundColor: 'background.paper' }}>
              <div className="flex items-center gap-12">
                <Box className="w-44 h-44 rounded-xl flex items-center justify-center" sx={{ backgroundColor: (theme) => alpha(theme.palette.info.main, 0.1) }}>
                  <FuseSvgIcon className="text-info-500" size={22}>heroicons-outline:collection</FuseSvgIcon>
                </Box>
                <div>
                  <Typography className="font-semibold">نمایش {mediaList.length} از {pagination.total} فایل</Typography>
                  <Typography variant="caption" className="text-gray-500">صفحه {pagination.page} از {pagination.totalPages}</Typography>
                </div>
              </div>
              <div className="flex items-center gap-8">
                <Button
                  variant="outlined"
                  size="small"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="rounded-xl"
                  startIcon={<FuseSvgIcon size={16}>heroicons-outline:chevron-right</FuseSvgIcon>}
                >
                  قبلی
                </Button>
                <Box className="px-16 py-8 rounded-xl font-bold" sx={{ backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }}>
                  {pagination.page}
                </Box>
                <Button
                  variant="outlined"
                  size="small"
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage(page + 1)}
                  className="rounded-xl"
                  endIcon={<FuseSvgIcon size={16}>heroicons-outline:chevron-left</FuseSvgIcon>}
                >
                  بعدی
                </Button>
              </div>
            </Paper>
          </motion.div>
        )}
      </div>

      {/* Modern Edit Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={() => setEditDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{ sx: { borderRadius: '20px', overflow: 'hidden' } }}
      >
        <DialogTitle className="pb-0">
          <div className="flex items-center gap-12">
            <Box className="w-40 h-40 rounded-xl flex items-center justify-center" sx={{ background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})` }}>
              <FuseSvgIcon className="text-white" size={20}>heroicons-outline:pencil</FuseSvgIcon>
            </Box>
            <Typography className="font-bold text-lg">ویرایش اطلاعات رسانه</Typography>
          </div>
        </DialogTitle>
        <DialogContent>
          {selectedMedia && (
            <div className="space-y-20 pt-20">
              <Box className="rounded-2xl overflow-hidden" sx={{ backgroundColor: (theme) => alpha(theme.palette.grey[500], 0.05) }}>
                <img src={selectedMedia.url} alt={selectedMedia.alt || selectedMedia.filename} className="w-full max-h-[300px] object-contain" />
              </Box>
              <div className="flex flex-wrap items-center gap-8">
                <Chip label={selectedMedia.filename} size="small" sx={{ borderRadius: '8px' }} />
                <Chip label={selectedMedia.mimeType} size="small" variant="outlined" sx={{ borderRadius: '8px' }} />
                {selectedMedia.width && selectedMedia.height && <Chip label={`${selectedMedia.width}×${selectedMedia.height}`} size="small" variant="outlined" sx={{ borderRadius: '8px' }} />}
              </div>
              <TextField
                label="متن جایگزین (Alt Text)"
                fullWidth
                value={editData.alt}
                onChange={(e) => setEditData({ ...editData, alt: e.target.value })}
                placeholder="توضیح تصویر برای سئو..."
                helperText="این متن برای موتورهای جستجو و دسترسی‌پذیری استفاده می‌شود"
                InputProps={{ sx: { borderRadius: '12px' } }}
              />
            </div>
          )}
        </DialogContent>
        <DialogActions className="p-20 pt-0">
          <Button onClick={() => setEditDialogOpen(false)} className="rounded-xl">انصراف</Button>
          <Button onClick={handleSaveEdit} variant="contained" className="rounded-xl px-24" sx={{ boxShadow: 'none' }}>ذخیره تغییرات</Button>
        </DialogActions>
      </Dialog>

      {/* Modern Preview Dialog */}
      <Dialog
        open={!!selectedMedia && !editDialogOpen}
        onClose={() => setSelectedMedia(null)}
        maxWidth="lg"
        fullWidth
        PaperProps={{ sx: { borderRadius: '20px', overflow: 'hidden', backgroundColor: 'transparent', boxShadow: 'none' } }}
      >
        <DialogContent className="p-0 relative">
          <Box className="absolute top-16 right-16 z-10">
            <IconButton onClick={() => setSelectedMedia(null)} sx={{ backgroundColor: 'rgba(0,0,0,0.5)', color: 'white', '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' } }}>
              <FuseSvgIcon>heroicons-outline:x</FuseSvgIcon>
            </IconButton>
          </Box>
          {selectedMedia && (
            <img src={selectedMedia.url} alt={selectedMedia.alt || selectedMedia.filename} className="w-full rounded-2xl" />
          )}
        </DialogContent>
        {selectedMedia && (
          <Box className="p-20 flex flex-col sm:flex-row items-center justify-between gap-16 bg-white dark:bg-gray-900 rounded-b-2xl">
            <div>
              <Typography className="font-semibold">{selectedMedia.filename}</Typography>
              <Typography variant="caption" className="text-gray-500">
                {selectedMedia.width && selectedMedia.height && `${selectedMedia.width}×${selectedMedia.height} • `}{selectedMedia.mimeType}
              </Typography>
            </div>
            <div className="flex gap-8">
              <Button
                onClick={() => { navigator.clipboard.writeText(selectedMedia.url); enqueueSnackbar('آدرس کپی شد', { variant: 'success' }); }}
                className="rounded-xl"
                startIcon={<FuseSvgIcon size={16}>heroicons-outline:clipboard-copy</FuseSvgIcon>}
              >
                کپی آدرس
              </Button>
              <Button variant="contained" onClick={() => setSelectedMedia(null)} className="rounded-xl" sx={{ boxShadow: 'none' }}>بستن</Button>
            </div>
          </Box>
        )}
      </Dialog>
    </motion.div>
  );
}

export default Media;
