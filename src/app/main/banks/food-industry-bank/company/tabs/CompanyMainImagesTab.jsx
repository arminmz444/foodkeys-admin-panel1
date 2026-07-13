import { lighten, styled } from '@mui/material/styles';
import { useEffect, useRef, useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import axios from 'axios';
import { getServerFile } from 'src/utils/string-utils';

const Root = styled('div')(({ theme }) => ({
  '& .companyLogoContainer': {
    width: '100%',
    marginBottom: theme.spacing(4),
  },
  '& .logoUploadArea': {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    padding: theme.spacing(3),
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[1],
  },
  '& .logoPreviewContainer': {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    minHeight: 250,
    borderRadius: theme.shape.borderRadius,
    backgroundColor: lighten(theme.palette.background.default, theme.palette.mode === 'light' ? 0.4 : 0.02),
    border: `1px dashed ${theme.palette.divider}`,
    marginBottom: theme.spacing(2),
    position: 'relative',
    cursor: 'pointer',
  },
  '& .logoPreview': {
    maxWidth: '100%',
    maxHeight: 250,
    objectFit: 'contain',
    borderRadius: theme.shape.borderRadius,
  },
  '& .logoButtons': {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: theme.spacing(2),
    marginTop: theme.spacing(2),
  },
  '& .uploadInstructions': {
    textAlign: 'center',
    color: theme.palette.text.secondary,
    marginTop: theme.spacing(1),
  },
}));

function CompanyMainImagesTab() {
  const { control, setValue, watch } = useFormContext();
  const [previewLogo, setPreviewLogo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  const logo = watch('logo');
  const companyId = watch('id');

  useEffect(() => {
    if (logo) {
      setPreviewLogo(getServerFile(logo));
    } else {
      setPreviewLogo(null);
    }
  }, [logo]);

  const fetchExistingLogo = async () => {
    if (!companyId) return null;

    try {
      const response = await axios.get(`/company/${companyId}/logo`);
      if (response.data?.status === 'SUCCESS' && response.data.data) {
        return response.data.data.filePath;
      }
    } catch (error) {
      return null;
    }

    return null;
  };

  const uploadLogoFile = async (file) => {
    if (!file || !companyId) return;

    setIsLoading(true);
    const previewUrl = URL.createObjectURL(file);
    setPreviewLogo(previewUrl);

    try {
      const formData = new FormData();
      formData.append('files', file);
      formData.append('fileServiceType', 'COMPANY_LOGO');
      formData.append('companyId', companyId);

      const response = await axios.post('/file', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data?.status === 'SUCCESS' && response.data.data) {
        const uploadedFiles = Array.isArray(response.data.data) ? response.data.data : [response.data.data];
        const uploadedFile = uploadedFiles[0];
        setValue('logo', uploadedFile.filePath);
        setPreviewLogo(getServerFile(uploadedFile.filePath));
      } else {
        throw new Error('Invalid server response format');
      }
    } catch (error) {
      if (logo) {
        setPreviewLogo(getServerFile(logo));
      } else {
        setPreviewLogo(null);
      }
    } finally {
      URL.revokeObjectURL(previewUrl);
      setIsLoading(false);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadLogoFile(file);
    }
    event.target.value = null;
  };

  const handleRemoveLogo = async () => {
    if (!companyId) {
      setValue('logo', null);
      setPreviewLogo(null);
      return;
    }

    setIsLoading(true);
    try {
      await axios.delete(`/company/${companyId}/logo`);
      setValue('logo', null);
      setPreviewLogo(null);
    } catch (error) {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  const openFilePicker = () => {
    if (!isLoading) {
      fileInputRef.current?.click();
    }
  };

  useEffect(() => {
    if (companyId && !logo) {
      setIsLoading(true);
      fetchExistingLogo().then((existingLogo) => {
        if (existingLogo) {
          setValue('logo', existingLogo);
          setPreviewLogo(getServerFile(existingLogo));
        }
        setIsLoading(false);
      });
    }
  }, [companyId, setValue, logo]);

  return (
    <Root>
      <Typography variant="h6" className="mb-16">
        لوگو و عکس پس‌زمینه شرکت
      </Typography>

      <div className="companyLogoContainer">
        <Paper className="logoUploadArea">
          <Typography variant="subtitle1" className="mb-8">
            لوگوی شرکت
          </Typography>

          <Controller
            name="logo"
            control={control}
            render={() => (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  hidden
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={handleFileChange}
                />

                <div
                  className={`logoPreviewContainer ${isLoading ? 'opacity-50' : ''}`}
                  onClick={openFilePicker}
                  onKeyDown={(event) => {
                    if (!isLoading && (event.key === 'Enter' || event.key === ' ')) {
                      openFilePicker();
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label="آپلود لوگو"
                >
                  {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 z-10">
                      <FuseSvgIcon size={32} color="primary" className="animate-spin">
                        heroicons-outline:refresh
                      </FuseSvgIcon>
                    </div>
                  )}

                  {previewLogo ? (
                    <img src={previewLogo} alt="لوگوی شرکت" className="logoPreview" />
                  ) : (
                    <div className="flex flex-col items-center justify-center">
                      <FuseSvgIcon size={64} color="action">
                        heroicons-outline:photograph
                      </FuseSvgIcon>
                      <Typography variant="body2" className="uploadInstructions mt-16">
                        برای آپلود لوگوی شرکت کلیک کنید
                      </Typography>
                      <Typography variant="caption" className="mt-8" color="textSecondary">
                        فرمت‌های پشتیبانی شده: PNG، JPG، JPEG، WEBP
                      </Typography>
                    </div>
                  )}
                </div>

                <div className="logoButtons">
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={openFilePicker}
                    startIcon={
                      <FuseSvgIcon>{isLoading ? 'heroicons-outline:refresh' : 'heroicons-outline:upload'}</FuseSvgIcon>
                    }
                    disabled={isLoading}
                    className={isLoading ? 'animate-pulse' : ''}
                  >
                    {previewLogo ? 'تغییر لوگو' : 'آپلود لوگو'}
                  </Button>

                  {previewLogo && (
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={handleRemoveLogo}
                      startIcon={<FuseSvgIcon>heroicons-outline:trash</FuseSvgIcon>}
                      disabled={isLoading}
                    >
                      حذف لوگو
                    </Button>
                  )}
                </div>
              </>
            )}
          />
        </Paper>
      </div>
    </Root>
  );
}

export default CompanyMainImagesTab;
