import { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import {
	Typography,
	Button,
	Paper,
	Grid,
	Box,
	Alert,
	CircularProgress,
	Chip,
	Tooltip
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { motion } from 'framer-motion';
import Lightbox from 'yet-another-react-lightbox';
import Video from 'yet-another-react-lightbox/plugins/video';
import 'yet-another-react-lightbox/styles.css';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { getServerFile, uploadFiles } from '@/utils/string-utils';
import {
	getDefaultMetadata,
	getFileServiceTypeDisplayName,
	isImageFile,
	isVideoFile
} from 'src/app/main/banks/food-industry-bank/company/tabs/utils/fileUtils';
import FileCard from 'src/app/main/banks/food-industry-bank/company/tabs/components/FileCard';
import useFileServiceTypeValidation from '@/app/main/shared-hooks/useFileServiceTypeValidation.js';

function ServiceFileSection({
	title,
	fieldName,
	fileServiceType,
	maxFiles = 10,
	allowedFileTypes = 'image/*,video/*,application/pdf',
	description,
	acceptMessage,
	serviceId,
	syncPathField = null
}) {
	const { watch, setValue, getValues } = useFormContext();
	const files = watch(fieldName) || [];

	const [lightboxIndex, setLightboxIndex] = useState(-1);
	const [uploadError, setUploadError] = useState(null);
	const [validationErrors, setValidationErrors] = useState([]);
	const [isLoading, setIsLoading] = useState(false);

	const {
		config: validationConfig,
		isConfigAvailable,
		validateFiles
	} = useFileServiceTypeValidation(fileServiceType);

	const effectiveMaxFiles =
		isConfigAvailable && validationConfig.maxFiles ? validationConfig.maxFiles : maxFiles;

	const effectiveAllowedTypes =
		isConfigAvailable && validationConfig.allowedMimeTypes && validationConfig.allowedMimeTypes.length > 0
			? validationConfig.allowedMimeTypes.join(',')
			: allowedFileTypes;

	const slides = files
		.map((file) => {
			if (isImageFile(file.contentType)) {
				return {
					src: file.filePath ? getServerFile(file.filePath) : file.previewUrl,
					alt: file.metadata?.altText || file.fileName
				};
			}
			if (isVideoFile(file.contentType)) {
				return {
					type: 'video',
					width: 1280,
					height: 720,
					poster: file.thumbnailUrl,
					sources: [
						{
							src: file.filePath ? getServerFile(file.filePath) : file.previewUrl,
							type: file.contentType
						}
					]
				};
			}
			return null;
		})
		.filter(Boolean);

	const syncPath = (nextFiles) => {
		if (!syncPathField) return;
		const primary = nextFiles.find((f) => f.filePath) || nextFiles[0];
		setValue(syncPathField, primary?.filePath || '', { shouldDirty: true });
	};

	const handleAddFiles = async (e) => {
		const selectedFiles = Array.from(e.target.files || []);
		if (!selectedFiles.length) return;

		setValidationErrors([]);

		if (isConfigAvailable) {
			const result = validateFiles(selectedFiles, files.length);
			if (!result.valid) {
				setValidationErrors(result.errors);
				setUploadError(null);
				return;
			}
		} else if (files.length + selectedFiles.length > effectiveMaxFiles) {
			setUploadError(`حداکثر تعداد فایل مجاز ${effectiveMaxFiles} است.`);
			return;
		}

		setIsLoading(true);
		setUploadError(null);

		const tempFiles = selectedFiles.map((file) => {
			const previewUrl = URL.createObjectURL(file);
			return {
				id: uuidv4(),
				fileName: file.name,
				filePath: null,
				contentType: file.type,
				fileSize: file.size,
				uploadPending: true,
				previewUrl,
				metadata: getDefaultMetadata(fileServiceType, file.type),
				fileServiceType
			};
		});

		const withTemps = maxFiles === 1 ? tempFiles : [...files, ...tempFiles];
		setValue(fieldName, withTemps, { shouldDirty: true });

		try {
			const uploadedFiles = await uploadFiles(selectedFiles, fileServiceType);
			const uploadedList = Array.isArray(uploadedFiles) ? uploadedFiles : [uploadedFiles];

			const currentFiles = getValues(fieldName) || [];
			const updatedFiles = currentFiles.map((file) => {
				if (!file.uploadPending) return file;

				const uploadedFile = uploadedList.find((uploaded) =>
					uploaded.fileName?.includes(file.fileName.split('.')[0])
				);

				if (!uploadedFile) return file;

				let metadata = file.metadata;
				if (uploadedFile.metadata) {
					try {
						metadata =
							typeof uploadedFile.metadata === 'string'
								? JSON.parse(uploadedFile.metadata)
								: uploadedFile.metadata;
					} catch (err) {
						console.error('Error parsing metadata:', err);
					}
				}

				const next = {
					...file,
					id: uploadedFile.id,
					filePath: uploadedFile.filePath,
					fileExtension: uploadedFile.fileExtension,
					uploadPending: false,
					metadata
				};
				delete next.previewUrl;
				return next;
			});

			setValue(fieldName, updatedFiles, { shouldDirty: true });
			syncPath(updatedFiles);
		} catch (error) {
			console.error('Upload error:', error);
			setUploadError('خطا در آپلود فایل‌ها. لطفاً مجدداً تلاش کنید.');

			const currentFiles = getValues(fieldName) || [];
			const updatedFiles = currentFiles.map((file) => {
				if (file.uploadPending) {
					return {
						...file,
						uploadPending: false,
						uploadError: true
					};
				}
				return file;
			});
			setValue(fieldName, updatedFiles, { shouldDirty: true });
		} finally {
			setIsLoading(false);
			e.target.value = null;
		}
	};

	const handleRemoveFile = async (fileToRemove) => {
		const newFiles = files.filter((file) => file.id !== fileToRemove.id);
		setValue(fieldName, newFiles, { shouldDirty: true });
		syncPath(newFiles);

		if (fileToRemove.id && !fileToRemove.uploadPending && !fileToRemove.uploadError && serviceId) {
			// try {
			// 	await axios.delete(`/service/${serviceId}/file/${fileToRemove.id}`);
			// } catch (error) {
			// 	console.error('Error deleting file:', error);
			// }
		}

		if (fileToRemove.previewUrl && fileToRemove.previewUrl.startsWith('blob:')) {
			URL.revokeObjectURL(fileToRemove.previewUrl);
		}
	};

	const handleMetadataChange = (file, newMetadata) => {
		const updatedFiles = files.map((f) => (f.id === file.id ? { ...f, metadata: newMetadata } : f));
		setValue(fieldName, updatedFiles, { shouldDirty: true });
	};

	useEffect(() => {
		return () => {
			files.forEach((file) => {
				if (file.previewUrl && file.previewUrl.startsWith('blob:')) {
					URL.revokeObjectURL(file.previewUrl);
				}
			});
		};
	}, [files]);

	function formatFileSizeDisplay(bytes) {
		if (!bytes) return '';
		if (bytes >= 1024 * 1024 * 1024) {
			return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
		}
		if (bytes >= 1024 * 1024) {
			return `${(bytes / (1024 * 1024)).toFixed(0)} MB`;
		}
		if (bytes >= 1024) {
			return `${(bytes / 1024).toFixed(0)} KB`;
		}
		return `${bytes} B`;
	}

	return (
		<Paper component={motion.div} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-24 mb-24">
			<Box className="flex justify-between items-center mb-16 flex-wrap gap-12">
				<Box className="flex items-center gap-8 flex-wrap">
					<Typography variant="h6" className="font-bold">
						{title || getFileServiceTypeDisplayName(fileServiceType)}
					</Typography>

					{isConfigAvailable && (
						<Box className="flex items-center gap-4 flex-wrap">
							{validationConfig.maxFileSize && (
								<Tooltip title="حداکثر حجم هر فایل">
									<Chip
										size="small"
										variant="outlined"
										color="info"
										label={`حداکثر ${formatFileSizeDisplay(validationConfig.maxFileSize)}`}
										icon={<FuseSvgIcon size={14}>heroicons-outline:information-circle</FuseSvgIcon>}
									/>
								</Tooltip>
							)}
							{validationConfig.allowedExtensions && validationConfig.allowedExtensions.length > 0 && (
								<Tooltip title="فرمت‌های مجاز">
									<Chip
										size="small"
										variant="outlined"
										color="info"
										label={validationConfig.allowedExtensions.join(', ')}
										icon={<FuseSvgIcon size={14}>heroicons-outline:document</FuseSvgIcon>}
									/>
								</Tooltip>
							)}
						</Box>
					)}
				</Box>

				<Button
					variant="contained"
					color="secondary"
					disabled={isLoading || files.length >= effectiveMaxFiles}
					startIcon={<FuseSvgIcon>heroicons-outline:upload</FuseSvgIcon>}
					component="label"
				>
					آپلود فایل
					<input
						type="file"
						multiple={effectiveMaxFiles > 1}
						hidden
						accept={effectiveAllowedTypes}
						onChange={handleAddFiles}
						disabled={isLoading || files.length >= effectiveMaxFiles}
						onClick={(e) => {
							e.target.value = null;
						}}
					/>
				</Button>
			</Box>

			{description && (
				<Typography variant="body2" className="mb-16 text-gray-600">
					{description}
				</Typography>
			)}

			{acceptMessage && (
				<Typography variant="caption" color="text.secondary" className="block mb-16">
					{acceptMessage}
				</Typography>
			)}

			{uploadError && (
				<Alert severity="error" className="mb-16" onClose={() => setUploadError(null)}>
					{uploadError}
				</Alert>
			)}

			{validationErrors.length > 0 && (
				<Alert severity="warning" className="mb-16" onClose={() => setValidationErrors([])}>
					<Typography variant="body2" className="font-bold mb-4">
						خطای اعتبارسنجی فایل‌ها:
					</Typography>
					<ul className="list-disc list-inside m-0 p-0">
						{validationErrors.map((err, index) => (
							<li key={index}>{err}</li>
						))}
					</ul>
				</Alert>
			)}

			{isLoading && (
				<Box className="flex justify-center my-24">
					<CircularProgress />
				</Box>
			)}

			{!isLoading && files.length === 0 && (
				<Box className="flex flex-col items-center justify-center py-32 border border-dashed rounded-12">
					<FuseSvgIcon size={48} className="mb-12 opacity-40">
						heroicons-outline:photograph
					</FuseSvgIcon>
					<Typography color="text.secondary">هنوز فایلی آپلود نشده است</Typography>
				</Box>
			)}

			{files.length > 0 && (
				<Grid container spacing={2}>
					{files.map((file, index) => (
						<Grid item xs={12} sm={6} md={4} lg={3} key={file.id || index}>
							<FileCard
								file={file}
								index={index}
								onRemove={handleRemoveFile}
								onMetadataChange={handleMetadataChange}
								onPreview={() => setLightboxIndex(index)}
								showMetadata
							/>
						</Grid>
					))}
				</Grid>
			)}

			{lightboxIndex >= 0 && (
				<Lightbox
					open={lightboxIndex >= 0}
					close={() => setLightboxIndex(-1)}
					index={lightboxIndex}
					slides={slides}
					plugins={[Video]}
				/>
			)}
		</Paper>
	);
}

export default ServiceFileSection;
