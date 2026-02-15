import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { motion } from 'framer-motion';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import NavLinkAdapter from '@fuse/core/NavLinkAdapter';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import { Link } from 'react-router-dom';
import { useTheme, alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import { useGetWeblogTagsQuery } from '../WeblogApi';

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
};

/**
 * The Tags header.
 */
function TagsHeader() {
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
  const theme = useTheme();
  const { data: tags = [] } = useGetWeblogTagsQuery({ sortBy: 'name' });

  return (
    <Box
      className="relative overflow-hidden"
      sx={{
        background: (t) => `linear-gradient(135deg, ${alpha(t.palette.warning.dark, 0.05)} 0%, ${alpha(t.palette.secondary.dark, 0.08)} 100%)`,
      }}
    >
      {/* Decorative Elements */}
      <Box className="absolute -top-40 -right-40 w-[200px] h-[200px] rounded-full opacity-10" sx={{ background: theme.palette.warning.main }} />
      <Box className="absolute -bottom-20 -left-20 w-[150px] h-[150px] rounded-full opacity-5" sx={{ background: theme.palette.secondary.main }} />
      
      <div className="relative flex flex-col sm:flex-row space-y-16 sm:space-y-0 w-full items-center justify-between py-24 sm:py-32 px-24 md:px-32">
        <div className="flex flex-col items-center sm:items-start">
          <motion.div variants={itemVariants}>
            <Button
              component={Link}
              to="/apps/weblog/dashboard"
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
              داشبورد وبلاگ
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
              <Typography className="text-2xl md:text-3xl font-extrabold tracking-tight">
                برچسب‌ها
              </Typography>
              <Typography variant="body2" className="text-gray-500 mt-4">
                مدیریت و سازماندهی برچسب‌های محتوا
              </Typography>
            </div>
          </motion.div>
        </div>

        <motion.div variants={itemVariants} className="flex items-center gap-12">
          <Chip
            label={`${tags.length} برچسب`}
            sx={{
              backgroundColor: alpha(theme.palette.warning.main, 0.15),
              color: theme.palette.warning.dark,
              fontWeight: 600,
              fontSize: '0.9rem',
              height: 36,
              borderRadius: '12px'
            }}
            icon={<FuseSvgIcon size={18} className="text-warning-600">heroicons-outline:tag</FuseSvgIcon>}
          />
          <Button
            variant="contained"
            component={NavLinkAdapter}
            to="/apps/weblog/tags/new"
            size={isMobile ? 'small' : 'medium'}
            className="rounded-xl px-20"
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.warning.main}, ${theme.palette.warning.dark})`,
              boxShadow: `0 4px 14px 0 ${alpha(theme.palette.warning.main, 0.4)}`,
              '&:hover': {
                boxShadow: `0 6px 20px 0 ${alpha(theme.palette.warning.main, 0.5)}`
              }
            }}
            startIcon={<FuseSvgIcon size={20}>heroicons-outline:plus</FuseSvgIcon>}
          >
            افزودن برچسب
          </Button>
        </motion.div>
      </div>
    </Box>
  );
}

export default TagsHeader;
