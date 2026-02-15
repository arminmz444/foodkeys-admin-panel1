import TextField from '@mui/material/TextField';
import { Controller, useFormContext } from 'react-hook-form';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import { useParams } from 'react-router-dom';
import { useGetWeblogTagQuery } from '../WeblogApi';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { alpha, useTheme } from '@mui/material/styles';

const sectionVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 80, damping: 15 } }
};

/**
 * The tag form.
 */
function TagForm() {
  const theme = useTheme();
  const methods = useFormContext();
  const { control, formState } = methods;
  const { errors } = formState;
  const { tagId } = useParams();
  const isNew = tagId === 'new';

  const { data: tag } = useGetWeblogTagQuery(
    { idOrSlug: tagId },
    { skip: isNew }
  );

  return (
    <motion.div 
      className="space-y-24"
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.1 } } }}
    >
      {/* Basic Info */}
      <motion.div variants={sectionVariants}>
        <Paper className="rounded-2xl overflow-hidden" elevation={0} sx={{ backgroundColor: 'background.paper' }}>
          <Box 
            className="flex items-center gap-12 px-24 py-16"
            sx={{ 
              background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)}, ${alpha(theme.palette.warning.main, 0.02)})`,
              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`
            }}
          >
            <Box 
              className="w-40 h-40 rounded-xl flex items-center justify-center"
              sx={{ background: `linear-gradient(135deg, ${theme.palette.warning.main}, ${theme.palette.warning.dark})` }}
            >
              <FuseSvgIcon className="text-white" size={20}>heroicons-outline:tag</FuseSvgIcon>
            </Box>
            <Typography className="font-bold text-lg">اطلاعات برچسب</Typography>
          </Box>
          
          <div className="p-24 space-y-20">
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="نام برچسب *"
                  fullWidth
                  error={!!errors.name}
                  helperText={errors?.name?.message}
                  variant="outlined"
                  placeholder="نام برچسب را وارد کنید..."
                  InputProps={{
                    sx: { borderRadius: '12px' },
                    startAdornment: (
                      <Box className="ml-8">
                        <FuseSvgIcon size={20} className="text-gray-400">heroicons-outline:hashtag</FuseSvgIcon>
                      </Box>
                    )
                  }}
                />
              )}
            />

            <Controller
              name="slug"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="نامک (Slug)"
                  fullWidth
                  variant="outlined"
                  placeholder="نامک یکتا برای URL (خودکار از نام ساخته می‌شود)"
                  helperText="اگر خالی باشد، از نام برچسب ساخته می‌شود"
                  InputProps={{
                    dir: 'ltr',
                    sx: { borderRadius: '12px' },
                    startAdornment: (
                      <Box className="ml-8">
                        <FuseSvgIcon size={20} className="text-gray-400">heroicons-outline:link</FuseSvgIcon>
                      </Box>
                    )
                  }}
                />
              )}
            />
          </div>
        </Paper>
      </motion.div>

      {/* SEO Settings */}
      <motion.div variants={sectionVariants}>
        <Paper className="rounded-2xl overflow-hidden" elevation={0} sx={{ backgroundColor: 'background.paper' }}>
          <Box 
            className="flex items-center gap-12 px-24 py-16"
            sx={{ 
              background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)}, ${alpha(theme.palette.success.main, 0.02)})`,
              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`
            }}
          >
            <Box 
              className="w-40 h-40 rounded-xl flex items-center justify-center"
              sx={{ background: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.dark})` }}
            >
              <FuseSvgIcon className="text-white" size={20}>heroicons-outline:search-circle</FuseSvgIcon>
            </Box>
            <Typography className="font-bold text-lg">تنظیمات سئو</Typography>
          </Box>
          
          <div className="p-24 space-y-20">
            <Controller
              name="metaTitle"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="عنوان متا (Meta Title)"
                  fullWidth
                  variant="outlined"
                  placeholder="عنوان سئو برای صفحه برچسب..."
                  InputProps={{
                    sx: { borderRadius: '12px' },
                    startAdornment: (
                      <Box className="ml-8">
                        <FuseSvgIcon size={20} className="text-gray-400">heroicons-outline:document-text</FuseSvgIcon>
                      </Box>
                    )
                  }}
                />
              )}
            />

            <Controller
              name="metaDescription"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="توضیحات متا (Meta Description)"
                  fullWidth
                  multiline
                  rows={3}
                  variant="outlined"
                  placeholder="توضیحات سئو برای صفحه برچسب..."
                  InputProps={{
                    sx: { borderRadius: '12px' }
                  }}
                />
              )}
            />
          </div>
        </Paper>
      </motion.div>

      {/* Posts with this tag */}
      {!isNew && tag?.posts && tag.posts.length > 0 && (
        <motion.div variants={sectionVariants}>
          <Paper className="rounded-2xl overflow-hidden" elevation={0} sx={{ backgroundColor: 'background.paper' }}>
            <Box 
              className="flex items-center justify-between px-24 py-16"
              sx={{ 
                background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)}, ${alpha(theme.palette.info.main, 0.02)})`,
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`
              }}
            >
              <Box className="flex items-center gap-12">
                <Box 
                  className="w-40 h-40 rounded-xl flex items-center justify-center"
                  sx={{ background: `linear-gradient(135deg, ${theme.palette.info.main}, ${theme.palette.info.dark})` }}
                >
                  <FuseSvgIcon className="text-white" size={20}>heroicons-outline:document-text</FuseSvgIcon>
                </Box>
                <Typography className="font-bold text-lg">پست‌های دارای این برچسب</Typography>
              </Box>
              <Chip 
                label={`${tag._count?.posts || tag.posts.length} پست`}
                sx={{
                  backgroundColor: alpha(theme.palette.info.main, 0.15),
                  color: 'info.dark',
                  fontWeight: 600,
                  borderRadius: '10px'
                }}
              />
            </Box>
            
            <div className="p-16 space-y-8">
              {tag.posts.slice(0, 10).map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Box
                    component={Link}
                    to={`/apps/weblog/posts/${post.id}`}
                    className="flex items-center gap-12 p-16 rounded-xl transition-all duration-200"
                    sx={{
                      textDecoration: 'none',
                      backgroundColor: alpha(theme.palette.grey[500], 0.04),
                      border: `1px solid transparent`,
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.info.main, 0.05),
                        borderColor: alpha(theme.palette.info.main, 0.2),
                        transform: 'translateX(-4px)'
                      }
                    }}
                  >
                    <Box 
                      className="w-36 h-36 rounded-lg flex items-center justify-center"
                      sx={{ backgroundColor: alpha(theme.palette.info.main, 0.1) }}
                    >
                      <FuseSvgIcon size={18} className="text-info-600">heroicons-outline:document-text</FuseSvgIcon>
                    </Box>
                    <div className="flex-1 min-w-0">
                      <Typography className="font-medium truncate">{post.title}</Typography>
                    </div>
                    <Chip
                      size="small"
                      label={post.status === 'PUBLISHED' ? 'منتشر شده' : post.status === 'DRAFT' ? 'پیش‌نویس' : post.status}
                      sx={{
                        backgroundColor: post.status === 'PUBLISHED' 
                          ? alpha(theme.palette.success.main, 0.12) 
                          : alpha(theme.palette.grey[500], 0.12),
                        color: post.status === 'PUBLISHED' ? 'success.dark' : 'text.secondary',
                        fontSize: '0.75rem',
                        height: 24,
                        borderRadius: '8px'
                      }}
                    />
                    <FuseSvgIcon size={16} className="text-gray-400">heroicons-outline:chevron-left</FuseSvgIcon>
                  </Box>
                </motion.div>
              ))}
              {tag.posts.length > 10 && (
                <Box className="text-center pt-12">
                  <Typography variant="body2" className="text-gray-500">
                    و {tag.posts.length - 10} پست دیگر...
                  </Typography>
                </Box>
              )}
            </div>
          </Paper>
        </motion.div>
      )}
    </motion.div>
  );
}

export default TagForm;
