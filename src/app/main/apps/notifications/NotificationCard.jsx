import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import clsx from 'clsx';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import NavLinkAdapter from '@fuse/core/NavLinkAdapter';
import { useAppSelector } from 'app/store/hooks';
import { selectContrastMainTheme } from '@fuse/core/FuseSettings/fuseSettingsSlice';
import { darken, useTheme } from '@mui/material/styles';
import green from '@mui/material/colors/green';
import blue from '@mui/material/colors/blue';
import red from '@mui/material/colors/red';
import orange from '@mui/material/colors/orange';
import FuseTheme from '@fuse/core/FuseTheme';
import yellow from '@mui/material/colors/yellow';
import { formatDistanceToNow } from 'date-fns-jalali';

const variantBgColors = {
	success: green[600],
	info: blue[700],
	error: red[600],
	warning: orange[600],
	alert: yellow[700]
};

/**
 * The notification card.
 */
function NotificationCard(props) {
	const { item, className, onClose, onClick } = props;
	const theme = useTheme();
	const defaultBgColor = theme.palette.background.paper;

	let bgColor = !item.read ? variantBgColors.info : variantBgColors[item.variant] || defaultBgColor;

	if (item.variant === 'primary') {
		bgColor = theme.palette.primary.main;
	}

	if (item.variant === 'secondary') {
		bgColor = theme.palette.secondary.main;
	}

	const contrastTheme = useAppSelector(selectContrastMainTheme(bgColor));
	const handleClose = (ev) => {
		ev.preventDefault();
		ev.stopPropagation();

		if (onClose) {
			onClose(item?.id);
		}
	};

	const handleClick = (ev) => {
		if (onClick) {
			ev.preventDefault();
			onClick(item);
		}
	};

	const useLink = item.link && !onClick;

	return (
		<FuseTheme theme={contrastTheme}>
			<Card
				className={clsx(
					'relative flex min-h-64 w-full items-center space-x-8 rounded-16 p-20 shadow',
					className
				)}
				sx={{
					backgroundColor: bgColor,
					color: contrastTheme.palette.text.primary,
					...(useLink || onClick ? { '&:hover': { backgroundColor: darken(bgColor, 0.05) } } : {})
				}}
				elevation={0}
				component={useLink ? NavLinkAdapter : 'div'}
				to={useLink ? item.link : ''}
				role={useLink || onClick ? 'button' : undefined}
				onClick={onClick ? handleClick : undefined}
			>
				{item.icon && !item.image && (
					<Box
						sx={{ backgroundColor: darken(bgColor, contrastTheme.palette.mode === 'dark' ? 0.3 : 0.1) }}
						className="me-12 mr-12 flex h-32 w-32 shrink-0 items-center justify-center rounded-full"
					>
						<FuseSvgIcon
							className="opacity-75"
							color="inherit"
						>
							{item.icon}
						</FuseSvgIcon>
					</Box>
				)}

				{item.image && (
					<img
						className="mr-12 h-32 w-32 shrink-0 overflow-hidden rounded-full object-cover object-center"
						src={item.image}
						alt="Notification"
					/>
				)}

				<div className="flex flex-auto flex-col">
					{item.title && <Typography className="line-clamp-1 font-semibold">{item.title}</Typography>}

					{item.message && (
						<div
							className="line-clamp-2"
							// eslint-disable-next-line react/no-danger
							dangerouslySetInnerHTML={{ __html: item.message }}
						/>
					)}

					{item.timestamp && (
						<Typography
							className="mt-8 text-sm leading-none "
							color="text.secondary"
						>
							{formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
						</Typography>
					)}
				</div>

				<IconButton
					disableRipple
					className="absolute right-0 top-0 p-8"
					color="inherit"
					size="small"
					onClick={handleClose}
				>
					<FuseSvgIcon
						size={12}
						className="opacity-75"
						color="inherit"
					>
						heroicons-solid:x
					</FuseSvgIcon>
				</IconButton>
				{item.children}
			</Card>
		</FuseTheme>
	);
}

export default NotificationCard;
