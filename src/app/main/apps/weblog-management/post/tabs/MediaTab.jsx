import { useState, useCallback } from 'react';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Grid from '@mui/material/Grid';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { alpha } from '@mui/material/styles';
import { useGetWeblogMediaQuery, useUploadWeblogMediaMutation, useDeleteWeblogMediaMutation } from '../../WeblogApi';
import FuseLoading from '@fuse/core/FuseLoading';
import { enqueueSnackbar } from 'notistack';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import LinearProgress from '@mui/material/LinearProgress';
import Chip from '@mui/material/Chip';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';

function MediaItem({ media, onDelete, onSelect }) {
  const [showActions, setShowActions] = useState(false);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="relative"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <Paper
        className="overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg"
        sx={{
          '&:hover': {
            transform: 'translateY(-2px)'
          }
        }}
      >
        <Box
          className="w-full h-120 bg-cover bg-center"
          sx={{
            backgroundImage: `url(${media.url})`,
            backgroundColor: 'grey.200'
          }}
        />
        <div className="p-8">
          <Typography variant="caption" className="block truncate font-medium">
            {media.filename}
          </Typography>
          <Typography variant="caption" className="text-gray-500">
            {media.width}x{media.height} • {formatFileSize(media.size)}
          </Typography>
        </div>

        <AnimatePresence>
          {showActions && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center gap-8"
              style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
            >
              <IconButton
                size="small"
                onClick={() => onSelect(media)}
                sx={{ backgroundColor: 'white', '&:hover': { backgroundColor: 'grey.200' } }}
              >
                <FuseSvgIcon size={18}>heroicons-outline:eye</FuseSvgIcon>
              </IconButton>
              <IconButton
                size="small"
                onClick={() => {
                  navigator.clipboard.writeText(media.url);
                  enqueueSnackbar('لینک کپی شد', { variant: 'success' });
                }}
                sx={{ backgroundColor: 'white', '&:hover': { backgroundColor: 'grey.200' } }}
              >
                <FuseSvgIcon size={18}>heroicons-outline:clipboard-copy</FuseSvgIcon>
              </IconButton>
              <IconButton
                size="small"
                onClick={() => onDelete(media.id)}
                sx={{ backgroundColor: 'error.main', color: 'white', '&:hover': { backgroundColor: 'error.dark' } }}
              >
                <FuseSvgIcon size={18}>heroicons-outline:trash</FuseSvgIcon>
              </IconButton>
            </motion.div>
          )}
        </AnimatePresence>
      </Paper>
    </motion.div>
  );
}

function MediaTab({ postId }) {
  const isNewPost = postId === 'new';
  const { data: mediaResponse, isLoading, refetch } = useGetWeblogMediaQuery(
    { postId: isNewPost ? undefined : postId, limit: 50 },
    { skip: isNewPost }
  );
  const [uploadMedia, { isLoading: isUploading }] = useUploadWeblogMediaMutation();
  const [deleteMedia] = useDeleteWeblogMediaMutation();

  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [altText, setAltText] = useState('');

  const mediaList = mediaResponse?.data || [];

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setUploadProgress(10);

    try {
      setUploadProgress(50);
      await uploadMedia({
        file,
        postId: isNewPost ? undefined : postId,
        alt: altText
      }).unwrap();
      setUploadProgress(100);
      enqueueSnackbar('فایل با موفقیت آپلود شد', { variant: 'success' });
      setUploadDialogOpen(false);
      setAltText('');
      refetch();
    } catch (error) {
      enqueueSnackbar('خطا در آپلود فایل', { variant: 'error' });
    } finally {
      setUploadProgress(0);
    }
  }, [uploadMedia, postId, isNewPost, altText, refetch]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/gif': ['.gif'],
      'image/webp': ['.webp'],
      'image/svg+xml': ['.svg']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: false
  });

  const handleDelete = async (id) => {
    if (!window.confirm('آیا از حذف این رسانه مطمئن هستید؟')) return;

    try {
      await deleteMedia(id).unwrap();
      enqueueSnackbar('رسانه با موفقیت حذف شد', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('خطا در حذف رسانه', { variant: 'error' });
    }
  };

  if (isNewPost) {
    return (
      <Paper className="p-32 text-center" elevation={0} sx={{ backgroundColor: 'background.default' }}>
        <FuseSvgIcon className="text-gray-400 mb-16" size={64}>
          heroicons-outline:photograph
        </FuseSvgIcon>
        <Typography className="text-gray-500 mb-8">
          برای آپلود رسانه ابتدا پست را ذخیره کنید
        </Typography>
        <Typography variant="caption" className="text-gray-400">
          پس از ایجاد پست می‌توانید رسانه‌ها را مدیریت کنید
        </Typography>
      </Paper>
    );
  }

  if (isLoading) {
    return <FuseLoading />;
  }

  return (
    <div className="space-y-24">
      {/* Upload Area */}
      <Paper className="p-24" elevation={0} sx={{ backgroundColor: 'background.default' }}>
        <div className="flex items-center justify-between mb-16">
          <Typography className="font-semibold text-lg">رسانه‌های پست</Typography>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<FuseSvgIcon size={18}>heroicons-outline:upload</FuseSvgIcon>}
            onClick={() => setUploadDialogOpen(true)}
          >
            آپلود رسانه
          </Button>
        </div>

        {/* Dropzone */}
        <Box
          {...getRootProps()}
          className="border-2 border-dashed rounded-lg p-32 text-center cursor-pointer transition-all duration-200"
          sx={{
            borderColor: isDragActive ? 'secondary.main' : 'divider',
            backgroundColor: isDragActive ? (theme) => alpha(theme.palette.secondary.main, 0.05) : 'transparent',
            '&:hover': {
              borderColor: 'secondary.main',
              backgroundColor: (theme) => alpha(theme.palette.secondary.main, 0.02)
            }
          }}
        >
          <input {...getInputProps()} />
          <FuseSvgIcon className="text-gray-400 mb-16" size={48}>
            heroicons-outline:cloud-upload
          </FuseSvgIcon>
          <Typography className="text-gray-600 mb-8">
            {isDragActive ? 'فایل را اینجا رها کنید' : 'فایل را اینجا بکشید یا کلیک کنید'}
          </Typography>
          <Typography variant="caption" className="text-gray-400">
            فرمت‌های مجاز: JPG, PNG, GIF, WebP, SVG • حداکثر: 5MB
          </Typography>
        </Box>

        {isUploading && (
          <Box className="mt-16">
            <LinearProgress variant="determinate" value={uploadProgress} />
            <Typography variant="caption" className="text-gray-500 mt-8 block text-center">
              در حال آپلود... {uploadProgress}%
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Media Grid */}
      <Paper className="p-24" elevation={0} sx={{ backgroundColor: 'background.default' }}>
        <Typography className="font-semibold text-lg mb-16">
          رسانه‌های موجود ({mediaList.length})
        </Typography>

        {mediaList.length > 0 ? (
          <Grid container spacing={16}>
            {mediaList.map((media) => (
              <Grid item xs={6} sm={4} md={3} key={media.id}>
                <MediaItem
                  media={media}
                  onDelete={handleDelete}
                  onSelect={(m) => {
                    setSelectedMedia(m);
                    setPreviewOpen(true);
                  }}
                />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box className="text-center py-32">
            <FuseSvgIcon className="text-gray-400 mb-16" size={48}>
              heroicons-outline:photograph
            </FuseSvgIcon>
            <Typography className="text-gray-500">
              هیچ رسانه‌ای برای این پست آپلود نشده است
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>آپلود رسانه جدید</DialogTitle>
        <DialogContent>
          <Box
            {...getRootProps()}
            className="border-2 border-dashed rounded-lg p-24 text-center cursor-pointer transition-all duration-200 mt-16"
            sx={{
              borderColor: isDragActive ? 'secondary.main' : 'divider',
              backgroundColor: isDragActive ? (theme) => alpha(theme.palette.secondary.main, 0.05) : 'transparent'
            }}
          >
            <input {...getInputProps()} />
            <FuseSvgIcon className="text-gray-400 mb-8" size={40}>
              heroicons-outline:cloud-upload
            </FuseSvgIcon>
            <Typography className="text-gray-600">
              فایل را اینجا بکشید یا کلیک کنید
            </Typography>
          </Box>
          <TextField
            label="متن جایگزین (Alt)"
            fullWidth
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
            className="mt-16"
            placeholder="توضیح تصویر برای دسترسی‌پذیری..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialogOpen(false)}>انصراف</Button>
        </DialogActions>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <div className="flex items-center justify-between">
            <span>پیش‌نمایش رسانه</span>
            <IconButton onClick={() => setPreviewOpen(false)}>
              <FuseSvgIcon>heroicons-outline:x</FuseSvgIcon>
            </IconButton>
          </div>
        </DialogTitle>
        <DialogContent>
          {selectedMedia && (
            <div className="space-y-16">
              <img
                src={selectedMedia.url}
                alt={selectedMedia.alt || selectedMedia.filename}
                className="w-full rounded-lg"
              />
              <div className="grid grid-cols-2 gap-16">
                <div>
                  <Typography variant="caption" className="text-gray-500">نام فایل</Typography>
                  <Typography>{selectedMedia.filename}</Typography>
                </div>
                <div>
                  <Typography variant="caption" className="text-gray-500">ابعاد</Typography>
                  <Typography>{selectedMedia.width} × {selectedMedia.height}</Typography>
                </div>
                <div>
                  <Typography variant="caption" className="text-gray-500">نوع فایل</Typography>
                  <Typography>{selectedMedia.mimeType}</Typography>
                </div>
                <div>
                  <Typography variant="caption" className="text-gray-500">حجم</Typography>
                  <Typography>
                    {(selectedMedia.size / 1024).toFixed(2)} KB
                  </Typography>
                </div>
              </div>
              <div>
                <Typography variant="caption" className="text-gray-500">لینک</Typography>
                <div className="flex items-center gap-8 mt-4">
                  <TextField
                    size="small"
                    fullWidth
                    value={selectedMedia.url}
                    InputProps={{ readOnly: true, dir: 'ltr' }}
                  />
                  <Button
                    variant="outlined"
                    onClick={() => {
                      navigator.clipboard.writeText(selectedMedia.url);
                      enqueueSnackbar('لینک کپی شد', { variant: 'success' });
                    }}
                  >
                    کپی
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default MediaTab;
