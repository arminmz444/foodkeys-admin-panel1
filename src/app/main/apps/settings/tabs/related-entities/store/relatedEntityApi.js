import { apiService as api } from 'app/store/apiService';

// Tag types for related entities
const addTagTypes = ['RelatedEntity', 'RelatedCompany', 'RelatedService'];

const RelatedEntityApi = api.enhanceEndpoints({ addTagTypes }).injectEndpoints({
	endpoints: (builder) => ({
		// Get related entities with pagination (generic)
		getRelatedEntities: builder.query({
			query: ({ entityType, sourceEntityId, pageNumber = 1, pageSize = 10 }) => ({
				url: '/related',
				method: 'GET',
				params: { entityType, sourceEntityId, pageNumber, pageSize }
			}),
			transformResponse: (response) => {
				const data = { data: response?.data || [] };
				if (response && response.pagination) {
					data.totalPages = response.pagination.totalPages;
					data.totalElements = response.pagination.totalElements;
					data.pageSize = response.pagination.pageSize;
					data.pageNumber = response.pagination.pageNumber;
				}
				return data;
			},
			providesTags: (result, error, { entityType, sourceEntityId }) => [
				{ type: 'RelatedEntity', id: `${entityType}-${sourceEntityId}` },
				{ type: 'RelatedEntity', id: 'LIST' }
			],
			keepUnusedDataFor: 0,
			refetchOnMountOrArgChange: true
		}),

		// Get all related entities without pagination
		getAllRelatedEntities: builder.query({
			query: ({ entityType, sourceEntityId }) => ({
				url: '/related/all',
				method: 'GET',
				params: { entityType, sourceEntityId }
			}),
			transformResponse: (response) => response?.data || [],
			providesTags: (result, error, { entityType, sourceEntityId }) => [
				{ type: 'RelatedEntity', id: `${entityType}-${sourceEntityId}-ALL` }
			]
		}),

		// Get related entity by ID
		getRelatedEntityById: builder.query({
			query: (id) => ({
				url: `/related/${id}`,
				method: 'GET'
			}),
			transformResponse: (response) => response?.data,
			providesTags: (result, error, id) => [{ type: 'RelatedEntity', id }]
		}),

		// Check if entities are related
		checkEntitiesRelated: builder.query({
			query: ({ entityType, sourceEntityId, relatedEntityId }) => ({
				url: '/related/check',
				method: 'GET',
				params: { entityType, sourceEntityId, relatedEntityId }
			}),
			transformResponse: (response) => response?.data
		}),

		// Add related entities (generic)
		addRelatedEntities: builder.mutation({
			query: (request) => ({
				url: '/related',
				method: 'POST',
				data: request
			}),
			transformResponse: (response) => response?.data,
			invalidatesTags: (result, error, { entityType, sourceEntityId }) => [
				{ type: 'RelatedEntity', id: `${entityType}-${sourceEntityId}` },
				{ type: 'RelatedEntity', id: 'LIST' }
			]
		}),

		// Remove related entities (generic)
		removeRelatedEntities: builder.mutation({
			query: (request) => ({
				url: '/related',
				method: 'DELETE',
				data: request
			}),
			invalidatesTags: (result, error, { entityType, sourceEntityId }) => [
				{ type: 'RelatedEntity', id: `${entityType}-${sourceEntityId}` },
				{ type: 'RelatedEntity', id: 'LIST' }
			]
		}),

		// Remove related entity by ID
		removeRelatedEntityById: builder.mutation({
			query: ({ id, softDelete = false }) => ({
				url: `/related/${id}`,
				method: 'DELETE',
				params: { softDelete }
			}),
			invalidatesTags: [{ type: 'RelatedEntity', id: 'LIST' }]
		}),

		// Reorder related entities (generic)
		reorderRelatedEntities: builder.mutation({
			query: (request) => ({
				url: '/related/reorder',
				method: 'PUT',
				data: request
			}),
			transformResponse: (response) => response?.data,
			invalidatesTags: (result, error, { entityType, sourceEntityId }) => [
				{ type: 'RelatedEntity', id: `${entityType}-${sourceEntityId}` }
			]
		}),

		// Normalize display orders (generic)
		normalizeRelatedDisplayOrders: builder.mutation({
			query: ({ entityType, sourceEntityId }) => ({
				url: '/related/normalize',
				method: 'POST',
				params: { entityType, sourceEntityId }
			}),
			invalidatesTags: (result, error, { entityType, sourceEntityId }) => [
				{ type: 'RelatedEntity', id: `${entityType}-${sourceEntityId}` }
			]
		}),

		// ========== Company-Specific Endpoints ==========
		// All company endpoints use the unified
		// `/related/company/{companyId}/{relationType}/**` URL format.
		// relationType can be 'related' (default), 'rival' or 'sub-company'.

		// Get related companies (enriched, website format)
		getRelatedCompaniesEnriched: builder.query({
			query: ({ companyId, relationType = 'related' }) => ({
				url: `/related/company/${companyId}/${relationType}`,
				method: 'GET'
			}),
			transformResponse: (response) => response?.data || [],
			providesTags: (result, error, { companyId, relationType = 'related' }) => [
				{ type: 'RelatedCompany', id: `${relationType}-${companyId}` }
			],
			keepUnusedDataFor: 0,
			refetchOnMountOrArgChange: true
		}),

		// Get related companies with pagination (admin format)
		getRelatedCompaniesPaginated: builder.query({
			query: ({ companyId, relationType = 'related', pageNumber = 1, pageSize = 10 }) => ({
				url: `/related/company/${companyId}/${relationType}/paginated`,
				method: 'GET',
				params: { pageNumber, pageSize }
			}),
			transformResponse: (response) => {
				const data = { data: response?.data || [] };
				if (response && response.pagination) {
					data.totalPages = response.pagination.totalPages;
					data.totalElements = response.pagination.totalElements;
					data.pageSize = response.pagination.pageSize;
					data.pageNumber = response.pagination.pageNumber;
				}
				return data;
			},
			providesTags: (result, error, { companyId, relationType = 'related' }) => [
				{ type: 'RelatedCompany', id: `paginated-${relationType}-${companyId}` }
			],
			keepUnusedDataFor: 0,
			refetchOnMountOrArgChange: true
		}),

		// Add single related company
		addRelatedCompany: builder.mutation({
			query: ({ companyId, relatedCompanyId, displayOrder, relationType = 'related' }) => ({
				url: `/related/company/${companyId}/${relationType}/${relatedCompanyId}`,
				method: 'POST',
				params: displayOrder ? { displayOrder } : {}
			}),
			transformResponse: (response) => response?.data,
			invalidatesTags: (result, error, { companyId, relationType = 'related' }) => [
				{ type: 'RelatedCompany', id: `${relationType}-${companyId}` },
				{ type: 'RelatedCompany', id: `paginated-${relationType}-${companyId}` }
			]
		}),

		// Add multiple related companies (batch)
		addRelatedCompaniesBatch: builder.mutation({
			query: ({ companyId, relatedCompanyIds, relationType = 'related' }) => ({
				url: `/related/company/${companyId}/${relationType}/batch`,
				method: 'POST',
				data: relatedCompanyIds
			}),
			transformResponse: (response) => response?.data,
			invalidatesTags: (result, error, { companyId, relationType = 'related' }) => [
				{ type: 'RelatedCompany', id: `${relationType}-${companyId}` },
				{ type: 'RelatedCompany', id: `paginated-${relationType}-${companyId}` }
			]
		}),

		// Remove single related company
		removeRelatedCompany: builder.mutation({
			query: ({ companyId, relatedCompanyId, relationType = 'related' }) => ({
				url: `/related/company/${companyId}/${relationType}/${relatedCompanyId}`,
				method: 'DELETE'
			}),
			invalidatesTags: (result, error, { companyId, relationType = 'related' }) => [
				{ type: 'RelatedCompany', id: `${relationType}-${companyId}` },
				{ type: 'RelatedCompany', id: `paginated-${relationType}-${companyId}` }
			]
		}),

		// Remove multiple related companies (batch)
		removeRelatedCompaniesBatch: builder.mutation({
			query: ({ companyId, relatedCompanyIds, relationType = 'related' }) => ({
				url: `/related/company/${companyId}/${relationType}/batch`,
				method: 'DELETE',
				data: relatedCompanyIds
			}),
			invalidatesTags: (result, error, { companyId, relationType = 'related' }) => [
				{ type: 'RelatedCompany', id: `${relationType}-${companyId}` },
				{ type: 'RelatedCompany', id: `paginated-${relationType}-${companyId}` }
			]
		}),

		// Reorder related companies
		reorderRelatedCompanies: builder.mutation({
			query: ({ companyId, orderedCompanyIds, relationType = 'related' }) => ({
				url: `/related/company/${companyId}/${relationType}/reorder`,
				method: 'PUT',
				data: orderedCompanyIds
			}),
			transformResponse: (response) => response?.data,
			invalidatesTags: (result, error, { companyId, relationType = 'related' }) => [
				{ type: 'RelatedCompany', id: `${relationType}-${companyId}` },
				{ type: 'RelatedCompany', id: `paginated-${relationType}-${companyId}` }
			]
		}),

		// Update display order for single related company
		updateRelatedCompanyOrder: builder.mutation({
			query: ({ companyId, relatedCompanyId, newDisplayOrder, relationType = 'related' }) => ({
				url: `/related/company/${companyId}/${relationType}/${relatedCompanyId}/order`,
				method: 'PUT',
				params: { newDisplayOrder }
			}),
			transformResponse: (response) => response?.data,
			invalidatesTags: (result, error, { companyId, relationType = 'related' }) => [
				{ type: 'RelatedCompany', id: `${relationType}-${companyId}` },
				{ type: 'RelatedCompany', id: `paginated-${relationType}-${companyId}` }
			]
		}),

		// Toggle related company
		toggleRelatedCompany: builder.mutation({
			query: ({ companyId, relatedCompanyId, relationType = 'related' }) => ({
				url: `/related/company/${companyId}/${relationType}/${relatedCompanyId}/toggle`,
				method: 'POST'
			}),
			transformResponse: (response) => response?.data,
			invalidatesTags: (result, error, { companyId, relationType = 'related' }) => [
				{ type: 'RelatedCompany', id: `${relationType}-${companyId}` },
				{ type: 'RelatedCompany', id: `paginated-${relationType}-${companyId}` }
			]
		}),

		// Remove all related companies
		removeAllRelatedCompanies: builder.mutation({
			query: ({ companyId, softDelete = false, relationType = 'related' }) => ({
				url: `/related/company/${companyId}/${relationType}/all`,
				method: 'DELETE',
				params: { softDelete }
			}),
			invalidatesTags: (result, error, { companyId, relationType = 'related' }) => [
				{ type: 'RelatedCompany', id: `${relationType}-${companyId}` },
				{ type: 'RelatedCompany', id: `paginated-${relationType}-${companyId}` }
			]
		}),

		// Normalize related companies order
		normalizeRelatedCompaniesOrder: builder.mutation({
			query: ({ companyId, relationType = 'related' }) => ({
				url: `/related/company/${companyId}/${relationType}/normalize`,
				method: 'POST'
			}),
			invalidatesTags: (result, error, { companyId, relationType = 'related' }) => [
				{ type: 'RelatedCompany', id: `${relationType}-${companyId}` },
				{ type: 'RelatedCompany', id: `paginated-${relationType}-${companyId}` }
			]
		}),

		// ========== Service-Specific Endpoints ==========

		// Get related services (enriched, website format)
		getRelatedServicesEnriched: builder.query({
			query: (serviceId) => ({
				url: `/related/service/${serviceId}`,
				method: 'GET'
			}),
			transformResponse: (response) => response?.data || [],
			providesTags: (result, error, serviceId) => [
				{ type: 'RelatedService', id: serviceId }
			],
			keepUnusedDataFor: 0,
			refetchOnMountOrArgChange: true
		}),

		// Get related services with pagination (admin format)
		getRelatedServicesPaginated: builder.query({
			query: ({ serviceId, pageNumber = 1, pageSize = 10 }) => ({
				url: `/related/service/${serviceId}/paginated`,
				method: 'GET',
				params: { pageNumber, pageSize }
			}),
			transformResponse: (response) => {
				const data = { data: response?.data || [] };
				if (response && response.pagination) {
					data.totalPages = response.pagination.totalPages;
					data.totalElements = response.pagination.totalElements;
					data.pageSize = response.pagination.pageSize;
					data.pageNumber = response.pagination.pageNumber;
				}
				return data;
			},
			providesTags: (result, error, { serviceId }) => [
				{ type: 'RelatedService', id: `paginated-${serviceId}` }
			],
			keepUnusedDataFor: 0,
			refetchOnMountOrArgChange: true
		}),

		// Add single related service
		addRelatedService: builder.mutation({
			query: ({ serviceId, relatedServiceId, displayOrder }) => ({
				url: `/related/service/${serviceId}/related/${relatedServiceId}`,
				method: 'POST',
				params: displayOrder ? { displayOrder } : {}
			}),
			transformResponse: (response) => response?.data,
			invalidatesTags: (result, error, { serviceId }) => [
				{ type: 'RelatedService', id: serviceId },
				{ type: 'RelatedService', id: `paginated-${serviceId}` }
			]
		}),

		// Add multiple related services (batch)
		addRelatedServicesBatch: builder.mutation({
			query: ({ serviceId, relatedServiceIds }) => ({
				url: `/related/service/${serviceId}/batch`,
				method: 'POST',
				data: relatedServiceIds
			}),
			transformResponse: (response) => response?.data,
			invalidatesTags: (result, error, { serviceId }) => [
				{ type: 'RelatedService', id: serviceId },
				{ type: 'RelatedService', id: `paginated-${serviceId}` }
			]
		}),

		// Remove single related service
		removeRelatedService: builder.mutation({
			query: ({ serviceId, relatedServiceId }) => ({
				url: `/related/service/${serviceId}/related/${relatedServiceId}`,
				method: 'DELETE'
			}),
			invalidatesTags: (result, error, { serviceId }) => [
				{ type: 'RelatedService', id: serviceId },
				{ type: 'RelatedService', id: `paginated-${serviceId}` }
			]
		}),

		// Remove multiple related services (batch)
		removeRelatedServicesBatch: builder.mutation({
			query: ({ serviceId, relatedServiceIds }) => ({
				url: `/related/service/${serviceId}/batch`,
				method: 'DELETE',
				data: relatedServiceIds
			}),
			invalidatesTags: (result, error, { serviceId }) => [
				{ type: 'RelatedService', id: serviceId },
				{ type: 'RelatedService', id: `paginated-${serviceId}` }
			]
		}),

		// Reorder related services
		reorderRelatedServices: builder.mutation({
			query: ({ serviceId, orderedServiceIds }) => ({
				url: `/related/service/${serviceId}/reorder`,
				method: 'PUT',
				data: orderedServiceIds
			}),
			transformResponse: (response) => response?.data,
			invalidatesTags: (result, error, { serviceId }) => [
				{ type: 'RelatedService', id: serviceId },
				{ type: 'RelatedService', id: `paginated-${serviceId}` }
			]
		}),

		// Update display order for single related service
		updateRelatedServiceOrder: builder.mutation({
			query: ({ serviceId, relatedServiceId, newDisplayOrder }) => ({
				url: `/related/service/${serviceId}/related/${relatedServiceId}/order`,
				method: 'PUT',
				params: { newDisplayOrder }
			}),
			transformResponse: (response) => response?.data,
			invalidatesTags: (result, error, { serviceId }) => [
				{ type: 'RelatedService', id: serviceId },
				{ type: 'RelatedService', id: `paginated-${serviceId}` }
			]
		}),

		// Toggle related service
		toggleRelatedService: builder.mutation({
			query: ({ serviceId, relatedServiceId }) => ({
				url: `/related/service/${serviceId}/related/${relatedServiceId}/toggle`,
				method: 'POST'
			}),
			transformResponse: (response) => response?.data,
			invalidatesTags: (result, error, { serviceId }) => [
				{ type: 'RelatedService', id: serviceId },
				{ type: 'RelatedService', id: `paginated-${serviceId}` }
			]
		}),

		// Remove all related services
		removeAllRelatedServices: builder.mutation({
			query: ({ serviceId, softDelete = false }) => ({
				url: `/related/service/${serviceId}/all`,
				method: 'DELETE',
				params: { softDelete }
			}),
			invalidatesTags: (result, error, { serviceId }) => [
				{ type: 'RelatedService', id: serviceId },
				{ type: 'RelatedService', id: `paginated-${serviceId}` }
			]
		}),

		// Normalize related services order
		normalizeRelatedServicesOrder: builder.mutation({
			query: (serviceId) => ({
				url: `/related/service/${serviceId}/normalize`,
				method: 'POST'
			}),
			invalidatesTags: (result, error, serviceId) => [
				{ type: 'RelatedService', id: serviceId },
				{ type: 'RelatedService', id: `paginated-${serviceId}` }
			]
		}),

		// ========== Search Companies (for adding related) ==========
		searchCompaniesForRelated: builder.query({
			query: ({ search = '', pageNumber = 1, pageSize = 10, categoryId, subCategoryId }) => {
				const params = { pageNumber, pageSize };
				if (search) params.search = search;
				if (categoryId) params.categoryId = categoryId;
				if (subCategoryId) params.subCategoryId = subCategoryId;
				return {
					url: '/company/',
					method: 'GET',
					params
				};
			},
			transformResponse: (response) => {
				const data = { data: response?.data || [] };
				if (response && response.pagination) {
					data.totalPages = response.pagination.totalPages;
					data.totalElements = response.pagination.totalElements;
					data.pageSize = response.pagination.pageSize;
					data.pageNumber = response.pagination.pageNumber;
				}
				return data;
			},
			keepUnusedDataFor: 0,
			refetchOnMountOrArgChange: true
		}),

		// ========== Search Services (for adding related) ==========
		searchServicesForRelated: builder.query({
			query: ({ search = '', pageNumber = 1, pageSize = 10, categoryId, subCategoryId }) => {
				const params = { pageNumber, pageSize };
				if (search) params.search = search;
				if (categoryId) params.categoryId = categoryId;
				if (subCategoryId) params.subCategoryId = subCategoryId;
				return {
					url: '/service/',
					method: 'GET',
					params
				};
			},
			transformResponse: (response) => {
				const data = { data: response?.data || [] };
				if (response && response.pagination) {
					data.totalPages = response.pagination.totalPages;
					data.totalElements = response.pagination.totalElements;
					data.pageSize = response.pagination.pageSize;
					data.pageNumber = response.pagination.pageNumber;
				}
				return data;
			},
			keepUnusedDataFor: 0,
			refetchOnMountOrArgChange: true
		})
	}),
	overrideExisting: false
});

export default RelatedEntityApi;

export const {
	// Generic endpoints
	useGetRelatedEntitiesQuery,
	useGetAllRelatedEntitiesQuery,
	useGetRelatedEntityByIdQuery,
	useCheckEntitiesRelatedQuery,
	useAddRelatedEntitiesMutation,
	useRemoveRelatedEntitiesMutation,
	useRemoveRelatedEntityByIdMutation,
	useReorderRelatedEntitiesMutation,
	useNormalizeRelatedDisplayOrdersMutation,
	
	// Company-specific endpoints
	useGetRelatedCompaniesEnrichedQuery,
	useGetRelatedCompaniesPaginatedQuery,
	useAddRelatedCompanyMutation,
	useAddRelatedCompaniesBatchMutation,
	useRemoveRelatedCompanyMutation,
	useRemoveRelatedCompaniesBatchMutation,
	useReorderRelatedCompaniesMutation,
	useUpdateRelatedCompanyOrderMutation,
	useToggleRelatedCompanyMutation,
	useRemoveAllRelatedCompaniesMutation,
	useNormalizeRelatedCompaniesOrderMutation,
	
	// Search
	useSearchCompaniesForRelatedQuery,
	useLazySearchCompaniesForRelatedQuery,

	// Service-specific endpoints
	useGetRelatedServicesEnrichedQuery,
	useGetRelatedServicesPaginatedQuery,
	useAddRelatedServiceMutation,
	useAddRelatedServicesBatchMutation,
	useRemoveRelatedServiceMutation,
	useRemoveRelatedServicesBatchMutation,
	useReorderRelatedServicesMutation,
	useUpdateRelatedServiceOrderMutation,
	useToggleRelatedServiceMutation,
	useRemoveAllRelatedServicesMutation,
	useNormalizeRelatedServicesOrderMutation,
	useSearchServicesForRelatedQuery,
	useLazySearchServicesForRelatedQuery
} = RelatedEntityApi;
