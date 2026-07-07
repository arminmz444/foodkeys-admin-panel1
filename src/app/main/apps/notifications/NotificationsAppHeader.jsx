import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useSnackbar } from 'notistack';
import NotificationModel from './models/NotificationModel';
import NotificationTemplate from './NotificationTemplate';

function NotificationsAppHeader() {
	const { enqueueSnackbar, closeSnackbar } = useSnackbar();

	function demoNotification() {
		const item = NotificationModel({ title: 'این یک پیام دمو است' });
		enqueueSnackbar(item.title, {
			key: item.id,
			content: (
				<NotificationTemplate
					item={item}
					onClose={() => {
						closeSnackbar(item.id);
					}}
				/>
			)
		});
	}

	return (
		<div className="flex w-full container">
			<div className="flex flex-col sm:flex-row flex-auto sm:items-center min-w-0 p-24 md:p-32 pb-0 md:pb-0">
				<div className="flex flex-col flex-auto">
					<Typography className="text-3xl font-semibold tracking-tight leading-8">پیام‌ها و اعلانات</Typography>
					<Typography
						className="font-medium tracking-tight"
						color="text.secondary"
					>
						لیست پیام‌ها و اعلانات شما
					</Typography>
				</div>
				<div className="flex items-center mt-24 sm:mt-0 sm:mx-8 space-x-12">
					<Button
						className="whitespace-nowrap"
						onClick={demoNotification}
					>
						پیام دمو
					</Button>
				</div>
			</div>
		</div>
	);
}

export default NotificationsAppHeader;
