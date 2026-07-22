import { useMemo } from 'react';
import {
	Box,
	Paper,
	Typography,
	TextField,
	Select,
	MenuItem,
	FormControl,
	InputLabel,
	FormControlLabel,
	Switch,
	Slider,
	Divider,
	Tooltip,
	InputAdornment
} from '@mui/material';
import { Info as InfoIcon, Opacity as OpacityIcon } from '@mui/icons-material';
import { useFormContext, useWatch } from 'react-hook-form';

/**
 * Display forms (patterns) for the watermark.
 */
export const WATERMARK_DISPLAY_FORMS = {
	single: 'تکی (یک نقطه)',
	tiled: 'کاشی‌کاری (تکرار شونده)',
	diagonal: 'مورب (Diagonal)',
	horizontal: 'افقی (تکرار افقی)',
	vertical: 'عمودی (تکرار عمودی)'
};

export const WATERMARK_POSITIONS = {
	center: 'وسط',
	'top-left': 'بالا چپ',
	'top-center': 'بالا وسط',
	'top-right': 'بالا راست',
	'middle-left': 'میانه چپ',
	'middle-right': 'میانه راست',
	'bottom-left': 'پایین چپ',
	'bottom-center': 'پایین وسط',
	'bottom-right': 'پایین راست'
};

const DEFAULT_WATERMARK = {
	enabled: false,
	text: '',
	displayForm: 'diagonal',
	position: 'center',
	color: '#ffffff',
	opacity: 0.3,
	fontSize: 24,
	rotation: -30,
	gap: 120,
	imageUrl: ''
};

function hexToRgba(hex, opacity) {
	if (!hex) return `rgba(0,0,0,${opacity})`;
	let normalized = hex.replace('#', '');
	if (normalized.length === 3) {
		normalized = normalized
			.split('')
			.map((c) => c + c)
			.join('');
	}
	const num = parseInt(normalized, 16);
	if (Number.isNaN(num)) return `rgba(0,0,0,${opacity})`;
	const r = (num >> 16) & 255;
	const g = (num >> 8) & 255;
	const b = num & 255;
	return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

function positionToFlex(position) {
	const [vertical = 'middle', horizontal = 'center'] = (position || 'center-center').split('-');
	const map = {
		top: 'flex-start',
		middle: 'center',
		center: 'center',
		bottom: 'flex-end',
		left: 'flex-start',
		right: 'flex-end'
	};
	// position values like 'top-left' -> vertical=top, horizontal=left; 'center' -> both center
	if (position === 'center') return { alignItems: 'center', justifyContent: 'center' };
	return {
		alignItems: map[vertical] || 'center',
		justifyContent: map[horizontal] || 'center'
	};
}

/**
 * Renders a live preview of the configured watermark.
 */
function WatermarkPreview({ config }) {
	const { text, displayForm, position, color, opacity, fontSize, rotation, gap } = config;
	const rgbaColor = hexToRgba(color, opacity);
	const label = text || 'واترمارک';

	const previewCommon = {
		position: 'relative',
		width: '100%',
		height: 220,
		borderRadius: 2,
		overflow: 'hidden',
		background:
			'repeating-linear-gradient(45deg, #e5e7eb 0px, #e5e7eb 12px, #f3f4f6 12px, #f3f4f6 24px)',
		border: '1px solid rgba(0,0,0,0.12)'
	};

	if (displayForm === 'single') {
		return (
			<Box sx={{ ...previewCommon, display: 'flex', ...positionToFlex(position), p: 2 }}>
				<Typography
					component="span"
					sx={{
						color: rgbaColor,
						fontSize: `${fontSize}px`,
						fontWeight: 700,
						transform: `rotate(${rotation}deg)`,
						whiteSpace: 'nowrap',
						userSelect: 'none'
					}}
				>
					{label}
				</Typography>
			</Box>
		);
	}

	// Tiled / diagonal / horizontal / vertical => repeated pattern
	const angle = displayForm === 'diagonal' ? rotation : 0;
	const columns = displayForm === 'vertical' ? 1 : Math.max(2, Math.round(600 / gap));
	const rows = displayForm === 'horizontal' ? 1 : Math.max(2, Math.round(220 / (gap / 2)));
	const items = [];
	for (let r = 0; r < rows; r += 1) {
		for (let c = 0; c < columns; c += 1) {
			items.push(
				<Typography
					key={`${r}-${c}`}
					component="span"
					sx={{
						color: rgbaColor,
						fontSize: `${fontSize}px`,
						fontWeight: 700,
						transform: `rotate(${angle}deg)`,
						whiteSpace: 'nowrap',
						userSelect: 'none',
						textAlign: 'center'
					}}
				>
					{label}
				</Typography>
			);
		}
	}

	return (
		<Box sx={{ ...previewCommon, p: 1 }}>
			<Box
				sx={{
					width: '100%',
					height: '100%',
					display: 'grid',
					gridTemplateColumns: `repeat(${columns}, 1fr)`,
					alignItems: 'center',
					justifyItems: 'center',
					rowGap: `${Math.max(8, gap / 4)}px`
				}}
			>
				{items}
			</Box>
		</Box>
	);
}

/**
 * WatermarkField
 *
 * A dynamic watermark configurator that stores its config as an object at the
 * given form `name` path (e.g. `additionalInfo.watermark` or `additionalData.watermark`).
 */
function WatermarkField({ name = 'additionalInfo.watermark', disabled = false }) {
	const { control, setValue } = useFormContext();
	const rawValue = useWatch({ control, name });

	const config = useMemo(
		() => ({ ...DEFAULT_WATERMARK, ...(rawValue && typeof rawValue === 'object' ? rawValue : {}) }),
		[rawValue]
	);

	const update = (patch) => {
		setValue(name, { ...config, ...patch }, { shouldDirty: true });
	};

	return (
		<Box className="w-full">
			<Box className="flex items-center justify-between mb-16 flex-wrap gap-8">
				<Box className="flex items-center gap-8">
					<Typography variant="h6" className="font-semibold">
						واترمارک
					</Typography>
					<Tooltip title="واترمارک به صورت پویا روی تصاویر و متون صفحه اختصاصی نمایش داده می‌شود.">
						<InfoIcon fontSize="small" color="action" />
					</Tooltip>
				</Box>
				<FormControlLabel
					control={
						<Switch
							checked={!!config.enabled}
							onChange={(e) => update({ enabled: e.target.checked })}
							disabled={disabled}
							color="primary"
						/>
					}
					label="فعال بودن واترمارک"
				/>
			</Box>

			<Box
				className="grid grid-cols-1 lg:grid-cols-2 gap-24"
				sx={{ opacity: config.enabled ? 1 : 0.6, pointerEvents: config.enabled ? 'auto' : 'none' }}
			>
				{/* Config column */}
				<Box className="space-y-16">
					<TextField
						fullWidth
						label="متن واترمارک"
						value={config.text || ''}
						onChange={(e) => update({ text: e.target.value })}
						disabled={disabled}
						placeholder="متن واترمارک را وارد کنید"
						variant="outlined"
					/>

					<Box className="grid grid-cols-1 sm:grid-cols-2 gap-16">
						<FormControl fullWidth>
							<InputLabel>نوع نمایش</InputLabel>
							<Select
								value={config.displayForm}
								label="نوع نمایش"
								onChange={(e) => update({ displayForm: e.target.value })}
								disabled={disabled}
							>
								{Object.entries(WATERMARK_DISPLAY_FORMS).map(([value, label]) => (
									<MenuItem key={value} value={value}>
										{label}
									</MenuItem>
								))}
							</Select>
						</FormControl>

						<FormControl fullWidth disabled={config.displayForm !== 'single'}>
							<InputLabel>موقعیت</InputLabel>
							<Select
								value={config.position}
								label="موقعیت"
								onChange={(e) => update({ position: e.target.value })}
								disabled={disabled || config.displayForm !== 'single'}
							>
								{Object.entries(WATERMARK_POSITIONS).map(([value, label]) => (
									<MenuItem key={value} value={value}>
										{label}
									</MenuItem>
								))}
							</Select>
						</FormControl>
					</Box>

					<Box className="grid grid-cols-1 sm:grid-cols-2 gap-16 items-center">
						<TextField
							fullWidth
							type="color"
							label="رنگ"
							value={config.color || '#ffffff'}
							onChange={(e) => update({ color: e.target.value })}
							disabled={disabled}
							variant="outlined"
							sx={{ '& input': { height: 40, cursor: 'pointer' } }}
						/>
						<Box>
							<Typography variant="caption" color="text.secondary" className="flex items-center gap-4">
								<OpacityIcon fontSize="inherit" /> شفافیت: {Math.round((config.opacity ?? 0) * 100)}%
							</Typography>
							<Slider
								value={config.opacity ?? 0.3}
								min={0}
								max={1}
								step={0.05}
								onChange={(e, v) => update({ opacity: v })}
								disabled={disabled}
								valueLabelDisplay="auto"
								valueLabelFormat={(v) => `${Math.round(v * 100)}%`}
							/>
						</Box>
					</Box>

					<Box className="grid grid-cols-1 sm:grid-cols-2 gap-16">
						<Box>
							<Typography variant="caption" color="text.secondary">
								اندازه فونت: {config.fontSize}px
							</Typography>
							<Slider
								value={config.fontSize ?? 24}
								min={8}
								max={96}
								step={1}
								onChange={(e, v) => update({ fontSize: v })}
								disabled={disabled}
								valueLabelDisplay="auto"
							/>
						</Box>
						<Box>
							<Typography variant="caption" color="text.secondary">
								چرخش: {config.rotation}°
							</Typography>
							<Slider
								value={config.rotation ?? 0}
								min={-90}
								max={90}
								step={1}
								onChange={(e, v) => update({ rotation: v })}
								disabled={disabled}
								valueLabelDisplay="auto"
							/>
						</Box>
					</Box>

					{config.displayForm !== 'single' && (
						<Box>
							<Typography variant="caption" color="text.secondary">
								فاصله تکرار: {config.gap}px
							</Typography>
							<Slider
								value={config.gap ?? 120}
								min={40}
								max={400}
								step={10}
								onChange={(e, v) => update({ gap: v })}
								disabled={disabled}
								valueLabelDisplay="auto"
							/>
						</Box>
					)}

					<TextField
						fullWidth
						label="آدرس تصویر واترمارک (اختیاری)"
						value={config.imageUrl || ''}
						onChange={(e) => update({ imageUrl: e.target.value })}
						disabled={disabled}
						placeholder="/files/... یا آدرس کامل تصویر"
						variant="outlined"
						InputProps={{
							startAdornment: <InputAdornment position="start">🖼️</InputAdornment>
						}}
						helperText="در صورت وارد کردن، می‌تواند جایگزین متن به عنوان واترمارک تصویری استفاده شود"
					/>
				</Box>

				{/* Preview column */}
				<Box>
					<Typography variant="subtitle2" color="text.secondary" className="mb-8">
						پیش‌نمایش زنده
					</Typography>
					<WatermarkPreview config={config} />
				</Box>
			</Box>

			<Divider className="mt-24" />
		</Box>
	);
}

export default WatermarkField;
