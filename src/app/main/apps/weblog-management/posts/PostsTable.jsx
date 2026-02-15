/* eslint-disable react/no-unstable-nested-components */
import { useMemo, useState } from 'react';
import DataTable from 'app/shared-components/data-table/DataTable';
import FuseLoading from '@fuse/core/FuseLoading';
import { Chip, ListItemIcon, MenuItem, Paper, Box, TextField, FormControl, InputLabel, Select, InputAdornment, IconButton, Tooltip } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Link } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useGetWeblogPostsQuery, useDeleteWeblogPostMutation, useGetWeblogCategoriesQuery } from '../WeblogApi';
import { motion, AnimatePresence } from 'framer-motion';
import { alpha, useTheme } from '@mui/material/styles';

const statusConfig = {
  PUBLISHED: { label: 'منتشر شده', color: 'success', icon: 'heroicons-outline:check-circle' },
  DRAFT: { label: 'پیش‌نویس', color: 'warning', icon: 'heroicons-outline:pencil' },
  SCHEDULED: { label: 'زمان‌بندی شده', color: 'info', icon: 'heroicons-outline:clock' },
  ARCHIVED: { label: 'آرشیو شده', color: 'default', icon: 'heroicons-outline:archive' }
};

function PostsTable() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const { data: postsResponse, isLoading, isFetching } = useGetWeblogPostsQuery({
    page,
    limit,
    search: search || undefined,
    status: status || undefined,
    categoryId: categoryId || undefined
  });

  const { data: categories } = useGetWeblogCategoriesQuery({});
  const [deletePost] = useDeleteWeblogPostMutation();

  const posts = postsResponse?.data || [];
  const pagination = postsResponse?.pagination || {};

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearch('');
    setSearchInput('');
    setStatus('');
    setCategoryId('');
    setPage(1);
  };

  const columns = useMemo(
    () => [
      {
        accessorFn: (row) => row.featuredImage,
        id: 'featuredImage',
        header: '',
        enableColumnFilter: false,
        enableColumnDragging: false,
        size: 90,
        enableSorting: false,
        Cell: ({ row }) => (
          <motion.div 
            className="flex items-center justify-center"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            {row.original?.featuredImage ? (
              <Box
                className="w-56 h-56 rounded-xl overflow-hidden"
                sx={{ boxShadow: '0 4px 14px -4px rgba(0,0,0,0.15)' }}
              >
                <img
                  className="w-full h-full object-cover"
                  src={row.original.featuredImage}
                  alt={row.original.title}
                />
              </Box>
            ) : (
              <Box
                className="w-56 h-56 rounded-xl flex items-center justify-center"
                sx={{ 
                  background: (theme) => `linear-gradient(135deg, ${alpha(theme.palette.grey[200], 0.8)}, ${alpha(theme.palette.grey[300], 0.8)})`
                }}
              >
                <FuseSvgIcon className="text-gray-400" size={24}>
                  heroicons-outline:photograph
                </FuseSvgIcon>
              </Box>
            )}
          </motion.div>
        )
      },
      {
        accessorKey: 'title',
        header: 'عنوان',
        size: 320,
        Cell: ({ row }) => (
          <div className="flex flex-col py-8">
            <Typography
              component={Link}
              to={`/apps/weblog/posts/${row.original.id}`}
              className="font-semibold text-base hover:text-primary-500 transition-colors"
              sx={{ textDecoration: 'none' }}
            >
              {row.original.title}
            </Typography>
            <Typography variant="caption" className="text-gray-500 mt-4 line-clamp-1">
              {row.original.excerpt?.substring(0, 80) || 'بدون خلاصه...'}
            </Typography>
          </div>
        )
      },
      {
        accessorKey: 'status',
        header: 'وضعیت',
        size: 140,
        Cell: ({ row }) => {
          const config = statusConfig[row.original.status] || statusConfig.DRAFT;
          return (
            <Chip
              size="small"
              label={config.label}
              icon={<FuseSvgIcon size={14}>{config.icon}</FuseSvgIcon>}
              sx={{
                backgroundColor: (theme) => alpha(theme.palette[config.color].main, 0.12),
                color: `${config.color}.main`,
                fontWeight: 600,
                borderRadius: '10px',
                '& .MuiChip-icon': {
                  color: 'inherit'
                }
              }}
            />
          );
        }
      },
      {
        accessorKey: 'category',
        header: 'دسته‌بندی',
        size: 150,
        Cell: ({ row }) => (
          row.original.category ? (
            <Chip
              size="small"
              label={row.original.category.name}
              variant="outlined"
              component={Link}
              to={`/apps/weblog/categories/${row.original.category.id}`}
              clickable
              sx={{ 
                borderRadius: '10px',
                fontWeight: 500,
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: (theme) => alpha(theme.palette.secondary.main, 0.1),
                  borderColor: 'secondary.main'
                }
              }}
            />
          ) : (
            <Typography variant="caption" className="text-gray-400">بدون دسته‌بندی</Typography>
          )
        )
      },
      {
        accessorKey: 'tags',
        header: 'برچسب‌ها',
        size: 200,
        Cell: ({ row }) => (
          <div className="flex flex-wrap gap-4">
            {row.original.tags?.slice(0, 2).map((tagItem) => (
              <Chip
                key={tagItem.tagId}
                size="small"
                label={tagItem.tag?.name || 'N/A'}
                sx={{ 
                  fontSize: '0.7rem', 
                  height: 22,
                  borderRadius: '6px',
                  backgroundColor: (theme) => alpha(theme.palette.warning.main, 0.1),
                  color: 'warning.dark'
                }}
              />
            ))}
            {row.original.tags?.length > 2 && (
              <Tooltip title={row.original.tags.slice(2).map(t => t.tag?.name).join('، ')}>
                <Chip
                  size="small"
                  label={`+${row.original.tags.length - 2}`}
                  sx={{ 
                    fontSize: '0.7rem', 
                    height: 22,
                    borderRadius: '6px',
                    backgroundColor: (theme) => alpha(theme.palette.grey[500], 0.1)
                  }}
                />
              </Tooltip>
            )}
          </div>
        )
      },
      {
        accessorKey: 'viewCount',
        header: 'بازدید',
        size: 100,
        Cell: ({ row }) => (
          <Box className="flex items-center gap-6 px-8 py-4 rounded-lg" sx={{ backgroundColor: (theme) => alpha(theme.palette.info.main, 0.08) }}>
            <FuseSvgIcon size={16} className="text-info-500">heroicons-outline:eye</FuseSvgIcon>
            <Typography variant="body2" className="font-medium text-info-600">{row.original.viewCount || 0}</Typography>
          </Box>
        )
      },
      {
        accessorKey: 'publishedAt',
        header: 'تاریخ انتشار',
        size: 150,
        Cell: ({ row }) => (
          <div className="flex items-center gap-8">
            <FuseSvgIcon size={16} className="text-gray-400">heroicons-outline:calendar</FuseSvgIcon>
            <Typography variant="body2" className="text-gray-600">
              {row.original.publishedAt
                ? new Date(row.original.publishedAt).toLocaleDateString('fa-IR', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })
                : '-'}
            </Typography>
          </div>
        )
      }
    ],
    []
  );

  if (isLoading) {
    return <FuseLoading />;
  }

  return (
    <Paper
      className="flex flex-col flex-auto rounded-none overflow-hidden w-full h-full"
      elevation={0}
      sx={{ backgroundColor: 'background.default' }}
    >
      {/* Modern Filters Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="p-20 md:p-24"
      >
        <Paper 
          className="p-20 rounded-2xl"
          sx={{ 
            backgroundColor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider'
          }}
        >
          <div className="flex flex-wrap items-center gap-16">
            {/* Search Input */}
            <TextField
              size="small"
              placeholder="جستجو در پست‌ها..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="min-w-[240px] flex-1 md:flex-none"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FuseSvgIcon size={20} className="text-gray-400">heroicons-outline:search</FuseSvgIcon>
                  </InputAdornment>
                ),
                endAdornment: searchInput && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => { setSearchInput(''); setSearch(''); }}>
                      <FuseSvgIcon size={16}>heroicons-outline:x</FuseSvgIcon>
                    </IconButton>
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: '12px',
                  '&:hover': { backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.02) }
                }
              }}
            />

            {/* Status Filter */}
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>وضعیت</InputLabel>
              <Select
                value={status}
                label="وضعیت"
                onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                sx={{ borderRadius: '12px' }}
              >
                <MenuItem value="">
                  <div className="flex items-center gap-8">
                    <Box className="w-8 h-8 rounded-full bg-gray-400" />
                    همه
                  </div>
                </MenuItem>
                <MenuItem value="PUBLISHED">
                  <div className="flex items-center gap-8">
                    <Box className="w-8 h-8 rounded-full bg-green-500" />
                    منتشر شده
                  </div>
                </MenuItem>
                <MenuItem value="DRAFT">
                  <div className="flex items-center gap-8">
                    <Box className="w-8 h-8 rounded-full bg-amber-500" />
                    پیش‌نویس
                  </div>
                </MenuItem>
                <MenuItem value="SCHEDULED">
                  <div className="flex items-center gap-8">
                    <Box className="w-8 h-8 rounded-full bg-blue-500" />
                    زمان‌بندی شده
                  </div>
                </MenuItem>
                <MenuItem value="ARCHIVED">
                  <div className="flex items-center gap-8">
                    <Box className="w-8 h-8 rounded-full bg-gray-500" />
                    آرشیو شده
                  </div>
                </MenuItem>
              </Select>
            </FormControl>

            {/* Category Filter */}
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>دسته‌بندی</InputLabel>
              <Select
                value={categoryId}
                label="دسته‌بندی"
                onChange={(e) => { setCategoryId(e.target.value); setPage(1); }}
                sx={{ borderRadius: '12px' }}
              >
                <MenuItem value="">همه دسته‌بندی‌ها</MenuItem>
                {categories?.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Search Button */}
            <Button
              variant="contained"
              size="medium"
              onClick={handleSearch}
              className="rounded-xl px-20"
              sx={{
                boxShadow: 'none',
                '&:hover': { boxShadow: 'none' }
              }}
              startIcon={<FuseSvgIcon size={18}>heroicons-outline:search</FuseSvgIcon>}
            >
              جستجو
            </Button>

            {/* Clear Filters */}
            <AnimatePresence>
              {(search || status || categoryId) && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <Button
                    variant="outlined"
                    size="medium"
                    onClick={handleClearFilters}
                    color="error"
                    className="rounded-xl"
                    startIcon={<FuseSvgIcon size={16}>heroicons-outline:x</FuseSvgIcon>}
                  >
                    پاک کردن
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Paper>
      </motion.div>

      {/* Data Table Container */}
      <div className="flex-1 px-20 md:px-24 pb-24">
        <Paper 
          className="rounded-2xl overflow-hidden h-full"
          sx={{ 
            backgroundColor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider'
          }}
        >
          <DataTable
            data={posts}
            columns={columns}
            renderRowActionMenuItems={({ closeMenu, row, table }) => [
              <MenuItem
                key={0}
                component={Link}
                to={`/apps/weblog/posts/${row.original.id}`}
                onClick={closeMenu}
                className="gap-12"
              >
                <ListItemIcon>
                  <FuseSvgIcon className="text-blue-500">heroicons-outline:pencil</FuseSvgIcon>
                </ListItemIcon>
                <Typography>ویرایش پست</Typography>
              </MenuItem>,
              <MenuItem
                key={1}
                onClick={() => {
                  if (window.confirm('آیا از حذف این پست مطمئن هستید؟')) {
                    deletePost(row.original.id);
                  }
                  closeMenu();
                  table.resetRowSelection();
                }}
                className="gap-12"
              >
                <ListItemIcon>
                  <FuseSvgIcon color="error">heroicons-outline:trash</FuseSvgIcon>
                </ListItemIcon>
                <Typography color="error">حذف پست</Typography>
              </MenuItem>
            ]}
            renderTopToolbarCustomActions={({ table }) => {
              const { rowSelection } = table.getState();

              if (Object.keys(rowSelection).length === 0) {
                return null;
              }

              return (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => {
                      const selectedRows = table.getSelectedRowModel().rows;
                      if (window.confirm(`آیا از حذف ${selectedRows.length} پست مطمئن هستید؟`)) {
                        selectedRows.forEach((row) => deletePost(row.original.id));
                      }
                      table.resetRowSelection();
                    }}
                    className="rounded-lg"
                    color="error"
                    startIcon={<FuseSvgIcon size={16}>heroicons-outline:trash</FuseSvgIcon>}
                  >
                    حذف {Object.keys(rowSelection).length} مورد
                  </Button>
                </motion.div>
              );
            }}
            muiTableContainerProps={{
              sx: { 
                opacity: isFetching ? 0.5 : 1, 
                transition: 'opacity 0.3s ease',
                maxHeight: 'calc(100vh - 400px)'
              }
            }}
            muiTablePaperProps={{
              elevation: 0,
              sx: { backgroundColor: 'transparent' }
            }}
          />
        </Paper>
      </div>

      {/* Modern Pagination Info */}
      {pagination.total > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-20 md:px-24 pb-24"
        >
          <Paper 
            className="flex items-center justify-between p-16 rounded-2xl"
            sx={{ 
              backgroundColor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <div className="flex items-center gap-12">
              <Box
                className="w-40 h-40 rounded-xl flex items-center justify-center"
                sx={{ backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1) }}
              >
                <FuseSvgIcon className="text-primary-500" size={20}>heroicons-outline:document-text</FuseSvgIcon>
              </Box>
              <div>
                <Typography variant="body2" className="font-semibold">
                  نمایش {posts.length} از {pagination.total} پست
                </Typography>
                <Typography variant="caption" className="text-gray-500">
                  صفحه {pagination.page} از {pagination.totalPages}
                </Typography>
              </div>
            </div>
            <Chip
              label={`${pagination.total} پست`}
              size="small"
              sx={{
                backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1),
                color: 'primary.main',
                fontWeight: 600
              }}
            />
          </Paper>
        </motion.div>
      )}
    </Paper>
  );
}

export default PostsTable;
