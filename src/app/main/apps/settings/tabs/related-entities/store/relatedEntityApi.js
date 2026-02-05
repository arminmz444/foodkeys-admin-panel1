import { apiService as api } from 'app/store/apiService';

// Tag types for related entities
const addTagTypes = ['RelatedEntity', 'RelatedCompany'];

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

		// Get related companies (enriched, website format)
		getRelatedCompaniesEnriched: builder.query({
			query: (companyId) => ({
				url: `/related/company/${companyId}`,
				method: 'GET'
			}),
			transformResponse: (response) => response?.data || [],
			providesTags: (result, error, companyId) => [
				{ type: 'RelatedCompany', id: companyId }
			],
			keepUnusedDataFor: 0,
			refetchOnMountOrArgChange: true
		}),

		// Get related companies with pagination (admin format)
		getRelatedCompaniesPaginated: builder.query({
			query: ({ companyId, pageNumber = 1, pageSize = 10 }) => ({
				url: `/related/company/${companyId}/paginated`,
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
			providesTags: (result, error, { companyId }) => [
				{ type: 'RelatedCompany', id: `paginated-${companyId}` }
			],
			keepUnusedDataFor: 0,
			refetchOnMountOrArgChange: true
		}),

		// Add single related company
		addRelatedCompany: builder.mutation({
			query: ({ companyId, relatedCompanyId, displayOrder }) => ({
				url: `/related/company/${companyId}/related/${relatedCompanyId}`,
				method: 'POST',
				params: displayOrder ? { displayOrder } : {}
			}),
			transformResponse: (response) => response?.data,
			invalidatesTags: (result, error, { companyId }) => [
				{ type: 'RelatedCompany', id: companyId },
				{ type: 'RelatedCompany', id: `paginated-${companyId}` }
			]
		}),

		// Add multiple related companies (batch)
		addRelatedCompaniesBatch: builder.mutation({
			query: ({ companyId, relatedCompanyIds }) => ({
				url: `/related/company/${companyId}/batch`,
				method: 'POST',
				data: relatedCompanyIds
			}),
			transformResponse: (response) => response?.data,
			invalidatesTags: (result, error, { companyId }) => [
				{ type: 'RelatedCompany', id: companyId },
				{ type: 'RelatedCompany', id: `paginated-${companyId}` }
			]
		}),

		// Remove single related company
		removeRelatedCompany: builder.mutation({
			query: ({ companyId, relatedCompanyId }) => ({
				url: `/related/company/${companyId}/related/${relatedCompanyId}`,
				method: 'DELETE'
			}),
			invalidatesTags: (result, error, { companyId }) => [
				{ type: 'RelatedCompany', id: companyId },
				{ type: 'RelatedCompany', id: `paginated-${companyId}` }
			]
		}),

		// Remove multiple related companies (batch)
		removeRelatedCompaniesBatch: builder.mutation({
			query: ({ companyId, relatedCompanyIds }) => ({
				url: `/related/company/${companyId}/batch`,
				method: 'DELETE',
				data: relatedCompanyIds
			}),
			invalidatesTags: (result, error, { companyId }) => [
				{ type: 'RelatedCompany', id: companyId },
				{ type: 'RelatedCompany', id: `paginated-${companyId}` }
			]
		}),

		// Reorder related companies
		reorderRelatedCompanies: builder.mutation({
			query: ({ companyId, orderedCompanyIds }) => ({
				url: `/related/company/${companyId}/reorder`,
				method: 'PUT',
				data: orderedCompanyIds
			}),
			transformResponse: (response) => response?.data,
			invalidatesTags: (result, error, { companyId }) => [
				{ type: 'RelatedCompany', id: companyId },
				{ type: 'RelatedCompany', id: `paginated-${companyId}` }
			]
		}),

		// Update display order for single related company
		updateRelatedCompanyOrder: builder.mutation({
			query: ({ companyId, relatedCompanyId, newDisplayOrder }) => ({
				url: `/related/company/${companyId}/related/${relatedCompanyId}/order`,
				method: 'PUT',
				params: { newDisplayOrder }
			}),
			transformResponse: (response) => response?.data,
			invalidatesTags: (result, error, { companyId }) => [
				{ type: 'RelatedCompany', id: companyId },
				{ type: 'RelatedCompany', id: `paginated-${companyId}` }
			]
		}),

		// Toggle related company
		toggleRelatedCompany: builder.mutation({
			query: ({ companyId, relatedCompanyId }) => ({
				url: `/related/company/${companyId}/related/${relatedCompanyId}/toggle`,
				method: 'POST'
			}),
			transformResponse: (response) => response?.data,
			invalidatesTags: (result, error, { companyId }) => [
				{ type: 'RelatedCompany', id: companyId },
				{ type: 'RelatedCompany', id: `paginated-${companyId}` }
			]
		}),

		// Remove all related companies
		removeAllRelatedCompanies: builder.mutation({
			query: ({ companyId, softDelete = false }) => ({
				url: `/related/company/${companyId}/all`,
				method: 'DELETE',
				params: { softDelete }
			}),
			invalidatesTags: (result, error, { companyId }) => [
				{ type: 'RelatedCompany', id: companyId },
				{ type: 'RelatedCompany', id: `paginated-${companyId}` }
			]
		}),

		// Normalize related companies order
		normalizeRelatedCompaniesOrder: builder.mutation({
			query: (companyId) => ({
				url: `/related/company/${companyId}/normalize`,
				method: 'POST'
			}),
			invalidatesTags: (result, error, companyId) => [
				{ type: 'RelatedCompany', id: companyId },
				{ type: 'RelatedCompany', id: `paginated-${companyId}` }
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
	useLazySearchCompaniesForRelatedQuery
} = RelatedEntityApi;
