import Button from '@mui/material/Button';
import { useTheme, alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { motion } from 'framer-motion';
import { useFormContext } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router-dom';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import {
  useCreateWeblogTagMutation,
  useDeleteWeblogTagMutation,
  useUpdateWeblogTagMutation
} from '../WeblogApi';
import { enqueueSnackbar } from 'notistack';
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import { useState } from 'react';
import ConfirmDialog from '../../archive/ConfirmDialog';

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
};

/**
 * The tag header.
 */
function TagHeader() {
  const routeParams = useParams();
  const { tagId } = routeParams;
  const isNew = tagId === 'new';

  const [createTag, { isLoading: isCreating }] = useCreateWeblogTagMutation();
  const [updateTag, { isLoading: isUpdating }] = useUpdateWeblogTagMutation();
  const [deleteTag, { isLoading: isDeleting }] = useDeleteWeblogTagMutation();
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const methods = useFormContext();
  const { formState, watch, getValues } = methods;
  const { isValid, dirtyFields } = formState;
  const theme = useTheme();
  const navigate = useNavigate();

  const { name } = watch();

  const handleSaveTag = async () => {
    try {
      const values = getValues();
      await updateTag({ id: tagId, ...values }).unwrap();
      enqueueSnackbar('برچسب با موفقیت بروزرسانی شد', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('خطا در بروزرسانی برچسب', { variant: 'error' });
    }
  };

  const handleCreateTag = async () => {
    try {
      const values = getValues();
      await createTag(values).unwrap();
      enqueueSnackbar('برچسب با موفقیت ایجاد شد', { variant: 'success' });
      navigate('/apps/weblog/tags');
    } catch (error) {
      enqueueSnackbar('خطا در ایجاد برچسب', { variant: 'error' });
    }
  };

  const handlePrepareDelete = () => {
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    setDeleteDialogOpen(false);
    try {
      await deleteTag(tagId).unwrap();
      enqueueSnackbar('برچسب با موفقیت حذف شد', { variant: 'success' });
      navigate('/apps/weblog/tags');
    } catch (error) {
      enqueueSnackbar('خطا در حذف برچسب', { variant: 'error' });
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
  };

  return (
    <>
      <Box
        className="relative overflow-hidden"
        sx={{
          background: `linear-gradient(135deg, ${alpha(theme.palette.warning.dark, 0.05)} 0%, ${alpha(theme.palette.secondary.dark, 0.08)} 100%)`,
        }}
      >
        {/* Decorative Elements */}
        <Box className="absolute -top-40 -right-40 w-[200px] h-[200px] rounded-full opacity-10" sx={{ background: theme.palette.warning.main }} />
        <Box className="absolute -bottom-20 -left-20 w-[150px] h-[150px] rounded-full opacity-5" sx={{ background: theme.palette.secondary.main }} />

        <div className="relative flex flex-col sm:flex-row w-full items-center justify-between space-y-16 sm:space-y-0 py-24 sm:py-32 px-24 md:px-32">
          <div className="flex flex-col items-center sm:items-start">
            <motion.div variants={itemVariants}>
              <Button
                component={Link}
                to="/apps/weblog/tags"
                className="mb-8 rounded-lg"
                sx={{ 
                  color: 'text.secondary',
                  '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.08) }
                }}
                size="small"
                startIcon={
                  <FuseSvgIcon size={16}>
                    {theme.direction === 'ltr'
                      ? 'heroicons-outline:arrow-sm-left'
                      : 'heroicons-outline:arrow-sm-right'}
                  </FuseSvgIcon>
                }
              >
                برچسب‌ها
              </Button>
            </motion.div>

            <motion.div variants={itemVariants} className="flex items-center gap-16">
              <Box
                className="hidden sm:flex items-center justify-center w-56 h-56 rounded-2xl"
                sx={{
                  background: `linear-gradient(135deg, ${theme.palette.warning.main}, ${theme.palette.warning.dark})`,
                  boxShadow: `0 8px 24px -8px ${alpha(theme.palette.warning.main, 0.4)}`
                }}
              >
                <FuseSvgIcon className="text-white" size={28}>heroicons-outline:tag</FuseSvgIcon>
              </Box>
              <div>
                <div className="flex items-center gap-12">
                  <Typography className="text-2xl md:text-3xl font-extrabold tracking-tight">
                    {name || 'برچسب جدید'}
                  </Typography>
                  {isNew && (
                    <Chip 
                      label="جدید" 
                      size="small" 
                      sx={{ 
                        backgroundColor: alpha(theme.palette.success.main, 0.15),
                        color: 'success.dark',
                        fontWeight: 600,
                        borderRadius: '8px'
                      }} 
                    />
                  )}
                </div>
                {!isNew && (
                  <Typography variant="body2" className="text-gray-500 mt-4">
                    شناسه: {tagId}
                  </Typography>
                )}
              </div>
            </motion.div>
          </div>

          <motion.div variants={itemVariants} className="flex items-center gap-12">
            {!isNew && (
              <Button
                variant="outlined"
                color="error"
                onClick={handlePrepareDelete}
                disabled={isDeleting}
                className="rounded-xl"
                sx={{
                  borderColor: alpha(theme.palette.error.main, 0.5),
                  '&:hover': {
                    borderColor: theme.palette.error.main,
                    backgroundColor: alpha(theme.palette.error.main, 0.05)
                  }
                }}
                startIcon={<FuseSvgIcon size={18}>heroicons-outline:trash</FuseSvgIcon>}
              >
                حذف
              </Button>
            )}
            <LoadingButton
              variant="contained"
              disabled={!isValid || (isNew ? false : Object.keys(dirtyFields).length === 0)}
              loading={isCreating || isUpdating}
              onClick={isNew ? handleCreateTag : handleSaveTag}
              className="rounded-xl px-20"
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.warning.main}, ${theme.palette.warning.dark})`,
                boxShadow: `0 4px 14px 0 ${alpha(theme.palette.warning.main, 0.4)}`,
                '&:hover': {
                  boxShadow: `0 6px 20px 0 ${alpha(theme.palette.warning.main, 0.5)}`
                },
                '&.Mui-disabled': {
                  background: alpha(theme.palette.grey[500], 0.3)
                }
              }}
              startIcon={<FuseSvgIcon size={18}>heroicons-outline:save</FuseSvgIcon>}
            >
              {isNew ? 'ایجاد برچسب' : 'ذخیره تغییرات'}
            </LoadingButton>
          </motion.div>
        </div>
      </Box>

      <ConfirmDialog
        open={deleteDialogOpen}
        title="حذف برچسب"
        content={`آیا از حذف برچسب "${name}" مطمئن هستید؟ این عمل قابل بازگشت نیست.`}
        confirmText="حذف"
        cancelText="انصراف"
        confirmColor="error"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </>
  );
}

export default TagHeader;
