import TextField from '@mui/material/TextField';
import { Controller, useFormContext } from 'react-hook-form';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { alpha, useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';
import Chip from '@mui/material/Chip';

const sectionVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 80, damping: 15 } }
};

/**
 * SEO settings tab.
 */
function SeoTab() {
  const theme = useTheme();
  const methods = useFormContext();
  const { control, watch } = methods;

  const metaTitle = watch('metaTitle') || '';
  const metaDescription = watch('metaDescription') || '';
  const title = watch('title') || '';
  const excerpt = watch('excerpt') || '';

  // SEO recommendations
  const titleLength = (metaTitle || title).length;
  const descLength = (metaDescription || excerpt).length;
  
  const titleScore = titleLength >= 30 && titleLength <= 60 ? 100 : titleLength < 30 ? (titleLength / 30) * 100 : Math.max(0, 100 - ((titleLength - 60) * 2));
  const descScore = descLength >= 120 && descLength <= 160 ? 100 : descLength < 120 ? (descLength / 120) * 100 : Math.max(0, 100 - ((descLength - 160) * 2));
  const overallScore = (titleScore + descScore) / 2;

  const getScoreColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 50) return 'warning';
    return 'error';
  };

  return (
    <motion.div 
      className="space-y-24"
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.1 } } }}
    >
      {/* SEO Score Overview */}
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
              className="w-44 h-44 rounded-xl flex items-center justify-center"
              sx={{ background: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.dark})` }}
            >
              <FuseSvgIcon className="text-white" size={22}>heroicons-outline:chart-bar</FuseSvgIcon>
            </Box>
            <div>
              <Typography className="font-bold text-lg">امتیاز سئو</Typography>
              <Typography variant="caption" className="text-gray-500">ارزیابی بهینه‌سازی محتوا</Typography>
            </div>
          </Box>
          
          <div className="p-24">
            <Box className="flex flex-col sm:flex-row items-center gap-24">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              >
                <Box
                  className="w-100 h-100 rounded-full flex items-center justify-center relative"
                  sx={{
                    background: `conic-gradient(${theme.palette[getScoreColor(overallScore)].main} ${overallScore}%, ${alpha(theme.palette.grey[500], 0.1)} ${overallScore}%)`,
                  }}
                >
                  <Box 
                    className="w-80 h-80 rounded-full flex items-center justify-center bg-white dark:bg-gray-900"
                    sx={{ boxShadow: `inset 0 2px 8px ${alpha(theme.palette.grey[500], 0.1)}` }}
                  >
                    <Typography className="text-3xl font-extrabold" color={`${getScoreColor(overallScore)}.main`}>
                      {Math.round(overallScore)}
                    </Typography>
                  </Box>
                </Box>
              </motion.div>
              
              <div className="flex-1 space-y-16 w-full">
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <Box className="flex items-center gap-8">
                      <FuseSvgIcon size={16} className="text-gray-400">heroicons-outline:document-text</FuseSvgIcon>
                      <Typography variant="body2" className="font-medium">عنوان متا</Typography>
                    </Box>
                    <Chip 
                      size="small" 
                      label={`${Math.round(titleScore)}%`}
                      sx={{ 
                        backgroundColor: alpha(theme.palette[getScoreColor(titleScore)].main, 0.15),
                        color: `${getScoreColor(titleScore)}.dark`,
                        fontWeight: 600,
                        borderRadius: '8px',
                        minWidth: 50
                      }}
                    />
                  </div>
                  <LinearProgress
                    variant="determinate"
                    value={titleScore}
                    sx={{ 
                      height: 10, 
                      borderRadius: 5,
                      backgroundColor: alpha(theme.palette[getScoreColor(titleScore)].main, 0.1),
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 5,
                        backgroundColor: theme.palette[getScoreColor(titleScore)].main
                      }
                    }}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <Box className="flex items-center gap-8">
                      <FuseSvgIcon size={16} className="text-gray-400">heroicons-outline:menu-alt-2</FuseSvgIcon>
                      <Typography variant="body2" className="font-medium">توضیحات متا</Typography>
                    </Box>
                    <Chip 
                      size="small" 
                      label={`${Math.round(descScore)}%`}
                      sx={{ 
                        backgroundColor: alpha(theme.palette[getScoreColor(descScore)].main, 0.15),
                        color: `${getScoreColor(descScore)}.dark`,
                        fontWeight: 600,
                        borderRadius: '8px',
                        minWidth: 50
                      }}
                    />
                  </div>
                  <LinearProgress
                    variant="determinate"
                    value={descScore}
                    sx={{ 
                      height: 10, 
                      borderRadius: 5,
                      backgroundColor: alpha(theme.palette[getScoreColor(descScore)].main, 0.1),
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 5,
                        backgroundColor: theme.palette[getScoreColor(descScore)].main
                      }
                    }}
                  />
                </div>
              </div>
            </Box>
          </div>
        </Paper>
      </motion.div>

      {/* Meta Title */}
      <motion.div variants={sectionVariants}>
        <Paper className="rounded-2xl overflow-hidden" elevation={0} sx={{ backgroundColor: 'background.paper' }}>
          <Box 
            className="flex items-center gap-12 px-24 py-16"
            sx={{ 
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.primary.main, 0.02)})`,
              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`
            }}
          >
            <Box 
              className="w-40 h-40 rounded-xl flex items-center justify-center"
              sx={{ background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})` }}
            >
              <FuseSvgIcon className="text-white" size={20}>heroicons-outline:document-text</FuseSvgIcon>
            </Box>
            <Typography className="font-bold text-lg">عنوان متا</Typography>
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
                  placeholder="عنوان سئو برای موتورهای جستجو..."
                  helperText={`${titleLength} کاراکتر از 60 کاراکتر توصیه شده ${!metaTitle ? '(از عنوان پست استفاده می‌شود)' : ''}`}
                  InputProps={{
                    sx: { borderRadius: '12px' },
                    startAdornment: (
                      <Box className="ml-8">
                        <FuseSvgIcon size={20} className="text-gray-400">heroicons-outline:pencil</FuseSvgIcon>
                      </Box>
                    )
                  }}
                />
              )}
            />

            {/* Modern Google Preview */}
            <Box 
              className="p-20 rounded-2xl"
              sx={{ 
                backgroundColor: 'background.default',
                border: `1px solid ${alpha(theme.palette.divider, 0.5)}`
              }}
            >
              <Box className="flex items-center gap-8 mb-12">
                <Box className="w-28 h-28 rounded-full" sx={{ backgroundColor: alpha(theme.palette.info.main, 0.15) }}>
                  <FuseSvgIcon size={28} className="text-info-500">material-outline:search</FuseSvgIcon>
                </Box>
                <Typography variant="caption" className="text-gray-500 font-medium">پیش‌نمایش در گوگل</Typography>
              </Box>
              <Typography
                className="text-lg hover:underline cursor-pointer"
                sx={{ 
                  color: '#1a0dab',
                  fontFamily: 'arial',
                  fontWeight: 500
                }}
              >
                {metaTitle || title || 'عنوان پست'}
              </Typography>
              <Typography
                variant="body2"
                className="mt-6"
                sx={{ 
                  color: '#006621',
                  fontFamily: 'arial',
                  fontSize: '13px'
                }}
              >
                example.com › blog › {watch('slug') || 'post-slug'}
              </Typography>
              <Typography
                variant="body2"
                className="mt-6 line-clamp-2"
                sx={{ 
                  color: '#545454',
                  fontFamily: 'arial',
                  fontSize: '13px',
                  lineHeight: 1.5
                }}
              >
                {metaDescription || excerpt || 'توضیحات پست در نتایج جستجو نمایش داده خواهد شد...'}
              </Typography>
            </Box>
          </div>
        </Paper>
      </motion.div>

      {/* Meta Description */}
      <motion.div variants={sectionVariants}>
        <Paper className="rounded-2xl overflow-hidden" elevation={0} sx={{ backgroundColor: 'background.paper' }}>
          <Box 
            className="flex items-center gap-12 px-24 py-16"
            sx={{ 
              background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)}, ${alpha(theme.palette.info.main, 0.02)})`,
              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`
            }}
          >
            <Box 
              className="w-40 h-40 rounded-xl flex items-center justify-center"
              sx={{ background: `linear-gradient(135deg, ${theme.palette.info.main}, ${theme.palette.info.dark})` }}
            >
              <FuseSvgIcon className="text-white" size={20}>heroicons-outline:menu-alt-2</FuseSvgIcon>
            </Box>
            <Typography className="font-bold text-lg">توضیحات متا</Typography>
          </Box>
          
          <div className="p-24">
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
                  placeholder="توضیحات سئو برای موتورهای جستجو..."
                  helperText={`${descLength} کاراکتر از 120-160 کاراکتر توصیه شده ${!metaDescription ? '(از خلاصه پست استفاده می‌شود)' : ''}`}
                  InputProps={{
                    sx: { borderRadius: '12px' }
                  }}
                />
              )}
            />
          </div>
        </Paper>
      </motion.div>

      {/* Canonical URL */}
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
              <FuseSvgIcon className="text-white" size={20}>heroicons-outline:link</FuseSvgIcon>
            </Box>
            <Typography className="font-bold text-lg">لینک کانونیکال</Typography>
          </Box>
          
          <div className="p-24">
            <Controller
              name="canonicalUrl"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="لینک کانونیکال (Canonical URL)"
                  fullWidth
                  variant="outlined"
                  placeholder="https://example.com/original-post"
                  helperText="اگر این محتوا از منبع دیگری کپی شده، لینک منبع اصلی را وارد کنید"
                  InputProps={{
                    dir: 'ltr',
                    sx: { borderRadius: '12px' },
                    startAdornment: (
                      <Box className="ml-8">
                        <FuseSvgIcon size={20} className="text-gray-400">heroicons-outline:globe-alt</FuseSvgIcon>
                      </Box>
                    )
                  }}
                />
              )}
            />
          </div>
        </Paper>
      </motion.div>

      {/* SEO Tips */}
      <motion.div variants={sectionVariants}>
        <Paper 
          className="rounded-2xl overflow-hidden" 
          elevation={0} 
          sx={{ 
            backgroundColor: alpha(theme.palette.info.main, 0.03),
            border: `1px solid ${alpha(theme.palette.info.main, 0.15)}`
          }}
        >
          <div className="flex items-start gap-16 p-24">
            <Box 
              className="w-48 h-48 rounded-xl flex items-center justify-center flex-shrink-0"
              sx={{ background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.2)}, ${alpha(theme.palette.info.main, 0.1)})` }}
            >
              <FuseSvgIcon className="text-info-500" size={24}>heroicons-outline:light-bulb</FuseSvgIcon>
            </Box>
            <div>
              <Typography className="font-bold text-lg mb-12">نکات بهینه‌سازی سئو</Typography>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
                {[
                  { icon: 'heroicons-outline:check-circle', text: 'عنوان متا باید بین ۳۰ تا ۶۰ کاراکتر باشد' },
                  { icon: 'heroicons-outline:check-circle', text: 'توضیحات متا باید بین ۱۲۰ تا ۱۶۰ کاراکتر باشد' },
                  { icon: 'heroicons-outline:check-circle', text: 'از کلمات کلیدی اصلی در عنوان استفاده کنید' },
                  { icon: 'heroicons-outline:check-circle', text: 'هر صفحه باید عنوان و توضیحات یکتا داشته باشد' },
                  { icon: 'heroicons-outline:check-circle', text: 'از نامک (slug) کوتاه و معنادار استفاده کنید' },
                  { icon: 'heroicons-outline:check-circle', text: 'لینک کانونیکال فقط برای محتوای کپی شده نیاز است' }
                ].map((tip, index) => (
                  <Box key={index} className="flex items-start gap-8">
                    <FuseSvgIcon size={18} className="text-success-500 mt-2 flex-shrink-0">{tip.icon}</FuseSvgIcon>
                    <Typography variant="body2" className="text-gray-600">{tip.text}</Typography>
                  </Box>
                ))}
              </div>
            </div>
          </div>
        </Paper>
      </motion.div>
    </motion.div>
  );
}

export default SeoTab;
