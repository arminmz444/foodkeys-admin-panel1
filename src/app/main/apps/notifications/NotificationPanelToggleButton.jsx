import Badge from '@mui/material/Badge';
import IconButton from '@mui/material/IconButton';
import { useAppDispatch, useAppSelector } from 'app/store/hooks';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useEffect, useRef, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useTheme } from '@mui/material';
import { toggleNotificationPanel } from './notificationPanelSlice';
import { selectUnreadCount } from './models/notificationSlice';

function NotificationPanelToggleButton(props) {
	const { children = <FuseSvgIcon>heroicons-outline:bell</FuseSvgIcon> } = props;
	const unreadCount = useAppSelector(selectUnreadCount);
	const [animate, setAnimate] = useState(false);
	const prevUnreadCount = useRef(unreadCount);
	const theme = useTheme();
	const dispatch = useAppDispatch();
	const controls = useAnimation();

	useEffect(() => {
		if (animate) {
			controls.start({
				rotate: [0, 20, -20, 0],
				color: [theme.palette.secondary.main],
				transition: { duration: 0.2, repeat: 5 }
			});
		} else {
			controls.start({ rotate: 0, scale: 1, color: theme.palette.text.secondary });
		}
	}, [animate, controls, theme.palette.secondary.main, theme.palette.text.secondary]);

	useEffect(() => {
		if (unreadCount > prevUnreadCount.current) {
			setAnimate(true);
			const timer = setTimeout(() => setAnimate(false), 1000);
			prevUnreadCount.current = unreadCount;
			return () => clearTimeout(timer);
		}

		prevUnreadCount.current = unreadCount;
		return undefined;
	}, [unreadCount]);

	return (
		<IconButton
			className="h-40 w-40"
			onClick={() => dispatch(toggleNotificationPanel())}
			size="large"
		>
			<Badge
				color="secondary"
				badgeContent={unreadCount > 0 ? unreadCount : null}
				max={99}
				invisible={unreadCount === 0}
			>
				<motion.div animate={controls}>{children}</motion.div>
			</Badge>
		</IconButton>
	);
}

export default NotificationPanelToggleButton;
