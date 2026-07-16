import { createSlice } from '@reduxjs/toolkit';
import {
	CACHE_STORAGE_KEY,
	LAST_SEEN_STORAGE_KEY,
	loadNotificationCache,
	mapNotificationFromApi,
	MAX_PREVIEW_ITEMS,
	mergeNotifications,
	saveNotificationCache
} from '../utils/notificationUtils';

const initialState = {
	unreadCount: 0,
	previewItems: loadNotificationCache(),
	hasPendingUpdates: false,
	knownIds: loadNotificationCache().map((item) => item.id)
};

export const notificationsSlice = createSlice({
	name: 'notifications',
	initialState,
	reducers: {
		hydrateNotificationCache: (state) => {
			const cached = loadNotificationCache();
			state.previewItems = cached;
			state.knownIds = cached.map((item) => item.id);
		},
		setUnreadCount: (state, action) => {
			state.unreadCount = action.payload ?? 0;
		},
		setHasPendingUpdates: (state, action) => {
			state.hasPendingUpdates = action.payload;
		},
		clearPendingUpdates: (state) => {
			state.hasPendingUpdates = false;
		},
		markPreviewNotificationAsRead: (state, action) => {
			const notificationId = action.payload;
			const index = state.previewItems.findIndex((item) => item.id === notificationId);

			if (index !== -1) {
				state.previewItems[index].read = true;
				saveNotificationCache(state.previewItems);
			}
		},
		processIncomingNotifications: (state, action) => {
			const incoming = (action.payload || []).map(mapNotificationFromApi).filter((item) => item.id);
			const freshItems = incoming.filter((item) => !state.knownIds.includes(item.id));

			if (!freshItems.length) {
				return;
			}

			freshItems.forEach((item) => {
				state.knownIds.push(item.id);
			});

			state.previewItems = mergeNotifications(state.previewItems, freshItems).slice(0, MAX_PREVIEW_ITEMS);
			saveNotificationCache(state.previewItems);

			if (freshItems.some((item) => !item.read)) {
				state.hasPendingUpdates = true;
			}
		},
		resetNotificationsState: () => {
			localStorage.removeItem(CACHE_STORAGE_KEY);
			localStorage.removeItem(LAST_SEEN_STORAGE_KEY);
			return {
				...initialState,
				previewItems: [],
				knownIds: []
			};
		}
	}
});

export const {
	hydrateNotificationCache,
	setUnreadCount,
	setHasPendingUpdates,
	clearPendingUpdates,
	markPreviewNotificationAsRead,
	processIncomingNotifications,
	resetNotificationsState
} = notificationsSlice.actions;

export const selectUnreadCount = (state) => state?.notifications?.unreadCount ?? 0;
export const selectPreviewNotifications = (state) => state?.notifications?.previewItems ?? [];
export const selectHasPendingUpdates = (state) => state?.notifications?.hasPendingUpdates ?? false;

export default notificationsSlice.reducer;
