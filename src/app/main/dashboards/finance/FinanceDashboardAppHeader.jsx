import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { motion } from 'framer-motion';

function FinanceDashboardAppHeader({ onRefresh, isRefreshing }) {
  const today = new Date();
  const formattedDate = new Intl.DateTimeFormat('fa-IR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(today);

  return (
    <div className="flex w-full container">
      <div className="flex flex-col sm:flex-row flex-auto sm:items-center min-w-0 p-24 md:p-32 pb-0 md:pb-0">
        <div className="flex flex-col flex-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Typography className="text-3xl font-bold tracking-tight leading-8">
              داشبورد مالی
            </Typography>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Typography
              className="font-medium tracking-tight mt-4"
              color="text.secondary"
            >
              آخرین وضعیت تراکنش‌ها و پرداخت‌های مالی سامانه
            </Typography>
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex items-center mt-16 sm:mt-0 gap-12"
        >
          <Chip
            label={formattedDate}
            variant="outlined"
            size="small"
            icon={<FuseSvgIcon size={16}>heroicons-solid:calendar</FuseSvgIcon>}
            sx={{ direction: 'rtl' }}
          />
          <Tooltip title="بروزرسانی داده‌ها">
            <IconButton
              onClick={onRefresh}
              disabled={isRefreshing}
              color="primary"
              size="large"
              sx={{
                backgroundColor: (theme) => theme.palette.action.hover,
                '&:hover': {
                  backgroundColor: (theme) => theme.palette.action.selected,
                },
              }}
            >
              <motion.div
                animate={{ rotate: isRefreshing ? 360 : 0 }}
                transition={{
                  duration: 1,
                  repeat: isRefreshing ? Infinity : 0,
                  ease: 'linear',
                }}
              >
                <FuseSvgIcon size={22}>heroicons-solid:arrow-path</FuseSvgIcon>
              </motion.div>
            </IconButton>
          </Tooltip>
        </motion.div>
      </div>
    </div>
  );
}

export default FinanceDashboardAppHeader;
