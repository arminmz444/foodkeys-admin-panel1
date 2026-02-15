/* eslint-disable react/no-unstable-nested-components */
import { useMemo, useState } from 'react';
import DataTable from 'app/shared-components/data-table/DataTable';
import FuseLoading from '@fuse/core/FuseLoading';
import { Chip, ListItemIcon, MenuItem, Paper, TextField, InputAdornment, IconButton, Box, Tooltip } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Link } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useGetWeblogTagsQuery, useDeleteWeblogTagMutation, useBulkCreateWeblogTagsMutation } from '../WeblogApi';
import { motion } from 'framer-motion';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { enqueueSnackbar } from 'notistack';
import { alpha, useTheme } from '@mui/material/styles';

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 100, damping: 15 } }
};

function TagsTable() {
  const theme = useTheme();
  const [search, setSearch] = useState('');
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [bulkTags, setBulkTags] = useState('');

  const { data: tags = [], isLoading, isFetching } = useGetWeblogTagsQuery({ sortBy: 'name' });
  const [deleteTag] = useDeleteWeblogTagMutation();
  const [bulkCreateTags, { isLoading: isBulkCreating }] = useBulkCreateWeblogTagsMutation();

  const filteredTags = useMemo(() => {
    if (!search) return tags;
    return tags.filter((tag) =>
      tag.name.toLowerCase().includes(search.toLowerCase()) ||
      tag.slug?.toLowerCase().includes(search.toLowerCase())
    );
  }, [tags, search]);

  const handleBulkCreate = async () => {
    const tagNames = bulkTags
      .split('\n')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    if (tagNames.length === 0) {
      enqueueSnackbar('لطفا حداقل یک برچسب وارد کنید', { variant: 'warning' });
      return;
    }

    try {
      const result = await bulkCreateTags(tagNames).unwrap();
      enqueueSnackbar(`${result?.data?.created?.length || 0} برچسب ایجاد شد`, { variant: 'success' });
      setBulkDialogOpen(false);
      setBulkTags('');
    } catch (error) {
      enqueueSnackbar('خطا در ایجاد برچسب‌ها', { variant: 'error' });
    }
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'نام برچسب',
        size: 200,
        Cell: ({ row }) => (
          <Box
            component={Link}
            to={`/apps/weblog/tags/${row.original.id}`}
            className="flex items-center gap-12 py-8 group"
            sx={{ textDecoration: 'none' }}
          >
            <Box
              className="w-40 h-40 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
              sx={{ 
                background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.15)}, ${alpha(theme.palette.warning.main, 0.05)})`,
                border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`
              }}
            >
              <FuseSvgIcon size={18} className="text-warning-600">heroicons-outline:tag</FuseSvgIcon>
            </Box>
            <div>
              <Typography className="font-semibold group-hover:text-warning-600 transition-colors">
                {row.original.name}
              </Typography>
            </div>
          </Box>
        )
      },
      {
        accessorKey: 'slug',
        header: 'نامک',
        size: 150,
        Cell: ({ row }) => (
          <Box 
            className="inline-flex items-center px-12 py-4 rounded-lg font-mono text-sm"
            sx={{ backgroundColor: alpha(theme.palette.grey[500], 0.08) }}
            dir="ltr"
          >
            {row.original.slug}
          </Box>
        )
      },
      {
        accessorKey: '_count.posts',
        header: 'تعداد پست',
        size: 120,
        Cell: ({ row }) => {
          const count = row.original._count?.posts || 0;
          return (
            <Chip
              size="small"
              label={`${count} پست`}
              sx={{
                backgroundColor: count > 0 
                  ? alpha(theme.palette.success.main, 0.12) 
                  : alpha(theme.palette.grey[500], 0.1),
                color: count > 0 ? 'success.dark' : 'text.secondary',
                fontWeight: 600,
                borderRadius: '10px',
                height: 28
              }}
              icon={count > 0 ? <FuseSvgIcon size={14} className="text-success-600">heroicons-outline:document-text</FuseSvgIcon> : undefined}
            />
          );
        }
      },
      {
        accessorKey: 'metaDescription',
        header: 'توضیحات',
        size: 250,
        Cell: ({ row }) => (
          <Tooltip title={row.original.metaDescription || ''} placement="top" arrow>
            <Typography variant="body2" className="text-gray-500 line-clamp-1 cursor-help">
              {row.original.metaDescription || '—'}
            </Typography>
          </Tooltip>
        )
      },
      {
        accessorKey: 'createdAt',
        header: 'تاریخ ایجاد',
        size: 150,
        Cell: ({ row }) => (
          <Box className="flex items-center gap-8">
            <FuseSvgIcon size={16} className="text-gray-400">heroicons-outline:calendar</FuseSvgIcon>
            <Typography variant="body2" className="text-gray-600">
              {row.original.createdAt
                ? new Date(row.original.createdAt).toLocaleDateString('fa-IR')
                : '—'}
            </Typography>
          </Box>
        )
      }
    ],
    [theme]
  );

  if (isLoading) {
    return <FuseLoading />;
  }

  return (
    <div className="p-24 md:p-32">
      <motion.div variants={itemVariants}>
        <Paper className="rounded-2xl overflow-hidden" elevation={0} sx={{ backgroundColor: 'background.paper' }}>
          {/* Modern Filters */}
          <Box 
            className="flex flex-wrap items-center gap-16 p-20"
            sx={{ borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}
          >
            <Box className="flex items-center gap-12">
              <Box 
                className="w-44 h-44 rounded-xl flex items-center justify-center"
                sx={{ backgroundColor: alpha(theme.palette.warning.main, 0.1) }}
              >
                <FuseSvgIcon className="text-warning-600" size={22}>heroicons-outline:search</FuseSvgIcon>
              </Box>
              <TextField
                size="small"
                placeholder="جستجو در برچسب‌ها..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  sx: { 
                    borderRadius: '12px',
                    backgroundColor: alpha(theme.palette.grey[500], 0.04),
                    '& fieldset': { borderColor: 'transparent' },
                    '&:hover fieldset': { borderColor: alpha(theme.palette.warning.main, 0.3) },
                    '&.Mui-focused fieldset': { borderColor: theme.palette.warning.main }
                  },
                  endAdornment: search && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setSearch('')}>
                        <FuseSvgIcon size={16}>heroicons-outline:x</FuseSvgIcon>
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                sx={{ minWidth: 280 }}
              />
            </Box>

            <Button
              variant="outlined"
              size="small"
              onClick={() => setBulkDialogOpen(true)}
              className="rounded-xl"
              sx={{
                borderColor: alpha(theme.palette.warning.main, 0.5),
                color: theme.palette.warning.dark,
                '&:hover': {
                  borderColor: theme.palette.warning.main,
                  backgroundColor: alpha(theme.palette.warning.main, 0.05)
                }
              }}
              startIcon={<FuseSvgIcon size={16}>heroicons-outline:plus-sm</FuseSvgIcon>}
            >
              افزودن گروهی
            </Button>
          </Box>

          <DataTable
            data={filteredTags}
            columns={columns}
            renderRowActionMenuItems={({ closeMenu, row, table }) => [
              <MenuItem
                key={0}
                component={Link}
                to={`/apps/weblog/tags/${row.original.id}`}
                onClick={closeMenu}
                className="gap-8"
              >
                <ListItemIcon>
                  <FuseSvgIcon className="text-primary-500">heroicons-outline:pencil</FuseSvgIcon>
                </ListItemIcon>
                ویرایش
              </MenuItem>,
              <MenuItem
                key={1}
                onClick={() => {
                  if (window.confirm('آیا از حذف این برچسب مطمئن هستید؟')) {
                    deleteTag(row.original.id);
                  }
                  closeMenu();
                  table.resetRowSelection();
                }}
                disabled={row.original._count?.posts > 0}
                className="gap-8"
              >
                <ListItemIcon>
                  <FuseSvgIcon color={row.original._count?.posts > 0 ? 'disabled' : 'error'}>
                    heroicons-outline:trash
                  </FuseSvgIcon>
                </ListItemIcon>
                <Typography color={row.original._count?.posts > 0 ? 'text.disabled' : 'error'}>
                  حذف
                </Typography>
              </MenuItem>
            ]}
            renderTopToolbarCustomActions={({ table }) => {
              const { rowSelection } = table.getState();

              if (Object.keys(rowSelection).length === 0) {
                return null;
              }

              return (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => {
                      const selectedRows = table.getSelectedRowModel().rows;
                      const deletableRows = selectedRows.filter((row) => !row.original._count?.posts);
                      if (deletableRows.length === 0) {
                        enqueueSnackbar('برچسب‌های انتخاب شده دارای پست هستند و قابل حذف نیستند', { variant: 'warning' });
                        return;
                      }
                      if (window.confirm(`آیا از حذف ${deletableRows.length} برچسب مطمئن هستید؟`)) {
                        deletableRows.forEach((row) => deleteTag(row.original.id));
                      }
                      table.resetRowSelection();
                    }}
                    className="rounded-xl"
                    color="error"
                    startIcon={<FuseSvgIcon size={16}>heroicons-outline:trash</FuseSvgIcon>}
                  >
                    حذف موارد انتخاب شده
                  </Button>
                </motion.div>
              );
            }}
            muiTableContainerProps={{
              sx: { opacity: isFetching ? 0.5 : 1, transition: 'opacity 0.2s' }
            }}
          />

          {/* Modern Footer */}
          <Box 
            className="flex items-center justify-between p-16"
            sx={{ 
              borderTop: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
              backgroundColor: alpha(theme.palette.grey[500], 0.02)
            }}
          >
            <Box className="flex items-center gap-8">
              <Box 
                className="w-32 h-32 rounded-lg flex items-center justify-center"
                sx={{ backgroundColor: alpha(theme.palette.warning.main, 0.1) }}
              >
                <FuseSvgIcon size={16} className="text-warning-600">heroicons-outline:collection</FuseSvgIcon>
              </Box>
              <Typography variant="body2" className="font-medium">
                {filteredTags.length} برچسب
              </Typography>
            </Box>
          </Box>
        </Paper>
      </motion.div>

      {/* Modern Bulk Create Dialog */}
      <Dialog 
        open={bulkDialogOpen} 
        onClose={() => setBulkDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{ sx: { borderRadius: '20px', overflow: 'hidden' } }}
      >
        <DialogTitle className="pb-0">
          <Box className="flex items-center gap-12">
            <Box 
              className="w-44 h-44 rounded-xl flex items-center justify-center"
              sx={{ background: `linear-gradient(135deg, ${theme.palette.warning.main}, ${theme.palette.warning.dark})` }}
            >
              <FuseSvgIcon className="text-white" size={22}>heroicons-outline:plus-sm</FuseSvgIcon>
            </Box>
            <div>
              <Typography className="font-bold text-lg">افزودن گروهی برچسب‌ها</Typography>
              <Typography variant="body2" className="text-gray-500">هر برچسب را در یک خط جداگانه وارد کنید</Typography>
            </div>
          </Box>
        </DialogTitle>
        <DialogContent className="pt-24">
          <TextField
            autoFocus
            multiline
            rows={8}
            fullWidth
            value={bulkTags}
            onChange={(e) => setBulkTags(e.target.value)}
            placeholder="برچسب اول&#10;برچسب دوم&#10;برچسب سوم"
            variant="outlined"
            InputProps={{
              sx: { 
                borderRadius: '16px',
                fontFamily: 'inherit'
              }
            }}
          />
        </DialogContent>
        <DialogActions className="p-20 pt-0">
          <Button onClick={() => setBulkDialogOpen(false)} className="rounded-xl">انصراف</Button>
          <Button
            onClick={handleBulkCreate}
            variant="contained"
            disabled={isBulkCreating || !bulkTags.trim()}
            className="rounded-xl px-24"
            sx={{ 
              background: `linear-gradient(135deg, ${theme.palette.warning.main}, ${theme.palette.warning.dark})`,
              boxShadow: 'none'
            }}
          >
            {isBulkCreating ? 'در حال ایجاد...' : 'ایجاد برچسب‌ها'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default TagsTable;
