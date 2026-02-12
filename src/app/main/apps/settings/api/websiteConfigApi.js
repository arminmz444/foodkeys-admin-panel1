import { apiService as api } from "app/store/apiService";

const addTagTypes = ['WebsiteConfig', 'ConfigSchema'];

const websiteConfigApi = api.enhanceEndpoints({ addTagTypes }).injectEndpoints({
    endpoints: (builder) => ({
        getConfig: builder.query({
            query: (section) => ({
                url: `/config/website/${section}`,
                method: "GET",
            }),
            providesTags: (result, error, section) => [{ type: 'WebsiteConfig', id: section }],
        }),

        getSchemas: builder.query({
            query: () => ({
                url: `/config/website/schema`,
                method: "GET",
            }),
            providesTags: ['ConfigSchema'],
        }),

        // Add new config
        addConfig: builder.mutation({
            query: (configData) => ({
                url: '',
                method: 'POST',
                data: configData,
            }),
            invalidatesTags: ['WebsiteConfig'],
        }),

        // Update config section
        updateConfig: builder.mutation({
            query: ({ section, configData }) => ({
                url: `/config/website/${section}`,
                method: 'PUT',
                data: configData,
            }),
            invalidatesTags: (result, error, { section }) => [{ type: 'WebsiteConfig', id: section }],
        }),

        // Add config schema
        addConfigSchema: builder.mutation({
            query: (schemaData) => ({
                url: '/schema',
                method: 'POST',
                data: schemaData,
            }),
            invalidatesTags: ['ConfigSchema'],
        }),

        uploadWebsiteConfigFile: builder.mutation({
            query: ({ section, file }) => {
                const formData = new FormData();
                formData.append('file', file);
                return {
                    url: `/config/${section}/file`,
                    method: 'POST',
                    data: formData,
                    formData: true
                };
            },
            invalidatesTags: (result, error, { section }) => [{ type: 'WebsiteConfig', id: section }],
        }),
    }),
    overrideExisting: false,
});

export default websiteConfigApi;

export const {
    useGetConfigQuery,
    useGetSchemasQuery,
    useAddConfigMutation,
    useUpdateConfigMutation,
    useAddConfigSchemaMutation,
    useUploadWebsiteConfigFileMutation,
} = websiteConfigApi;