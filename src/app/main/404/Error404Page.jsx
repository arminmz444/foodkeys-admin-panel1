import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

/**
 * Uniform 404 Page
 * 
 * This page is shown for both:
 * 1. Pages that don't exist
 * 2. Pages that exist but user doesn't have access to
 * 
 * This prevents information leakage about which pages exist in the system.
 */
function Error404Page() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col flex-1 items-center justify-center p-16">
      <div className="w-full max-w-3xl text-center">
        <Paper className="flex flex-col items-center justify-center p-48 sm:p-64 rounded-2xl shadow">
          <div className="w-full max-w-sm">
            <FuseSvgIcon className="text-96 mb-24" size={96} color="action">
              heroicons-outline:exclamation-circle
            </FuseSvgIcon>

            <Typography variant="h1" className="mb-16 font-bold tracking-tight">
              404
            </Typography>

            <Typography variant="h5" className="mb-16 font-medium" color="text.secondary">
              صفحه مورد نظر یافت نشد
            </Typography>

            <Typography className="mb-32" color="text.secondary">
              صفحه‌ای که به دنبال آن هستید وجود ندارد یا به آن دسترسی ندارید.
            </Typography>

            <Button
              variant="contained"
              color="secondary"
              onClick={() => navigate('/')}
              startIcon={<FuseSvgIcon>heroicons-outline:arrow-right</FuseSvgIcon>}
            >
              بازگشت به صفحه اصلی
            </Button>
          </div>
        </Paper>
      </div>
    </div>
  );
}

export default Error404Page;
