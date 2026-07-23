// src/app/services/ServiceApi.js
import { apiService as api } from 'app/store/apiService.js';

const addTagTypes = ['Services', 'ServiceSchemas', 'ServiceRequests'];

export const serviceApi = api
  .enhanceEndpoints({ addTagTypes })
  .injectEndpoints({
    endpoints: (build) => ({
      getServicesSubCategoriesByCategoryId: build.query({
        query: ({ pageNumber = 0, pageSize = 10 }) => ({
          url: "/service/subcategory",
          transformResponse: (response) => response?.data,
          params: { pageNumber, pageSize },
        }),
        providesTags: [
          {
            type: "Services",
            id: "SERVICE_SUBCATEGORIES_BY_CATEGORY_ID_4",
          },
        ],
      }),
      getServicesSubCategories: build.query({
        query: ({ pageNumber = 0, pageSize = 10 }) => ({
          url: "/service/subcategory",
          transformResponse: (response) => response?.data,
          params: { pageNumber, pageSize },
        }),
        providesTags: [{ type: "Services", id: "SERVICE_ALL_SUBCATEGORIES" }],
      }),
      getServices: build.query({
        query: ({ pageNumber = 0, pageSize = 10, search = "", filters = {} }) => {
          // console.log('API Query called with params:', { pageNumber, pageSize, search, filters });
          const params = { pageNumber, pageSize, search };
          
          // Add filter parameters
          if (filters.name) params.name = filters.name;
          if (filters.description) params.description = filters.description;
          if (filters.subCategoryId) params.subCategoryId = filters.subCategoryId;
          if (filters.ranking) params.ranking = filters.ranking;
          if (filters.rankingAll) params.rankingAll = filters.rankingAll;
          if (filters.keyWords) params.keyWords = filters.keyWords;
          if (filters.tags) params.tags = filters.tags;
          if (filters.status !== undefined && filters.status !== null) params.status = filters.status;
          if (filters.visit) params.visit = filters.visit;
          
          return {
            url: "/service",
            transformResponse: (response) => response?.data,
            params,
          };
        },
        providesTags: (result, error, { search, filters }) => [
          { type: "Services", id: "LIST" },
          { type: "Services", id: `SEARCH_${search || 'empty'}` },
          { type: "Services", id: `FILTERS_${JSON.stringify(filters || {})}` }
        ],
      }),
      getServiceById: build.query({
        query: (serviceId) => ({
          url: `/service/${serviceId}`,
        }),
        transformResponse: (response) => response?.data,
        providesTags: (result, error, serviceId) => [
          { type: "Services", id: serviceId },
        ],
      }),
      // createService: build.mutation({
      //   query: (newService) => ({
      //     url: `/service`,
      //     method: "POST",
      //     data: newService,
      //   }),
      //   invalidatesTags: [{ type: "service", id: "LIST" }],
      // }),
      // updateService: build.mutation({
      //   query: ({ id, service }) => ({
      //     url: `/service/${id}`,
      //     method: "PUT",
      //     data: service,
      //   }),
      //   invalidatesTags: (result, error, { id }) => [{ type: "service", id }, {type: "service", id: "LIST"}],
      // }),
      deleteService: build.mutation({
        query: (id) => ({
          url: `/service/${id}`,
          method: "DELETE",
        }),
        invalidatesTags: (result, error, { id }) => [{ type: "service", id }, {type: "service", id: "LIST"}],
      }),
      getServiceSchemas: build.query({
        query: ({ pageSize, pageNumber }) =>
          `/service/schema?pageSize=${pageSize}&pageNumber=${pageNumber}`,
        providesTags: ["ServiceSchemas"],
      }),
      getSubcategoryOptions: build.query({
        query: () => `/subcategory/options`,
        providesTags: ["subcategoryOptions"],
      }),
      getServiceSubcategoryOptions: build.query({
        query: (categoryId) => ({
          url: `/category/${categoryId || 4}/subcategory`,
          method: "GET",
        }),
        transformResponse: (response) => response?.data || [],
        providesTags: (result, error, categoryId) => [
          { type: "ServiceSubcategoryOptions", id: categoryId || 4 },
        ],
      }),
  
    // getServices: build.query({
    //   query: ({ page = 0, size = 10, categoryId = null, subCategoryId = null }) => {
    //     let queryParams = `?page=${page}&pageSize=${size}`;
    //     if (categoryId) queryParams += `&categoryId=${categoryId}`;
    //     if (subCategoryId) queryParams += `&subCategoryId=${subCategoryId}`;
    //     return `service${queryParams}`;
    //   },
    //   transformResponse: (response) => response.data,
    //   providesTags: ['Services']
    // }),
    
    // Get service by ID
    // getServiceById: build.query({
    //   query: (id) => `service/${id}`,
    //   transformResponse: (response) => response.data,
    //   providesTags: (result, error, id) => [{ type: 'Services', id }]
    // }),
    
    // Create new service
    createService: build.mutation({
      query: (newService) => ({
        url: 'service',
        method: 'POST',
        data: newService
      }),
      invalidatesTags: ['Services']
    }),
    
    // Update service
    updateService: build.mutation({
      query: ({ id, service }) => ({
        url: `service/${id}`,
        method: 'PUT',
        data: service
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Services', id }, 'Services']
    }),
    
    // // Delete service
    // deleteService: build.mutation({
    //   query: (id) => ({
    //     url: `service/${id}`,
    //     method: 'DELETE'
    //   }),
    //   invalidatesTags: ['Services']
    // }),
    
    // // Get subcategory options
    // getSubcategoryOptions: build.query({
    //   query: () => 'subcategory/options?categoryId=4&pageSize=100',
    //   transformResponse: (response) => response.data,
    //   providesTags: ['ServiceCategories']
    // }),
    
    // Get subcategory schema
    getSubcategorySchema: build.query({
      query: (subCategoryId) => `subcategory/${subCategoryId}/schema`,
      transformResponse: (response) => response.data,
      providesTags: (result, error, id) => [{ type: 'ServiceSchemas', id }]
    }),
    
    // Publish service
    publishService: build.mutation({
      query: (serviceId) => ({
        url: `service/${serviceId}/publish/`,
        method: 'POST'
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Services', id }, 'Services']
    }),

    // Service Request endpoints
    getServiceRequests: build.query({
      query: ({
        pageNumber = 1,
        pageSize,
        search,
        sort,
        filter,
        categoryId,
        subCategoryId,
        requestStatus,
        requestType,
        type,
      }) => ({
        url: `/request/service`,
        method: 'GET',
        params: {
          pageNumber: pageNumber !== 0 ? pageNumber : 1,
          pageSize: pageSize || 10,
          search: search || '',
          ...(categoryId != null && categoryId !== '' ? { categoryId } : {}),
          ...(subCategoryId != null && subCategoryId !== '' ? { subCategoryId } : {}),
          sort: (sort && Object.entries(sort)?.length && JSON.stringify(sort)) || '',
          filter: (filter && Object.entries(filter)?.length && JSON.stringify(filter)) || '',
          requestStatus: requestStatus || '',
          requestType: requestType ?? type ?? '',
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
      providesTags: ['serviceRequests'],
      // Disable caching to prevent stale data
      keepUnusedDataFor: 0,
      // Force refetch on every request
      refetchOnMountOrArgChange: true
    }),

    getServiceRequestById: build.query({
      query: (requestId) => ({
        url: `/request/${requestId}/workflow`,
        method: 'GET'
      }),
      transformResponse: (response) => response?.data,
      providesTags: (result, error, id) => [{ type: 'serviceRequest', id }],
      // Disable caching to prevent stale data
      keepUnusedDataFor: 0,
      // Force refetch on every request
      refetchOnMountOrArgChange: true
    }),

    // answerServiceSubmitRequest: build.mutation({
    //   query: ({ requestId, answer, description }) => ({
    //     url: `/request/${requestId}/answer`,
    //     method: 'POST',
    //     data: {
    //       answer,
    //       description
    //     }
    //   }),
    //   invalidatesTags: ['serviceRequests', 'serviceRequest'],
    // }),

    answerServiceSubmitRequest: build.mutation({
        query: ({ serviceId, requestId, answerData }) => ({
          url: `/request/${requestId}/service/${serviceId}`,
          method: 'POST',
          data: answerData
        }),
        invalidatesTags: ['serviceRequests', 'serviceRequest']
      }),

      answerServiceRevisionRequest: build.mutation({
        query: ({ serviceId, requestId, answerData }) => ({
          url: `/service/${serviceId}/revision/${requestId}`,
          method: 'PUT',
          data: answerData
        }),
        invalidatesTags: ['serviceRequests', 'serviceRequest']
      }),


    overrideExisting: false,
  })
  });

export const {
  useGetServicesQuery,
  useLazyGetServicesQuery,
  useGetServicesSubCategoriesByCategoryIdQuery,
  useGetServicesSubCategoriesQuery,
  useGetServiceByIdQuery,
  useCreateServiceMutation,
  useUpdateServiceMutation,
  useDeleteServiceMutation,
  useGetServiceSchemasQuery,
  useGetSubcategoryOptionsQuery,
  useGetServiceSubcategoryOptionsQuery,
  useGetServiceRequestsQuery,
  useGetServiceRequestByIdQuery,
  useAnswerServiceSubmitRequestMutation,
} = serviceApi;
