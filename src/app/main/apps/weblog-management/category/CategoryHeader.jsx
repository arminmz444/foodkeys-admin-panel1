import Button from '@mui/material/Button';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { motion } from 'framer-motion';
import { useFormContext } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router-dom';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import {
  useCreateWeblogCategoryMutation,
  useDeleteWeblogCategoryMutation,
  useUpdateWeblogCategoryMutation
} from '../WeblogApi';
import { enqueueSnackbar } from 'notistack';
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';
import { useState } from 'react';
import ConfirmDialog from '../../archive/ConfirmDialog';

/**
 * The category header.
 */
function CategoryHeader() {
  const routeParams = useParams();
  const { categoryId } = routeParams;
  const isNew = categoryId === 'new';

  const [createCategory, { isLoading: isCreating }] = useCreateWeblogCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateWeblogCategoryMutation();
  const [deleteCategory, { isLoading: isDeleting }] = useDeleteWeblogCategoryMutation();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const methods = useFormContext();
  const { formState, watch, getValues } = methods;
  const { isValid, dirtyFields } = formState;
  const theme = useTheme();
  const navigate = useNavigate();

  const { name } = watch();

  const handleSave = async () => {
    try {
      const values = getValues();
      await updateCategory({ id: categoryId, ...values }).unwrap();
      enqueueSnackbar('دسته‌بندی با موفقیت بروزرسانی شد', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('خطا در بروزرسانی دسته‌بندی', { variant: 'error' });
    }
  };

  const handleCreate = async () => {
    try {
      const values = getValues();
      await createCategory(values).unwrap();
      enqueueSnackbar('دسته‌بندی با موفقیت ایجاد شد', { variant: 'success' });
      navigate('/apps/weblog/categories');
    } catch (error) {
      enqueueSnackbar('خطا در ایجاد دسته‌بندی', { variant: 'error' });
    }
  };

  const handlePrepareDelete = () => {
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    setDeleteDialogOpen(false);
    try {
      await deleteCategory(categoryId).unwrap();
      enqueueSnackbar('دسته‌بندی با موفقیت حذف شد', { variant: 'success' });
      navigate('/apps/weblog/categories');
    } catch (error) {
      enqueueSnackbar('خطا در حذف دسته‌بندی', { variant: 'error' });
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
  };

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
              to="/apps/weblog/categories"
              color="inherit"
            >
              <FuseSvgIcon size={20}>
                {theme.direction === 'ltr'
                  ? 'heroicons-outline:arrow-sm-left'
                  : 'heroicons-outline:arrow-sm-right'}
              </FuseSvgIcon>
              <span className="flex mx-4 font-medium">دسته‌بندی‌ها</span>
            </Typography>
          </motion.div>

          <div className="flex items-center max-w-full">
            <motion.div
              className="hidden sm:flex"
              initial={{ scale: 0 }}
              animate={{ scale: 1, transition: { delay: 0.3 } }}
            >
              <Box
                className="w-32 sm:w-48 h-32 sm:h-48 rounded-lg flex items-center justify-center"
                sx={{ backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1) }}
              >
                <FuseSvgIcon className="text-primary-500">heroicons-outline:folder</FuseSvgIcon>
              </Box>
            </motion.div>
            <motion.div
              className="flex flex-col min-w-0 mx-8 sm:mx-16"
              initial={{ x: -20 }}
              animate={{ x: 0, transition: { delay: 0.3 } }}
            >
              <Typography className="text-16 sm:text-20 truncate font-semibold">
                {name || 'دسته‌بندی جدید'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {isNew ? 'ایجاد دسته‌بندی جدید' : `شناسه: ${categoryId}`}
              </Typography>
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
            onClick={isNew ? handleCreate : handleSave}
            startIcon={<FuseSvgIcon size={20}>heroicons-outline:save</FuseSvgIcon>}
          >
            {isNew ? 'ایجاد' : 'ذخیره'}
          </LoadingButton>
        </motion.div>
      </div>

      <ConfirmDialog
        open={deleteDialogOpen}
        title="حذف دسته‌بندی"
        content={`آیا از حذف دسته‌بندی "${name}" مطمئن هستید؟ این عمل قابل بازگشت نیست.`}
        confirmText="حذف"
        cancelText="انصراف"
        confirmColor="error"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </>
  );
}

export default CategoryHeader;
