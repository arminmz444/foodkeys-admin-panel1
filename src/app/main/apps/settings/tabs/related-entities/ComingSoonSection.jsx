import { motion } from 'framer-motion';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import { HiOutlineSparkles, HiOutlineClock } from 'react-icons/hi';

// Animated background particles
function FloatingParticle({ delay, size, x, y, colorScheme }) {
	const gradients = {
		rose: 'linear-gradient(135deg, rgba(244, 63, 94, 0.15) 0%, rgba(236, 72, 153, 0.15) 100%)',
		indigo: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%)'
	};

	return (
		<motion.div
			className="absolute rounded-full"
			style={{ 
				width: size, 
				height: size, 
				left: `${x}%`, 
				top: `${y}%`,
				background: gradients[colorScheme] || gradients.indigo
			}}
			animate={{
				y: [0, -30, 0],
				x: [0, 15, 0],
				scale: [1, 1.2, 1],
				opacity: [0.3, 0.6, 0.3]
			}}
			transition={{
				duration: 4,
				delay,
				repeat: Infinity,
				ease: 'easeInOut'
			}}
		/>
	);
}

function ComingSoonSection({ title, description, icon, colorScheme = 'indigo' }) {
	// Generate random particles
	const particles = [
		{ delay: 0, size: 60, x: 10, y: 20 },
		{ delay: 0.5, size: 40, x: 80, y: 15 },
		{ delay: 1, size: 80, x: 70, y: 70 },
		{ delay: 1.5, size: 50, x: 20, y: 75 },
		{ delay: 2, size: 30, x: 50, y: 40 },
		{ delay: 2.5, size: 45, x: 90, y: 50 }
	];

	const colors = {
		rose: {
			iconBg: 'linear-gradient(135deg, rgba(244, 63, 94, 0.08) 0%, rgba(236, 72, 153, 0.08) 100%)',
			iconText: 'text-rose-400 dark:text-rose-500',
			dotBg: 'bg-rose-500',
			ringStart: 'rgba(244, 63, 94, 0.1)',
			ringEnd: 'rgba(236, 72, 153, 0.1)',
			ringStart2: 'rgba(244, 63, 94, 0.2)',
			ringEnd2: 'rgba(236, 72, 153, 0.2)'
		},
		indigo: {
			iconBg: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(168, 85, 247, 0.08) 100%)',
			iconText: 'text-indigo-400 dark:text-indigo-500',
			dotBg: 'bg-indigo-500',
			ringStart: 'rgba(99, 102, 241, 0.1)',
			ringEnd: 'rgba(168, 85, 247, 0.1)',
			ringStart2: 'rgba(99, 102, 241, 0.2)',
			ringEnd2: 'rgba(168, 85, 247, 0.2)'
		}
	};

	const scheme = colors[colorScheme] || colors.indigo;

	return (
		<Box className="relative overflow-hidden" sx={{ bgcolor: 'background.paper' }}>
			{/* Floating Particles Background */}
			<div className="absolute inset-0 pointer-events-none">
				{particles.map((particle, index) => (
					<FloatingParticle key={index} {...particle} colorScheme={colorScheme} />
				))}
			</div>

			{/* Content */}
			<motion.div
				initial={{ opacity: 0, y: 30 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6 }}
				className="relative z-10 flex flex-col items-center justify-center min-h-[400px] text-center px-24"
			>
				{/* Icon Container */}
				<motion.div
					initial={{ scale: 0 }}
					animate={{ scale: 1 }}
					transition={{ 
						type: 'spring', 
						stiffness: 200, 
						damping: 15,
						delay: 0.2 
					}}
					className="relative mb-32"
				>
					{/* Glowing rings */}
					<motion.div
						className="absolute inset-0 rounded-full"
						style={{
							background: `linear-gradient(135deg, ${scheme.ringStart} 0%, ${scheme.ringEnd} 100%)`,
							width: 160, 
							height: 160, 
							margin: -32
						}}
						animate={{
							scale: [1, 1.5, 1],
							opacity: [0.5, 0, 0.5]
						}}
						transition={{
							duration: 3,
							repeat: Infinity,
							ease: 'easeInOut'
						}}
					/>
					<motion.div
						className="absolute inset-0 rounded-full"
						style={{
							background: `linear-gradient(135deg, ${scheme.ringStart2} 0%, ${scheme.ringEnd2} 100%)`,
							width: 140, 
							height: 140, 
							margin: -22
						}}
						animate={{
							scale: [1, 1.3, 1],
							opacity: [0.8, 0, 0.8]
						}}
						transition={{
							duration: 3,
							delay: 0.5,
							repeat: Infinity,
							ease: 'easeInOut'
						}}
					/>
					
					{/* Main icon */}
					<Box 
						className="w-96 h-96 rounded-3xl flex items-center justify-center backdrop-blur-sm"
						sx={{
							background: scheme.iconBg,
							border: '1px solid',
							borderColor: 'divider'
						}}
					>
						<div className={scheme.iconText}>
							{icon}
						</div>
					</Box>
				</motion.div>

				{/* Coming Soon Badge */}
				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4 }}
				>
					<Chip
						icon={<HiOutlineSparkles className="text-amber-500" />}
						label="به زودی"
						sx={{
							background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(245, 158, 11, 0.1) 100%)',
							border: '1px solid rgba(251, 191, 36, 0.3)',
							color: '#f59e0b',
							fontWeight: 600,
							fontSize: '0.875rem',
							px: 1,
							mb: 2
						}}
					/>
				</motion.div>

				{/* Title */}
				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.5 }}
				>
					<Typography 
						variant="h4" 
						className="font-bold mb-12"
						sx={{ color: 'text.primary' }}
					>
						{title}
					</Typography>
				</motion.div>

				{/* Description */}
				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.6 }}
				>
					<Typography 
						variant="body1" 
						className="max-w-md mx-auto mb-24"
						sx={{ color: 'text.secondary' }}
					>
						{description}
					</Typography>
				</motion.div>

				{/* Status Info */}
				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.7 }}
				>
					<Box 
						className="flex items-center gap-8 px-20 py-12 rounded-full"
						sx={{ bgcolor: 'action.hover' }}
					>
						<HiOutlineClock size={18} className="text-gray-400" />
						<Typography variant="caption" sx={{ color: 'text.secondary' }}>
							در حال توسعه
						</Typography>
					</Box>
				</motion.div>

				{/* Progress Dots */}
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.8 }}
					className="flex items-center gap-8 mt-24"
				>
					{[0, 1, 2].map((i) => (
						<motion.div
							key={i}
							className={`w-8 h-8 rounded-full ${scheme.dotBg}`}
							animate={{
								scale: [1, 1.5, 1],
								opacity: [0.3, 1, 0.3]
							}}
							transition={{
								duration: 1.5,
								delay: i * 0.2,
								repeat: Infinity,
								ease: 'easeInOut'
							}}
						/>
					))}
				</motion.div>
			</motion.div>
		</Box>
	);
}

export default ComingSoonSection;
