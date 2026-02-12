// import { apiService as api } from 'app/store/apiService';

// export const addTagTypes = ['ConfigList', 'Config', 'EndpointMappingList', 'EndpointMapping'];
// export const configManagementApi = api
// .enhanceEndpoints({
//   addTagTypes
// }).injectEndpoints({
//   endpoints: (builder) => ({
//     getConfigs: builder.query({
//       query: ({ category = '', pageNumber = 0, pageSize = 10 }) => ({
//         url: '/config/website',
//         params: { category, pageNumber, pageSize }
//       }),
//       providesTags: (result) =>
//         (result && result.data && Array.isArray(result.data))
//           ? [
//               ...result.data.map(({ name }) => ({ type: 'Config', id: name })),
//               { type: 'ConfigList', id: 'LIST' }
//             ]
//           : [{ type: 'ConfigList', id: 'LIST' }],
//       keepUnusedDataFor: 3600 
//     }),
//     updateConfig: builder.mutation({
//       query: ({ configName, configData }) => ({
//         url: `/configs/${configName}`,
//         method: 'PUT',
//         body: configData
//       }),
//       invalidatesTags: (result, error, { configName }) => [
//         { type: 'Config', id: configName },
//         { type: 'ConfigList', id: 'LIST' }
//       ]
//     }),
//     getEndpointMappings: builder.query({
//       query: () => '/endpoints',
//       providesTags: (result) =>
//         result
//           ? [
//               ...result.map(({ id }) => ({ type: 'EndpointMapping', id })),
//               { type: 'EndpointMappingList', id: 'LIST' }
//             ]
//           : [{ type: 'EndpointMappingList', id: 'LIST' }],
//       keepUnusedDataFor: 3600
//     }),
//     createEndpointMapping: builder.mutation({
//       query: (data) => ({
//         url: '/endpoints',
//         method: 'POST',
//         body: data
//       }),
//       invalidatesTags: [{ type: 'EndpointMappingList', id: 'LIST' }]
//     }),
//     updateEndpointMapping: builder.mutation({
//       query: ({ id, ...data }) => ({
//         url: `/endpoints/${id}`,
//         method: 'PUT',
//         body: data
//       }),
//       invalidatesTags: (result, error, { id }) => [
//         { type: 'EndpointMapping', id },
//         { type: 'EndpointMappingList', id: 'LIST' }
//       ]
//     }),
//     deleteEndpointMapping: builder.mutation({
//       query: (id) => ({
//         url: `/endpoints/${id}`,
//         method: 'DELETE'
//       }),
//       invalidatesTags: (result, error, id) => [
//         { type: 'EndpointMapping', id },
//         { type: 'EndpointMappingList', id: 'LIST' }
//       ]
//     })
//   })
// });

// export const {
//   useGetConfigsQuery,
//   useUpdateConfigMutation,
//   useGetEndpointMappingsQuery,
//   useCreateEndpointMappingMutation,
//   useUpdateEndpointMappingMutation,
//   useDeleteEndpointMappingMutation
// } = configManagementApi;

// export default configManagementApi;


import { apiService as api } from 'app/store/apiService';

// Tag types for configuration management
const addTagTypes = ['ConfigSchema', 'Config', 'ConfigFile', 'ServiceSchema', 'Service', 'ServiceFile'];

const ConfigManagementApi = api.enhanceEndpoints({ addTagTypes }).injectEndpoints({
  endpoints: (builder) => ({
    // Configuration Schema Endpoints
    getConfigSchemas: builder.query({
      query: ({ pageNumber = 1, pageSize = 10, search = '', sort = {} }) => {
        let url = `/config-schema?pageNumber=${pageNumber}&pageSize=${pageSize}`;
        if (search) url += `&search=${search}`;
        if (sort && Object.entries(sort)?.length) url += `&sort=${JSON.stringify(sort)}`;
        
        return {
          url,
          method: 'GET'
        };
      },
      transformResponse: (response) => {
        const data = { data: response?.data?.data };
        
        if (response && response.pagination) {
          data.totalPages = response.pagination.totalPages;
          data.totalElements = response.pagination.totalElements;
          data.pageSize = response.pagination.pageSize;
          data.pageIndex = response.pagination.pageIndex;
        }
        
        return data;
      },
      providesTags: (result) =>
        (result && result.data && Array.isArray(result.data))
          ? [
              ...result.data.map(({ id }) => ({ type: 'ConfigSchema', id })),
              { type: 'ConfigSchema', id: 'LIST' }
            ]
          : [{ type: 'ConfigSchema', id: 'LIST' }],
      keepUnusedDataFor: 3600
    }),
    
    getConfigSchema: builder.query({
      query: (id) => ({
        url: `/config-schema/${id}`,
        method: 'GET'
      }),
      transformResponse: (response) => response?.data,
      providesTags: (result, error, id) => [{ type: 'ConfigSchema', id }]
    }),
    
    createConfigSchema: builder.mutation({
      query: (body) => ({
        url: '/config-schema',
        method: 'POST',
        data: body
      }),
      transformResponse: (response) => response?.data?.data,
      invalidatesTags: [{ type: 'ConfigSchema', id: 'LIST' }]
    }),
    
    updateConfigSchema: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/config-schema/${id}`,
        method: 'PUT',
        data: body
      }),
      transformResponse: (response) => response?.data?.data,
      invalidatesTags: (result, error, { id }) => [
        { type: 'ConfigSchema', id },
        { type: 'ConfigSchema', id: 'LIST' }
      ]
    }),
    
    deleteConfigSchema: builder.mutation({
      query: (id) => ({
        url: `/config-schema/${id}`,
        method: 'DELETE'
      }),
      transformResponse: (response) => response?.data?.data,
      invalidatesTags: (result, error, id) => [
        { type: 'ConfigSchema', id },
        { type: 'ConfigSchema', id: 'LIST' }
      ]
    }),
    
    validateConfigSchema: builder.mutation({
      query: (body) => ({
        url: '/config-schema/validate',
        method: 'POST',
        data: body
      }),
      transformResponse: (response) => response?.data
    }),
    
    // Configuration Endpoints
    getConfigs: builder.query({
      query: ({ pageNumber = 1, pageSize = 10, search = '', sort = {}, filter = {}, schemaId }) => {
        let url = `/config?pageNumber=${pageNumber}&pageSize=${pageSize}`;
        
        if (search) url += `&search=${search}`;
        if (sort && Object.entries(sort)?.length) url += `&sort=${JSON.stringify(sort)}`;
        if (filter && Object.entries(filter)?.length) url += `&filter=${JSON.stringify(filter)}`;
        if (schemaId) url += `&schemaId=${schemaId}`;
        
        return {
          url,
          method: 'GET'
        };
      },
      transformResponse: (response) => {
        const data = { data: response?.data?.data };
        if (response && response.pagination) {
          data.totalPages = response.pagination.totalPages;
          data.totalElements = response.pagination.totalElements;
          data.pageSize = response.pagination.pageSize;
          data.pageIndex = response.pagination.pageIndex;
        }
        
        return data;
      },
      providesTags: (result) =>
        (result && result.data && Array.isArray(result.data))
          ? [
              ...result.data.map(({ name }) => ({ type: 'Config', id: name })),
              { type: 'Config', id: 'LIST' }
            ]
          : [{ type: 'Config', id: 'LIST' }],
      keepUnusedDataFor: 300 // shorter cache for configs as they might change frequently
    }),
    
    getConfig: builder.query({
      query: (name) => ({
        url: `/config/${name}`,
        method: 'GET'
      }),
      transformResponse: (response) => response?.data?.data,
      providesTags: (result, error, name) => [{ type: 'Config', id: name }]
    }),
    
    createConfig: builder.mutation({
      query: (body) => ({
        url: '/config',
        method: 'POST',
        data: body
      }),
      transformResponse: (response) => response?.data?.data,
      invalidatesTags: [{ type: 'Config', id: 'LIST' }]
    }),
    
    updateConfig: builder.mutation({
      query: ({ name, ...body }) => ({
        url: `/config/${name}`,
        method: 'PUT',
        data: body
      }),
      transformResponse: (response) => response?.data?.data,
      invalidatesTags: (result, error, { name }) => [
        { type: 'Config', id: name },
        { type: 'Config', id: 'LIST' }
      ]
    }),
    
    deleteConfig: builder.mutation({
      query: (name) => ({
        url: `/config/${name}`,
        method: 'DELETE'
      }),
      transformResponse: (response) => response?.data?.data,
      invalidatesTags: (result, error, name) => [
        { type: 'Config', id: name },
        { type: 'Config', id: 'LIST' }
      ]
    }),
    
    validateConfig: builder.mutation({
      query: (body) => ({
        url: '/config/validate',
        method: 'POST',
        data: body
      }),
      transformResponse: (response) => response?.data
    }),
    
    uploadConfigFile: builder.mutation({
      query: ({ configName, file }) => {
        const formData = new FormData();
        formData.append('file', file);

        return {
          url: `/config/${configName}/file`,
          method: 'POST',
          data: formData,
          formData: true
        };
      },
      transformResponse: (response) => response?.data?.data,
      invalidatesTags: (result, error, { configName }) => [
        { type: 'Config', id: configName },
        { type: 'ConfigFile', id: 'LIST' }
      ]
    }),
    
    uploadConfigFileBase64: builder.mutation({
      query: ({ configName, base64Data, fileName, contentType }) => ({
        url: `/config/${configName}/file/base64`,
        method: 'POST',
        data: { base64Data, fileName, contentType }
      }),
      transformResponse: (response) => response?.data?.data,
      invalidatesTags: (result, error, { configName }) => [
        { type: 'Config', id: configName },
        { type: 'ConfigFile', id: 'LIST' }
      ]
    }),
    
    getConfigFiles: builder.query({
      query: (configName) => ({
        url: `/config/${configName}/files`,
        method: 'GET'
      }),
      transformResponse: (response) => response?.data?.data,
      providesTags: [{ type: 'ConfigFile', id: 'LIST' }]
    }),
    
    deleteConfigFile: builder.mutation({
      query: ({ configName, fileId }) => ({
        url: `/config/${configName}/file/${fileId}`,
        method: 'DELETE'
      }),
      transformResponse: (response) => response?.data?.data,
      invalidatesTags: [
        { type: 'ConfigFile', id: 'LIST' },
        { type: 'Config', id: 'LIST' }
      ]
    }),
    
    // Service Schema Endpoints
    getServiceSchemas: builder.query({
      query: ({ pageNumber = 1, pageSize = 10, search = '', sort = {} }) => {
        let url = `/service-schema?pageNumber=${pageNumber}&pageSize=${pageSize}`;
        
        if (search) url += `&search=${search}`;
        if (sort && Object.entries(sort)?.length) url += `&sort=${JSON.stringify(sort)}`;
        
        return {
          url,
          method: 'GET'
        };
      },
      transformResponse: (response) => {
        const data = { data: response?.data?.data };
        
        if (response && response.pagination) {
          data.totalPages = response.pagination.totalPages;
          data.totalElements = response.pagination.totalElements;
          data.pageSize = response.pagination.pageSize;
          data.pageIndex = response.pagination.pageIndex;
        }
        
        return data;
      },
      providesTags: (result) =>
        (result && result.data && Array.isArray(result.data))
          ? [
              ...result.data.map(({ id }) => ({ type: 'ServiceSchema', id })),
              { type: 'ServiceSchema', id: 'LIST' }
            ]
          : [{ type: 'ServiceSchema', id: 'LIST' }],
      keepUnusedDataFor: 3600
    }),
    
    getServiceSchema: builder.query({
      query: (id) => ({
        url: `/service-schema/${id}`,
        method: 'GET'
      }),
      transformResponse: (response) => response?.data?.data,
      providesTags: (result, error, id) => [{ type: 'ServiceSchema', id }]
    }),
    
    createServiceSchema: builder.mutation({
      query: (body) => ({
        url: '/service-schema',
        method: 'POST',
        data: body
      }),
      transformResponse: (response) => response?.data?.data,
      invalidatesTags: [{ type: 'ServiceSchema', id: 'LIST' }]
    }),
    
    updateServiceSchema: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/service-schema/${id}`,
        method: 'PUT',
        data: body
      }),
      transformResponse: (response) => response?.data?.data,
      invalidatesTags: (result, error, { id }) => [
        { type: 'ServiceSchema', id },
        { type: 'ServiceSchema', id: 'LIST' }
      ]
    }),
    
    deleteServiceSchema: builder.mutation({
      query: (id) => ({
        url: `/service-schema/${id}`,
        method: 'DELETE'
      }),
      transformResponse: (response) => response?.data?.data,
      invalidatesTags: (result, error, id) => [
        { type: 'ServiceSchema', id },
        { type: 'ServiceSchema', id: 'LIST' }
      ]
    }),
    
    validateServiceSchema: builder.mutation({
      query: (body) => ({
        url: '/service-schema/validate',
        method: 'POST',
        data: body
      }),
      transformResponse: (response) => response?.data
    }),
    
    // Service Endpoints
    getServices: builder.query({
      query: ({ pageNumber = 1, pageSize = 10, search = '', sort = {}, filter = {}, schemaId }) => {
        let url = `/service?pageNumber=${pageNumber}&pageSize=${pageSize}`;
        
        if (search) url += `&search=${search}`;
        if (sort && Object.entries(sort)?.length) url += `&sort=${JSON.stringify(sort)}`;
        if (filter && Object.entries(filter)?.length) url += `&filter=${JSON.stringify(filter)}`;
        if (schemaId) url += `&schemaId=${schemaId}`;
        
        return {
          url,
          method: 'GET'
        };
      },
      transformResponse: (response) => {
        const data = { data: response?.data?.data };
        
        if (response && response.pagination) {
          data.totalPages = response.pagination.totalPages;
          data.totalElements = response.pagination.totalElements;
          data.pageSize = response.pagination.pageSize;
          data.pageIndex = response.pagination.pageIndex;
        }
        
        return data;
      },
      providesTags: (result) =>
        (result && result.data && Array.isArray(result.data))
          ? [
              ...result.data.map(({ id }) => ({ type: 'Service', id })),
              { type: 'Service', id: 'LIST' }
            ]
          : [{ type: 'Service', id: 'LIST' }],
      keepUnusedDataFor: 300
    }),
    
    getService: builder.query({
      query: (id) => ({
        url: `/service/${id}`,
        method: 'GET'
      }),
      transformResponse: (response) => response?.data?.data,
      providesTags: (result, error, id) => [{ type: 'Service', id }]
    }),
    
    createService: builder.mutation({
      query: (body) => ({
        url: '/service',
        method: 'POST',
        data: body
      }),
      transformResponse: (response) => response?.data?.data,
      invalidatesTags: [{ type: 'Service', id: 'LIST' }]
    }),
    
    updateService: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/service/${id}`,
        method: 'PUT',
        data: body
      }),
      transformResponse: (response) => response?.data?.data,
      invalidatesTags: (result, error, { id }) => [
        { type: 'Service', id },
        { type: 'Service', id: 'LIST' }
      ]
    }),
    
    deleteService: builder.mutation({
      query: (id) => ({
        url: `/service/${id}`,
        method: 'DELETE'
      }),
      transformResponse: (response) => response?.data?.data,
      invalidatesTags: (result, error, id) => [
        { type: 'Service', id },
        { type: 'Service', id: 'LIST' }
      ]
    }),
    
    validateService: builder.mutation({
      query: (body) => ({
        url: '/service/validate',
        method: 'POST',
        data: body
      }),
      transformResponse: (response) => response?.data
    }),
    
    uploadServiceFile: builder.mutation({
      query: ({ serviceId, file, fileServiceType }) => {
        const formData = new FormData();
        formData.append('file', file);
        if (fileServiceType) formData.append('fileServiceType', fileServiceType);
        
        return {
          url: `/service/${serviceId}/file`,
          method: 'POST',
          data: formData,
          formData: true
        };
      },
      transformResponse: (response) => response?.data?.data,
      invalidatesTags: (result, error, { serviceId }) => [
        { type: 'Service', id: serviceId },
        { type: 'ServiceFile', id: 'LIST' }
      ]
    }),
    
    uploadServiceFileBase64: builder.mutation({
      query: ({ serviceId, base64Data, fileName, contentType, fileServiceType }) => ({
        url: `/service/${serviceId}/file/base64`,
        method: 'POST',
        data: { base64Data, fileName, contentType, fileServiceType }
      }),
      transformResponse: (response) => response?.data?.data,
      invalidatesTags: (result, error, { serviceId }) => [
        { type: 'Service', id: serviceId },
        { type: 'ServiceFile', id: 'LIST' }
      ]
    }),
    
    getServiceFiles: builder.query({
      query: (serviceId) => ({
        url: `/service/${serviceId}/files`,
        method: 'GET'
      }),
      transformResponse: (response) => response?.data?.data,
      providesTags: [{ type: 'ServiceFile', id: 'LIST' }]
    }),
    
    deleteServiceFile: builder.mutation({
      query: ({ serviceId, fileId }) => ({
        url: `/service/${serviceId}/file/${fileId}`,
        method: 'DELETE'
      }),
      transformResponse: (response) => response?.data?.data,
      invalidatesTags: [
        { type: 'ServiceFile', id: 'LIST' },
        { type: 'Service', id: 'LIST' }
      ]
    }),
  }),
  overrideExisting: false
});

export default ConfigManagementApi;

export const {
  // Config Schema hooks
  useGetConfigSchemasQuery,
  useGetConfigSchemaQuery,
  useCreateConfigSchemaMutation,
  useUpdateConfigSchemaMutation,
  useDeleteConfigSchemaMutation,
  useValidateConfigSchemaMutation,
  
  // Config hooks
  useGetConfigsQuery,
  useGetConfigQuery,
  useCreateConfigMutation,
  useUpdateConfigMutation,
  useDeleteConfigMutation,
  useValidateConfigMutation,
  useUploadConfigFileMutation,
  useUploadConfigFileBase64Mutation,
  useGetConfigFilesQuery,
  useDeleteConfigFileMutation,
  
  // Service Schema hooks
  useGetServiceSchemasQuery,
  useGetServiceSchemaQuery,
  useCreateServiceSchemaMutation,
  useUpdateServiceSchemaMutation,
  useDeleteServiceSchemaMutation,
  useValidateServiceSchemaMutation,
  
  // Service hooks
  useGetServicesQuery,
  useGetServiceQuery,
  useCreateServiceMutation,
  useUpdateServiceMutation,
  useDeleteServiceMutation,
  useValidateServiceMutation,
  useUploadServiceFileMutation,
  useUploadServiceFileBase64Mutation,
  useGetServiceFilesQuery,
  useDeleteServiceFileMutation,
} = ConfigManagementApi;



// import { apiService as api } from 'app/store/apiService';

// export const addTagTypes = ['ConfigList', 'Config', 'EndpointMappingList', 'EndpointMapping'];
// export const configManagementApi = api
// .enhanceEndpoints({
//   addTagTypes
// }).injectEndpoints({
//   endpoints: (builder) => ({
//     getConfigs: builder.query({
//       query: ({ category = '', pageNumber = 0, pageSize = 10 }) => ({
//         url: '/config/website',
//         params: { category, pageNumber, pageSize }
//       }),
//       providesTags: (result) =>
//         (result && result.data && Array.isArray(result.data))
//           ? [
//               ...result.data.map(({ name }) => ({ type: 'Config', id: name })),
//               { type: 'ConfigList', id: 'LIST' }
//             ]
//           : [{ type: 'ConfigList', id: 'LIST' }],
//       keepUnusedDataFor: 3600 
//     }),
//     updateConfig: builder.mutation({
//       query: ({ configName, configData }) => ({
//         url: `/configs/${configName}`,
//         method: 'PUT',
//         body: configData
//       }),
//       invalidatesTags: (result, error, { configName }) => [
//         { type: 'Config', id: configName },
//         { type: 'ConfigList', id: 'LIST' }
//       ]
//     }),
//     getEndpointMappings: builder.query({
//       query: () => '/endpoints',
//       providesTags: (result) =>
//         result
//           ? [
//               ...result.map(({ id }) => ({ type: 'EndpointMapping', id })),
//               { type: 'EndpointMappingList', id: 'LIST' }
//             ]
//           : [{ type: 'EndpointMappingList', id: 'LIST' }],
//       keepUnusedDataFor: 3600
//     }),
//     createEndpointMapping: builder.mutation({
//       query: (data) => ({
//         url: '/endpoints',
//         method: 'POST',
//         body: data
//       }),
//       invalidatesTags: [{ type: 'EndpointMappingList', id: 'LIST' }]
//     }),
//     updateEndpointMapping: builder.mutation({
//       query: ({ id, ...data }) => ({
//         url: `/endpoints/${id}`,
//         method: 'PUT',
//         body: data
//       }),
//       invalidatesTags: (result, error, { id }) => [
//         { type: 'EndpointMapping', id },
//         { type: 'EndpointMappingList', id: 'LIST' }
//       ]
//     }),
//     deleteEndpointMapping: builder.mutation({
//       query: (id) => ({
//         url: `/endpoints/${id}`,
//         method: 'DELETE'
//       }),
//       invalidatesTags: (result, error, id) => [
//         { type: 'EndpointMapping', id },
//         { type: 'EndpointMappingList', id: 'LIST' }
//       ]
//     })
//   })
// });

// export const {
//   useGetConfigsQuery,
//   useUpdateConfigMutation,
//   useGetEndpointMappingsQuery,
//   useCreateEndpointMappingMutation,
//   useUpdateEndpointMappingMutation,
//   useDeleteEndpointMappingMutation
// } = configManagementApi;

// export default configManagementApi;


// import { apiService as api } from 'app/store/apiService';

// // Tag types for configuration management
// const addTagTypes = ['ConfigSchema', 'Config', 'ConfigFile', 'ServiceSchema', 'Service', 'ServiceFile'];

// const ConfigManagementApi = api.enhanceEndpoints({ addTagTypes }).injectEndpoints({
//   endpoints: (builder) => ({
//     // Configuration Schema Endpoints
//     getConfigSchemas: builder.query({
//       query: ({ pageNumber = 1, pageSize = 10, search = '', sort = {} }) => {
//         let url = `/config-schema?pageNumber=${pageNumber}&pageSize=${pageSize}`;
//         if (search) url += `&search=${search}`;
//         if (sort && Object.entries(sort)?.length) url += `&sort=${JSON.stringify(sort)}`;
        
//         return {
//           url,
//           method: 'GET'
//         };
//       },
//       transformResponse: (response) => {
//         const data = { data: response?.data };
        
//         if (response && response.pagination) {
//           data.totalPages = response.pagination.totalPages;
//           data.totalElements = response.pagination.totalElements;
//           data.pageSize = response.pagination.pageSize;
//           data.pageIndex = response.pagination.pageIndex;
//         }
        
//         return data;
//       },
//       providesTags: (result) =>
//         (result && result.data && Array.isArray(result.data))
//           ? [
//               ...result.data.map(({ id }) => ({ type: 'ConfigSchema', id })),
//               { type: 'ConfigSchema', id: 'LIST' }
//             ]
//           : [{ type: 'ConfigSchema', id: 'LIST' }],
//       keepUnusedDataFor: 3600
//     }),
    
//     getConfigSchema: builder.query({
//       query: (id) => ({
//         url: `/config-schema/${id}`,
//         method: 'GET'
//       }),
//       transformResponse: (response) => response?.data,
//       providesTags: (result, error, id) => [{ type: 'ConfigSchema', id }]
//     }),
    
//     createConfigSchema: builder.mutation({
//       query: (body) => ({
//         url: '/config-schema',
//         method: 'POST',
//         body
//       }),
//       transformResponse: (response) => response?.data,
//       invalidatesTags: [{ type: 'ConfigSchema', id: 'LIST' }]
//     }),
    
//     updateConfigSchema: builder.mutation({
//       query: ({ id, ...body }) => ({
//         url: `/config-schema/${id}`,
//         method: 'PUT',
//         body
//       }),
//       transformResponse: (response) => response?.data,
//       invalidatesTags: (result, error, { id }) => [
//         { type: 'ConfigSchema', id },
//         { type: 'ConfigSchema', id: 'LIST' }
//       ]
//     }),
    
//     deleteConfigSchema: builder.mutation({
//       query: (id) => ({
//         url: `/config-schema/${id}`,
//         method: 'DELETE'
//       }),
//       transformResponse: (response) => response?.data,
//       invalidatesTags: (result, error, id) => [
//         { type: 'ConfigSchema', id },
//         { type: 'ConfigSchema', id: 'LIST' }
//       ]
//     }),
    
//     validateConfigSchema: builder.mutation({
//       query: (body) => ({
//         url: '/config-schema/validate',
//         method: 'POST',
//         body
//       }),
//       transformResponse: (response) => response?.data
//     }),
    
//     // Configuration Endpoints
//     getConfigs: builder.query({
//       query: ({ pageNumber = 1, pageSize = 10, search = '', sort = {}, filter = {}, schemaId }) => {
//         let url = `/config?pageNumber=${pageNumber}&pageSize=${pageSize}`;
        
//         if (search) url += `&search=${search}`;
//         if (sort && Object.entries(sort)?.length) url += `&sort=${JSON.stringify(sort)}`;
//         if (filter && Object.entries(filter)?.length) url += `&filter=${JSON.stringify(filter)}`;
//         if (schemaId) url += `&schemaId=${schemaId}`;
        
//         return {
//           url,
//           method: 'GET'
//         };
//       },
//       transformResponse: (response) => {
//         const data = { data: response?.data };
        
//         if (response && response.pagination) {
//           data.totalPages = response.pagination.totalPages;
//           data.totalElements = response.pagination.totalElements;
//           data.pageSize = response.pagination.pageSize;
//           data.pageIndex = response.pagination.pageIndex;
//         }
        
//         return data;
//       },
//       providesTags: (result) =>
//         (result && result.data && Array.isArray(result.data))
//           ? [
//               ...result.data.map(({ name }) => ({ type: 'Config', id: name })),
//               { type: 'Config', id: 'LIST' }
//             ]
//           : [{ type: 'Config', id: 'LIST' }],
//       keepUnusedDataFor: 300 // shorter cache for configs as they might change frequently
//     }),
    
//     getConfig: builder.query({
//       query: (name) => ({
//         url: `/config/${name}`,
//         method: 'GET'
//       }),
//       transformResponse: (response) => response?.data,
//       providesTags: (result, error, name) => [{ type: 'Config', id: name }]
//     }),
    
//     createConfig: builder.mutation({
//       query: (body) => ({
//         url: '/config',
//         method: 'POST',
//         body
//       }),
//       transformResponse: (response) => response?.data,
//       invalidatesTags: [{ type: 'Config', id: 'LIST' }]
//     }),
    
//     updateConfig: builder.mutation({
//       query: ({ name, ...body }) => ({
//         url: `/config/${name}`,
//         method: 'PUT',
//         body
//       }),
//       transformResponse: (response) => response?.data,
//       invalidatesTags: (result, error, { name }) => [
//         { type: 'Config', id: name },
//         { type: 'Config', id: 'LIST' }
//       ]
//     }),
    
//     deleteConfig: builder.mutation({
//       query: (name) => ({
//         url: `/config/${name}`,
//         method: 'DELETE'
//       }),
//       transformResponse: (response) => response?.data,
//       invalidatesTags: (result, error, name) => [
//         { type: 'Config', id: name },
//         { type: 'Config', id: 'LIST' }
//       ]
//     }),
    
//     validateConfig: builder.mutation({
//       query: (body) => ({
//         url: '/config/validate',
//         method: 'POST',
//         body
//       }),
//       transformResponse: (response) => response?.data
//     }),
    
//     uploadConfigFile: builder.mutation({
//       query: ({ configName, file }) => {
//         const formData = new FormData();
//         formData.append('file', file);
        
//         return {
//           url: `/config/${configName}/file`,
//           method: 'POST',
//           body: formData,
//           formData: true
//         };
//       },
//       transformResponse: (response) => response?.data,
//       invalidatesTags: (result, error, { configName }) => [
//         { type: 'Config', id: configName },
//         { type: 'ConfigFile', id: 'LIST' }
//       ]
//     }),
    
//     uploadConfigFileBase64: builder.mutation({
//       query: ({ configName, base64Data, fileName, contentType }) => ({
//         url: `/config/${configName}/file/base64`,
//         method: 'POST',
//         body: { base64Data, fileName, contentType }
//       }),
//       transformResponse: (response) => response?.data,
//       invalidatesTags: (result, error, { configName }) => [
//         { type: 'Config', id: configName },
//         { type: 'ConfigFile', id: 'LIST' }
//       ]
//     }),
    
//     getConfigFiles: builder.query({
//       query: (configName) => ({
//         url: `/config/${configName}/files`,
//         method: 'GET'
//       }),
//       transformResponse: (response) => response?.data,
//       providesTags: [{ type: 'ConfigFile', id: 'LIST' }]
//     }),
    
//     deleteConfigFile: builder.mutation({
//       query: ({ configName, fileId }) => ({
//         url: `/config/${configName}/file/${fileId}`,
//         method: 'DELETE'
//       }),
//       transformResponse: (response) => response?.data,
//       invalidatesTags: [
//         { type: 'ConfigFile', id: 'LIST' },
//         { type: 'Config', id: 'LIST' }
//       ]
//     }),
    
//     // Service Schema Endpoints
//     getServiceSchemas: builder.query({
//       query: ({ pageNumber = 1, pageSize = 10, search = '', sort = {} }) => {
//         let url = `/service-schema?pageNumber=${pageNumber}&pageSize=${pageSize}`;
        
//         if (search) url += `&search=${search}`;
//         if (sort && Object.entries(sort)?.length) url += `&sort=${JSON.stringify(sort)}`;
        
//         return {
//           url,
//           method: 'GET'
//         };
//       },
//       transformResponse: (response) => {
//         const data = { data: response?.data };
        
//         if (response && response.pagination) {
//           data.totalPages = response.pagination.totalPages;
//           data.totalElements = response.pagination.totalElements;
//           data.pageSize = response.pagination.pageSize;
//           data.pageIndex = response.pagination.pageIndex;
//         }
        
//         return data;
//       },
//       providesTags: (result) =>
//         (result && result.data && Array.isArray(result.data))
//           ? [
//               ...result.data.map(({ id }) => ({ type: 'ServiceSchema', id })),
//               { type: 'ServiceSchema', id: 'LIST' }
//             ]
//           : [{ type: 'ServiceSchema', id: 'LIST' }],
//       keepUnusedDataFor: 3600
//     }),
    
//     getServiceSchema: builder.query({
//       query: (id) => ({
//         url: `/service-schema/${id}`,
//         method: 'GET'
//       }),
//       transformResponse: (response) => response?.data,
//       providesTags: (result, error, id) => [{ type: 'ServiceSchema', id }]
//     }),
    
//     createServiceSchema: builder.mutation({
//       query: (body) => ({
//         url: '/service-schema',
//         method: 'POST',
//         body
//       }),
//       transformResponse: (response) => response?.data,
//       invalidatesTags: [{ type: 'ServiceSchema', id: 'LIST' }]
//     }),
    
//     updateServiceSchema: builder.mutation({
//       query: ({ id, ...body }) => ({
//         url: `/service-schema/${id}`,
//         method: 'PUT',
//         body
//       }),
//       transformResponse: (response) => response?.data,
//       invalidatesTags: (result, error, { id }) => [
//         { type: 'ServiceSchema', id },
//         { type: 'ServiceSchema', id: 'LIST' }
//       ]
//     }),
    
//     deleteServiceSchema: builder.mutation({
//       query: (id) => ({
//         url: `/service-schema/${id}`,
//         method: 'DELETE'
//       }),
//       transformResponse: (response) => response?.data,
//       invalidatesTags: (result, error, id) => [
//         { type: 'ServiceSchema', id },
//         { type: 'ServiceSchema', id: 'LIST' }
//       ]
//     }),
    
//     validateServiceSchema: builder.mutation({
//       query: (body) => ({
//         url: '/service-schema/validate',
//         method: 'POST',
//         body
//       }),
//       transformResponse: (response) => response?.data
//     }),
    
//     // Service Endpoints
//     getServices: builder.query({
//       query: ({ pageNumber = 1, pageSize = 10, search = '', sort = {}, filter = {}, schemaId }) => {
//         let url = `/service?pageNumber=${pageNumber}&pageSize=${pageSize}`;
        
//         if (search) url += `&search=${search}`;
//         if (sort && Object.entries(sort)?.length) url += `&sort=${JSON.stringify(sort)}`;
//         if (filter && Object.entries(filter)?.length) url += `&filter=${JSON.stringify(filter)}`;
//         if (schemaId) url += `&schemaId=${schemaId}`;
        
//         return {
//           url,
//           method: 'GET'
//         };
//       },
//       transformResponse: (response) => {
//         const data = { data: response?.data };
        
//         if (response && response.pagination) {
//           data.totalPages = response.pagination.totalPages;
//           data.totalElements = response.pagination.totalElements;
//           data.pageSize = response.pagination.pageSize;
//           data.pageIndex = response.pagination.pageIndex;
//         }
        
//         return data;
//       },
//       providesTags: (result) =>
//         (result && result.data && Array.isArray(result.data))
//           ? [
//               ...result.data.map(({ id }) => ({ type: 'Service', id })),
//               { type: 'Service', id: 'LIST' }
//             ]
//           : [{ type: 'Service', id: 'LIST' }],
//       keepUnusedDataFor: 300
//     }),
    
//     getService: builder.query({
//       query: (id) => ({
//         url: `/service/${id}`,
//         method: 'GET'
//       }),
//       transformResponse: (response) => response?.data,
//       providesTags: (result, error, id) => [{ type: 'Service', id }]
//     }),
    
//     createService: builder.mutation({
//       query: (body) => ({
//         url: '/service',
//         method: 'POST',
//         body
//       }),
//       transformResponse: (response) => response?.data,
//       invalidatesTags: [{ type: 'Service', id: 'LIST' }]
//     }),
    
//     updateService: builder.mutation({
//       query: ({ id, ...body }) => ({
//         url: `/service/${id}`,
//         method: 'PUT',
//         body
//       }),
//       transformResponse: (response) => response?.data,
//       invalidatesTags: (result, error, { id }) => [
//         { type: 'Service', id },
//         { type: 'Service', id: 'LIST' }
//       ]
//     }),
    
//     deleteService: builder.mutation({
//       query: (id) => ({
//         url: `/service/${id}`,
//         method: 'DELETE'
//       }),
//       transformResponse: (response) => response?.data,
//       invalidatesTags: (result, error, id) => [
//         { type: 'Service', id },
//         { type: 'Service', id: 'LIST' }
//       ]
//     }),
    
//     validateService: builder.mutation({
//       query: (body) => ({
//         url: '/service/validate',
//         method: 'POST',
//         body
//       }),
//       transformResponse: (response) => response?.data
//     }),
    
//     uploadServiceFile: builder.mutation({
//       query: ({ serviceId, file, fileServiceType }) => {
//         const formData = new FormData();
//         formData.append('file', file);
//         if (fileServiceType) formData.append('fileServiceType', fileServiceType);
        
//         return {
//           url: `/service/${serviceId}/file`,
//           method: 'POST',
//           body: formData,
//           formData: true
//         };
//       },
//       transformResponse: (response) => response?.data,
//       invalidatesTags: (result, error, { serviceId }) => [
//         { type: 'Service', id: serviceId },
//         { type: 'ServiceFile', id: 'LIST' }
//       ]
//     }),
    
//     uploadServiceFileBase64: builder.mutation({
//       query: ({ serviceId, base64Data, fileName, contentType, fileServiceType }) => ({
//         url: `/service/${serviceId}/file/base64`,
//         method: 'POST',
//         body: { base64Data, fileName, contentType, fileServiceType }
//       }),
//       transformResponse: (response) => response?.data,
//       invalidatesTags: (result, error, { serviceId }) => [
//         { type: 'Service', id: serviceId },
//         { type: 'ServiceFile', id: 'LIST' }
//       ]
//     }),
    
//     getServiceFiles: builder.query({
//       query: (serviceId) => ({
//         url: `/service/${serviceId}/files`,
//         method: 'GET'
//       }),
//       transformResponse: (response) => response?.data,
//       providesTags: [{ type: 'ServiceFile', id: 'LIST' }]
//     }),
    
//     deleteServiceFile: builder.mutation({
//       query: ({ serviceId, fileId }) => ({
//         url: `/service/${serviceId}/file/${fileId}`,
//         method: 'DELETE'
//       }),
//       transformResponse: (response) => response?.data,
//       invalidatesTags: [
//         { type: 'ServiceFile', id: 'LIST' },
//         { type: 'Service', id: 'LIST' }
//       ]
//     }),
//   }),
//   overrideExisting: false
// });

// export default ConfigManagementApi;

// export const {
//   // Config Schema hooks
//   useGetConfigSchemasQuery,
//   useGetConfigSchemaQuery,
//   useCreateConfigSchemaMutation,
//   useUpdateConfigSchemaMutation,
//   useDeleteConfigSchemaMutation,
//   useValidateConfigSchemaMutation,
  
//   // Config hooks
//   useGetConfigsQuery,
//   useGetConfigQuery,
//   useCreateConfigMutation,
//   useUpdateConfigMutation,
//   useDeleteConfigMutation,
//   useValidateConfigMutation,
//   useUploadConfigFileMutation,
//   useUploadConfigFileBase64Mutation,
//   useGetConfigFilesQuery,
//   useDeleteConfigFileMutation,
  
//   // Service Schema hooks
//   useGetServiceSchemasQuery,
//   useGetServiceSchemaQuery,
//   useCreateServiceSchemaMutation,
//   useUpdateServiceSchemaMutation,
//   useDeleteServiceSchemaMutation,
//   useValidateServiceSchemaMutation,
  
//   // Service hooks
//   useGetServicesQuery,
//   useGetServiceQuery,
//   useCreateServiceMutation,
//   useUpdateServiceMutation,
//   useDeleteServiceMutation,
//   useValidateServiceMutation,
//   useUploadServiceFileMutation,
//   useUploadServiceFileBase64Mutation,
//   useGetServiceFilesQuery,
//   useDeleteServiceFileMutation,
// } = ConfigManagementApi;

