import { useMemo, useCallback } from 'react';
import { useGetFileValidationConfigQuery } from './fileValidationApi';

const DEFAULT_CONFIG = {
  maxFiles: 10,
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedMimeTypes: [],
  allowedExtensions: [],
  displayName: '',
};

function formatFileSize(bytes) {
  if (bytes >= 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} گیگابایت`;
  }
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} مگابایت`;
  }
  if (bytes >= 1024) {
    return `${(bytes / 1024).toFixed(1)} کیلوبایت`;
  }
  return `${bytes} بایت`;
}

function matchesMimeType(fileType, allowedTypes) {
  if (!allowedTypes || allowedTypes.length === 0) return true;
  
  return allowedTypes.some((allowed) => {
    if (allowed === '*/*') return true;
    if (allowed.endsWith('/*')) {
      const category = allowed.split('/')[0];
      return fileType.startsWith(`${category}/`);
    }
    return fileType === allowed;
  });
}

function matchesExtension(fileName, allowedExtensions) {
  if (!allowedExtensions || allowedExtensions.length === 0) return true;
  
  const ext = fileName.split('.').pop()?.toLowerCase();
  if (!ext) return false;
  
  return allowedExtensions.some((allowed) => {
    const normalizedAllowed = allowed.startsWith('.') ? allowed.slice(1).toLowerCase() : allowed.toLowerCase();
    return ext === normalizedAllowed;
  });
}

export default function useFileServiceTypeValidation(fileServiceTypeName, options = {}) {
  const { skip = false } = options;

  const {
    data: apiConfig,
    isLoading,
    isError,
    error,
  } = useGetFileValidationConfigQuery(fileServiceTypeName, {
    skip: skip || !fileServiceTypeName,
  });

  const config = useMemo(() => {
    if (!apiConfig) return DEFAULT_CONFIG;
    return {
      ...DEFAULT_CONFIG,
      ...apiConfig,
    };
  }, [apiConfig]);

  const validateFile = useCallback(
    (file, currentFileCount = 0) => {
      const errors = [];

      if (config.maxFileSize && file.size > config.maxFileSize) {
        errors.push(
          `حجم فایل نباید بیشتر از ${formatFileSize(config.maxFileSize)} باشد`
        );
      }

      if (config.allowedMimeTypes && config.allowedMimeTypes.length > 0) {
        if (!matchesMimeType(file.type, config.allowedMimeTypes)) {
          const formattedTypes = config.allowedMimeTypes.join('، ');
          errors.push(
            `فرمت فایل مجاز نیست. فرمت‌های مجاز: ${formattedTypes}`
          );
        }
      }

      if (config.allowedExtensions && config.allowedExtensions.length > 0) {
        if (!matchesExtension(file.name, config.allowedExtensions)) {
          const formattedExts = config.allowedExtensions.join('، ');
          errors.push(
            `پسوند فایل مجاز نیست. پسوندهای مجاز: ${formattedExts}`
          );
        }
      }

      if (config.maxFiles && currentFileCount >= config.maxFiles) {
        errors.push(
          `حداکثر تعداد فایل مجاز ${config.maxFiles} عدد است`
        );
      }

      return {
        valid: errors.length === 0,
        errors,
      };
    },
    [config]
  );

  const validateFiles = useCallback(
    (fileList, currentFileCount = 0) => {
      const allErrors = [];
      const validFiles = [];
      const invalidFiles = [];

      if (config.maxFiles && currentFileCount + fileList.length > config.maxFiles) {
        allErrors.push(
          `حداکثر تعداد فایل مجاز ${config.maxFiles} عدد است. شما در حال حاضر ${currentFileCount} فایل دارید.`
        );
        return { valid: false, errors: allErrors, validFiles: [], invalidFiles: fileList };
      }

      fileList.forEach((file) => {
        const result = validateFile(file, currentFileCount);
        if (result.valid) {
          validFiles.push(file);
        } else {
          invalidFiles.push({ file, errors: result.errors });
          allErrors.push(...result.errors.map((err) => `${file.name}: ${err}`));
        }
      });

      return {
        valid: allErrors.length === 0,
        errors: allErrors,
        validFiles,
        invalidFiles,
      };
    },
    [config, validateFile]
  );

  return {
    config,
    isLoading,
    isError,
    error,
    validateFile,
    validateFiles,
    isConfigAvailable: !!apiConfig && !isError,
  };
}
