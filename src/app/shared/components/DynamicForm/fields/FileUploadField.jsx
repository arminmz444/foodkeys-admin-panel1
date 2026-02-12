import { useState, useRef } from 'react';
import { Controller } from 'react-hook-form';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import { MdUploadFile, MdDelete, MdDownload, MdImage } from 'react-icons/md';
import { useUploadWebsiteConfigFileMutation } from '@/app/main/apps/settings/api/websiteConfigApi';
import { getServerFile } from 'src/utils/string-utils';

/**
 * File Upload Field Component
 * 
 * Handles file uploads for URI format fields in dynamic forms.
 * Shows preview for images and download button for other files.
 */
function FileUploadField({ 
    field: fieldDef, 
    control, 
    error,
    disabled = false,
    configSection, // The config section/name for the upload endpoint
    setValue,
}) {
    const { 
        key, 
        path, 
        title, 
        description, 
        isRequired,
    } = fieldDef;

    const name = path || key;
    const [uploadFile, { isLoading: uploading }] = useUploadWebsiteConfigFileMutation();
    const [previewUrl, setPreviewUrl] = useState(null);
    const onChangeRef = useRef(null);

    // Determine if file is an image based on URL
    const isImage = (url) => {
        if (!url) return false;
        const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp'];
        const extension = url.split('.').pop()?.toLowerCase();
        return imageExtensions.includes(extension);
    };

    // Get file name from URL
    const getFileName = (url) => {
        if (!url) return '';
        try {
            const urlObj = new URL(url, window.location.origin);
            const pathname = urlObj.pathname;
            return pathname.split('/').pop() || 'file';
        } catch {
            return url.split('/').pop() || 'file';
        }
    };

    // Handle file selection and upload
    const handleFileChange = async (event) => {
        const file = event.target.files?.[0];
        if (!file || !configSection) return;
        
        // Ensure we have a way to update the form (either setValue or onChangeRef)
        if (!setValue && !onChangeRef.current) return;

        try {
            // Create preview for images
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreviewUrl(reader.result);
                };
                reader.readAsDataURL(file);
            }

            // Upload file
            const response = await uploadFile({ 
                section: configSection, 
                file 
            }).unwrap();

            // Update form with file path from response
            const filePath =
                response?.data?.filePath ||
                response?.filePath ||
                response?.data?.data?.filePath;
            
            if (filePath) {
                // Keep raw filePath in form data; use absolute URL only for preview/download.
                // Using setValue with shouldDirty ensures useWatch detects the change
                if (setValue) {
                    setValue(name, filePath, {
                        shouldDirty: true,
                        shouldTouch: true,
                        shouldValidate: true,
                    });
                } else if (onChangeRef.current) {
                    onChangeRef.current(filePath);
                }
                
                setPreviewUrl(null); // Clear local preview
            }
        } catch (err) {
            console.error('File upload error:', err);
            setPreviewUrl(null);
        }
    };

    // Handle file removal
    const handleRemove = () => {
        // Update form value - using setValue with shouldDirty ensures useWatch detects the change
        if (setValue) {
            setValue(name, '', {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: true,
            });
        } else if (onChangeRef.current) {
            onChangeRef.current('');
        }
        
        setPreviewUrl(null);
    };

    return (
        <Controller
            control={control}
            name={name}
            render={({ field: { onChange, value } }) => {
                // Store onChange in ref for async handlers
                onChangeRef.current = onChange;
            
                const currentUrl = value || '';
                const displayUrl = getServerFile(currentUrl);
                // const serverUrl = import.meta.env.VITE_API_URL || '';
                // const displayUrl =
                    // currentUrl && !currentUrl.startsWith('http')
                        // ? `${serverUrl}${currentUrl}`
                        // : currentUrl;
                const hasFile = !!currentUrl || !!previewUrl;
                const fileName = getFileName(displayUrl);
                const isImageFile = isImage(displayUrl);

                return (
                    <Box className="w-full">
                        <Typography className="text-sm font-medium mb-8">
                            {title}
                            {isRequired && <span className="text-red-500 mr-4">*</span>}
                        </Typography>
                        
                        {description && (
                            <Typography variant="caption" color="text.secondary" className="block mb-8">
                                {description}
                            </Typography>
                        )}

                        <Paper 
                            variant="outlined" 
                            className={`p-16 ${error ? 'border-red-500' : ''}`}
                        >
                            {hasFile ? (
                                <Box className="space-y-12">
                                    {/* Preview or file info */}
                                    {(isImageFile || previewUrl) ? (
                                        <Box className="relative">
                                            <img 
                                                src={previewUrl || displayUrl} 
                                                alt={title}
                                                className="w-full max-w-md h-auto rounded-lg border object-cover"
                                                style={{ maxHeight: '300px' }}
                                            />
                                            {uploading && (
                                                <Box className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                                                    <CircularProgress size={40} className="text-white" />
                                                </Box>
                                            )}
                                        </Box>
                                    ) : (
                                        <Box className="flex items-center gap-12 p-12 bg-gray-50 dark:bg-gray-800 rounded">
                                            <MdUploadFile size={32} className="text-gray-500" />
                                            <Box className="flex-1">
                                                <Typography className="font-medium">{fileName}</Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    فایل آپلود شده
                                                </Typography>
                                            </Box>
                                        </Box>
                                    )}

                                    {/* Actions */}
                                    <Box className="flex gap-8">
                                        {displayUrl && !uploading && (
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                startIcon={isImageFile ? <MdImage /> : <MdDownload />}
                                                href={displayUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                {isImageFile ? 'مشاهده' : 'دانلود'}
                                            </Button>
                                        )}
                                        
                                        {!disabled && !uploading && (
                                            <>
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    component="label"
                                                    startIcon={<MdUploadFile />}
                                                >
                                                    تغییر فایل
                                                    <input
                                                        type="file"
                                                        hidden
                                                        onChange={handleFileChange}
                                                        disabled={disabled || uploading}
                                                    />
                                                </Button>
                                                
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={handleRemove}
                                                >
                                                    <MdDelete />
                                                </IconButton>
                                            </>
                                        )}
                                    </Box>
                                </Box>
                            ) : (
                                <Box className="flex flex-col items-center justify-center py-32">
                                    <MdUploadFile size={48} className="text-gray-400 mb-12" />
                                    <Typography color="text.secondary" className="mb-16 text-center">
                                        {uploading ? 'در حال آپلود...' : 'هیچ فایلی انتخاب نشده است'}
                                    </Typography>
                                    
                                    {!disabled && (
                                        <Button
                                            variant="contained"
                                            component="label"
                                            startIcon={uploading ? <CircularProgress size={16} /> : <MdUploadFile />}
                                            disabled={uploading}
                                        >
                                            {uploading ? 'در حال آپلود...' : 'انتخاب فایل'}
                                            <input
                                                type="file"
                                                hidden
                                                onChange={handleFileChange}
                                                disabled={disabled || uploading}
                                            />
                                        </Button>
                                    )}
                                </Box>
                            )}
                        </Paper>

                        {error && (
                            <Typography color="error" variant="caption" className="mt-4 block">
                                {error.message}
                            </Typography>
                        )}
                    </Box>
                );
            }}
        />
    );
}

export default FileUploadField;
