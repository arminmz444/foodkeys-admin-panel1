import { useState, useRef } from 'react';
import { useFormContext } from 'react-hook-form';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
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
	CircularProgress,
	Tooltip,
	Chip
} from '@mui/material';
import {
	HiOutlinePhotograph,
	HiOutlinePlus,
	HiOutlineTrash,
	HiOutlineUpload,
	HiOutlineMenu
} from 'react-icons/hi';
import { enqueueSnackbar } from 'notistack';
import { getServerFile, uploadFiles } from 'src/utils/string-utils';

const DISPLAY_POSITIONS = {
	top: 'بالا',
	bottom: 'پایین',
	left: 'چپ',
	right: 'راست',
	'top-left': 'بالا چپ',
	'top-right': 'بالا راست',
	'bottom-left': 'پایین چپ',
	'bottom-right': 'پایین راست',
	center: 'وسط',
	sidebar: 'نوار کناری',
	popup: 'پاپ‌آپ'
};

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

function createDefaultAd() {
	return {
		id: uid(),
		image: '',
		url: '',
		title: '',
		description: '',
		displayPosition: 'top',
		enabled: true
	};
}

function AdvertisementCard({ ad, index, onChange, onRemove, disabled }) {
	const fileInputRef = useRef(null);
	const [uploading, setUploading] = useState(false);
	const imageUrl = ad.image ? getServerFile(ad.image) : '';

	const handleFile = async (event) => {
		const file = event.target.files?.[0];
		if (!file) return;
		setUploading(true);
		try {
			const uploaded = await uploadFiles([file], 'COMPANY_ADVERTISEMENT_IMAGE');
			const filePath = Array.isArray(uploaded) ? uploaded[0]?.filePath : uploaded?.filePath;
			if (filePath) {
				onChange({ ...ad, image: filePath });
				enqueueSnackbar('تصویر با موفقیت آپلود شد', { variant: 'success' });
			}
		} catch (error) {
			enqueueSnackbar('خطا در آپلود تصویر', { variant: 'error' });
		} finally {
			setUploading(false);
			if (fileInputRef.current) fileInputRef.current.value = '';
		}
	};

	return (
		<Paper
			elevation={0}
			sx={{
				border: '1px solid',
				borderColor: 'divider',
				borderRadius: 3,
				p: 2,
				transition: 'all 0.2s',
				'&:hover': { borderColor: 'primary.main', boxShadow: 2 }
			}}
		>
			<Box className="flex items-start gap-12">
				<Box className="cursor-grab active:cursor-grabbing flex items-center text-gray-400 hover:text-indigo-500 pt-8 touch-none">
					<HiOutlineMenu size={22} />
				</Box>

				<Box
					sx={{
						width: 96,
						height: 96,
						borderRadius: 2,
						border: '1px solid',
						borderColor: 'divider',
						bgcolor: 'action.hover',
						flexShrink: 0,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						overflow: 'hidden',
						position: 'relative'
					}}
				>
					{imageUrl ? (
						<img src={imageUrl} alt={ad.title || 'ad'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
					) : (
						<HiOutlinePhotograph size={32} className="text-gray-300" />
					)}
					{uploading && (
						<Box
							sx={{
								position: 'absolute',
								inset: 0,
								bgcolor: 'rgba(0,0,0,0.4)',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center'
							}}
						>
							<CircularProgress size={22} sx={{ color: '#fff' }} />
						</Box>
					)}
				</Box>

				<Box className="flex-1 min-w-0 space-y-8">
					<Box className="flex items-center gap-8">
						<Chip label={`#${index + 1}`} size="small" color="primary" />
						<input
							ref={fileInputRef}
							type="file"
							accept="image/*,image/gif"
							style={{ display: 'none' }}
							onChange={handleFile}
						/>
						<Button
							size="small"
							variant="outlined"
							startIcon={<HiOutlineUpload />}
							onClick={() => fileInputRef.current?.click()}
							disabled={disabled || uploading}
						>
							آپلود تصویر/گیف
						</Button>
						<Box sx={{ flex: 1 }} />
						<Tooltip title="حذف تبلیغ">
							<IconButton size="small" color="error" onClick={() => onRemove(ad.id)} disabled={disabled}>
								<HiOutlineTrash size={18} />
							</IconButton>
						</Tooltip>
					</Box>

					<Box className="grid grid-cols-1 sm:grid-cols-2 gap-8">
						<TextField
							size="small"
							label="عنوان"
							value={ad.title || ''}
							onChange={(e) => onChange({ ...ad, title: e.target.value })}
							disabled={disabled}
						/>
						<TextField
							size="small"
							label="آدرس (نسبی)"
							placeholder="/products/123"
							value={ad.url || ''}
							onChange={(e) => onChange({ ...ad, url: e.target.value })}
							disabled={disabled}
						/>
						<TextField
							size="small"
							className="sm:col-span-2"
							label="توضیحات (اختیاری)"
							value={ad.description || ''}
							onChange={(e) => onChange({ ...ad, description: e.target.value })}
							disabled={disabled}
						/>
						<TextField
							size="small"
							label="آدرس تصویر (اختیاری)"
							value={ad.image || ''}
							onChange={(e) => onChange({ ...ad, image: e.target.value })}
							disabled={disabled}
							helperText="در صورت داشتن آدرس آماده"
						/>
						<FormControl size="small">
							<InputLabel>موقعیت نمایش</InputLabel>
							<Select
								value={ad.displayPosition}
								label="موقعیت نمایش"
								onChange={(e) => onChange({ ...ad, displayPosition: e.target.value })}
								disabled={disabled}
							>
								{Object.entries(DISPLAY_POSITIONS).map(([v, l]) => (
									<MenuItem key={v} value={v}>
										{l}
									</MenuItem>
								))}
							</Select>
						</FormControl>
					</Box>
				</Box>
			</Box>
		</Paper>
	);
}

function AdvertisementsTab({ name = 'additionalInfo.advertisements', disabled = false }) {
	const { watch, setValue } = useFormContext();
	const stored = watch(name);

	const [ads, setAds] = useState(() =>
		Array.isArray(stored) ? stored.map((a) => ({ ...createDefaultAd(), ...a })) : []
	);

	const sync = (next) => {
		// keep displayOrder in sync with array order
		const withOrder = next.map((a, i) => ({ ...a, displayOrder: i + 1 }));
		setAds(withOrder);
		setValue(name, withOrder, { shouldDirty: true });
	};

	const addAd = () => sync([...ads, createDefaultAd()]);
	const updateAd = (id, next) => sync(ads.map((a) => (a.id === id ? next : a)));
	const removeAd = (id) => sync(ads.filter((a) => a.id !== id));

	return (
		<Box className="space-y-24">
			<motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
				<Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
					<CardContent>
						<div className="flex items-center gap-16 flex-wrap">
							<div className="p-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg">
								<HiOutlinePhotograph size={28} className="text-white" />
							</div>
							<div className="flex-1 min-w-0">
								<Typography variant="h5" className="font-bold">
									تبلیغات
								</Typography>
								<Typography variant="body2" color="text.secondary">
									تبلیغات را با تصویر/گیف، لینک و موقعیت نمایش مدیریت کنید (ترتیب با کشیدن و رها کردن)
								</Typography>
							</div>
							<Button
								variant="contained"
								startIcon={<HiOutlinePlus />}
								onClick={addAd}
								disabled={disabled}
								sx={{
									background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
									'&:hover': { background: 'linear-gradient(135deg, #d97706 0%, #c2410c 100%)' }
								}}
							>
								افزودن تبلیغ
							</Button>
						</div>
					</CardContent>
				</Card>
			</motion.div>

			{ads.length === 0 ? (
				<Paper
					elevation={0}
					sx={{ p: 6, borderRadius: 3, textAlign: 'center', border: '2px dashed', borderColor: 'divider' }}
				>
					<div className="w-80 h-80 mx-auto mb-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
						<HiOutlinePhotograph size={40} className="text-gray-300 dark:text-gray-600" />
					</div>
					<Typography variant="h6" color="text.secondary" className="mb-8">
						هنوز تبلیغی اضافه نشده است
					</Typography>
					<Button variant="outlined" startIcon={<HiOutlinePlus />} onClick={addAd} disabled={disabled}>
						افزودن اولین تبلیغ
					</Button>
				</Paper>
			) : (
				<Reorder.Group
					axis="y"
					values={ads}
					onReorder={sync}
					className="space-y-12"
					style={{ listStyle: 'none', padding: 0, margin: 0 }}
				>
					<AnimatePresence>
						{ads.map((ad, index) => (
							<Reorder.Item key={ad.id} value={ad} style={{ position: 'relative' }}>
								<AdvertisementCard
									ad={ad}
									index={index}
									onChange={(next) => updateAd(ad.id, next)}
									onRemove={removeAd}
									disabled={disabled}
								/>
							</Reorder.Item>
						))}
					</AnimatePresence>
				</Reorder.Group>
			)}
		</Box>
	);
}

export default AdvertisementsTab;
