import Button from '@mui/material/Button';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { motion } from 'framer-motion';
import { useFormContext } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router-dom';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import {
  useCreateWeblogPostMutation,
  useDeleteWeblogPostMutation,
  useUpdateWeblogPostMutation
} from '../WeblogApi';
import { enqueueSnackbar } from 'notistack';
import LoadingButton from '@mui/lab/LoadingButton';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import { useState } from 'react';
import ConfirmDialog from '../../archive/ConfirmDialog';

const statusConfig = {
  PUBLISHED: { label: 'منتشر شده', color: 'success' },
  DRAFT: { label: 'پیش‌نویس', color: 'warning' },
  SCHEDULED: { label: 'زمان‌بندی شده', color: 'info' },
  ARCHIVED: { label: 'آرشیو شده', color: 'default' }
};

/**
 * The post header.
 */
function PostHeader() {
  const routeParams = useParams();
  const { postId } = routeParams;
  const isNew = postId === 'new';

  const [createPost, { isLoading: isCreating }] = useCreateWeblogPostMutation();
  const [updatePost, { isLoading: isUpdating }] = useUpdateWeblogPostMutation();
  const [deletePost, { isLoading: isDeleting }] = useDeleteWeblogPostMutation();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const methods = useFormContext();
  const { formState, watch, getValues } = methods;
  const { isValid, dirtyFields } = formState;
  const theme = useTheme();
  const navigate = useNavigate();

  const { title, featuredImage, status } = watch();

  const handleSavePost = async () => {
    try {
      const values = getValues();
      await updatePost({ id: postId, ...values }).unwrap();
      enqueueSnackbar('پست با موفقیت بروزرسانی شد', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('خطا در بروزرسانی پست', { variant: 'error' });
    }
  };

  const handleCreatePost = async () => {
    try {
      const values = getValues();
      await createPost(values).unwrap();
      enqueueSnackbar('پست با موفقیت ایجاد شد', { variant: 'success' });
      navigate('/apps/weblog/posts');
    } catch (error) {
      enqueueSnackbar('خطا در ایجاد پست', { variant: 'error' });
    }
  };

  const handlePrepareDelete = () => {
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    setDeleteDialogOpen(false);
    try {
      await deletePost(postId).unwrap();
      enqueueSnackbar('پست با موفقیت حذف شد', { variant: 'success' });
      navigate('/apps/weblog/posts');
    } catch (error) {
      enqueueSnackbar('خطا در حذف پست', { variant: 'error' });
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
  };

  const statusInfo = statusConfig[status] || statusConfig.DRAFT;

  return (
    <>
      <div className="flex flex-col sm:flex-row flex-1 w-full items-center justify-between space-y-8 sm:space-y-0 py-24 sm:py-32 px-24 md:px-32">
        <div className="flex flex-col items-start space-y-8 sm:space-y-0 w-full sm:max-w-full min-w-0">
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1, transition: { delay: 0.3 } }}
          >
            <Typography
              className="flex items-center sm:mb-12"
              component={Link}
              role="button"
              to="/apps/weblog/posts"
              color="inherit"
            >
              <FuseSvgIcon size={20}>
                {theme.direction === 'ltr'
                  ? 'heroicons-outline:arrow-sm-left'
                  : 'heroicons-outline:arrow-sm-right'}
              </FuseSvgIcon>
              <span className="flex mx-4 font-medium">پست‌ها</span>
            </Typography>
          </motion.div>

          <div className="flex items-center max-w-full">
            <motion.div
              className="hidden sm:flex"
              initial={{ scale: 0 }}
              animate={{ scale: 1, transition: { delay: 0.3 } }}
            >
              {featuredImage ? (
                <img
                  className="w-32 sm:w-48 rounded-lg object-cover"
                  src={featuredImage}
                  alt={title}
                />
              ) : (
                <Box
                  className="w-32 sm:w-48 h-32 sm:h-48 rounded-lg flex items-center justify-center"
                  sx={{ backgroundColor: 'grey.200' }}
                >
                  <FuseSvgIcon className="text-gray-400">heroicons-outline:document-text</FuseSvgIcon>
                </Box>
              )}
            </motion.div>
            <motion.div
              className="flex flex-col min-w-0 mx-8 sm:mx-16"
              initial={{ x: -20 }}
              animate={{ x: 0, transition: { delay: 0.3 } }}
            >
              <Typography className="text-16 sm:text-20 truncate font-semibold">
                {title || 'پست جدید'}
              </Typography>
              <div className="flex items-center gap-8 mt-4">
                <Chip
                  size="small"
                  label={statusInfo.label}
                  color={statusInfo.color}
                />
                {!isNew && (
                  <Typography variant="caption" color="text.secondary">
                    شناسه: {postId}
                  </Typography>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        <motion.div
          className="flex items-center gap-8"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0, transition: { delay: 0.3 } }}
        >
          {!isNew && (
            <Button
              variant="outlined"
              color="error"
              onClick={handlePrepareDelete}
              disabled={isDeleting}
              startIcon={<FuseSvgIcon size={20}>heroicons-outline:trash</FuseSvgIcon>}
            >
              حذف
            </Button>
          )}
          <LoadingButton
            variant="contained"
            color="secondary"
            disabled={!isValid || (isNew ? false : Object.keys(dirtyFields).length === 0)}
            loading={isCreating || isUpdating}
            onClick={isNew ? handleCreatePost : handleSavePost}
            startIcon={<FuseSvgIcon size={20}>heroicons-outline:save</FuseSvgIcon>}
          >
            {isNew ? 'ایجاد پست' : 'ذخیره'}
          </LoadingButton>
        </motion.div>
      </div>

      <ConfirmDialog
        open={deleteDialogOpen}
        title="حذف پست"
        content={`آیا از حذف پست "${title}" مطمئن هستید؟ این عمل قابل بازگشت نیست.`}
        confirmText="حذف"
        cancelText="انصراف"
        confirmColor="error"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </>
  );
}

export default PostHeader;
