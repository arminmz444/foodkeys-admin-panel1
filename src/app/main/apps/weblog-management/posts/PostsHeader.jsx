import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { motion } from 'framer-motion';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import NavLinkAdapter from '@fuse/core/NavLinkAdapter';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import { Link } from 'react-router-dom';
import { alpha, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';

/**
 * The Posts header.
 */
function PostsHeader() {
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
  const theme = useTheme();

  return (
    <Box
      className="relative overflow-hidden"
      sx={{
        background: (theme) => `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.05)} 0%, ${alpha(theme.palette.secondary.dark, 0.08)} 100%)`,
      }}
    >
      {/* Decorative elements */}
      <Box
        className="absolute -top-40 -right-40 w-[200px] h-[200px] rounded-full opacity-10"
        sx={{ background: (theme) => theme.palette.primary.main }}
      />
      <Box
        className="absolute -bottom-20 -left-20 w-[150px] h-[150px] rounded-full opacity-5"
        sx={{ background: (theme) => theme.palette.secondary.main }}
      />
      
      <div className="relative flex flex-col sm:flex-row space-y-16 sm:space-y-0 w-full items-center justify-between py-24 sm:py-32 px-24 md:px-32">
        <div className="flex flex-col items-center sm:items-start">
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1, transition: { delay: 0.2 } }}
          >
            <Button
              component={Link}
              to="/apps/weblog/dashboard"
              className="mb-8 rounded-lg"
              sx={{
                color: 'text.secondary',
                '&:hover': {
                  backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.08)
                }
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
              داشبورد وبلاگ
            </Button>
          </motion.div>
          
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1, transition: { delay: 0.3 } }}
            className="flex items-center gap-16"
          >
            <Box
              className="hidden sm:flex items-center justify-center w-56 h-56 rounded-2xl"
              sx={{
                background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                boxShadow: (theme) => `0 8px 24px -8px ${alpha(theme.palette.primary.main, 0.4)}`
              }}
            >
              <FuseSvgIcon className="text-white" size={28}>heroicons-outline:document-text</FuseSvgIcon>
            </Box>
            <div>
              <Typography className="text-2xl md:text-3xl font-extrabold tracking-tight">
                مدیریت پست‌ها
              </Typography>
              <Typography variant="body2" className="text-gray-500 mt-4">
                ایجاد، ویرایش و مدیریت تمام پست‌های وبلاگ
              </Typography>
            </div>
          </motion.div>
        </div>

        <motion.div
          className="flex items-center gap-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.4 } }}
        >
          <Button
            variant="contained"
            component={NavLinkAdapter}
            to="/apps/weblog/posts/new"
            size={isMobile ? 'medium' : 'large'}
            className="rounded-xl px-24 shadow-lg text-white"
            sx={{
              background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
              boxShadow: (theme) => `0 8px 24px -8px ${alpha(theme.palette.primary.main, 0.5)}`,
              '&:hover': {
                boxShadow: (theme) => `0 12px 32px -8px ${alpha(theme.palette.primary.main, 0.6)}`
              }
            }}
            startIcon={<FuseSvgIcon size={20}>heroicons-outline:plus</FuseSvgIcon>}
          >
            افزودن پست
          </Button>
        </motion.div>
      </div>
    </Box>
  );
}

export default PostsHeader;
