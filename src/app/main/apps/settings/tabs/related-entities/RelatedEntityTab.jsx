import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Paper from '@mui/material/Paper';
import { 
	HiOutlineOfficeBuilding, 
	HiOutlineCog, 
	HiOutlineCollection,
	HiOutlineLink
} from 'react-icons/hi';
import CompanyRelatedSection from './CompanyRelatedSection';
import ComingSoonSection from './ComingSoonSection';

// Tab panel component
function TabPanel({ children, value, index, ...other }) {
	return (
		<div
			role="tabpanel"
			hidden={value !== index}
			id={`related-tabpanel-${index}`}
			aria-labelledby={`related-tab-${index}`}
			{...other}
		>
			<AnimatePresence mode="wait">
				{value === index && (
					<motion.div
						key={index}
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -20 }}
						transition={{ duration: 0.3, ease: 'easeInOut' }}
					>
						<Box sx={{ pt: 3 }}>{children}</Box>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}

function a11yProps(index) {
	return {
		id: `related-tab-${index}`,
		'aria-controls': `related-tabpanel-${index}`,
	};
}

const tabConfig = [
	{
		label: 'شرکت‌ها',
		icon: <HiOutlineOfficeBuilding size={20} />,
		description: 'مدیریت شرکت‌های مرتبط'
	},
	{
		label: 'خدمات',
		icon: <HiOutlineCog size={20} />,
		description: 'مدیریت خدمات مرتبط'
	},
	{
		label: 'محصولات',
		icon: <HiOutlineCollection size={20} />,
		description: 'مدیریت محصولات مرتبط'
	}
];

function RelatedEntityTab() {
	const [activeTab, setActiveTab] = useState(0);

	const handleTabChange = (event, newValue) => {
		setActiveTab(newValue);
	};

	return (
		<div className="w-full max-w-6xl mx-auto">
			{/* Header Section */}
			<motion.div
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className="mb-32"
			>
				<div className="flex items-center gap-16 mb-8">
					<div className="p-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
						<HiOutlineLink size={28} className="text-white" />
					</div>
					<div>
						<Typography variant="h4" className="font-bold text-gray-800 dark:text-gray-100">
							مدیریت موجودیت‌های مرتبط
						</Typography>
						<Typography variant="body2" className="text-gray-500 dark:text-gray-400 mt-4">
							شرکت‌ها، خدمات و محصولات مرتبط را مدیریت کنید
						</Typography>
					</div>
				</div>
			</motion.div>

			{/* Tabs Section */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, delay: 0.1 }}
			>
				<Paper 
					elevation={0}
					className="rounded-2xl overflow-hidden"
					sx={{
						bgcolor: 'background.paper',
						border: '1px solid',
						borderColor: 'divider',
					}}
				>
					<Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
						<Tabs 
							value={activeTab} 
							onChange={handleTabChange} 
							aria-label="related entities tabs"
							variant="fullWidth"
							sx={{
								bgcolor: 'background.default',
								'& .MuiTab-root': {
									minHeight: 72,
									textTransform: 'none',
									fontSize: '1rem',
									fontWeight: 500,
									transition: 'all 0.3s ease',
									color: 'text.secondary',
									'&:hover': {
										bgcolor: 'action.hover',
									},
									'&.Mui-selected': {
										color: '#6366f1',
										fontWeight: 600,
									}
								},
								'& .MuiTabs-indicator': {
									height: 3,
									borderRadius: '3px 3px 0 0',
									background: 'linear-gradient(90deg, #6366f1 0%, #a855f7 100%)',
								}
							}}
						>
							{tabConfig.map((tab, index) => (
								<Tab
									key={index}
									label={
										<div className="flex flex-col items-center gap-4">
											<div className={`p-8 rounded-xl transition-all duration-300 ${
												activeTab === index 
													? 'bg-gradient-to-br from-indigo-500/10 to-purple-500/10' 
													: 'bg-gray-100 dark:bg-gray-800'
											}`}>
												{tab.icon}
											</div>
											<span>{tab.label}</span>
										</div>
									}
									{...a11yProps(index)}
								/>
							))}
						</Tabs>
					</Box>

					{/* Tab Panels */}
					<Box 
						className="p-24 md:p-32"
						sx={{ bgcolor: 'background.paper' }}
					>
						<TabPanel value={activeTab} index={0}>
							<CompanyRelatedSection />
						</TabPanel>
						<TabPanel value={activeTab} index={1}>
							<ComingSoonSection 
								title="خدمات مرتبط"
								description="امکان مدیریت خدمات مرتبط به زودی اضافه خواهد شد"
								icon={<HiOutlineCog size={64} />}
								colorScheme="indigo"
							/>
						</TabPanel>
						<TabPanel value={activeTab} index={2}>
							<ComingSoonSection 
								title="محصولات مرتبط"
								description="امکان مدیریت محصولات مرتبط به زودی اضافه خواهد شد"
								icon={<HiOutlineCollection size={64} />}
								colorScheme="indigo"
							/>
						</TabPanel>
					</Box>
				</Paper>
			</motion.div>
		</div>
	);
}

export default RelatedEntityTab;
