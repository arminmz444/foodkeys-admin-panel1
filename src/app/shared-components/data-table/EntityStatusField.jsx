import clsx from 'clsx';

/**
 * The EntityStatusField component.
 */
function EntityStatusField(props) {
	const { name, colorClsx, bgColor, color, heartbeat = false, style } = props;

	return (
		<div
			className={clsx(
				'inline-block text-12 font-semibold py-4 px-12 rounded-full truncate',
				colorClsx,
				heartbeat && 'animate-heartbeat'
			)}
			style={{
				...(bgColor ? { backgroundColor: bgColor } : null),
				...(color ? { color } : null),
				...style,
			}}
		>
			{name}
		</div>
	);
}

export default EntityStatusField;
