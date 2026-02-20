import { apiService as api } from "app/store/apiService";

// Tag types for subscription
const addTagTypes = ["Subscription"];

const SubscriptionsApi = api.enhanceEndpoints({ addTagTypes }).injectEndpoints({
  endpoints: (builder) => ({
    getSubscriptions: builder.query({
      query: ({ pageNumber, pageSize, search, sort, filter }) => {
        const sortParam =
          sort && Object.entries(sort)?.length
            ? encodeURIComponent(JSON.stringify(sort))
            : '';

        const filterParam =
          filter && Object.entries(filter)?.length
            ? encodeURIComponent(JSON.stringify(filter))
            : '';

        return {
          url: `/subscription?pageNumber=${pageNumber}` +
               `&pageSize=${pageSize}` +
               `&search=${encodeURIComponent(search ?? '')}` +
               `&sort=${sortParam}` +
               `&filter=${filterParam}`,
          method: "GET",
        };
      },
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
      providesTags: (result) =>
          (result && result.data && Array.isArray(result.data))
              ? [
                ...result.data.map(({ id }) => ({ type: "Subscription", id })),
                { type: "Subscription", id: "LIST" },
              ]
              : [{ type: "Subscription", id: "LIST" }],
      keepUnusedDataFor: 3600,
    }),
    getSubscription: builder.query({
      query: (id) => ({
        url: `/subscription/${id}`,
        method: "GET",
      }),
      transformResponse: (response) => response?.data,
      providesTags: (result, error, id) => [{ type: "Subscription", id }],
    }),
    createSubscription: builder.mutation({
      query: (body) => ({
        url: "/subscription/",
        method: "POST",
        data: body,
      }),
      transformResponse: (response) => response?.data,
      invalidatesTags: [{ type: "Subscription", id: "LIST" }],
    }),
    updateSubscription: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/subscription/${id}`,
        method: "PUT",
        data: body,
      }),
      transformResponse: (response) => response?.data,
      invalidatesTags: (result, error, { id }) => [
        { type: "Subscription", id },
        { type: "Subscription", id: "LIST" },
      ],
    }),
    deleteSubscription: builder.mutation({
      query: (id) => ({
        url: `/subscription/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response) => response?.data,
      invalidatesTags: (result, error, id) => [
        { type: "Subscription", id },
        { type: "Subscription", id: "LIST" },
      ],
    }),
    // New endpoints for subscription management
    acceptOrDenySubscription: builder.mutation({
      query: ({ id, status }) => ({
        url: `/subscription/${id}/status`,
        method: "PUT",
        data: { status },
      }),
      transformResponse: (response) => response?.data,
      invalidatesTags: (result, error, { id }) => [
        { type: "Subscription", id },
        { type: "Subscription", id: "LIST" },
      ],
    }),
    enableSubscription: builder.mutation({
      query: (id) => ({
        url: `/subscription/${id}/enable`,
        method: "PUT",
      }),
      transformResponse: (response) => response?.data,
      invalidatesTags: (result, error, id) => [
        { type: "Subscription", id },
        { type: "Subscription", id: "LIST" },
      ],
    }),
    disableSubscription: builder.mutation({
      query: (id) => ({
        url: `/subscription/${id}/disable`,
        method: "PUT",
      }),
      transformResponse: (response) => response?.data,
      invalidatesTags: (result, error, id) => [
        { type: "Subscription", id },
        { type: "Subscription", id: "LIST" },
      ],
    }),
    extendSubscription: builder.mutation({
      query: ({ id, monthsToExtend, reason }) => ({
        url: `/subscription/${id}/extend`,
        method: "PUT",
        data: { monthsToExtend, reason },
      }),
      transformResponse: (response) => response?.data,
      invalidatesTags: (result, error, { id }) => [
        { type: "Subscription", id },
        { type: "Subscription", id: "LIST" },
      ],
    }),
  }),
  overrideExisting: false,
});

export default SubscriptionsApi;

export const {
  useGetSubscriptionsQuery,
  useGetSubscriptionQuery,
  useCreateSubscriptionMutation,
  useUpdateSubscriptionMutation,
  useDeleteSubscriptionMutation,
  useAcceptOrDenySubscriptionMutation,
  useEnableSubscriptionMutation,
  useDisableSubscriptionMutation,
  useExtendSubscriptionMutation,
} = SubscriptionsApi;