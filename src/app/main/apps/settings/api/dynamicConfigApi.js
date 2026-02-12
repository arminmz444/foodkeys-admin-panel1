import { apiService as api } from "app/store/apiService";

const addTagTypes = ['DynamicConfig', 'ConfigSchema', 'AllConfigs'];

const dynamicConfigApi = api.enhanceEndpoints({ addTagTypes }).injectEndpoints({
    endpoints: (builder) => ({
        // Get all configs list
        getAllConfigs: builder.query({
            query: () => ({
                url: `/config`,
                method: "GET",
            }),
            providesTags: ['AllConfigs'],
        }),

        // Get config schema by schema ID
        getConfigSchema: builder.query({
            query: (schemaId) => ({
                url: `/config/schema/${schemaId}`,
                method: "GET",
            }),
            providesTags: (result, error, schemaId) => [{ type: 'ConfigSchema', id: schemaId }],
        }),

        // Get config schema by name
        getConfigSchemaByName: builder.query({
            query: (schemaName) => ({
                url: `/config/schema/by-name/${schemaName}`,
                method: "GET",
            }),
            providesTags: (result, error, schemaName) => [{ type: 'ConfigSchema', id: schemaName }],
        }),

        // Get config by name (section)
        getConfigByName: builder.query({
            query: (name) => ({
                url: `/config/website/${name}`,
                method: "GET",
            }),
            providesTags: (result, error, name) => [{ type: 'DynamicConfig', id: name }],
        }),

        // Update config by name (section)
        updateConfigByName: builder.mutation({
            query: ({ name, configData }) => ({
                url: `/config/website/${name}`,
                method: 'PUT',
                data: configData,
            }),
            invalidatesTags: (result, error, { name }) => [
                { type: 'DynamicConfig', id: name },
                'AllConfigs'
            ],
        }),

        // Get config with its schema in one call (convenience endpoint)
        getConfigWithSchema: builder.query({
            query: (configId) => ({
                url: `/config/${configId}/schema`,
                method: "GET",
            }),
            providesTags: (result, error, configId) => [
                { type: 'DynamicConfig', id: configId },
                { type: 'ConfigSchema', id: configId }
            ],
        }),
    }),
    overrideExisting: false,
});

export default dynamicConfigApi;

export const {
    useGetAllConfigsQuery,
    useGetConfigSchemaQuery,
    useGetConfigSchemaByNameQuery,
    useGetConfigByNameQuery,
    useUpdateConfigByNameMutation,
    useGetConfigWithSchemaQuery,
    // Lazy queries for manual triggering
    useLazyGetConfigSchemaQuery,
    useLazyGetConfigByNameQuery,
} = dynamicConfigApi;
