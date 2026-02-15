import { useState } from 'react';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { motion, AnimatePresence } from 'framer-motion';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import FuseLoading from '@fuse/core/FuseLoading';
import { useGetWeblogCategoriesQuery, useDeleteWeblogCategoryMutation } from '../WeblogApi';
import { Link } from 'react-router-dom';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import { alpha } from '@mui/material/styles';
import { enqueueSnackbar } from 'notistack';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Tooltip from '@mui/material/Tooltip';

const container = {
  show: {
    transition: {
      staggerChildren: 0.05
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

function CategoryCard({ category, onDelete, level = 0 }) {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = category.children && category.children.length > 0;

  return (
    <motion.div variants={item}>
      <Card
        className="transition-all duration-200 hover:shadow-lg"
        sx={{
          borderRight: 4,
          borderColor: level === 0 ? 'primary.main' : 'secondary.main',
          ml: level * 24,
          '&:hover': {
            transform: 'translateX(-4px)'
          }
        }}
      >
        <CardContent className="pb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-12">
              <Box
                className="w-48 h-48 rounded-lg flex items-center justify-center"
                sx={{
                  backgroundColor: (theme) =>
                    alpha(level === 0 ? theme.palette.primary.main : theme.palette.secondary.main, 0.1)
                }}
              >
                <FuseSvgIcon
                  className={level === 0 ? 'text-primary-500' : 'text-secondary-500'}
                  size={24}
                >
                  heroicons-outline:folder
                </FuseSvgIcon>
              </Box>
              <div>
                <Typography
                  component={Link}
                  to={`/apps/weblog/categories/${category.id}`}
                  className="font-semibold text-lg hover:text-primary-500 transition-colors"
                >
                  {category.name}
                </Typography>
                <Typography variant="body2" className="text-gray-500 mt-4">
                  {category.slug}
                </Typography>
              </div>
            </div>
            <div className="flex items-center gap-8">
              <Chip
                size="small"
                label={`${category._count?.posts || 0} پست`}
                color={category._count?.posts > 0 ? 'primary' : 'default'}
                variant="outlined"
              />
              {hasChildren && (
                <Chip
                  size="small"
                  label={`${category.children.length} زیردسته`}
                  color="secondary"
                  variant="outlined"
                />
              )}
            </div>
          </div>

          {category.description && (
            <Typography variant="body2" className="text-gray-600 mt-12 line-clamp-2">
              {category.description}
            </Typography>
          )}
        </CardContent>

        <CardActions className="justify-between px-16 pb-12">
          <div className="flex items-center gap-4">
            {hasChildren && (
              <Button
                size="small"
                onClick={() => setExpanded(!expanded)}
                startIcon={
                  <FuseSvgIcon size={16}>
                    {expanded ? 'heroicons-outline:chevron-up' : 'heroicons-outline:chevron-down'}
                  </FuseSvgIcon>
                }
              >
                {expanded ? 'بستن' : 'نمایش زیردسته‌ها'}
              </Button>
            )}
          </div>
          <div className="flex items-center gap-4">
            <Tooltip title="مشاهده پست‌ها">
              <IconButton
                size="small"
                component={Link}
                to={`/apps/weblog/posts?categoryId=${category.id}`}
              >
                <FuseSvgIcon size={18}>heroicons-outline:document-text</FuseSvgIcon>
              </IconButton>
            </Tooltip>
            <Tooltip title="ویرایش">
              <IconButton
                size="small"
                component={Link}
                to={`/apps/weblog/categories/${category.id}`}
              >
                <FuseSvgIcon size={18}>heroicons-outline:pencil</FuseSvgIcon>
              </IconButton>
            </Tooltip>
            <Tooltip title="حذف">
              <IconButton
                size="small"
                onClick={() => onDelete(category)}
                color="error"
              >
                <FuseSvgIcon size={18}>heroicons-outline:trash</FuseSvgIcon>
              </IconButton>
            </Tooltip>
          </div>
        </CardActions>
      </Card>

      {/* Children */}
      <Collapse in={expanded}>
        <div className="space-y-12 mt-12">
          {category.children?.map((child) => (
            <CategoryCard
              key={child.id}
              category={child}
              onDelete={onDelete}
              level={level + 1}
            />
          ))}
        </div>
      </Collapse>
    </motion.div>
  );
}

function CategoriesContent() {
  const { data: categories, isLoading } = useGetWeblogCategoriesQuery({ includeChildren: true });
  const [deleteCategory] = useDeleteWeblogCategoryMutation();

  const handleDelete = async (category) => {
    if (category._count?.posts > 0) {
      enqueueSnackbar('این دسته‌بندی دارای پست است و قابل حذف نیست', { variant: 'error' });
      return;
    }

    if (category.children?.length > 0) {
      enqueueSnackbar('این دسته‌بندی دارای زیردسته است و قابل حذف نیست', { variant: 'error' });
      return;
    }

    if (!window.confirm(`آیا از حذف دسته‌بندی "${category.name}" مطمئن هستید؟`)) return;

    try {
      await deleteCategory(category.id).unwrap();
      enqueueSnackbar('دسته‌بندی با موفقیت حذف شد', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('خطا در حذف دسته‌بندی', { variant: 'error' });
    }
  };

  if (isLoading) {
    return <FuseLoading />;
  }

  // Filter to only show root categories (no parent)
  const rootCategories = categories?.filter((cat) => !cat.parentId) || [];

  return (
    <Paper
      className="flex flex-col flex-auto shadow-3 rounded-t-16 overflow-hidden rounded-b-0 w-full h-full p-24"
      elevation={0}
    >
      {rootCategories.length > 0 ? (
        <motion.div
          className="space-y-16"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {rootCategories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onDelete={handleDelete}
            />
          ))}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-64"
        >
          <FuseSvgIcon className="text-gray-400 mb-16" size={64}>
            heroicons-outline:folder-open
          </FuseSvgIcon>
          <Typography className="text-gray-500 text-lg mb-8">
            هیچ دسته‌بندی‌ای یافت نشد
          </Typography>
          <Typography variant="body2" className="text-gray-400 mb-24">
            برای سازماندهی پست‌های خود دسته‌بندی ایجاد کنید
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            component={Link}
            to="/apps/weblog/categories/new"
            startIcon={<FuseSvgIcon size={18}>heroicons-outline:plus</FuseSvgIcon>}
          >
            ایجاد اولین دسته‌بندی
          </Button>
        </motion.div>
      )}

      {/* Summary */}
      {rootCategories.length > 0 && (
        <Box className="mt-24 pt-16 border-t">
          <Typography variant="body2" className="text-gray-500">
            مجموع: {categories?.length || 0} دسته‌بندی • {rootCategories.length} دسته‌بندی اصلی
          </Typography>
        </Box>
      )}
    </Paper>
  );
}

export default CategoriesContent;
