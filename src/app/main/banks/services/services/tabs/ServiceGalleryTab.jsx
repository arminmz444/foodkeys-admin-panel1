import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { Typography, Alert, Box, CircularProgress } from '@mui/material';
import axios from 'axios';
import { motion } from 'framer-motion';
import ServiceFileSection from './components/ServiceFileSection';

function mapGalleryFile(file, serviceType) {
	let metadata = {};
	if (file.metadata) {
		try {
			metadata = typeof file.metadata === 'string' ? JSON.parse(file.metadata) : file.metadata;
		} catch (e) {
			console.error('Error parsing file metadata:', e);
		}
	}

	return {
		id: file.id,
		fileName: file.fileName,
		filePath: file.filePath,
		contentType: file.contentType || (file.fileExtension ? `image/${String(file.fileExtension).replace('.', '')}` : ''),
		fileSize: file.fileSize,
		fileExtension: file.fileExtension,
		metadata,
		fileServiceType: serviceType
	};
}

function ServiceGalleryTab() {
	const { setValue } = useFormContext();
	const { id: serviceId } = useParams();
	const isSavedService = Boolean(serviceId) && !String(serviceId).startsWith('draft-') && serviceId !== 'new';
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState(null);

	useEffect(() => {
		if (!isSavedService) return;

		const fetchGalleryFiles = async () => {
			setIsLoading(true);
			setError(null);

			try {
				const response = await axios.get(`/service/${serviceId}/files`);
				if (response.data && response.data.status === 'SUCCESS') {
					const galleryFiles = response.data.data || [];

					const groupedFiles = galleryFiles.reduce((groups, file) => {
						const serviceType = file.fileServiceType;
						if (!groups[serviceType]) {
							groups[serviceType] = [];
						}
						groups[serviceType].push(mapGalleryFile(file, serviceType));
						return groups;
					}, {});

					if (groupedFiles.SERVICE_LOGO) {
						setValue('serviceLogoFiles', groupedFiles.SERVICE_LOGO);
						const primaryLogo = groupedFiles.SERVICE_LOGO.find((f) => f.filePath) || groupedFiles.SERVICE_LOGO[0];
						if (primaryLogo?.filePath) {
							setValue('logo', primaryLogo.filePath);
						}
					}

					if (groupedFiles.SERVICE_BACKGROUND_IMAGE) {
						setValue('serviceBackgroundImages', groupedFiles.SERVICE_BACKGROUND_IMAGE);
						const primaryBg =
							groupedFiles.SERVICE_BACKGROUND_IMAGE.find((f) => f.filePath) ||
							groupedFiles.SERVICE_BACKGROUND_IMAGE[0];
						if (primaryBg?.filePath) {
							setValue('backgroundImage', primaryBg.filePath);
						}
					}

					if (groupedFiles.SERVICE_GALLERY_SLIDER) {
						setValue('serviceGallerySlider', groupedFiles.SERVICE_GALLERY_SLIDER);
					}

					if (groupedFiles.SERVICE_GALLERY_VIDEO) {
						setValue('serviceGalleryVideo', groupedFiles.SERVICE_GALLERY_VIDEO);
					}
				}
			} catch (err) {
				console.error('Error fetching service gallery files:', err);
				setError(err.response?.data?.message || 'خطا در بارگیری اطلاعات گالری');
			} finally {
				setIsLoading(false);
			}
		};

		fetchGalleryFiles();
	}, [isSavedService, serviceId, setValue]);

	if (isLoading && isSavedService) {
		return (
			<Box className="flex justify-center items-center p-48">
				<CircularProgress />
			</Box>
		);
	}

	if (error) {
		return (
			<Alert severity="error" className="my-16">
				خطا در بارگیری اطلاعات گالری: {error}
			</Alert>
		);
	}

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1, transition: { delay: 0.1 } }}
			className="w-full"
		>
			<Typography variant="h5" className="mb-16 font-medium">
				مدیریت گالری و فایل‌های سرویس
			</Typography>

			<Alert severity="info" className="mb-24">
				در این بخش می‌توانید لوگو، تصویر پس‌زمینه، اسلایدر و ویدیوهای مرتبط با سرویس را بارگذاری کنید. مسیر فایل
				لوگو و پس‌زمینه هنگام ذخیره سرویس ارسال می‌شود.
			</Alert>

			{!isSavedService && (
				<Alert severity="warning" className="mb-24">
					می‌توانید فایل‌ها را آپلود کنید؛ پس از ذخیره سرویس، فایل‌ها به سرویس متصل می‌شوند.
				</Alert>
			)}

			<ServiceFileSection
				title="لوگو سرویس"
				fieldName="serviceLogoFiles"
				fileServiceType="SERVICE_LOGO"
				maxFiles={1}
				allowedFileTypes="image/*"
				description="لوگوی سرویس برای نمایش در کارت‌ها و صفحات مرتبط استفاده می‌شود."
				acceptMessage="فقط فایل‌های تصویری مجاز هستند (حداکثر 1 فایل)"
				serviceId={isSavedService ? serviceId : null}
				syncPathField="logo"
			/>

			<ServiceFileSection
				title="تصویر پس‌زمینه"
				fieldName="serviceBackgroundImages"
				fileServiceType="SERVICE_BACKGROUND_IMAGE"
				maxFiles={1}
				allowedFileTypes="image/*"
				description="تصویر پس‌زمینه برای نمایش در هدر پروفایل سرویس استفاده می‌شود."
				acceptMessage="فقط فایل‌های تصویری با کیفیت بالا مجاز هستند (حداکثر 1 فایل)"
				serviceId={isSavedService ? serviceId : null}
				syncPathField="backgroundImage"
			/>

			<ServiceFileSection
				title="گالری اسلایدر"
				fieldName="serviceGallerySlider"
				fileServiceType="SERVICE_GALLERY_SLIDER"
				maxFiles={10}
				allowedFileTypes="image/*"
				description="تصاویر مورد نظر برای نمایش در اسلایدر صفحه سرویس را در این قسمت آپلود کنید."
				acceptMessage="فقط فایل‌های تصویری با کیفیت بالا و ابعاد مناسب مجاز هستند (حداکثر 10 فایل)"
				serviceId={isSavedService ? serviceId : null}
			/>

			<ServiceFileSection
				title="گالری ویدیو"
				fieldName="serviceGalleryVideo"
				fileServiceType="SERVICE_GALLERY_VIDEO"
				maxFiles={3}
				allowedFileTypes="video/mp4,video/webm,video/ogg"
				description="ویدیوهای کوتاه معرفی سرویس را آپلود کنید. حداکثر ۳ ویدیوی کوتاه و کم‌حجم مجاز است."
				acceptMessage="فقط فایل‌های ویدیویی (MP4, WebM, OGG) مجاز هستند (حداکثر 3 فایل)"
				serviceId={isSavedService ? serviceId : null}
			/>
		</motion.div>
	);
}

export default ServiceGalleryTab;
