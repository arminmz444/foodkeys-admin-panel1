import { z } from 'zod';

export const fileTypes = {
  'image/jpeg': { 
    type: 'image', 
    extension: '.jpg', 
    label: 'تصویر JPEG' 
  },
  'image/png': { 
    type: 'image', 
    extension: '.png', 
    label: 'تصویر PNG'
  },
  'image/gif': { 
    type: 'image', 
    extension: '.gif', 
    label: 'تصویر GIF'
  },
  'image/webp': { 
    type: 'image', 
    extension: '.webp', 
    label: 'تصویر WEBP'
  },
  'image/avif': { 
    type: 'image', 
    extension: '.avif', 
    label: 'تصویر AVIF'
  },
  'image/svg+xml': { 
    type: 'image', 
    extension: '.svg', 
    label: 'تصویر SVG'
  },
  
  'video/mp4': { 
    type: 'video', 
    extension: '.mp4', 
    label: 'ویدیو MP4'
  },
  'video/webm': { 
    type: 'video', 
    extension: '.webm', 
    label: 'ویدیو WEBM'
  },
  'video/ogg': { 
    type: 'video', 
    extension: '.ogv', 
    label: 'ویدیو OGG'
  },
  'video/x-msvideo': { 
    type: 'video', 
    extension: '.avi', 
    label: 'ویدیو AVI'
  },
  
  // Documents
  'application/pdf': { 
    type: 'document', 
    extension: '.pdf', 
    label: 'سند PDF'
  },
  'application/msword': { 
    type: 'document', 
    extension: '.doc', 
    label: 'سند Word'
  },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { 
    type: 'document', 
    extension: '.docx', 
    label: 'سند Word'
  },
  'application/vnd.ms-excel': { 
    type: 'document', 
    extension: '.xls', 
    label: 'صفحه گسترده Excel'
  },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { 
    type: 'document', 
    extension: '.xlsx', 
    label: 'صفحه گسترده Excel'
  },
  'text/plain': { 
    type: 'document', 
    extension: '.txt', 
    label: 'سند متنی'
  },
};

export const getFileTypeInfo = (contentType) => {
  return fileTypes[contentType] || { 
    type: 'unknown', 
    extension: '', 
    label: 'فایل نامشخص' 
  };
};

export const isImageFile = (contentType) => {
  return contentType && contentType.startsWith('image/');
};

export const isVideoFile = (contentType) => {
  return contentType && contentType.startsWith('video/');
};

export const isDocumentFile = (contentType) => {
  const info = getFileTypeInfo(contentType);
  return info.type === 'document';
};

export const MAX_FILE_SIZE = 10 * 1024 * 1024; 

export const metadataSchemas = {
  base: z.object({
    title: z.string()
      .min(1, { message: 'عنوان الزامی است' })
      .max(100, { message: 'عنوان نمی‌تواند بیش از 100 کاراکتر باشد' })
      .refine(val => val.trim().length > 0, { message: 'عنوان نمی‌تواند خالی باشد' }),
    
    description: z.string()
      .max(500, { message: 'توضیحات نمی‌تواند بیش از 500 کاراکتر باشد' })
      .optional()
      .nullable(),
    
    altText: z.string()
      .max(200, { message: 'متن جایگزین نمی‌تواند بیش از 200 کاراکتر باشد' })
      .optional()
      .nullable(),
  }),
  
  image: z.object({
    title: z.string()
      .min(1, { message: 'عنوان تصویر الزامی است' })
      .max(100, { message: 'عنوان تصویر نمی‌تواند بیش از 100 کاراکتر باشد' }),
    
    altText: z.string()
      .min(1, { message: 'متن جایگزین تصویر الزامی است' })
      .max(200, { message: 'متن جایگزین نمی‌تواند بیش از 200 کاراکتر باشد' }),
    
    description: z.string()
      .max(500, { message: 'توضیحات تصویر نمی‌تواند بیش از 500 کاراکتر باشد' })
      .optional()
      .nullable(),
  }),
  
  video: z.object({
    title: z.string()
      .min(1, { message: 'عنوان ویدیو الزامی است' })
      .max(100, { message: 'عنوان ویدیو نمی‌تواند بیش از 100 کاراکتر باشد' }),
    
    description: z.string()
      .max(500, { message: 'توضیحات ویدیو نمی‌تواند بیش از 500 کاراکتر باشد' })
      .optional()
      .nullable(),
    
    altText: z.string()
      .max(200, { message: 'متن جایگزین نمی‌تواند بیش از 200 کاراکتر باشد' })
      .optional()
      .nullable(),
  }),
  
  // Document-specific schema
  document: z.object({
    title: z.string()
      .min(1, { message: 'عنوان سند الزامی است' })
      .max(100, { message: 'عنوان سند نمی‌تواند بیش از 100 کاراکتر باشد' }),
    
    description: z.string()
      .max(500, { message: 'توضیحات سند نمی‌تواند بیش از 500 کاراکتر باشد' })
      .optional()
      .nullable(),
  }),
  
  contact: z.object({
    firstName: z.string()
      .min(1, { message: 'نام الزامی است' })
      .max(50, { message: 'نام نمی‌تواند بیش از 50 کاراکتر باشد' }),
    
    lastName: z.string()
      .min(1, { message: 'نام خانوادگی الزامی است' })
      .max(50, { message: 'نام خانوادگی نمی‌تواند بیش از 50 کاراکتر باشد' }),
    
    phoneNumbers: z.array(z.string()
      .min(1, { message: 'شماره تلفن الزامی است' })
      .regex(/^[0-9+\-\s()]{7,20}$/, { message: 'فرمت شماره تلفن صحیح نیست' }))
      .min(1, { message: 'حداقل یک شماره تلفن الزامی است' })
      .max(3, { message: 'حداکثر سه شماره تلفن مجاز است' }),
    
    emails: z.array(z.string()
      .email({ message: 'فرمت ایمیل صحیح نیست' }))
      .min(1, { message: 'حداقل یک ایمیل الزامی است' })
      .max(3, { message: 'حداکثر سه ایمیل مجاز است' }),
    
    position: z.string()
      .max(100, { message: 'سمت نمی‌تواند بیش از 100 کاراکتر باشد' })
      .optional()
      .nullable(),
    
    description: z.string()
      .max(500, { message: 'توضیحات نمی‌تواند بیش از 500 کاراکتر باشد' })
      .optional()
      .nullable(),
  }),
};

export const getMetadataSchema = (fileServiceType, contentType) => {
  if (fileServiceType === 'COMPANY_GALLERY_CONTACT') {
    return metadataSchemas.contact;
  }
  
  if (isImageFile(contentType)) {
    return metadataSchemas.image;
  } else if (isVideoFile(contentType)) {
    return metadataSchemas.video;
  } else if (isDocumentFile(contentType)) {
    return metadataSchemas.document;
  }
  
  // Default schema
  return metadataSchemas.base;
};

export const getDefaultMetadata = (fileServiceType, contentType) => {
  if (fileServiceType === 'COMPANY_GALLERY_CONTACT') {
    return {
      firstName: '',
      lastName: '',
      phoneNumbers: [''],
      emails: [''],
      position: '',
      description: '',
    };
  }
  
  if (isImageFile(contentType)) {
    return {
      title: '',
      altText: '',
      description: '',
    };
  } else if (isVideoFile(contentType)) {
    return {
      title: '',
      description: '',
      altText: '',
    };
  } else if (isDocumentFile(contentType)) {
    return {
      title: '',
      description: '',
    };
  }
  
  return {
    title: '',
    description: '',
    altText: '',
  };
};

export const fileServiceTypeDisplayNames = {
  COMPANY_LOGO: 'لوگو شرکت',
  COMPANY_BACKGROUND_IMAGE: 'تصویر پس زمینه',
  COMPANY_CERTIFICATE: 'گواهی‌ها',
  COMPANY_GALLERY_DOCUMENT: 'اسناد',
  COMPANY_GALLERY_PRODUCT: 'محصولات',
  COMPANY_GALLERY_CONTACT: 'مخاطبین',
  COMPANY_GALLERY_CATALOG: 'کاتالوگ',
  COMPANY_GALLERY_SLIDER: 'اسلایدر',
  SERVICE_LOGO: 'لوگو سرویس',
  SERVICE_BACKGROUND_IMAGE: 'تصویر پس‌زمینه سرویس',
  SERVICE_GALLERY_SLIDER: 'اسلایدر سرویس',
  SERVICE_GALLERY_VIDEO: 'ویدیو سرویس',
};

export const getFileServiceTypeDisplayName = (fileServiceType) => {
  return fileServiceTypeDisplayNames[fileServiceType] || fileServiceType;
};

export const getMetadataFieldsConfig = (fileServiceType, contentType) => {
  if (fileServiceType === 'COMPANY_GALLERY_CONTACT') {
    return {
      firstName: { label: 'نام', required: true },
      lastName: { label: 'نام خانوادگی', required: true },
      phoneNumbers: { label: 'شماره تلفن', required: true, isArray: true, max: 3 },
      emails: { label: 'ایمیل', required: true, isArray: true, max: 3 },
      position: { label: 'سمت', required: false },
      description: { label: 'توضیحات', required: false, multiline: true },
    };
  }
  
  if (isImageFile(contentType)) {
    return {
      title: { label: 'عنوان تصویر', required: true },
      altText: { label: 'متن جایگزین', required: true },
      description: { label: 'توضیحات', required: false, multiline: true },
    };
  } 
  
  else if (isVideoFile(contentType)) {
    return {
      title: { label: 'عنوان ویدیو', required: true },
      description: { label: 'توضیحات', required: false, multiline: true },
      altText: { label: 'متن جایگزین', required: false },
    };
  } 
  
  else if (isDocumentFile(contentType)) {
    return {
      title: { label: 'عنوان سند', required: true },
      description: { label: 'توضیحات', required: false, multiline: true },
    };
  }
  
  return {
    title: { label: 'عنوان', required: true },
    description: { label: 'توضیحات', required: false, multiline: true },
    altText: { label: 'متن جایگزین', required: false },
  };
};