import { motion } from 'framer-motion';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

/**
 * Shared gradient page header used across messaging / notification admin pages.
 */
function AdminPageHeader({
	title,
	subtitle,
	icon = 'heroicons-outline:bell',
	gradient = 'from-teal-500 to-cyan-600',
	actions,
	onRefresh,
	isRefreshing
}) {
	return (
		<motion.div
			initial={{ opacity: 0, y: -16 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.45, ease: 'easeOut' }}
			className="mb-24 md:mb-32"
		>
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-16">
				<div className="flex items-center gap-16 min-w-0">
					<div
						className={`flex-shrink-0 p-12 rounded-2xl bg-gradient-to-br ${gradient} shadow-lg`}
					>
						<FuseSvgIcon className="text-white" size={28}>
							{icon}
						</FuseSvgIcon>
					</div>
					<div className="min-w-0">
						<Typography
							variant="h5"
							className="font-bold text-gray-800 dark:text-gray-100 truncate"
						>
							{title}
						</Typography>
						{subtitle && (
							<Typography
								variant="body2"
								className="text-gray-500 dark:text-gray-400 mt-4"
							>
								{subtitle}
							</Typography>
						)}
					</div>
				</div>

				<Box className="flex items-center gap-8 flex-wrap">
					{onRefresh && (
						<IconButton
							onClick={onRefresh}
							disabled={isRefreshing}
							className="bg-gray-100 dark:bg-gray-800"
							size="small"
						>
							<FuseSvgIcon
								size={20}
								className={isRefreshing ? 'animate-spin' : ''}
							>
								heroicons-outline:refresh
							</FuseSvgIcon>
						</IconButton>
					)}
					{actions}
				</Box>
			</div>
		</motion.div>
	);
}

export default AdminPageHeader;
