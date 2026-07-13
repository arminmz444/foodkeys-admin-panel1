import Typography from '@mui/material/Typography';
import { Link } from 'react-router-dom';
import AvatarGroup from '@mui/material/AvatarGroup';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import JwtLoginTab from './tabs/JwtSignInTab';

function SignInPage() {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center sm:flex-row sm:justify-center md:items-start md:justify-start">
      <Paper className="h-full w-full px-16 py-8 ltr:border-r-1 rtl:border-l-1 sm:h-auto sm:w-auto sm:rounded-2xl sm:p-48 sm:shadow md:flex md:h-full md:w-1/2 md:items-center md:justify-end md:rounded-none md:p-64 md:shadow-none">
        <div className="mx-auto w-full max-w-320 sm:mx-0 sm:w-320">
          <img className="w-48" src="assets/images/logo/logo.svg" alt="logo" />

          <Typography className="mt-32 text-4xl font-extrabold leading-tight tracking-tight">
            ورود به حساب کاربری (محت مدیریت)
          </Typography>
          <div className="mt-2 flex items-baseline font-medium">
            <Typography>Don't have an account?</Typography>
            <Link className="ml-4" to="/sign-up">
              Sign up
            </Link>
          </div>

          <Alert icon={false} severity="info" className="mt-24 px-16 text-13 leading-relaxed">
            You are browsing <b>Fuse React Demo</b>. Click on the "Sign in" button to access the Demo and
            Documentation.
          </Alert>

          <div className="mt-24">
            <JwtLoginTab />
          </div>
        </div>
      </Paper>

      <Box
        className="relative hidden h-full flex-auto items-center justify-center overflow-hidden p-64 md:flex lg:px-112"
        sx={{ backgroundColor: 'primary.main' }}
      >
        <div className="relative z-10 w-full max-w-2xl">
          <div className="text-7xl font-bold leading-none text-gray-100">
            <div>Welcome to</div>
            <div>our community</div>
          </div>
          <div className="mt-24 text-lg leading-6 tracking-tight text-gray-400">
            به داشبورد مدیریت سایت مرجع صنایع غذایی و کشاورزی ایران (سام) خوش آمدید!
          </div>
          <div className="mt-32 flex items-center">
            <AvatarGroup
              sx={{
                '& .MuiAvatar-root': {
                  borderColor: 'primary.main',
                },
              }}
            >
              <Avatar src="assets/images/avatars/female-18.jpg" />
              <Avatar src="assets/images/avatars/female-11.jpg" />
              <Avatar src="assets/images/avatars/male-09.jpg" />
              <Avatar src="assets/images/avatars/male-16.jpg" />
            </AvatarGroup>
            <div className="ml-16 font-medium tracking-tight text-gray-400">
              با ۱۷ سال تجربه و دانش در حوزه صنایع غذایی و کشاورزی
            </div>
          </div>
        </div>
      </Box>
    </div>
  );
}

export default SignInPage;
