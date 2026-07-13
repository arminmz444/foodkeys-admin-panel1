import { apiService as api } from 'app/store/apiService';

const addTagTypes = ['subscriptionList', 'subscription'];

const SubscriptionsApi = api.enhanceEndpoints({ addTagTypes }).injectEndpoints({
	endpoints: (builder) => ({
		getSubscriptions: builder.query({
			query: ({ pageNumber, pageSize, search, sort, filter }) => ({
				url: `/subscription?pageNumber=${pageNumber}&pageSize=${pageSize}&search=${search}&sort=${(sort && Object.entries(sort)?.length && JSON.stringify(sort)) || ''}&filter=${(filter && Object.entries(filter)?.length && JSON.stringify(filter)) || ''}`,
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
			providesTags: ['subscriptionList']
		}),

		getSubscription: builder.query({
			query: (id) => ({
				url: `/subscription/${id}`,
				method: 'GET'
			}),
			transformResponse: (response) => response?.data,
			providesTags: (result, error, id) => [{ type: 'subscription', id }]
		}),

		createSubscription: builder.mutation({
			query: (newCat) => ({
				url: '/subscription/',
				method: 'POST',
				data: newCat
			}),
			transformResponse: (response) => response,
			invalidatesTags: ['subscriptionList']
		}),

		updateSubscription: builder.mutation({
			query: ({ id, ...rest }) => ({
				url: `/subscription/${id}`,
				method: 'PUT',
				data: rest
			}),
			transformResponse: (response) => response?.data,
			invalidatesTags: (result, error, { id }) => [{ type: 'subscription', id }, 'subscriptionList']
		}),

		deleteSubscription: builder.mutation({
			query: (id) => ({
				url: `/subscription/${id}`,
				method: 'DELETE'
			}),
			transformResponse: (response) => response?.data,
			invalidatesTags: ['subscriptionList']
		})
	}),
	overrideExisting: false
});

export default SubscriptionsApi;

export const {
	useGetSubscriptionsQuery,
	useGetSubscriptionQuery,
	useCreateSubscriptionMutation,
	useUpdateSubscriptionMutation,
	useDeleteSubscriptionMutation
} = SubscriptionsApi;
