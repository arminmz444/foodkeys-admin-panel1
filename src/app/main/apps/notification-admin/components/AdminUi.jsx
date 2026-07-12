import { motion } from 'framer-motion';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

const container = {
	hidden: { opacity: 0 },
	show: {
		opacity: 1,
		transition: { staggerChildren: 0.06 }
	}
};

const item = {
	hidden: { opacity: 0, y: 12 },
	show: { opacity: 1, y: 0 }
};

function EmptyState({ icon = 'heroicons-outline:inbox', title, description }) {
	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.96 }}
			animate={{ opacity: 1, scale: 1 }}
			className="flex flex-col items-center justify-center py-64 px-24 text-center"
		>
			<div className="p-20 rounded-full bg-gray-100 dark:bg-gray-800 mb-16">
				<FuseSvgIcon size={40} className="text-gray-400">
					{icon}
				</FuseSvgIcon>
			</div>
			<Typography variant="h6" className="font-semibold text-gray-700 dark:text-gray-200 mb-8">
				{title}
			</Typography>
			{description && (
				<Typography variant="body2" className="text-gray-500 max-w-sm">
					{description}
				</Typography>
			)}
		</motion.div>
	);
}

function LoadingState() {
	return (
		<div className="flex items-center justify-center py-64">
			<CircularProgress size={36} />
		</div>
	);
}

function StatCard({ label, value, icon, color = 'teal' }) {
	const colorMap = {
		teal: 'from-teal-500 to-cyan-600',
		blue: 'from-blue-500 to-indigo-600',
		amber: 'from-amber-500 to-orange-600',
		rose: 'from-rose-500 to-pink-600',
		emerald: 'from-emerald-500 to-green-600',
		slate: 'from-slate-500 to-slate-700'
	};

	return (
		<motion.div variants={item} className="flex-1 min-w-[140px]">
			<Paper
				elevation={0}
				className="p-16 md:p-20 rounded-2xl border border-gray-100 dark:border-gray-700 h-full"
			>
				<div className="flex items-start justify-between gap-12">
					<div>
						<Typography variant="caption" className="text-gray-500 font-medium">
							{label}
						</Typography>
						<Typography variant="h5" className="font-bold mt-4 text-gray-800 dark:text-gray-100">
							{value}
						</Typography>
					</div>
					<div
						className={`p-8 rounded-xl bg-gradient-to-br ${colorMap[color] || colorMap.teal} shadow-md`}
					>
						<FuseSvgIcon size={18} className="text-white">
							{icon}
						</FuseSvgIcon>
					</div>
				</div>
			</Paper>
		</motion.div>
	);
}

function StatsRow({ children }) {
	return (
		<motion.div
			variants={container}
			initial="hidden"
			animate="show"
			className="flex flex-wrap gap-12 md:gap-16 mb-24"
		>
			{children}
		</motion.div>
	);
}

export { EmptyState, LoadingState, StatCard, StatsRow, container, item };
