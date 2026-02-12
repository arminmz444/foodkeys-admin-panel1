import { apiService as api } from 'app/store/apiService';

export const addTagTypes = [
  'foodCompanyDetails',
  'foodCompanyList',
  'foodCompanyRequestList',
  'companyArchives',
  'archiveTypes'
];

const FoodIndustryBankApi = api
  .enhanceEndpoints({
    addTagTypes
  })
  .injectEndpoints({
    endpoints: (build) => ({
      getAllFoodIndustryCompanies: build.query({
  query: ({ pageNumber, pageSize, search, sort, filter }) => {
    const sortParam =
      sort && Object.entries(sort)?.length
        ? encodeURIComponent(JSON.stringify(sort))
        : '';

    const filterParam =
      filter && Object.entries(filter)?.length
        ? encodeURIComponent(JSON.stringify(filter))
        : '';

    return {
      url: `/company/?categoryId=1` +
           `&pageNumber=${pageNumber}` +
           `&pageSize=${pageSize}` +
           `&search=${encodeURIComponent(search ?? '')}` +
           `&sort=${sortParam}` +
           `&filter=${filterParam}`,
      method: 'GET',
    };
  },
  transformResponse: (response) => {
    const data = { data: response?.data };

    if (response && response.pagination) {
      data.totalPages = response.pagination.totalPages;
      data.totalElements = response.pagination.totalElements;
      data.pageSize = response.pagination.pageSize;
      data.pageIndex = response.pagination.pageNumber;
    }

    return data;
  },
  providesTags: ['foodCompanyList'],
  keepUnusedDataFor: 0,
  refetchOnMountOrArgChange: true,
}),
      getEmployeeCommentsByEntity: build.query({
        query: ({ entityType, entityId, pageNumber, pageSize }) => ({
          url: `/employee/comment/entity/${entityType}/${entityId}/page`,
          method: 'GET',
          params: { 
            pageNumber: pageNumber || 1,
            pageSize: pageSize || 10
          }
        }),
        // transformResponse: (response) => {
        //   return response?.data || [];
        // },
        providesTags: ['employeeComments']
      }),

      getEmployeeCommentById: build.query({
        query: (commentId) => ({
          url: `/employee/comment/${commentId}`,
          method: 'GET'
        }),
        transformResponse: (response) => response?.data,
        providesTags: (result, error, id) => [{ type: 'employeeComments', id }]
      }),

      addEmployeeComment: build.mutation({
        query: (commentData) => ({
          url: `/employee/comment`,
          method: 'POST',
          data: commentData
        }),
        invalidatesTags: ['employeeComments']
      }),

      updateEmployeeComment: build.mutation({
        query: ({ id, commentData }) => ({
          url: `/employee/comment/${id}`,
          method: 'PUT',
          data: commentData
        }),
        invalidatesTags: (result, error, { id }) => [
          { type: 'employeeComments', id },
          'employeeComments'
        ]
      }),

      deleteEmployeeComment: build.mutation({
        query: (commentId) => ({
          url: `/employee/comment/${commentId}`,
          method: 'DELETE'
        }),
        invalidatesTags: ['employeeComments']
      }),
      getFoodIndustryCompanyDetails: build.query({
        query: (companyId) => ({
          url: `/company/${companyId}`
        }),
        transformResponse: (response) => response?.data,
        providesTags: (result, error, companyId) => [
          { type: 'foodCompanyDetails', id: companyId },
          'foodCompanyList'
        ],
        // Disable caching to prevent stale data
        keepUnusedDataFor: 0,
        // Force refetch on every request
        refetchOnMountOrArgChange: true
      }),

      updateCompanyLocation: build.mutation({
      query: ({ companyId, locationData }) => ({
        url: `companies/${companyId}/location`,
        method: 'PUT',
        data: locationData,
      }),
      invalidatesTags: (result, error, { companyId }) => [
        { type: 'FoodIndustryCompany', id: companyId },
      ],
    }),
      
    uploadGalleryFiles: build.mutation({
      query: ({ files, fileServiceType }) => {
        // Create a new FormData instance
        const formData = new FormData();
        
        // Append each file to the formData
        for (let i = 0; i < files.length; i++) {
          formData.append('files', files[i]);
        }
        
        // Append the fileServiceType parameter
        formData.append('fileServiceType', fileServiceType);
        
        return {
          url: '/file',  // Changed to match your backend's actual endpoint
          method: 'POST',
          // Don't set Content-Type header manually - fetchBaseQuery will set it correctly with boundary
          data: formData,  // Use 'body' instead of 'data' for formData
          formData: true,  // Signal that this is a formData request
        };
      },
    }),

    getCompanyGalleryFiles: build.query({
        query: (companyId) => ({
          url: `/company/${companyId}/gallery`,
          method: 'GET'
        }),
        transformResponse: (response) => response?.data,
        providesTags: (result, error, companyId) => [
          { type: 'GalleryFiles', id: companyId },
        ],
      }),
    

    
    updateGalleryFileMetadata: build.mutation({
      query: ({ fileId, metadata }) => ({
        url: `/file/${fileId}/metadata`,
        method: 'PUT',
        data: { metadata },  // Changed from 'data' to 'body'
      }),
      invalidatesTags: (result, error, { companyId }) => [
        { type: 'GalleryFiles', id: companyId },
      ],
    }),
    
    deleteGalleryFile: build.mutation({
      query: (fileId) => ({
        url: `/v1/file/${fileId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { companyId }) => [
        { type: 'GalleryFiles', id: companyId },
      ],
    }),
    createCompany: build.mutation({
        query: (companyData) => ({
          url: `/company/`,
          method: 'POST',
          data: prepareCompanyData(companyData)
        }),
        invalidatesTags: ['foodCompanyList']
      }),
      
      updateCompany: build.mutation({
        query: (companyData) => ({
          url: `/company/${companyData.id}`,
          method: 'PUT',
          data: prepareCompanyData(companyData)
        }),
        invalidatesTags: (result, error, { id }) => [
          { type: 'foodCompanyDetails', id },
          'foodCompanyList'
        ]
      }),
    saveCompanyGalleryFiles: build.mutation({
      query: ({ companyId, galleryFiles }) => ({
        url: `food-industry-bank/companies/${companyId}/gallery-files`,
        method: 'POST',
        data: { galleryFiles },  // Changed from 'data' to 'body'
      }),
      invalidatesTags: (result, error, { companyId }) => [
        { type: 'GalleryFiles', id: companyId },
        { type: 'FoodIndustryCompany', id: companyId },
      ],
    }),
      getAllFoodIndustryCompanyRequests: build.query({
        query: ({ pageNumber, pageSize, search, sort, filter }) => ({
          url: `/request/company?categoryId=1&pageNumber=${pageNumber}&pageSize=${pageSize}&search=${search}&sort=${(sort && Object.entries(sort)?.length && JSON.stringify(sort)) || ''}&filter=${(filter && Object.entries(filter)?.length && JSON.stringify(filter)) || ''}`,
          method: 'GET'
        }),
        transformResponse: (response) => {
          const data = { data: response?.data };

          if (response && response.pagination) {
            data.totalPages = response.pagination.totalPages;
            data.totalElements = response.pagination.totalElements;
            data.pageSize = response.pagination.pageSize;
            data.pageIndex = response.pagination.pageIndex;
          }

          return data;
        },
        providesTags: ['foodCompanyRequestList'],
        // Disable caching to prevent stale data
        keepUnusedDataFor: 0,
        // Force refetch on every request
        refetchOnMountOrArgChange: true
      }),
      
      getCompanyRequests: build.query({
        query: ({ pageNumber = 1, pageSize, search, sort, filter, categoryId, requestStatus }) => ({
          url: `/request/company`,
          method: 'GET',
          params: {
            pageNumber: pageNumber !== 0 ? pageNumber : 1,
            pageSize: pageSize || 10,
            search: search || '',
            categoryId: categoryId || 1,
            sort: (sort && Object.entries(sort)?.length && JSON.stringify(sort)) || '',
            filter: (filter && Object.entries(filter)?.length && JSON.stringify(filter)) || '',
            requestStatus: requestStatus || ''
          }
        }),
        transformResponse: (response) => {
          const data = { data: response?.data };

          if (response && response.pagination) {
            data.totalPages = response.pagination.totalPages;
            data.totalElements = response.pagination.totalElements;
            data.pageSize = response.pagination.pageSize;
            data.pageIndex = response.pagination.pageNumber;
          }

          return data;
        },
        providesTags: ['companyRequests'],
        // Disable caching to prevent stale data
        keepUnusedDataFor: 0,
        // Force refetch on every request
        refetchOnMountOrArgChange: true
      }),

      getCompanyRequestById: build.query({
        query: (requestId) => ({
          url: `/request/${requestId}`,
          method: 'GET'
        }),
        transformResponse: (response) => response?.data,
        providesTags: (result, error, id) => [{ type: 'companyRequest', id }],
        // Disable caching to prevent stale data
        keepUnusedDataFor: 0,
        // Force refetch on every request
        refetchOnMountOrArgChange: true
      }),

      answerCompanySubmitRequest: build.mutation({
        query: ({ companyId, requestId, answerData }) => ({
          url: `/request/${requestId}/company/${companyId}`,
          method: 'POST',
          data: answerData
        }),
        invalidatesTags: ['companyRequests', 'companyRequest']
      }),

      answerCompanyRevisionRequest: build.mutation({
        query: ({ companyId, requestId, answerData }) => ({
          url: `/company/${companyId}/revision/${requestId}`,
          method: 'PUT',
          data: answerData
        }),
        invalidatesTags: ['companyRequests', 'companyRequest']
      }),

      // Get categories for filter dropdown
      getCategories: build.query({
        query: () => ({
          url: '/category',
          method: 'GET'
        }),
        transformResponse: (response) => response?.data || []
      }),

      // Get request workflow history
      getRequestWorkflow: build.query({
        query: (requestId) => ({
          url: `/request/${requestId}/workflow`,
          method: 'GET'
        }),
        transformResponse: (response) => response?.data || []
      }),

      // Add employee comment to a request
      addRequestComment: build.mutation({
        query: ({ requestId, comment }) => ({
          url: `/request/${requestId}/comment`,
          method: 'POST',
          data: { comment }
        }),
        invalidatesTags: (result, error, { requestId }) => [
          { type: 'companyRequest', id: requestId },
          'companyRequests'
        ]
      }),

      // Get company details
      getCompanyDetails: build.query({
        query: (companyId) => ({
          url: `/company/${companyId}`,
          method: 'GET'
        }),
        transformResponse: (response) => response?.data
      }),
      // Archive-related endpoints
      getCompanyArchives: build.query({
        query: (companyId) => ({
          url: `/archives/entity/Company/${companyId}`,
          method: 'GET'
        }),
        transformResponse: (response) => response?.data,
        providesTags: ['companyArchives']
      }),
      
      getArchiveById: build.query({
        query: (archiveId) => ({
          url: `/archives/${archiveId}`,
          method: 'GET'
        }),
        transformResponse: (response) => response?.data
      }),
      
      compareArchives: build.query({
        query: ({ archiveId1, archiveId2 }) => ({
          url: `/archives/compare?archiveId1=${archiveId1}&archiveId2=${archiveId2}`,
          method: 'GET'
        }),
        transformResponse: (response) => response?.data
      }),
      
      createArchiveTask: build.mutation({
        query: (taskData) => ({
          url: `/archive-tasks`,
          method: 'POST',
          data: taskData
        }),
        invalidatesTags: ['companyArchives']
      }),
      
      rollbackToArchive: build.mutation({
        query: ({ archiveId, reason }) => ({
          url: `/archives/rollback/${archiveId}`,
          method: 'POST',
          params: { reason }
        }),
        invalidatesTags: ['companyArchives', 'foodCompanyDetails']
      }),
      
      getArchiveTypes: build.query({
        query: () => ({
          url: `/archives/types`,
          method: 'GET'
        }),
        transformResponse: (response) => response?.data,
        providesTags: ['archiveTypes']
      }),
      
      getCompanyVersionHistory: build.query({
        query: (companyId) => ({
          url: `/company/${companyId}/version`,
          method: 'GET'
        }),
        transformResponse: (response) => response?.data,
        providesTags: ['companyArchives']
      }),
      
      restoreCompanyVersion: build.mutation({
        query: ({ companyId, versionId }) => ({
          url: `/company/${companyId}/version/${versionId}/restore`,
          method: 'POST'
        }),
        invalidatesTags: ['companyArchives', 'foodCompanyDetails']
      })
    }),
    overrideExisting: false
  });

  function prepareCompanyData(data) {
    // Create a new object with the correct structure for CompanyCreateDTO
    const companyData = {
      // Basic information
      id: null,
      adminComment: data.adminComment,
      activities: data.activities || [],
      advertisingSlogan: data.advertisingSlogan,
      companyName: data.companyName,
      companyNameEn: data.companyNameEn,
      companyType: data.companyType?.value,
      companyTypeOther: data.companyTypeOther,
      subCategoryId: data.subCategory?.value || data.subCategoryId,
      userId: data.registrantId?.value || data.registrantId ||data.userId,
      parentCompanyId: data.parentCompanyId,
      subCompanyIds: data.subCompanyIds,
      ranking: data.ranking,
      rankingAll: data.rankingAll,
      status: data.status,
      // Company description fields
      primaryBrand: data.mainBrand,
      mainBrandEn: data.mainBrandEn,
      description: data.description,
      history: data.history,
      subjectOfActivity: data.subjectOfActivity,
      
      // Company metadata
      establishDate: null,// data.establishDateStr,
      companyKeyWords: data.companyKeyWords,
      companyTags: data.companyTags,
      
      // Physical properties
      landArea: data.landArea,
      buildingArea: data.buildingArea,
      
      // Personnel
      ceo: data.ceo,
      ceoPhoneNumber: data.ceoPhoneNumber,
      owner: data.owner,
      employeesCount: data.employeesCount,
      answerName: data.answerName,
      companyStakeholders: data.companyStakeholders,
      
      // Products
      productTitles: data.productTitles,
      outSourcedProductTitles: data.outSourcedProductTitles,
      productAvailability: data.productAvailability,
      rawMaterialsOrigin: data.rawMaterialsOrigin,
      products: prepareProducts(data.products || []),
      outSourcedProducts: prepareProducts(data.outSourcedProducts || [], true),
      
      // Location and contact info
      location: {
        officeLocation: data.officeLocation,
        factoryLocation: data.factoryLocation,
        officePoBox: data.officePoBox,
        factoryPoBox: data.factoryPoBox,
        officeState: data.officeState,
        officeCity: data.officeCity,
        factoryState: data.factoryState,
        factoryCity: data.factoryCity,
        industrialCity: data.industrialCity,
        country: data.country || "ایران",
        commonName: data.commonName,
        fullAddress: data.fullAddress,
        latitude: data.latitude,
        longitude: data.longitude
      },
      
      // Contact details
      factoryTels: preparePhoneArray(data.factoryTels),
      factoryFaxes: preparePhoneArray(data.factoryFaxes),
      officeTels: preparePhoneArray(data.officeTels),
      officeFaxes: preparePhoneArray(data.officeFaxes),
      emails: data.emails || [],
      smsNumber: data.smsNumber,
      specialLineNumber: data.specialLineNumber,
      
      // Social media
      telegramId: data.telegramId,
      telegramPhoneNo: data.telegramPhoneNo,
      whatsAppId: data.whatsAppId,
      whatsAppPhoneNo: data.whatsAppPhoneNo,
      instagramId: data.instagramId,
      linkedInId: data.linkedInId,
      skypeId: data.skypeId,
      eitaaPhoneNo: data.eitaaPhoneNo,
      rubikaPhoneNo: data.rubikaPhoneNo,
      website: data.website,
      socialMedias: data.socialMedias || [],
      
      // Stakeholders
      stakeholders: prepareStakeholders(data.stakeholders),
      
      // Contacts
      contacts: prepareContacts(data.contacts),
      
      // Brand data
      brands: prepareBrands(data.brands),
      
      // Media and settings
      hasPrivatePage: data.hasPrivatePage || false,
      miniAppIframeSource: data.miniAppIframeSource,
      logo: data.logo,
      backgroundImage: data.backgroundImage,
      
      // Additional info (custom key-value pairs)
      additionalInfo: data.additionalInfo || {},
      
      // Gallery files
      galleryFiles: prepareGalleryFiles(data)
    };
    
    return companyData;
  }
  
  // Helper function to prepare products array
  function prepareProducts(products, isOutsourced = false) {
    if (!products || !Array.isArray(products)) return [];
    
    return products.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      categoryType: product.categoryType,
      showProduct: product.showProduct || false,
      outsourced: isOutsourced,
      machineUsage: product.machineUsage || false
    }));
  }
  
  // Helper function to prepare phone array (tels, faxes)
  function preparePhoneArray(phones) {
    if (!phones || !Array.isArray(phones)) return [];
    
    return phones.filter(p => p && p.telNumber).map(phone => ({
      telNumber: phone.telNumber,
      telType: phone.telType
    }));
  }
  
  // Helper function to prepare stakeholders array
  function prepareStakeholders(stakeholders) {
    if (!stakeholders || !Array.isArray(stakeholders)) return [];
    
    return stakeholders.map(stakeholder => ({
      name: stakeholder.name,
      lastName: stakeholder.lastName,
      phone: stakeholder.phone,
      email: stakeholder.email
    }));
  }
  
  // Helper function to prepare contacts array
  function prepareContacts(contacts) {
    if (!contacts || !Array.isArray(contacts)) return [];
    
    return contacts.map(contact => ({
      name: contact.name,
      lastName: contact.lastName,
      email: contact.email,
      phone: contact.phone,
      position: contact.position
    }));
  }
  
  // Helper function to prepare brands array
  function prepareBrands(brands) {
    if (!brands || !Array.isArray(brands)) return [];
    
    return brands.map(brand => ({
      name: brand.name,
      nameEn: brand.nameEn,
      primary: brand.primary || false
    }));
  }
  
  // Helper function to prepare gallery files from all file categories
  function prepareGalleryFiles(data) {
    const galleryFiles = [];
    
    // Process each gallery file category
    processFileCategory(galleryFiles, data.companyLogoFiles, "COMPANY_LOGO");
    processFileCategory(galleryFiles, data.companyBackgroundImages, "COMPANY_BACKGROUND_IMAGE");
    processFileCategory(galleryFiles, data.companyCertificates, "COMPANY_CERTIFICATE");
    processFileCategory(galleryFiles, data.companyGalleryDocument, "COMPANY_GALLERY_DOCUMENT");
    processFileCategory(galleryFiles, data.companyGalleryProduct, "COMPANY_GALLERY_PRODUCT");
    processFileCategory(galleryFiles, data.companyGalleryContact, "COMPANY_GALLERY_CONTACT");
    processFileCategory(galleryFiles, data.companyGalleryCatalog, "COMPANY_GALLERY_CATALOG");
    processFileCategory(galleryFiles, data.companyGallerySlider, "COMPANY_GALLERY_SLIDER");
    
    return galleryFiles;
  }
  
  // Helper to process each file category
  function processFileCategory(galleryFiles, fileArray, fileServiceType) {
    if (fileArray && Array.isArray(fileArray)) {
      fileArray.forEach(file => {
        if (file) {
          galleryFiles.push({
            id: file.id,
            fileName: file.fileName,
            filePath: file.filePath,
            fileExtension: file.fileExtension,
            fileSize: file.fileSize,
            contentType: file.contentType,
            metadata: typeof file.metadata === 'string' ? file.metadata : JSON.stringify(file.metadata),
            fileServiceType: fileServiceType
          });
        }
      });
    }
  }

export default FoodIndustryBankApi;
export const {
  useCreateCompanyMutation,
  useUpdateCompanyMutation,
  useGetCompanyGalleryFilesQuery,
  useUploadGalleryFilesMutation,
  useUpdateGalleryFileMetadataMutation,
  useDeleteGalleryFileMutation,
  useSaveCompanyGalleryFilesMutation,
  useGetAllFoodIndustryCompaniesQuery,
  useGetAllFoodIndustryCompanyRequestsQuery,
  useGetFoodIndustryCompanyDetailsQuery,
  useGetCompanyArchivesQuery,
  useGetArchiveByIdQuery,
  useCompareArchivesQuery,
  useCreateArchiveTaskMutation,
  useRollbackToArchiveMutation,
  useGetArchiveTypesQuery,
  useGetCompanyVersionHistoryQuery,
  useRestoreCompanyVersionMutation,
  useGetEmployeeCommentsByEntityQuery,
  useGetEmployeeCommentByIdQuery,
  useAddEmployeeCommentMutation,
  useUpdateEmployeeCommentMutation,
  useDeleteEmployeeCommentMutation,
  useGetCompanyRequestsQuery,
  useGetCompanyRequestByIdQuery,
  useAnswerCompanySubmitRequestMutation,
  useAnswerCompanyRevisionRequestMutation,
  useGetCategoriesQuery,
  useGetRequestWorkflowQuery,
  useAddRequestCommentMutation,
  useGetCompanyDetailsQuery
} = FoodIndustryBankApi;