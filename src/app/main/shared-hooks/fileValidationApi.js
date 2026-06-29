import { apiService as api } from 'app/store/apiService';

const addTagTypes = ['FileServiceTypes'];

const FileValidationApi = api.enhanceEndpoints({ addTagTypes }).injectEndpoints({
  endpoints: (builder) => ({
    getFileValidationConfig: builder.query({
      query: (name) => ({
        url: `/file-service-type/${name}`,
        method: 'GET',
      }),
      transformResponse: (response) => {
        const data = response?.data || response;
        return {
          maxFiles: data.maxFiles ?? null,
          maxFileSize: data.maxFileSize ?? null,
          allowedMimeTypes: data.allowedMimeTypes ?? [],
          allowedExtensions: data.allowedExtensions ?? [],
          displayName: data.displayName ?? '',
          description: data.description ?? '',
          ...data,
        };
      },
      providesTags: (result, error, name) => [{ type: 'FileServiceTypes', id: name }],
      keepUnusedDataFor: 600,
    }),
  }),
  overrideExisting: false,
});

export default FileValidationApi;

export const { useGetFileValidationConfigQuery } = FileValidationApi;
