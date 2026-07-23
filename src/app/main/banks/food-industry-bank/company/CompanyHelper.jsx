/**
 * Utility function to prepare company data for API submission
 * This function combines all gallery files and prepares them for submission
 */
export const prepareCompanyDataForSubmission = (formData) => {
    // Clone the data to avoid modifying the original
    const preparedData = { ...formData };
    
    // Combine all gallery files into a single array
    const galleryFiles = [
      ...(preparedData.companyLogoFiles || []),
      ...(preparedData.companyBackgroundImages || []),
      ...(preparedData.companyCertificates || []),
      ...(preparedData.companyGalleryDocument || []),
      ...(preparedData.companyGalleryProduct || []),
      ...(preparedData.companyGalleryContact || []),
      ...(preparedData.companyGalleryCatalog || []),
      ...(preparedData.companyGallerySlider || []),
      ...(preparedData.companyGalleryVideo || []),
      ...(preparedData.companyGalleryGif || []),
      ...(preparedData.companyGalleryOfficeEnvironment || []),
    ]
    .map(file => {
      // Each file needs to have its metadata converted to a string for the API
      const preparedFile = { ...file };
      
      // Remove client-side only properties
      delete preparedFile.uploadPending;
      delete preparedFile.uploadError;
      delete preparedFile.previewUrl;
      
      // Convert metadata to string if it's an object
      if (preparedFile.metadata && typeof preparedFile.metadata === 'object') {
        preparedFile.metadata = JSON.stringify(preparedFile.metadata);
      }
      
      return preparedFile;
    })
    .filter(file => {
      // Only include files that have been successfully uploaded
      return file.id && file.filePath && !file.uploadPending;
    });
    
    // Add the combined gallery files to the data
    preparedData.galleryFiles = galleryFiles;
    
    // Remove individual gallery file arrays to avoid duplication and clutter
    delete preparedData.companyLogoFiles;
    delete preparedData.companyBackgroundImages;
    delete preparedData.companyCertificates;
    delete preparedData.companyGalleryDocument;
    delete preparedData.companyGalleryProduct;
    delete preparedData.companyGalleryContact;
    delete preparedData.companyGalleryCatalog;
    delete preparedData.companyGallerySlider;
    delete preparedData.companyGalleryVideo;
    delete preparedData.companyGalleryGif;
    delete preparedData.companyGalleryOfficeEnvironment;
    
    return preparedData;
  };
  
  /**
   * Process gallery files received from the API
   * This function handles any necessary transformations when files come from the API
   */
  export const processGalleryFilesFromApi = (files) => {
    if (!files || !Array.isArray(files)) return [];
    
    return files.map(file => {
      // Parse metadata if it's a string
      if (file.metadata && typeof file.metadata === 'string') {
        try {
          file.metadata = JSON.parse(file.metadata);
        } catch (e) {
          console.error('Error parsing file metadata:', e);
          file.metadata = {};
        }
      }
      
      // Ensure metadata is an object
      if (!file.metadata) {
        file.metadata = {};
      }
      
      return file;
    });
  };
  
  /**
   * Get a file's thumbnail or appropriate placeholder 
   */
  export const getFileThumbnail = (file) => {
    if (file.thumbnailUrl) {
      return file.thumbnailUrl;
    }
    
    // Determine file type
    const contentType = file.contentType || '';
    
    if (contentType.startsWith('image/')) {
      return file.filePath || file.previewUrl || '/assets/images/placeholders/image-placeholder.jpg';
    }
    
    if (contentType.startsWith('video/')) {
      return '/assets/images/placeholders/video-placeholder.jpg';
    }
    
    if (contentType === 'application/pdf') {
      return '/assets/images/placeholders/pdf-placeholder.jpg';
    }
    
    return '/assets/images/placeholders/file-placeholder.jpg';
  };