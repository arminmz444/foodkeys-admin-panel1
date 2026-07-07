import { apiService as api } from 'app/store/apiService';

export const addTagTypes = ['NotificationsList', 'Notification', 'NotificationUnreadCount', 'ArchivedNotificationsList'];

const transformPaginatedNotifications = (response) => {
	const data = { data: response?.data || [] };

	if (response?.pagination) {
		data.totalPages = response.pagination.totalPages;
		data.totalElements = response.pagination.totalElements;
		data.pageSize = response.pagination.pageSize;
		data.pageIndex = response.pagination.pageNumber ?? response.pagination.pageIndex;
	}

	return data;
};

const NotificationApi = api
	.enhanceEndpoints({
		addTagTypes
	})
	.injectEndpoints({
		endpoints: (builder) => ({
			getNotifications: builder.query({
				query: ({ pageNumber = 1, pageSize = 20 } = {}) => ({
					url: '/notifications',
					params: { pageNumber, pageSize }
				}),
				transformResponse: transformPaginatedNotifications,
				providesTags: (result) =>
					result?.data?.length
						? [
								...result.data.map((notification) => ({
									type: 'Notification',
									id: notification.id
								})),
								{ type: 'NotificationsList', id: 'LIST' }
							]
						: [{ type: 'NotificationsList', id: 'LIST' }]
			}),
			getArchivedNotifications: builder.query({
				query: ({ pageNumber = 1, pageSize = 20 } = {}) => ({
					url: '/notifications/archive',
					params: { pageNumber, pageSize }
				}),
				transformResponse: transformPaginatedNotifications,
				providesTags: [{ type: 'ArchivedNotificationsList', id: 'LIST' }]
			}),
			getNotificationUpdates: builder.query({
				query: (since) => ({
					url: '/notifications/updates',
					params: since ? { since } : undefined
				}),
				transformResponse: (response) => response?.data || []
			}),
			getUnreadNotificationCount: builder.query({
				query: () => ({ url: '/notifications/unread-count' }),
				transformResponse: (response) => response?.data ?? 0,
				providesTags: [{ type: 'NotificationUnreadCount', id: 'COUNT' }]
			}),
			getNotification: builder.query({
				query: (notificationId) => ({
					url: `/notifications/${notificationId}`
				}),
				transformResponse: (response) => response?.data || response,
				providesTags: (result, error, notificationId) => [{ type: 'Notification', id: notificationId }]
			}),
			markNotificationAsRead: builder.mutation({
				query: (notificationId) => ({
					url: `/notifications/${notificationId}/read`,
					method: 'POST'
				}),
				invalidatesTags: (result, error, notificationId) => [
					{ type: 'Notification', id: notificationId },
					{ type: 'NotificationsList', id: 'LIST' },
					{ type: 'NotificationUnreadCount', id: 'COUNT' }
				]
			}),
			archiveNotification: builder.mutation({
				query: (notificationId) => ({
					url: `/notifications/${notificationId}/archive`,
					method: 'POST'
				}),
				invalidatesTags: [
					{ type: 'NotificationsList', id: 'LIST' },
					{ type: 'ArchivedNotificationsList', id: 'LIST' },
					{ type: 'NotificationUnreadCount', id: 'COUNT' }
				]
			}),
			sendAdminNotification: builder.mutation({
				query: (payload) => ({
					url: '/admin/notifications/send',
					method: 'POST',
					data: payload
				})
			})
		}),
		overrideExisting: true
	});

export default NotificationApi;

export const {
	useGetNotificationsQuery,
	useGetArchivedNotificationsQuery,
	useGetNotificationUpdatesQuery,
	useLazyGetNotificationUpdatesQuery,
	useGetUnreadNotificationCountQuery,
	useLazyGetUnreadNotificationCountQuery,
	useGetNotificationQuery,
	useMarkNotificationAsReadMutation,
	useArchiveNotificationMutation,
	useSendAdminNotificationMutation
} = NotificationApi;

// Backward-compatible aliases used by existing components
export const useGetAllNotificationsQuery = useGetNotificationsQuery;
export const useDeleteNotificationMutation = useArchiveNotificationMutation;
export const useCreateNotificationMutation = useSendAdminNotificationMutation;
export const useGetAdminNotificationsQuery = useGetNotificationsQuery;
