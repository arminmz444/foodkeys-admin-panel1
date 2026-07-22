import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import {
	Box,
	Paper,
	Card,
	CardContent,
	Typography,
	TextField,
	Button,
	IconButton,
	Select,
	MenuItem,
	FormControl,
	InputLabel,
	FormControlLabel,
	Switch,
	Checkbox,
	Slider,
	Divider,
	Accordion,
	AccordionSummary,
	AccordionDetails,
	Chip,
	Tooltip,
	Alert,
	Tabs,
	Tab
} from '@mui/material';
import {
	HiOutlineBell,
	HiOutlinePlus,
	HiOutlineTrash,
	HiOutlineChevronDown,
	HiOutlineChevronUp,
	HiOutlineDuplicate,
	HiOutlineSparkles
} from 'react-icons/hi';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const TEMPLATES = {
	toast: { label: 'نوتیفیکیشن (Toast)', color: '#6366f1' },
	banner: { label: 'بنر بالای صفحه', color: '#0ea5e9' },
	modal: { label: 'مودال وسط صفحه', color: '#8b5cf6' },
	card: { label: 'کارت گوشه صفحه', color: '#10b981' },
	fullscreen: { label: 'تمام صفحه', color: '#f59e0b' },
	ribbon: { label: 'ریبون کناری', color: '#ef4444' }
};

const TOAST_POSITIONS = {
	'top-left': 'بالا چپ',
	'top-center': 'بالا وسط',
	'top-right': 'بالا راست',
	'bottom-left': 'پایین چپ',
	'bottom-center': 'پایین وسط',
	'bottom-right': 'پایین راست'
};

const ANIMATIONS = {
	fade: 'محو شدن (Fade)',
	slide: 'اسلاید (Slide)',
	zoom: 'بزرگ‌نمایی (Zoom)',
	bounce: 'فنری (Bounce)',
	flip: 'چرخش (Flip)',
	none: 'بدون انیمیشن'
};

const THEMES = {
	light: 'روشن',
	dark: 'تیره',
	colored: 'رنگی'
};

const TRIGGERS = {
	onLoad: 'هنگام بارگذاری صفحه',
	delay: 'با تاخیر زمانی',
	onScroll: 'هنگام اسکرول',
	onExit: 'هنگام خروج (Exit intent)'
};

const ACTION_TYPES = {
	link: 'لینک (آدرس نسبی)',
	'open-chat': 'باز کردن چت',
	'open-form': 'باز کردن فرم',
	'scroll-to-section': 'اسکرول به بخش',
	'go-to-user-panel': 'رفتن به پنل کاربری'
};

const FIELD_TYPES = {
	text: 'متن',
	textarea: 'متن بلند',
	number: 'عدد',
	email: 'ایمیل',
	tel: 'شماره تماس',
	boolean: 'بله/خیر',
	select: 'انتخابی'
};

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

function createDefaultAnnouncement(template = 'toast') {
	return {
		id: uid(),
		template,
		title: 'اعلان جدید',
		description: '',
		enabled: true,
		design: {
			backgroundColor: TEMPLATES[template]?.color || '#6366f1',
			textColor: '#ffffff',
			borderRadius: 12,
			icon: '🔔'
		},
		config: {
			position: 'top-right',
			animation: 'slide',
			theme: 'colored',
			duration: 5000,
			autoClose: true,
			closeOnClick: false,
			pauseOnHover: true,
			draggable: true,
			dismissible: true
		},
		timing: {
			trigger: 'onLoad',
			delay: 1000,
			showOnce: false,
			startDate: '',
			endDate: ''
		},
		form: {
			enabled: false,
			submitLabel: 'ارسال',
			fields: []
		},
		custom: {
			html: '',
			css: '',
			js: ''
		},
		actions: []
	};
}

/* ------------------------------------------------------------------ */
/*  Live preview                                                       */
/* ------------------------------------------------------------------ */

function AnnouncementPreview({ ann }) {
	const { design, config, template, title, description } = ann;
	const themeStyles =
		config.theme === 'light'
			? { background: '#ffffff', color: '#111827' }
			: config.theme === 'dark'
				? { background: '#1f2937', color: '#f9fafb' }
				: { background: design.backgroundColor, color: design.textColor };

	return (
		<Box
			sx={{
				position: 'relative',
				minHeight: 180,
				borderRadius: 2,
				background: 'repeating-linear-gradient(45deg,#f3f4f6 0 10px,#e5e7eb 10px 20px)',
				border: '1px solid rgba(0,0,0,0.12)',
				display: 'flex',
				alignItems:
					template === 'banner'
						? 'flex-start'
						: template === 'modal' || template === 'fullscreen'
							? 'center'
							: config.position?.startsWith('top')
								? 'flex-start'
								: 'flex-end',
				justifyContent:
					template === 'modal' || template === 'fullscreen'
						? 'center'
						: config.position?.endsWith('left')
							? 'flex-start'
							: config.position?.endsWith('center')
								? 'center'
								: 'flex-end',
				p: 1.5,
				overflow: 'hidden'
			}}
		>
			<Box
				sx={{
					...themeStyles,
					borderRadius: `${design.borderRadius}px`,
					p: 2,
					maxWidth: template === 'fullscreen' ? '100%' : 280,
					width: template === 'banner' || template === 'fullscreen' ? '100%' : 'auto',
					boxShadow: 3
				}}
			>
				<Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
					{design.icon} {title || 'بدون عنوان'}
				</Typography>
				{description && (
					<Typography variant="caption" sx={{ display: 'block', mt: 0.5, opacity: 0.9 }}>
						{description}
					</Typography>
				)}
				{ann.form?.enabled && ann.form.fields?.length > 0 && (
					<Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
						{ann.form.fields.slice(0, 3).map((f) => (
							<Box
								key={f.id}
								sx={{
									fontSize: 10,
									px: 1,
									py: 0.5,
									borderRadius: 1,
									bgcolor: 'rgba(255,255,255,0.25)'
								}}
							>
								{f.label || f.name || 'فیلد'}
							</Box>
						))}
					</Box>
				)}
				{ann.actions?.length > 0 && (
					<Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
						{ann.actions.map((a) => (
							<Chip
								key={a.id}
								label={a.label || ACTION_TYPES[a.type]}
								size="small"
								sx={{ height: 20, fontSize: 10, bgcolor: 'rgba(255,255,255,0.3)' }}
							/>
						))}
					</Box>
				)}
			</Box>
		</Box>
	);
}

/* ------------------------------------------------------------------ */
/*  Form-schema builder                                               */
/* ------------------------------------------------------------------ */

function FormSchemaBuilder({ form, onChange, disabled }) {
	const updateField = (id, patch) => {
		onChange({
			...form,
			fields: form.fields.map((f) => (f.id === id ? { ...f, ...patch } : f))
		});
	};
	const addField = () => {
		onChange({
			...form,
			fields: [...form.fields, { id: uid(), name: '', label: '', type: 'text', required: false, options: [] }]
		});
	};
	const removeField = (id) => {
		onChange({ ...form, fields: form.fields.filter((f) => f.id !== id) });
	};

	return (
		<Box>
			<FormControlLabel
				control={
					<Switch
						checked={!!form.enabled}
						onChange={(e) => onChange({ ...form, enabled: e.target.checked })}
						disabled={disabled}
					/>
				}
				label="فعال کردن فرم در این اعلان"
			/>

			{form.enabled && (
				<Box className="mt-8 space-y-12">
					<TextField
						size="small"
						label="متن دکمه ارسال"
						value={form.submitLabel || ''}
						onChange={(e) => onChange({ ...form, submitLabel: e.target.value })}
						disabled={disabled}
						sx={{ maxWidth: 220 }}
					/>

					{form.fields.map((field, idx) => (
						<Paper key={field.id} variant="outlined" className="p-12">
							<Box className="flex items-center gap-8 mb-8">
								<Chip label={idx + 1} size="small" color="primary" />
								<Typography variant="caption" color="text.secondary">
									فیلد فرم
								</Typography>
								<Box sx={{ flex: 1 }} />
								<IconButton size="small" color="error" onClick={() => removeField(field.id)} disabled={disabled}>
									<HiOutlineTrash size={16} />
								</IconButton>
							</Box>
							<Box className="grid grid-cols-1 sm:grid-cols-2 gap-8">
								<TextField
									size="small"
									label="نام (کلید انگلیسی)"
									value={field.name || ''}
									onChange={(e) => updateField(field.id, { name: e.target.value })}
									disabled={disabled}
								/>
								<TextField
									size="small"
									label="برچسب"
									value={field.label || ''}
									onChange={(e) => updateField(field.id, { label: e.target.value })}
									disabled={disabled}
								/>
								<FormControl size="small">
									<InputLabel>نوع</InputLabel>
									<Select
										value={field.type}
										label="نوع"
										onChange={(e) => updateField(field.id, { type: e.target.value })}
										disabled={disabled}
									>
										{Object.entries(FIELD_TYPES).map(([v, l]) => (
											<MenuItem key={v} value={v}>
												{l}
											</MenuItem>
										))}
									</Select>
								</FormControl>
								<FormControlLabel
									control={
										<Checkbox
											checked={!!field.required}
											onChange={(e) => updateField(field.id, { required: e.target.checked })}
											disabled={disabled}
										/>
									}
									label="اجباری"
								/>
								{field.type === 'select' && (
									<TextField
										size="small"
										className="sm:col-span-2"
										label="گزینه‌ها (با کاما جدا کنید)"
										value={(field.options || []).join(', ')}
										onChange={(e) =>
											updateField(field.id, {
												options: e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
											})
										}
										disabled={disabled}
									/>
								)}
							</Box>
						</Paper>
					))}

					<Button size="small" startIcon={<HiOutlinePlus />} onClick={addField} disabled={disabled} variant="outlined">
						افزودن فیلد فرم
					</Button>
				</Box>
			)}
		</Box>
	);
}

/* ------------------------------------------------------------------ */
/*  Actions builder                                                   */
/* ------------------------------------------------------------------ */

function ActionsBuilder({ actions, onChange, disabled }) {
	const updateAction = (id, patch) => onChange(actions.map((a) => (a.id === id ? { ...a, ...patch } : a)));
	const addAction = () =>
		onChange([...actions, { id: uid(), type: 'link', label: '', url: '', sectionName: '', path: '', formFields: [] }]);
	const removeAction = (id) => onChange(actions.filter((a) => a.id !== id));

	return (
		<Box className="space-y-12">
			{actions.map((action) => (
				<Paper key={action.id} variant="outlined" className="p-12">
					<Box className="flex items-center gap-8 mb-8">
						<FormControl size="small" sx={{ minWidth: 180 }}>
							<InputLabel>نوع اکشن</InputLabel>
							<Select
								value={action.type}
								label="نوع اکشن"
								onChange={(e) => updateAction(action.id, { type: e.target.value })}
								disabled={disabled}
							>
								{Object.entries(ACTION_TYPES).map(([v, l]) => (
									<MenuItem key={v} value={v}>
										{l}
									</MenuItem>
								))}
							</Select>
						</FormControl>
						<TextField
							size="small"
							label="متن دکمه"
							value={action.label || ''}
							onChange={(e) => updateAction(action.id, { label: e.target.value })}
							disabled={disabled}
							sx={{ flex: 1 }}
						/>
						<IconButton size="small" color="error" onClick={() => removeAction(action.id)} disabled={disabled}>
							<HiOutlineTrash size={16} />
						</IconButton>
					</Box>

					{action.type === 'link' && (
						<TextField
							fullWidth
							size="small"
							label="آدرس نسبی"
							placeholder="/products/123"
							value={action.url || ''}
							onChange={(e) => updateAction(action.id, { url: e.target.value })}
							disabled={disabled}
						/>
					)}
					{action.type === 'scroll-to-section' && (
						<TextField
							fullWidth
							size="small"
							label="نام بخش (Section id/name)"
							placeholder="contact-section"
							value={action.sectionName || ''}
							onChange={(e) => updateAction(action.id, { sectionName: e.target.value })}
							disabled={disabled}
						/>
					)}
					{action.type === 'go-to-user-panel' && (
						<TextField
							fullWidth
							size="small"
							label="آدرس نسبی پنل کاربری"
							placeholder="/dashboard/orders"
							value={action.path || ''}
							onChange={(e) => updateAction(action.id, { path: e.target.value })}
							disabled={disabled}
						/>
					)}
					{action.type === 'open-form' && (
						<Box>
							<Typography variant="caption" color="text.secondary" className="block mb-4">
								اسکیمای فرمی که باید باز شود:
							</Typography>
							<FormSchemaBuilder
								form={{ enabled: true, submitLabel: action.submitLabel || 'ارسال', fields: action.formFields || [] }}
								onChange={(f) =>
									updateAction(action.id, { formFields: f.fields, submitLabel: f.submitLabel })
								}
								disabled={disabled}
							/>
						</Box>
					)}
					{action.type === 'open-chat' && (
						<Typography variant="caption" color="text.secondary">
							با کلیک، پنجره چت باز می‌شود (نیازی به تنظیمات اضافه ندارد).
						</Typography>
					)}
				</Paper>
			))}

			<Button size="small" startIcon={<HiOutlinePlus />} onClick={addAction} disabled={disabled} variant="outlined">
				افزودن اکشن
			</Button>
		</Box>
	);
}

/* ------------------------------------------------------------------ */
/*  Single announcement editor                                        */
/* ------------------------------------------------------------------ */

function AnnouncementEditor({ ann, index, total, onChange, onRemove, onMove, onDuplicate, disabled }) {
	const [innerTab, setInnerTab] = useState(0);
	const setDesign = (patch) => onChange({ ...ann, design: { ...ann.design, ...patch } });
	const setConfig = (patch) => onChange({ ...ann, config: { ...ann.config, ...patch } });
	const setTiming = (patch) => onChange({ ...ann, timing: { ...ann.timing, ...patch } });
	const setCustom = (patch) => onChange({ ...ann, custom: { ...ann.custom, ...patch } });

	return (
		<Accordion defaultExpanded={index === total - 1} sx={{ borderRadius: 2, '&:before': { display: 'none' } }} variant="outlined">
			<AccordionSummary expandIcon={<ExpandMoreIcon />}>
				<Box className="flex items-center gap-8 w-full">
					<Box
						sx={{
							width: 32,
							height: 32,
							borderRadius: '50%',
							bgcolor: TEMPLATES[ann.template]?.color || 'primary.main',
							color: '#fff',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							fontSize: 14
						}}
					>
						{ann.design?.icon || '🔔'}
					</Box>
					<Box sx={{ minWidth: 0 }}>
						<Typography variant="subtitle2" noWrap>
							{ann.title || 'بدون عنوان'}
						</Typography>
						<Typography variant="caption" color="text.secondary">
							{TEMPLATES[ann.template]?.label}
						</Typography>
					</Box>
					<Box sx={{ flex: 1 }} />
					{!ann.enabled && <Chip label="غیرفعال" size="small" color="default" />}
					<Tooltip title="بالا بردن">
						<span>
							<IconButton
								size="small"
								disabled={disabled || index === 0}
								onClick={(e) => {
									e.stopPropagation();
									onMove(index, index - 1);
								}}
							>
								<HiOutlineChevronUp size={16} />
							</IconButton>
						</span>
					</Tooltip>
					<Tooltip title="پایین بردن">
						<span>
							<IconButton
								size="small"
								disabled={disabled || index === total - 1}
								onClick={(e) => {
									e.stopPropagation();
									onMove(index, index + 1);
								}}
							>
								<HiOutlineChevronDown size={16} />
							</IconButton>
						</span>
					</Tooltip>
					<Tooltip title="کپی">
						<IconButton
							size="small"
							disabled={disabled}
							onClick={(e) => {
								e.stopPropagation();
								onDuplicate(index);
							}}
						>
							<HiOutlineDuplicate size={16} />
						</IconButton>
					</Tooltip>
					<Tooltip title="حذف">
						<IconButton
							size="small"
							color="error"
							disabled={disabled}
							onClick={(e) => {
								e.stopPropagation();
								onRemove(index);
							}}
						>
							<HiOutlineTrash size={16} />
						</IconButton>
					</Tooltip>
				</Box>
			</AccordionSummary>
			<AccordionDetails>
				<Box className="grid grid-cols-1 lg:grid-cols-2 gap-24">
					<Box>
						<Box className="flex items-center gap-8 mb-12 flex-wrap">
							<FormControl size="small" sx={{ minWidth: 180 }}>
								<InputLabel>قالب</InputLabel>
								<Select
									value={ann.template}
									label="قالب"
									onChange={(e) => onChange({ ...ann, template: e.target.value })}
									disabled={disabled}
								>
									{Object.entries(TEMPLATES).map(([v, t]) => (
										<MenuItem key={v} value={v}>
											{t.label}
										</MenuItem>
									))}
								</Select>
							</FormControl>
							<FormControlLabel
								control={
									<Switch
										checked={!!ann.enabled}
										onChange={(e) => onChange({ ...ann, enabled: e.target.checked })}
										disabled={disabled}
									/>
								}
								label="فعال"
							/>
						</Box>

						<Tabs
							value={innerTab}
							onChange={(e, v) => setInnerTab(v)}
							variant="scrollable"
							scrollButtons="auto"
							className="mb-12"
						>
							<Tab label="محتوا و طراحی" />
							<Tab label="تنظیمات نمایش" />
							<Tab label="زمان‌بندی" />
							<Tab label="فرم" />
							<Tab label="اکشن‌ها" />
							<Tab label="کد سفارشی" />
						</Tabs>

						{innerTab === 0 && (
							<Box className="space-y-12">
								<TextField
									fullWidth
									size="small"
									label="عنوان"
									value={ann.title || ''}
									onChange={(e) => onChange({ ...ann, title: e.target.value })}
									disabled={disabled}
								/>
								<TextField
									fullWidth
									size="small"
									multiline
									minRows={2}
									label="توضیحات"
									value={ann.description || ''}
									onChange={(e) => onChange({ ...ann, description: e.target.value })}
									disabled={disabled}
								/>
								<Box className="grid grid-cols-2 sm:grid-cols-3 gap-8 items-center">
									<TextField
										size="small"
										label="آیکون (اموجی)"
										value={ann.design.icon || ''}
										onChange={(e) => setDesign({ icon: e.target.value })}
										disabled={disabled}
									/>
									<TextField
										size="small"
										type="color"
										label="رنگ پس‌زمینه"
										value={ann.design.backgroundColor || '#6366f1'}
										onChange={(e) => setDesign({ backgroundColor: e.target.value })}
										disabled={disabled}
									/>
									<TextField
										size="small"
										type="color"
										label="رنگ متن"
										value={ann.design.textColor || '#ffffff'}
										onChange={(e) => setDesign({ textColor: e.target.value })}
										disabled={disabled}
									/>
								</Box>
								<Box>
									<Typography variant="caption" color="text.secondary">
										گردی گوشه‌ها: {ann.design.borderRadius}px
									</Typography>
									<Slider
										value={ann.design.borderRadius ?? 12}
										min={0}
										max={40}
										onChange={(e, v) => setDesign({ borderRadius: v })}
										disabled={disabled}
									/>
								</Box>
							</Box>
						)}

						{innerTab === 1 && (
							<Box className="space-y-12">
								<Box className="grid grid-cols-1 sm:grid-cols-2 gap-8">
									<FormControl size="small">
										<InputLabel>موقعیت</InputLabel>
										<Select
											value={ann.config.position}
											label="موقعیت"
											onChange={(e) => setConfig({ position: e.target.value })}
											disabled={disabled}
										>
											{Object.entries(TOAST_POSITIONS).map(([v, l]) => (
												<MenuItem key={v} value={v}>
													{l}
												</MenuItem>
											))}
										</Select>
									</FormControl>
									<FormControl size="small">
										<InputLabel>انیمیشن</InputLabel>
										<Select
											value={ann.config.animation}
											label="انیمیشن"
											onChange={(e) => setConfig({ animation: e.target.value })}
											disabled={disabled}
										>
											{Object.entries(ANIMATIONS).map(([v, l]) => (
												<MenuItem key={v} value={v}>
													{l}
												</MenuItem>
											))}
										</Select>
									</FormControl>
									<FormControl size="small">
										<InputLabel>تم</InputLabel>
										<Select
											value={ann.config.theme}
											label="تم"
											onChange={(e) => setConfig({ theme: e.target.value })}
											disabled={disabled}
										>
											{Object.entries(THEMES).map(([v, l]) => (
												<MenuItem key={v} value={v}>
													{l}
												</MenuItem>
											))}
										</Select>
									</FormControl>
									<TextField
										size="small"
										type="number"
										label="مدت نمایش (ms)"
										value={ann.config.duration ?? 5000}
										onChange={(e) => setConfig({ duration: parseInt(e.target.value, 10) || 0 })}
										disabled={disabled}
									/>
								</Box>
								<Box className="flex flex-wrap gap-x-16">
									{[
										['autoClose', 'بستن خودکار'],
										['closeOnClick', 'بستن با کلیک'],
										['pauseOnHover', 'توقف با هاور'],
										['draggable', 'قابل کشیدن'],
										['dismissible', 'قابل بستن دستی']
									].map(([key, lbl]) => (
										<FormControlLabel
											key={key}
											control={
												<Checkbox
													checked={!!ann.config[key]}
													onChange={(e) => setConfig({ [key]: e.target.checked })}
													disabled={disabled}
												/>
											}
											label={lbl}
										/>
									))}
								</Box>
							</Box>
						)}

						{innerTab === 2 && (
							<Box className="space-y-12">
								<FormControl size="small" fullWidth>
									<InputLabel>زمان نمایش (Trigger)</InputLabel>
									<Select
										value={ann.timing.trigger}
										label="زمان نمایش (Trigger)"
										onChange={(e) => setTiming({ trigger: e.target.value })}
										disabled={disabled}
									>
										{Object.entries(TRIGGERS).map(([v, l]) => (
											<MenuItem key={v} value={v}>
												{l}
											</MenuItem>
										))}
									</Select>
								</FormControl>
								{ann.timing.trigger === 'delay' && (
									<TextField
										size="small"
										type="number"
										label="تاخیر (ms)"
										value={ann.timing.delay ?? 1000}
										onChange={(e) => setTiming({ delay: parseInt(e.target.value, 10) || 0 })}
										disabled={disabled}
									/>
								)}
								<Box className="grid grid-cols-1 sm:grid-cols-2 gap-8">
									<TextField
										size="small"
										type="date"
										label="تاریخ شروع"
										InputLabelProps={{ shrink: true }}
										value={ann.timing.startDate || ''}
										onChange={(e) => setTiming({ startDate: e.target.value })}
										disabled={disabled}
									/>
									<TextField
										size="small"
										type="date"
										label="تاریخ پایان"
										InputLabelProps={{ shrink: true }}
										value={ann.timing.endDate || ''}
										onChange={(e) => setTiming({ endDate: e.target.value })}
										disabled={disabled}
									/>
								</Box>
								<FormControlLabel
									control={
										<Checkbox
											checked={!!ann.timing.showOnce}
											onChange={(e) => setTiming({ showOnce: e.target.checked })}
											disabled={disabled}
										/>
									}
									label="فقط یک بار برای هر کاربر نمایش داده شود"
								/>
							</Box>
						)}

						{innerTab === 3 && (
							<FormSchemaBuilder form={ann.form} onChange={(f) => onChange({ ...ann, form: f })} disabled={disabled} />
						)}

						{innerTab === 4 && (
							<ActionsBuilder
								actions={ann.actions || []}
								onChange={(a) => onChange({ ...ann, actions: a })}
								disabled={disabled}
							/>
						)}

						{innerTab === 5 && (
							<Box className="space-y-12">
								<Alert severity="info" sx={{ fontSize: 12 }}>
									کد سفارشی برای شخصی‌سازی کامل ظاهر و رفتار اعلان استفاده می‌شود.
								</Alert>
								<TextField
									fullWidth
									size="small"
									multiline
									minRows={3}
									label="HTML سفارشی"
									value={ann.custom.html || ''}
									onChange={(e) => setCustom({ html: e.target.value })}
									disabled={disabled}
								/>
								<TextField
									fullWidth
									size="small"
									multiline
									minRows={3}
									label="CSS سفارشی"
									value={ann.custom.css || ''}
									onChange={(e) => setCustom({ css: e.target.value })}
									disabled={disabled}
								/>
								<TextField
									fullWidth
									size="small"
									multiline
									minRows={3}
									label="JavaScript سفارشی"
									value={ann.custom.js || ''}
									onChange={(e) => setCustom({ js: e.target.value })}
									disabled={disabled}
								/>
							</Box>
						)}
					</Box>

					<Box>
						<Typography variant="subtitle2" color="text.secondary" className="mb-8">
							پیش‌نمایش زنده
						</Typography>
						<AnnouncementPreview ann={ann} />
					</Box>
				</Box>
			</AccordionDetails>
		</Accordion>
	);
}

/* ------------------------------------------------------------------ */
/*  Main tab                                                          */
/* ------------------------------------------------------------------ */

function AnnouncementsTab({ name = 'additionalInfo.announcements', disabled = false }) {
	const { watch, setValue } = useFormContext();
	const stored = watch(name);

	const [announcements, setAnnouncements] = useState(() =>
		Array.isArray(stored) ? stored.map((a) => ({ ...createDefaultAnnouncement(a.template), ...a })) : []
	);

	const sync = (next) => {
		setAnnouncements(next);
		setValue(name, next, { shouldDirty: true });
	};

	const addAnnouncement = () => sync([...announcements, createDefaultAnnouncement('toast')]);
	const updateAnnouncement = (index, next) => sync(announcements.map((a, i) => (i === index ? next : a)));
	const removeAnnouncement = (index) => sync(announcements.filter((_, i) => i !== index));
	const duplicateAnnouncement = (index) =>
		sync([
			...announcements.slice(0, index + 1),
			{ ...announcements[index], id: uid(), title: `${announcements[index].title} (کپی)` },
			...announcements.slice(index + 1)
		]);
	const moveAnnouncement = (from, to) => {
		if (to < 0 || to >= announcements.length) return;
		const next = [...announcements];
		const [item] = next.splice(from, 1);
		next.splice(to, 0, item);
		sync(next);
	};

	return (
		<Box className="space-y-24">
			<motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
				<Card
					elevation={0}
					sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'visible' }}
				>
					<CardContent>
						<div className="flex items-center gap-16 mb-16 flex-wrap">
							<div className="p-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
								<HiOutlineBell size={28} className="text-white" />
							</div>
							<div className="flex-1 min-w-0">
								<Typography variant="h5" className="font-bold">
									اعلان‌ها
								</Typography>
								<Typography variant="body2" color="text.secondary">
									اعلان‌های پویا با قالب‌های آماده، فرم، اکشن و کد سفارشی بسازید
								</Typography>
							</div>
							<Button
								variant="contained"
								startIcon={<HiOutlinePlus />}
								onClick={addAnnouncement}
								disabled={disabled}
								sx={{
									background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
									'&:hover': { background: 'linear-gradient(135deg, #4f46e5 0%, #9333ea 100%)' }
								}}
							>
								افزودن اعلان
							</Button>
						</div>
						<Paper
							elevation={0}
							sx={{ p: 1.5, borderRadius: 2, bgcolor: 'action.hover', display: 'flex', alignItems: 'center', gap: 1 }}
						>
							<HiOutlineSparkles className="text-indigo-500" />
							<Typography variant="body2" color="text.secondary">
								{announcements.length} اعلان تعریف شده
							</Typography>
						</Paper>
					</CardContent>
				</Card>
			</motion.div>

			{announcements.length === 0 ? (
				<Paper
					elevation={0}
					sx={{ p: 6, borderRadius: 3, textAlign: 'center', border: '2px dashed', borderColor: 'divider' }}
				>
					<div className="w-80 h-80 mx-auto mb-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
						<HiOutlineBell size={40} className="text-gray-300 dark:text-gray-600" />
					</div>
					<Typography variant="h6" color="text.secondary" className="mb-8">
						هنوز اعلانی تعریف نشده است
					</Typography>
					<Button variant="outlined" startIcon={<HiOutlinePlus />} onClick={addAnnouncement} disabled={disabled}>
						افزودن اولین اعلان
					</Button>
				</Paper>
			) : (
				<Box className="space-y-12">
					<AnimatePresence>
						{announcements.map((ann, index) => (
							<motion.div
								key={ann.id}
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, scale: 0.98 }}
							>
								<AnnouncementEditor
									ann={ann}
									index={index}
									total={announcements.length}
									onChange={(next) => updateAnnouncement(index, next)}
									onRemove={removeAnnouncement}
									onMove={moveAnnouncement}
									onDuplicate={duplicateAnnouncement}
									disabled={disabled}
								/>
							</motion.div>
						))}
					</AnimatePresence>
				</Box>
			)}
		</Box>
	);
}

export default AnnouncementsTab;
