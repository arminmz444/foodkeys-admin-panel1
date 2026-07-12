import { apiService as api } from 'app/store/apiService';

const addTagTypes = [
	'NotificationChannel',
	'NotificationConfig',
	'NotificationConstraint',
	'InternalEvent',
	'NotificationMeta'
];

const NotificationAdminApi = api.enhanceEndpoints({ addTagTypes }).injectEndpoints({
	endpoints: (builder) => ({
		// ── Channels ──────────────────────────────────────────────
		getNotificationChannels: builder.query({
			query: () => ({
				url: '/notification-channels',
				method: 'GET'
			}),
			transformResponse: (response) => response?.data || [],
			providesTags: (result) =>
				result?.length
					? [
							...result.map(({ id }) => ({ type: 'NotificationChannel', id })),
							{ type: 'NotificationChannel', id: 'LIST' }
						]
					: [{ type: 'NotificationChannel', id: 'LIST' }],
			keepUnusedDataFor: 120,
			refetchOnMountOrArgChange: true
		}),

		getNotificationChannel: builder.query({
			query: (id) => ({
				url: `/notification-channels/${id}`,
				method: 'GET'
			}),
			transformResponse: (response) => response?.data,
			providesTags: (_, __, id) => [{ type: 'NotificationChannel', id }],
			keepUnusedDataFor: 120
		}),

		createNotificationChannel: builder.mutation({
			query: (body) => ({
				url: '/notification-channels',
				method: 'POST',
				data: body
			}),
			transformResponse: (response) => response?.data,
			invalidatesTags: [{ type: 'NotificationChannel', id: 'LIST' }]
		}),

		updateNotificationChannel: builder.mutation({
			query: ({ id, ...body }) => ({
				url: `/notification-channels/${id}`,
				method: 'PUT',
				data: body
			}),
			transformResponse: (response) => response?.data,
			invalidatesTags: (_, __, { id }) => [
				{ type: 'NotificationChannel', id },
				{ type: 'NotificationChannel', id: 'LIST' }
			]
		}),

		deleteNotificationChannel: builder.mutation({
			query: (id) => ({
				url: `/notification-channels/${id}`,
				method: 'DELETE'
			}),
			invalidatesTags: (_, __, id) => [
				{ type: 'NotificationChannel', id },
				{ type: 'NotificationChannel', id: 'LIST' },
				{ type: 'NotificationConstraint', id: 'LIST' }
			]
		}),

		// ── Configs ───────────────────────────────────────────────
		getNotificationConfigs: builder.query({
			query: ({ pageNumber = 1, pageSize = 10 } = {}) => ({
				url: '/notification-configs',
				method: 'GET',
				params: { pageNumber, pageSize }
			}),
			transformResponse: (response) => {
				const data = { data: response?.data || [] };
				if (response?.pagination) {
					data.totalPages = response.pagination.totalPages;
					data.totalElements = response.pagination.totalElements;
					data.pageSize = response.pagination.pageSize;
					data.pageNumber = response.pagination.pageNumber;
				}
				return data;
			},
			providesTags: (result) =>
				result?.data?.length
					? [
							...result.data.map(({ id }) => ({ type: 'NotificationConfig', id })),
							{ type: 'NotificationConfig', id: 'LIST' }
						]
					: [{ type: 'NotificationConfig', id: 'LIST' }],
			keepUnusedDataFor: 60,
			refetchOnMountOrArgChange: true
		}),

		getNotificationConfigsByTrigger: builder.query({
			query: (triggerKey) => ({
				url: '/notification-configs/filter',
				method: 'GET',
				params: { triggerKey }
			}),
			transformResponse: (response) => response?.data || [],
			providesTags: (result, _, triggerKey) =>
				result?.length
					? [
							...result.map(({ id }) => ({ type: 'NotificationConfig', id })),
							{ type: 'NotificationConfig', id: `TRIGGER_${triggerKey}` }
						]
					: [{ type: 'NotificationConfig', id: `TRIGGER_${triggerKey}` }],
			keepUnusedDataFor: 60
		}),

		getNotificationConfig: builder.query({
			query: (id) => ({
				url: `/notification-configs/${id}`,
				method: 'GET'
			}),
			transformResponse: (response) => response?.data,
			providesTags: (_, __, id) => [{ type: 'NotificationConfig', id }],
			keepUnusedDataFor: 120
		}),

		createNotificationConfig: builder.mutation({
			query: (body) => ({
				url: '/notification-configs',
				method: 'POST',
				data: body
			}),
			transformResponse: (response) => response?.data,
			invalidatesTags: [{ type: 'NotificationConfig', id: 'LIST' }]
		}),

		updateNotificationConfig: builder.mutation({
			query: ({ id, ...body }) => ({
				url: `/notification-configs/${id}`,
				method: 'PUT',
				data: { id, ...body }
			}),
			transformResponse: (response) => response?.data,
			invalidatesTags: (_, __, { id }) => [
				{ type: 'NotificationConfig', id },
				{ type: 'NotificationConfig', id: 'LIST' }
			]
		}),

		deleteNotificationConfig: builder.mutation({
			query: (id) => ({
				url: `/notification-configs/${id}`,
				method: 'DELETE'
			}),
			invalidatesTags: (_, __, id) => [
				{ type: 'NotificationConfig', id },
				{ type: 'NotificationConfig', id: 'LIST' }
			]
		}),

		toggleNotificationConfig: builder.mutation({
			query: (id) => ({
				url: `/notification-configs/${id}/toggle`,
				method: 'PUT'
			}),
			transformResponse: (response) => response?.data,
			invalidatesTags: (_, __, id) => [
				{ type: 'NotificationConfig', id },
				{ type: 'NotificationConfig', id: 'LIST' }
			]
		}),

		getTriggerKeys: builder.query({
			query: () => ({
				url: '/notification-configs/trigger-keys',
				method: 'GET'
			}),
			transformResponse: (response) => response?.data || [],
			providesTags: [{ type: 'NotificationMeta', id: 'TRIGGER_KEYS' }],
			keepUnusedDataFor: 600
		}),

		getEventTypes: builder.query({
			query: () => ({
				url: '/notification-configs/event-types',
				method: 'GET'
			}),
			transformResponse: (response) => response?.data || [],
			providesTags: [{ type: 'NotificationMeta', id: 'EVENT_TYPES' }],
			keepUnusedDataFor: 600
		}),

		getConfigChannelEnums: builder.query({
			query: () => ({
				url: '/notification-configs/notification-channels',
				method: 'GET'
			}),
			transformResponse: (response) => response?.data || [],
			providesTags: [{ type: 'NotificationMeta', id: 'CHANNEL_ENUMS' }],
			keepUnusedDataFor: 600
		}),

		// ── Constraints ───────────────────────────────────────────
		getNotificationConstraints: builder.query({
			query: () => ({
				url: '/notification-constraints',
				method: 'GET'
			}),
			transformResponse: (response) => response?.data || [],
			providesTags: (result) =>
				result?.length
					? [
							...result.map(({ id }) => ({ type: 'NotificationConstraint', id })),
							{ type: 'NotificationConstraint', id: 'LIST' }
						]
					: [{ type: 'NotificationConstraint', id: 'LIST' }],
			keepUnusedDataFor: 120,
			refetchOnMountOrArgChange: true
		}),

		getConstraintByChannel: builder.query({
			query: (channelCode) => ({
				url: `/notification-constraints/channel/${channelCode}`,
				method: 'GET'
			}),
			transformResponse: (response) => response?.data,
			providesTags: (_, __, channelCode) => [
				{ type: 'NotificationConstraint', id: `CHANNEL_${channelCode}` }
			],
			keepUnusedDataFor: 120
		}),

		updateNotificationConstraint: builder.mutation({
			query: ({ id, ...body }) => ({
				url: `/notification-constraints/${id}`,
				method: 'PUT',
				data: body
			}),
			transformResponse: (response) => response?.data,
			invalidatesTags: (_, __, { id }) => [
				{ type: 'NotificationConstraint', id },
				{ type: 'NotificationConstraint', id: 'LIST' }
			]
		}),

		// ── Internal Events ───────────────────────────────────────
		getInternalEvents: builder.query({
			query: ({ eventType = '', pageNumber = 1, pageSize = 20 } = {}) => ({
				url: '/internal-events',
				method: 'GET',
				params: {
					pageNumber,
					pageSize,
					...(eventType ? { eventType } : {})
				}
			}),
			transformResponse: (response) => {
				const data = { data: response?.data || [] };
				if (response?.pagination) {
					data.totalPages = response.pagination.totalPages;
					data.totalElements = response.pagination.totalElements;
					data.pageSize = response.pagination.pageSize;
					data.pageNumber = response.pagination.pageNumber;
				}
				return data;
			},
			providesTags: (result) =>
				result?.data?.length
					? [
							...result.data.map(({ id }) => ({ type: 'InternalEvent', id })),
							{ type: 'InternalEvent', id: 'LIST' }
						]
					: [{ type: 'InternalEvent', id: 'LIST' }],
			keepUnusedDataFor: 30,
			refetchOnMountOrArgChange: true
		}),

		getInternalEvent: builder.query({
			query: (id) => ({
				url: `/internal-events/${id}`,
				method: 'GET'
			}),
			transformResponse: (response) => response?.data,
			providesTags: (_, __, id) => [{ type: 'InternalEvent', id }],
			keepUnusedDataFor: 60
		})
	}),
	overrideExisting: false
});

export default NotificationAdminApi;

export const {
	useGetNotificationChannelsQuery,
	useGetNotificationChannelQuery,
	useCreateNotificationChannelMutation,
	useUpdateNotificationChannelMutation,
	useDeleteNotificationChannelMutation,
	useGetNotificationConfigsQuery,
	useGetNotificationConfigsByTriggerQuery,
	useGetNotificationConfigQuery,
	useCreateNotificationConfigMutation,
	useUpdateNotificationConfigMutation,
	useDeleteNotificationConfigMutation,
	useToggleNotificationConfigMutation,
	useGetTriggerKeysQuery,
	useGetEventTypesQuery,
	useGetConfigChannelEnumsQuery,
	useGetNotificationConstraintsQuery,
	useGetConstraintByChannelQuery,
	useUpdateNotificationConstraintMutation,
	useGetInternalEventsQuery,
	useGetInternalEventQuery
} = NotificationAdminApi;
