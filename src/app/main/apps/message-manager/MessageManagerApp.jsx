import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { styled } from '@mui/material/styles';
import {
	Tabs,
	Tab,
	Box,
	Typography,
	Button,
	Paper,
	useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Link } from 'react-router-dom';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { enqueueSnackbar } from 'notistack';
import EmailTemplatesContent from './EmailTemplatesContent';
import SmsTemplatesContent from './SmsTemplatesContent';
import { useInitializeSystemTemplatesMutation } from './store/templatesApi';

const Root = styled('div')(({ theme }) => ({
	display: 'flex',
	flexDirection: 'column',
	flex: '1 1 auto',
	width: '100%',
	height: '100%',
	minHeight: 0,
	background: theme.palette.mode === 'dark'
		? 'linear-gradient(180deg, rgba(15,23,42,0.4) 0%, transparent 40%)'
		: 'linear-gradient(180deg, rgba(240,253,250,0.7) 0%, transparent 40%)'
}));

function TabPanel({ children, value, index }) {
	return (
		<div
			role="tabpanel"
			hidden={value !== index}
			id={`messaging-tabpanel-${index}`}
			aria-labelledby={`messaging-tab-${index}`}
			style={{ flex: 1, display: value === index ? 'flex' : 'none', flexDirection: 'column', minHeight: 0 }}
		>
			<AnimatePresence mode="wait">
				{value === index && (
					<motion.div
						key={index}
						initial={{ opacity: 0, y: 12 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -8 }}
						transition={{ duration: 0.28, ease: 'easeOut' }}
						style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}
					>
						{children}
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}

const tabs = [
	{
		label: 'قالب‌های ایمیل',
		icon: 'heroicons-outline:mail',
		color: 'from-blue-500 to-indigo-600'
	},
	{
		label: 'قالب‌های پیامک',
		icon: 'heroicons-outline:device-mobile',
		color: 'from-teal-500 to-cyan-600'
	}
];

function MessagingApp() {
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
	const [tabValue, setTabValue] = useState(0);
	const [initializeTemplates, { isLoading: initializing }] =
		useInitializeSystemTemplatesMutation();

	const handleInitialize = async () => {
		try {
			await initializeTemplates().unwrap();
			enqueueSnackbar('قالب‌های سیستمی با موفقیت مقداردهی شدند', { variant: 'success' });
		} catch (err) {
			enqueueSnackbar(err?.data?.message || 'خطا در مقداردهی قالب‌ها', { variant: 'error' });
		}
	};

	return (
		<Root>
			<div className="px-12 pt-16 md:px-24 md:pt-24 lg:px-32">
				<motion.div
					initial={{ opacity: 0, y: -16 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.45 }}
					className="mb-16 md:mb-20"
				>
					<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-16">
						<div className="flex items-center gap-16 min-w-0">
							<div
								className={`flex-shrink-0 p-12 rounded-2xl bg-gradient-to-br ${tabs[tabValue].color} shadow-lg transition-all duration-300`}
							>
								<FuseSvgIcon className="text-white" size={28}>
									{tabs[tabValue].icon}
								</FuseSvgIcon>
							</div>
							<div className="min-w-0">
								<Typography
									variant="h5"
									className="font-bold text-gray-800 dark:text-gray-100"
								>
									مدیریت قالب‌های پیام
								</Typography>
								<Typography variant="body2" className="text-gray-500 mt-4">
									ویرایش، تست و ارسال قالب‌های ایمیل و پیامک سیستم
								</Typography>
							</div>
						</div>

						<div className="flex flex-wrap items-center gap-8">
							<Button
								component={Link}
								to="/apps/message-manager/history"
								variant="outlined"
								size={isMobile ? 'small' : 'medium'}
								startIcon={
									<FuseSvgIcon size={18}>heroicons-outline:clock</FuseSvgIcon>
								}
								className="rounded-xl"
							>
								تاریخچه ارسال
							</Button>
							<Button
								variant="outlined"
								size={isMobile ? 'small' : 'medium'}
								onClick={handleInitialize}
								disabled={initializing}
								startIcon={
									<FuseSvgIcon size={18}>heroicons-outline:refresh</FuseSvgIcon>
								}
								className="rounded-xl"
							>
								مقداردهی سیستمی
							</Button>
						</div>
					</div>
				</motion.div>

				<Paper
					elevation={0}
					className="rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden mb-0"
				>
					<Tabs
						value={tabValue}
						onChange={(_, v) => setTabValue(v)}
						variant={isMobile ? 'fullWidth' : 'standard'}
						aria-label="messaging tabs"
						sx={{
							minHeight: 56,
							'& .MuiTab-root': {
								minHeight: 56,
								textTransform: 'none',
								fontWeight: 600,
								fontSize: '0.95rem',
								gap: 1
							}
						}}
					>
						{tabs.map((tab, index) => (
							<Tab
								key={tab.label}
								icon={
									<FuseSvgIcon size={18}>{tab.icon}</FuseSvgIcon>
								}
								iconPosition="start"
								label={tab.label}
								id={`messaging-tab-${index}`}
								aria-controls={`messaging-tabpanel-${index}`}
							/>
						))}
					</Tabs>
				</Paper>
			</div>

			<Box
				sx={{
					flex: 1,
					display: 'flex',
					flexDirection: 'column',
					minHeight: 0,
					px: { xs: 1.5, md: 3, lg: 4 },
					pb: { xs: 1.5, md: 3 },
					pt: 2
				}}
			>
				<TabPanel value={tabValue} index={0}>
					<EmailTemplatesContent />
				</TabPanel>
				<TabPanel value={tabValue} index={1}>
					<SmsTemplatesContent />
				</TabPanel>
			</Box>
		</Root>
	);
}

export default MessagingApp;
