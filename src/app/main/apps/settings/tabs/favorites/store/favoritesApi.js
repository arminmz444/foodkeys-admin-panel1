import { apiService as api } from 'app/store/apiService';

// Tag types for favorites
const addTagTypes = ['Favorite', 'FavoriteCompany', 'FavoriteService'];

const FavoritesApi = api.enhanceEndpoints({ addTagTypes }).injectEndpoints({
	endpoints: (builder) => ({
		// Get paginated favorite companies by subcategory
		getFavoriteCompanies: builder.query({
			query: ({ subCategoryId, pageNumber = 1, pageSize = 10 }) => ({
				url: `/favorites/company/subcategory/${subCategoryId}`,
				method: 'GET',
				params: { pageNumber, pageSize }
			}),
			transformResponse: (response) => {
				const data = { data: response?.data || [] };
				if (response && response.pagination) {
					data.totalPages = response.pagination.totalPages;
					data.totalElements = response.pagination.totalElements;
					data.pageSize = response.pagination.pageSize;
					data.pageIndex = response.pagination.pageIndex;
					data.pageNumber = response.pagination.pageNumber;
				}
				return data;
			},
			providesTags: (result, error, { subCategoryId }) => [
				{ type: 'FavoriteCompany', id: subCategoryId },
				{ type: 'Favorite', id: 'LIST' }
			],
			keepUnusedDataFor: 0,
			refetchOnMountOrArgChange: true
		}),

		// Get all favorites (non-paginated)
		getAllFavorites: builder.query({
			query: () => ({
				url: '/favorites/all',
				method: 'GET'
			}),
			transformResponse: (response) => response?.data || [],
			providesTags: [{ type: 'Favorite', id: 'ALL' }],
			keepUnusedDataFor: 0,
			refetchOnMountOrArgChange: true
		}),

		// Check if company is favorited
		checkCompanyFavorite: builder.query({
			query: ({ companyId, subCategoryId }) => ({
				url: `/favorites/company/${companyId}/subcategory/${subCategoryId}/check`,
				method: 'GET'
			}),
			transformResponse: (response) => response?.data
		}),

		// Add single company as favorite
		addCompanyFavorite: builder.mutation({
			query: ({ companyId, subCategoryId }) => ({
				url: `/favorites/company/${companyId}/subcategory/${subCategoryId}`,
				method: 'POST'
			}),
			transformResponse: (response) => response?.data,
			invalidatesTags: (result, error, { subCategoryId }) => [
				{ type: 'FavoriteCompany', id: subCategoryId },
				{ type: 'Favorite', id: 'LIST' },
				{ type: 'Favorite', id: 'ALL' }
			]
		}),

		// Add multiple companies as favorites (batch)
		addBatchCompanyFavorites: builder.mutation({
			query: ({ subCategoryId, companyIds }) => ({
				url: `/favorites/company/batch/subcategory/${subCategoryId}`,
				method: 'POST',
				data: companyIds
			}),
			transformResponse: (response) => response?.data,
			invalidatesTags: (result, error, { subCategoryId }) => [
				{ type: 'FavoriteCompany', id: subCategoryId },
				{ type: 'Favorite', id: 'LIST' },
				{ type: 'Favorite', id: 'ALL' }
			]
		}),

		// Remove single company from favorites
		removeCompanyFavorite: builder.mutation({
			query: ({ companyId, subCategoryId }) => ({
				url: `/favorites/company/${companyId}/subcategory/${subCategoryId}`,
				method: 'DELETE'
			}),
			transformResponse: (response) => response?.data,
			invalidatesTags: (result, error, { subCategoryId }) => [
				{ type: 'FavoriteCompany', id: subCategoryId },
				{ type: 'Favorite', id: 'LIST' },
				{ type: 'Favorite', id: 'ALL' }
			]
		}),

		// Remove multiple companies from favorites (batch)
		removeBatchCompanyFavorites: builder.mutation({
			query: ({ subCategoryId, companyIds }) => ({
				url: `/favorites/company/batch/subcategory/${subCategoryId}`,
				method: 'DELETE',
				data: companyIds
			}),
			transformResponse: (response) => response?.data,
			invalidatesTags: (result, error, { subCategoryId }) => [
				{ type: 'FavoriteCompany', id: subCategoryId },
				{ type: 'Favorite', id: 'LIST' },
				{ type: 'Favorite', id: 'ALL' }
			]
		}),

		// Toggle favorite status
		toggleCompanyFavorite: builder.mutation({
			query: ({ companyId, subCategoryId }) => ({
				url: `/favorites/company/${companyId}/subcategory/${subCategoryId}/toggle`,
				method: 'POST'
			}),
			transformResponse: (response) => response?.data,
			invalidatesTags: (result, error, { subCategoryId }) => [
				{ type: 'FavoriteCompany', id: subCategoryId },
				{ type: 'Favorite', id: 'LIST' },
				{ type: 'Favorite', id: 'ALL' }
			]
		}),

		// Reorder favorites (drag-and-drop style)
		reorderCompanyFavorites: builder.mutation({
			query: ({ subCategoryId, companyIds }) => ({
				url: `/favorites/company/subcategory/${subCategoryId}/reorder`,
				method: 'PUT',
				data: companyIds
			}),
			transformResponse: (response) => response?.data,
			invalidatesTags: (result, error, { subCategoryId }) => [
				{ type: 'FavoriteCompany', id: subCategoryId },
				{ type: 'Favorite', id: 'LIST' }
			]
		}),

		// Update single company's display order
		updateCompanyFavoriteOrder: builder.mutation({
			query: ({ companyId, subCategoryId, displayOrder }) => ({
				url: `/favorites/company/${companyId}/subcategory/${subCategoryId}/order`,
				method: 'PUT',
				data: { displayOrder }
			}),
			transformResponse: (response) => response?.data,
			invalidatesTags: (result, error, { subCategoryId }) => [
				{ type: 'FavoriteCompany', id: subCategoryId },
				{ type: 'Favorite', id: 'LIST' }
			]
		}),

		// Normalize display orders
		normalizeFavoriteOrders: builder.mutation({
			query: () => ({
				url: '/favorites/normalize',
				method: 'POST'
			}),
			transformResponse: (response) => response?.data,
			invalidatesTags: [
				{ type: 'Favorite', id: 'LIST' },
				{ type: 'Favorite', id: 'ALL' }
			]
		}),

		// Get paginated favorite services by subcategory
		getFavoriteServices: builder.query({
			query: ({ subCategoryId, pageNumber = 1, pageSize = 10 }) => ({
				url: `/favorites/service/subcategory/${subCategoryId}`,
				method: 'GET',
				params: { pageNumber, pageSize }
			}),
			transformResponse: (response) => {
				const data = { data: response?.data || [] };
				if (response && response.pagination) {
					data.totalPages = response.pagination.totalPages;
					data.totalElements = response.pagination.totalElements;
					data.pageSize = response.pagination.pageSize;
					data.pageIndex = response.pagination.pageIndex;
					data.pageNumber = response.pagination.pageNumber;
				}
				return data;
			},
			providesTags: (result, error, { subCategoryId }) => [
				{ type: 'FavoriteService', id: subCategoryId },
				{ type: 'Favorite', id: 'LIST' }
			],
			keepUnusedDataFor: 0,
			refetchOnMountOrArgChange: true
		}),

		// Check if service is favorited
		checkServiceFavorite: builder.query({
			query: ({ serviceId, subCategoryId }) => ({
				url: `/favorites/service/${serviceId}/subcategory/${subCategoryId}/check`,
				method: 'GET'
			}),
			transformResponse: (response) => response?.data
		}),

		// Add single service as favorite
		addServiceFavorite: builder.mutation({
			query: ({ serviceId, subCategoryId }) => ({
				url: `/favorites/service/${serviceId}/subcategory/${subCategoryId}`,
				method: 'POST'
			}),
			transformResponse: (response) => response?.data,
			invalidatesTags: (result, error, { subCategoryId }) => [
				{ type: 'FavoriteService', id: subCategoryId },
				{ type: 'Favorite', id: 'LIST' },
				{ type: 'Favorite', id: 'ALL' }
			]
		}),

		// Add multiple services as favorites (batch)
		addBatchServiceFavorites: builder.mutation({
			query: ({ subCategoryId, serviceIds }) => ({
				url: `/favorites/service/batch/subcategory/${subCategoryId}`,
				method: 'POST',
				data: serviceIds
			}),
			transformResponse: (response) => response?.data,
			invalidatesTags: (result, error, { subCategoryId }) => [
				{ type: 'FavoriteService', id: subCategoryId },
				{ type: 'Favorite', id: 'LIST' },
				{ type: 'Favorite', id: 'ALL' }
			]
		}),

		// Remove single service from favorites
		removeServiceFavorite: builder.mutation({
			query: ({ serviceId, subCategoryId }) => ({
				url: `/favorites/service/${serviceId}/subcategory/${subCategoryId}`,
				method: 'DELETE'
			}),
			transformResponse: (response) => response?.data,
			invalidatesTags: (result, error, { subCategoryId }) => [
				{ type: 'FavoriteService', id: subCategoryId },
				{ type: 'Favorite', id: 'LIST' },
				{ type: 'Favorite', id: 'ALL' }
			]
		}),

		// Remove multiple services from favorites (batch)
		removeBatchServiceFavorites: builder.mutation({
			query: ({ subCategoryId, serviceIds }) => ({
				url: `/favorites/service/batch/subcategory/${subCategoryId}`,
				method: 'DELETE',
				data: serviceIds
			}),
			transformResponse: (response) => response?.data,
			invalidatesTags: (result, error, { subCategoryId }) => [
				{ type: 'FavoriteService', id: subCategoryId },
				{ type: 'Favorite', id: 'LIST' },
				{ type: 'Favorite', id: 'ALL' }
			]
		}),

		// Toggle service favorite status
		toggleServiceFavorite: builder.mutation({
			query: ({ serviceId, subCategoryId }) => ({
				url: `/favorites/service/${serviceId}/subcategory/${subCategoryId}/toggle`,
				method: 'POST'
			}),
			transformResponse: (response) => response?.data,
			invalidatesTags: (result, error, { subCategoryId }) => [
				{ type: 'FavoriteService', id: subCategoryId },
				{ type: 'Favorite', id: 'LIST' },
				{ type: 'Favorite', id: 'ALL' }
			]
		}),

		// Reorder service favorites (drag-and-drop style)
		reorderServiceFavorites: builder.mutation({
			query: ({ subCategoryId, serviceIds }) => ({
				url: `/favorites/service/subcategory/${subCategoryId}/reorder`,
				method: 'PUT',
				data: serviceIds
			}),
			transformResponse: (response) => response?.data,
			invalidatesTags: (result, error, { subCategoryId }) => [
				{ type: 'FavoriteService', id: subCategoryId },
				{ type: 'Favorite', id: 'LIST' }
			]
		}),

		// Update single service's display order
		updateServiceFavoriteOrder: builder.mutation({
			query: ({ serviceId, subCategoryId, displayOrder }) => ({
				url: `/favorites/service/${serviceId}/subcategory/${subCategoryId}/order`,
				method: 'PUT',
				data: { displayOrder }
			}),
			transformResponse: (response) => response?.data,
			invalidatesTags: (result, error, { subCategoryId }) => [
				{ type: 'FavoriteService', id: subCategoryId },
				{ type: 'Favorite', id: 'LIST' }
			]
		}),

		// Search companies to add as favorites
		searchCompanies: builder.query({
			query: ({ subCategoryId, search = '', pageNumber = 1, pageSize = 5 }) => {
				let url = `/company/?subCategoryId=${subCategoryId}&pageNumber=${pageNumber}&pageSize=${pageSize}`;
				if (search) url += `&search=${encodeURIComponent(search)}`;
				return {
					url,
					method: 'GET'
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

		// Search services to add as favorites
		searchServices: builder.query({
			query: ({ subCategoryId, search = '', pageNumber = 1, pageSize = 5 }) => {
				let url = `/service/?subCategoryId=${subCategoryId}&pageNumber=${pageNumber}&pageSize=${pageSize}`;
				if (search) url += `&search=${encodeURIComponent(search)}`;
				return {
					url,
					method: 'GET'
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

export default FavoritesApi;

export const {
	useGetFavoriteCompaniesQuery,
	useGetAllFavoritesQuery,
	useCheckCompanyFavoriteQuery,
	useAddCompanyFavoriteMutation,
	useAddBatchCompanyFavoritesMutation,
	useRemoveCompanyFavoriteMutation,
	useRemoveBatchCompanyFavoritesMutation,
	useToggleCompanyFavoriteMutation,
	useReorderCompanyFavoritesMutation,
	useUpdateCompanyFavoriteOrderMutation,
	useNormalizeFavoriteOrdersMutation,
	useSearchCompaniesQuery,
	useLazySearchCompaniesQuery,
	useGetFavoriteServicesQuery,
	useCheckServiceFavoriteQuery,
	useAddServiceFavoriteMutation,
	useAddBatchServiceFavoritesMutation,
	useRemoveServiceFavoriteMutation,
	useRemoveBatchServiceFavoritesMutation,
	useToggleServiceFavoriteMutation,
	useReorderServiceFavoritesMutation,
	useUpdateServiceFavoriteOrderMutation,
	useSearchServicesQuery,
	useLazySearchServicesQuery
} = FavoritesApi;
