import { useCallback, useEffect, useRef } from 'react';
import { useAppDispatch } from 'app/store/hooks';
import useJwtAuth from '@/app/auth/services/jwt/useJwtAuth.jsx';
import NotificationApi from '../NotificationApi';
import showNotificationToast from '../utils/showNotificationToast.jsx';
import {
	getLastSeenAt,
	loadNotificationCache,
	mapNotificationFromApi,
	POLL_INTERVAL_MS,
	setLastSeenAt
} from '../utils/notificationUtils';
import {
	hydrateNotificationCache,
	processIncomingNotifications,
	resetNotificationsState,
	setUnreadCount
} from '../models/notificationSlice';

function useNotificationManager() {
	const dispatch = useAppDispatch();
	const { isAuthenticated } = useJwtAuth();
	const knownIdsRef = useRef(new Set());
	const isPollingRef = useRef(false);

	const refreshUnreadCount = useCallback(async () => {
		try {
			const result = await dispatch(
				NotificationApi.endpoints.getUnreadNotificationCount.initiate(undefined, {
					forceRefetch: true
				})
			).unwrap();

			dispatch(setUnreadCount(result));
		} catch (error) {
			console.error('Failed to fetch unread notification count', error);
		}
	}, [dispatch]);

	const handleIncomingNotifications = useCallback(
		(rawNotifications = [], { showToast = true } = {}) => {
			const mapped = rawNotifications.map(mapNotificationFromApi).filter((item) => item.id);
			const fresh = mapped.filter((item) => !item.read && !knownIdsRef.current.has(item.id));
			if (!fresh.length) {
				return;
			}

			fresh.forEach((item) => {
				knownIdsRef.current.add(item.id);
			});

			dispatch(processIncomingNotifications(fresh));

			if (showToast) {
				fresh.forEach((item) => {
					showNotificationToast(item);
				});
			}

			refreshUnreadCount();
		},
		[dispatch, refreshUnreadCount]
	);

	const pollUpdates = useCallback(async () => {
		if (isPollingRef.current) {
			return;
		}

		isPollingRef.current = true;

		try {
			const since = getLastSeenAt();
			const updates = await dispatch(
				NotificationApi.endpoints.getNotificationUpdates.initiate(since, {
					forceRefetch: true
				})
			).unwrap();

			if (updates?.length) {
				handleIncomingNotifications(updates);
			}

			setLastSeenAt();
		} catch (error) {
			console.error('Failed to poll notification updates', error);
		} finally {
			isPollingRef.current = false;
		}
	}, [dispatch, handleIncomingNotifications]);

	useEffect(() => {
		if (!isAuthenticated) {
			dispatch(resetNotificationsState());
			knownIdsRef.current = new Set();
			return undefined;
		}

		dispatch(hydrateNotificationCache());
		knownIdsRef.current = new Set(loadNotificationCache().map((item) => item.id));

		refreshUnreadCount();
		pollUpdates();

		const intervalId = window.setInterval(pollUpdates, POLL_INTERVAL_MS);

		return () => {
			window.clearInterval(intervalId);
		};
	}, [dispatch, handleIncomingNotifications, isAuthenticated, pollUpdates, refreshUnreadCount]);

	return {
		pollUpdates,
		refreshUnreadCount
	};
}

export default useNotificationManager;
