import { apiService as api } from 'app/store/apiService';

const addTagTypes = ['bundleList', 'bundle'];

const BundlesApi = api.enhanceEndpoints({ addTagTypes }).injectEndpoints({
	endpoints: (builder) => ({
		getBundles: builder.query({
			query: ({ pageNumber, pageSize, search, sort, filter }) => ({
				url: `/bundle?pageNumber=${pageNumber}&pageSize=${pageSize}&search=${search}&sort=${(sort && Object.entries(sort)?.length && JSON.stringify(sort)) || ''}&filter=${(filter && Object.entries(filter)?.length && JSON.stringify(filter)) || ''}`,
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
			providesTags: ['bundleList']
		}),

		getBundle: builder.query({
			query: (id) => ({
				url: `/bundle/${id}`,
				method: 'GET'
			}),
			transformResponse: (response) => response?.data,
			providesTags: (result, error, id) => [{ type: 'bundle', id }]
		}),

		createBundle: builder.mutation({
			query: (newCat) => ({
				url: '/bundle/',
				method: 'POST',
				data: newCat
			}),
			transformResponse: (response) => response,
			invalidatesTags: ['bundleList']
		}),

		updateBundle: builder.mutation({
			query: ({ id, ...rest }) => ({
				url: `/bundle/${id}`,
				method: 'PUT',
				data: rest
			}),
			transformResponse: (response) => response?.data,
			invalidatesTags: (result, error, { id }) => [{ type: 'bundle', id }, 'bundleList']
		}),

		deleteBundle: builder.mutation({
			query: (id) => ({
				url: `/bundle/${id}`,
				method: 'DELETE'
			}),
			transformResponse: (response) => response?.data,
			invalidatesTags: ['bundleList']
		})
	}),
	overrideExisting: false
});

export default BundlesApi;

export const {
	useGetBundlesQuery,
	useGetBundleQuery,
	useCreateBundleMutation,
	useUpdateBundleMutation,
	useDeleteBundleMutation
} = BundlesApi;
