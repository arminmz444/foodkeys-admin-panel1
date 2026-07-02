import { useCallback, useEffect, useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  Paper,
  Typography,
} from '@mui/material';
import { lighten, styled } from '@mui/material/styles';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { getServerFile } from '@/utils/string-utils';
import useFileServiceTypeValidation from '@/app/main/shared-hooks/useFileServiceTypeValidation.js';

const getLogoDefaultMetadata = () => ({
  title: '',
  altText: '',
  description: '',
});

const FILE_SERVICE_TYPE = 'COMPANY_LOGO';
const FIELD_NAME = 'companyLogoFiles';

const LogoDropzone = styled(Paper)(({ theme }) => ({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  maxWidth: 320,
  minHeight: 240,
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  border: `2px dashed ${theme.palette.divider}`,
  backgroundColor: lighten(
    theme.palette.background.default,
    theme.palette.mode === 'light' ? 0.4 : 0.02
  ),
  cursor: 'pointer',
  transition: theme.transitions.create(['border-color', 'box-shadow'], {
    duration: theme.transitions.duration.short,
  }),
  '&:hover': {
    borderColor: theme.palette.primary.main,
    boxShadow: theme.shadows[2],
  },
  '&.drag-active': {
    borderColor: theme.palette.primary.main,
    backgroundColor: lighten(theme.palette.primary.main, 0.9),
  },
  '& .logo-preview': {
    maxWidth: '100%',
    maxHeight: 200,
    objectFit: 'contain',
    borderRadius: theme.shape.borderRadius,
  },
}));

function CompanyLogoUpload({ companyId }) {
  const { watch, setValue, getValues } = useFormContext();
  const logoFiles = watch(FIELD_NAME) || [];
  const logoPath = watch('logo');
  const fileInputRef = useRef(null);

  const [isLoading, setIsLoading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const [isDragActive, setIsDragActive] = useState(false);

  const currentFile = logoFiles[0] || null;

  const {
    config: validationConfig,
    isConfigAvailable,
    validateFiles,
  } = useFileServiceTypeValidation(FILE_SERVICE_TYPE);

  const effectiveAllowedTypes =
    isConfigAvailable &&
    validationConfig.allowedMimeTypes &&
    validationConfig.allowedMimeTypes.length > 0
      ? validationConfig.allowedMimeTypes.join(',')
      : 'image/png,image/jpeg,image/jpg,image/webp,image/svg+xml';

  const getPreviewUrl = useCallback(() => {
    if (currentFile?.filePath) {
      return getServerFile(currentFile.filePath);
    }
    if (currentFile?.previewUrl) {
      return currentFile.previewUrl;
    }
    if (logoPath) {
      return getServerFile(logoPath);
    }
    return null;
  }, [currentFile, logoPath]);

  const previewUrl = getPreviewUrl();

  const syncLogoField = (file) => {
    setValue('logo', file?.filePath || '', { shouldDirty: true });
  };

  const uploadFile = async (selectedFile) => {
    if (!selectedFile || !companyId || companyId === 'new') {
      setUploadError('برای آپلود لوگو ابتدا شرکت را ذخیره کنید.');
      return;
    }

    setValidationErrors([]);
    setUploadError(null);

    if (isConfigAvailable) {
      const result = validateFiles([selectedFile], 0);
      if (!result.valid) {
        setValidationErrors(result.errors);
        return;
      }
    }

    const previousFile = getValues(FIELD_NAME)?.[0];
    const previewBlobUrl = URL.createObjectURL(selectedFile);
    const tempFile = {
      id: uuidv4(),
      fileName: selectedFile.name,
      filePath: null,
      contentType: selectedFile.type,
      fileSize: selectedFile.size,
      uploadPending: true,
      previewUrl: previewBlobUrl,
      metadata: getLogoDefaultMetadata(),
      fileServiceType: FILE_SERVICE_TYPE,
    };

    setValue(FIELD_NAME, [tempFile], { shouldDirty: true });
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('files', selectedFile);
      formData.append('fileServiceType', FILE_SERVICE_TYPE);
      formData.append('companyId', companyId);

      const response = await axios.post('/file', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data?.status === 'SUCCESS' && response.data.data) {
        const uploadedFiles = Array.isArray(response.data.data)
          ? response.data.data
          : [response.data.data];
        const uploadedFile = uploadedFiles[0];

        let metadata = tempFile.metadata;
        if (uploadedFile.metadata) {
          try {
            metadata =
              typeof uploadedFile.metadata === 'string'
                ? JSON.parse(uploadedFile.metadata)
                : uploadedFile.metadata;
          } catch (e) {
            console.error('Error parsing metadata:', e);
          }
        }

        const updatedFile = {
          ...tempFile,
          id: uploadedFile.id,
          filePath: uploadedFile.filePath,
          fileExtension: uploadedFile.fileExtension,
          uploadPending: false,
          metadata,
        };
        delete updatedFile.previewUrl;

        setValue(FIELD_NAME, [updatedFile], { shouldDirty: true });
        syncLogoField(updatedFile);
        URL.revokeObjectURL(previewBlobUrl);

        if (
          previousFile?.id &&
          !previousFile.uploadPending &&
          previousFile.id !== uploadedFile.id
        ) {
          try {
            await axios.delete(`/${companyId}/gallery/${previousFile.id}`);
          } catch (error) {
            console.error('Error deleting previous logo:', error);
          }
        }
      } else {
        throw new Error('Invalid server response format');
      }
    } catch (error) {
      console.error('Logo upload error:', error);
      setUploadError('خطا در آپلود لوگو. لطفاً مجدداً تلاش کنید.');
      URL.revokeObjectURL(previewBlobUrl);
      setValue(
        FIELD_NAME,
        previousFile ? [previousFile] : [],
        { shouldDirty: true }
      );
      syncLogoField(previousFile || null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = async (event) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      await uploadFile(selectedFile);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = async (event) => {
    event.preventDefault();
    setIsDragActive(false);
    const selectedFile = event.dataTransfer.files?.[0];
    if (selectedFile) {
      await uploadFile(selectedFile);
    }
  };

  const handleRemove = async () => {
    const fileToRemove = getValues(FIELD_NAME)?.[0];

    setValue(FIELD_NAME, [], { shouldDirty: true });
    syncLogoField(null);

    if (
      fileToRemove?.id &&
      !fileToRemove.uploadPending &&
      !fileToRemove.uploadError &&
      companyId &&
      companyId !== 'new'
    ) {
      try {
        await axios.delete(`/${companyId}/gallery/${fileToRemove.id}`);
      } catch (error) {
        console.error('Error deleting logo:', error);
      }
    }

    if (fileToRemove?.previewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(fileToRemove.previewUrl);
    }
  };

  useEffect(() => {
    if (currentFile?.filePath && currentFile.filePath !== logoPath) {
      syncLogoField(currentFile);
    }
  }, [currentFile?.filePath, logoPath]);

  useEffect(() => {
    return () => {
      if (currentFile?.previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(currentFile.previewUrl);
      }
    };
  }, [currentFile?.previewUrl]);

  return (
    <Box className="flex flex-col items-center mb-32">
      <Typography variant="h6" className="mb-12 font-bold">
        لوگوی شرکت
      </Typography>

      <Typography
        variant="body2"
        color="text.secondary"
        className="mb-16 text-center max-w-md"
      >
        لوگوی اصلی شرکت را در این قسمت آپلود کنید. فرمت‌های PNG و SVG با
        پس‌زمینه شفاف توصیه می‌شود.
      </Typography>

      {uploadError && (
        <Alert
          severity="error"
          className="mb-12 w-full max-w-md"
          onClose={() => setUploadError(null)}
        >
          {uploadError}
        </Alert>
      )}

      {validationErrors.length > 0 && (
        <Alert
          severity="warning"
          className="mb-12 w-full max-w-md"
          onClose={() => setValidationErrors([])}
        >
          <ul className="list-disc list-inside m-0 p-0">
            {validationErrors.map((err, idx) => (
              <li key={idx}>
                <Typography variant="body2" component="span">
                  {err}
                </Typography>
              </li>
            ))}
          </ul>
        </Alert>
      )}

      <LogoDropzone
        className={isDragActive ? 'drag-active' : ''}
        elevation={0}
        onClick={() => !isLoading && fileInputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragActive(true);
        }}
        onDragLeave={() => setIsDragActive(false)}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          hidden
          accept={effectiveAllowedTypes}
          onChange={handleFileSelect}
          disabled={isLoading}
        />

        {isLoading && (
          <Box className="absolute inset-0 flex items-center justify-center bg-black/10 z-10 rounded">
            <CircularProgress />
          </Box>
        )}

        {previewUrl ? (
          <>
            <img src={previewUrl} alt="لوگوی شرکت" className="logo-preview" />
            <Typography variant="caption" color="text.secondary" className="mt-8">
              برای تغییر لوگو، فایل جدید را بکشید یا کلیک کنید
            </Typography>
          </>
        ) : (
          <Box className="flex flex-col items-center text-center">
            <FuseSvgIcon size={56} color="action">
              heroicons-outline:photograph
            </FuseSvgIcon>
            <Typography variant="body2" color="text.secondary" className="mt-12">
              فایل را اینجا بکشید و رها کنید
            </Typography>
            <Typography variant="caption" color="text.secondary" className="mt-4">
              یا برای انتخاب فایل کلیک کنید
            </Typography>
            <Typography variant="caption" color="text.disabled" className="mt-8">
              PNG، JPG، JPEG، WEBP، SVG
            </Typography>
          </Box>
        )}
      </LogoDropzone>

      {previewUrl && (
        <Box className="flex gap-8 mt-12">
          <Button
            variant="outlined"
            color="primary"
            size="small"
            onClick={(event) => {
              event.stopPropagation();
              fileInputRef.current?.click();
            }}
            disabled={isLoading}
            startIcon={<FuseSvgIcon size={18}>heroicons-outline:upload</FuseSvgIcon>}
          >
            تغییر لوگو
          </Button>
          <IconButton
            color="error"
            onClick={(event) => {
              event.stopPropagation();
              handleRemove();
            }}
            disabled={isLoading}
            size="small"
          >
            <FuseSvgIcon size={20}>heroicons-outline:trash</FuseSvgIcon>
          </IconButton>
        </Box>
      )}
    </Box>
  );
}

export default CompanyLogoUpload;
