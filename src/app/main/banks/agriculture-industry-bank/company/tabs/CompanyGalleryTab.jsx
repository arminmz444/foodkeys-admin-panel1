import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { Typography, Alert, Box, CircularProgress } from '@mui/material';
import axios from 'axios';
import { motion } from 'framer-motion';
import FileSection from './components/FileSection';

function CompanyGalleryTab() {
  const methods = useFormContext();
  const { setValue } = methods;
  const routeParams = useParams();
  const { companyId } = routeParams;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Fetch gallery files when component mounts
  useEffect(() => {
    // Skip if we're creating a new company
    if (!companyId || companyId === 'new') return;
    
    const fetchGalleryFiles = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await axios.get(`/company/${companyId}/gallery`);
        if (response.data && response.data.status === 'SUCCESS') {
          const galleryFiles = response.data.data || [];
          
          // Group files by their file service type
          const groupedFiles = galleryFiles.reduce((groups, file) => {
            const serviceType = file.fileServiceType;
            if (!groups[serviceType]) {
              groups[serviceType] = [];
            }
            
            let metadata = {};
            if (file.metadata) {
              try {
                metadata = typeof file.metadata === 'string' 
                  ? JSON.parse(file.metadata) 
                  : file.metadata;
              } catch (e) {
                console.error('Error parsing file metadata:', e);
              }
            }
            
            groups[serviceType].push({
              id: file.id,
              fileName: file.fileName,
              filePath: file.filePath,
              contentType: file.contentType || `image/${file.fileExtension.substring(1)}`,
              fileSize: file.fileSize,
              metadata,
              fileServiceType: serviceType,
            });
            
            return groups;
          }, {});
          
          // Set values in form for each file type
          if (groupedFiles.COMPANY_LOGO) {
            setValue('companyLogoFiles', groupedFiles.COMPANY_LOGO);
          }
          
          if (groupedFiles.COMPANY_BACKGROUND_IMAGE) {
            setValue('companyBackgroundImages', groupedFiles.COMPANY_BACKGROUND_IMAGE);
          }
          
          if (groupedFiles.COMPANY_CERTIFICATE) {
            setValue('companyCertificates', groupedFiles.COMPANY_CERTIFICATE);
          }
          
          if (groupedFiles.COMPANY_GALLERY_DOCUMENT) {
            setValue('companyGalleryDocument', groupedFiles.COMPANY_GALLERY_DOCUMENT);
          }
          
          if (groupedFiles.COMPANY_GALLERY_PRODUCT) {
            setValue('companyGalleryProduct', groupedFiles.COMPANY_GALLERY_PRODUCT);
          }
          
          if (groupedFiles.COMPANY_GALLERY_CONTACT) {
            setValue('companyGalleryContact', groupedFiles.COMPANY_GALLERY_CONTACT);
          }
          
          if (groupedFiles.COMPANY_GALLERY_CATALOG) {
            setValue('companyGalleryCatalog', groupedFiles.COMPANY_GALLERY_CATALOG);
          }
          
          if (groupedFiles.COMPANY_GALLERY_SLIDER) {
            setValue('companyGallerySlider', groupedFiles.COMPANY_GALLERY_SLIDER);
          }
          
          if (groupedFiles.COMPANY_GALLERY_VIDEO) {
            setValue('companyGalleryVideo', groupedFiles.COMPANY_GALLERY_VIDEO);
          }
          
          if (groupedFiles.COMPANY_GALLERY_GIF) {
            setValue('companyGalleryGif', groupedFiles.COMPANY_GALLERY_GIF);
          }
        }
      } catch (err) {
        console.error('Error fetching gallery files:', err);
        setError(err.response?.data?.message || 'خطا در بارگیری اطلاعات گالری');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchGalleryFiles();
  }, [companyId, setValue]);

  if (isLoading && companyId && companyId !== 'new') {
    return (
      <Box className="flex justify-center items-center p-24">
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
      <Typography variant="h4" className="mb-6 font-medium">
        مدیریت گالری و فایل‌های شرکت
      </Typography>
      
      <Alert severity="info" className="mb-6">
        در این بخش می‌توانید تصاویر، ویدیوها و اسناد مرتبط با شرکت را بارگذاری کنید.
        برای هر فایل امکان تعریف عنوان، توضیحات و سایر ویژگی‌ها وجود دارد.
      </Alert>
      
      <FileSection
        title="لوگو شرکت"
        fieldName="companyLogoFiles"
        fileServiceType="COMPANY_LOGO"
        maxFiles={2}
        allowedFileTypes="image/*"
        description="لوگوی اصلی شرکت را در این قسمت آپلود کنید. فرمت‌های PNG و SVG با پس‌زمینه شفاف توصیه می‌شود."
        acceptMessage="فقط فایل‌های تصویری مجاز هستند (حداکثر 2 فایل)"
        companyId={companyId}
      />
      
      <FileSection
        title="تصویر پس زمینه"
        fieldName="companyBackgroundImages"
        fileServiceType="COMPANY_BACKGROUND_IMAGE"
        maxFiles={1}
        allowedFileTypes="image/*"
        description="تصاویر پس‌زمینه برای نمایش در هدر پروفایل شرکت استفاده می‌شوند."
        acceptMessage="فقط فایل‌های تصویری با کیفیت بالا مجاز هستند (حداکثر 1 فایل)"
        companyId={companyId}
      />
      
      <FileSection
        title="گواهی‌ها و مجوزها"
        fieldName="companyCertificates"
        fileServiceType="COMPANY_CERTIFICATE"
        maxFiles={10}
        allowedFileTypes="image/*,application/pdf"
        description="گواهینامه‌ها، استانداردها و مجوزهای کسب و کار خود را در این قسمت آپلود کنید."
        acceptMessage="فایل‌های تصویری و PDF مجاز هستند (حداکثر 10 فایل)"
        companyId={companyId}
      />
      
      <FileSection
        title="اسناد"
        fieldName="companyGalleryDocument"
        fileServiceType="COMPANY_GALLERY_DOCUMENT"
        maxFiles={20}
        allowedFileTypes="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain"
        description="اسناد مرتبط با شرکت مانند کاتالوگ‌ها، بروشورها و گزارش‌ها را در این قسمت آپلود کنید."
        acceptMessage="فرمت‌های PDF، Word و Excel مجاز هستند (حداکثر 20 فایل)"
        companyId={companyId}
      />
      
      <FileSection
        title="گالری محصولات"
        fieldName="companyGalleryProduct"
        fileServiceType="COMPANY_GALLERY_PRODUCT"
        maxFiles={50}
        allowedFileTypes="image/*,video/*"
        description="تصاویر و ویدیوهای محصولات و خدمات شرکت را در این قسمت آپلود کنید."
        acceptMessage="فایل‌های تصویری و ویدیویی مجاز هستند (حداکثر 50 فایل)"
        companyId={companyId}
      />
      
      <FileSection
        title="گالری مخاطبین"
        fieldName="companyGalleryContact"
        fileServiceType="COMPANY_GALLERY_CONTACT"
        maxFiles={20}
        allowedFileTypes="image/*"
        description="تصاویر پرسنل، مدیران و افراد کلیدی شرکت را در این قسمت آپلود کنید."
        acceptMessage="فقط فایل‌های تصویری مجاز هستند (حداکثر 20 فایل)"
        companyId={companyId}
      />
      
      <FileSection
        title="گالری کاتالوگ"
        fieldName="companyGalleryCatalog"
        fileServiceType="COMPANY_GALLERY_CATALOG"
        maxFiles={10}
        allowedFileTypes="image/*,application/pdf"
        description="کاتالوگ‌های محصولات و خدمات شرکت را در این قسمت آپلود کنید."
        acceptMessage="فایل‌های تصویری و PDF مجاز هستند (حداکثر 10 فایل)"
        companyId={companyId}
      />
      
      <FileSection
        title="گالری اسلایدر"
        fieldName="companyGallerySlider"
        fileServiceType="COMPANY_GALLERY_SLIDER"
        maxFiles={10}
        allowedFileTypes="image/*"
        description="تصاویر مورد نظر برای نمایش در اسلایدر اصلی صفحه شرکت را در این قسمت آپلود کنید."
        acceptMessage="فقط فایل‌های تصویری با کیفیت بالا و ابعاد مناسب مجاز هستند (حداکثر 10 فایل)"
        companyId={companyId}
      />
      
      <FileSection
        title="گالری ویدیو"
        fieldName="companyGalleryVideo"
        fileServiceType="COMPANY_GALLERY_VIDEO"
        maxFiles={3}
        allowedFileTypes="video/mp4,video/webm,video/ogg"
        description="ویدیوهای کوتاه معرفی شرکت را آپلود کنید. حداکثر ۳ ویدیوی کوتاه و کم‌حجم مجاز است."
        acceptMessage="فقط فایل‌های ویدیویی (MP4, WebM, OGG) مجاز هستند (حداکثر 3 فایل)"
        companyId={companyId}
      />
      
      <FileSection
        title="تیزر متحرک (GIF)"
        fieldName="companyGalleryGif"
        fileServiceType="COMPANY_GALLERY_GIF"
        maxFiles={1}
        allowedFileTypes="image/gif"
        description="یک تصویر متحرک (GIF) کوتاه به عنوان تیزر تبلیغاتی شرکت آپلود کنید."
        acceptMessage="فقط فایل‌های GIF مجاز هستند (حداکثر 1 فایل)"
        companyId={companyId}
      />
    </motion.div>
  );
}

export default CompanyGalleryTab;