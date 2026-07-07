import NotificationModel from '../models/NotificationModel';

export const CACHE_STORAGE_KEY = 'admin_notifications_cache';
export const LAST_SEEN_STORAGE_KEY = 'admin_notifications_last_seen';
export const POLL_INTERVAL_MS = 30000;
export const MAX_PREVIEW_ITEMS = 30;

const PRIORITY_VARIANTS = {
	HIGH: 'error',
	MEDIUM: 'warning',
	LOW: 'info',
	DEFAULT: 'secondary'
};

const PRIORITY_ICONS = {
	HIGH: 'heroicons-solid:exclamation',
	MEDIUM: 'heroicons-solid:bell',
	LOW: 'heroicons-solid:information-circle',
	DEFAULT: 'heroicons-solid:bell'
};

export function mapNotificationFromApi(dto = {}) {
	const id = dto.id ?? dto.notificationId;

	return NotificationModel({
		id,
		title: dto.title || 'بدون عنوان',
		message: dto.message || dto.body || dto.description || '',
		description: dto.message || dto.body || dto.description || '',
		timestamp: dto.createdAt || dto.sendTime || dto.timestamp || dto.time,
		sendTime: dto.createdAt || dto.sendTime || dto.timestamp || dto.time,
		read: dto.read ?? dto.isRead ?? false,
		priority: dto.priority || 'LOW',
		icon: dto.icon || PRIORITY_ICONS[dto.priority] || PRIORITY_ICONS.DEFAULT,
		variant: dto.variant || PRIORITY_VARIANTS[dto.priority] || PRIORITY_VARIANTS.DEFAULT,
		link: id ? `/apps/notifications/${id}` : '/apps/notifications',
		useRouter: true
	});
}

export function loadNotificationCache() {
	try {
		const raw = localStorage.getItem(CACHE_STORAGE_KEY);
		if (!raw) {
			return [];
		}

		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed.map(mapNotificationFromApi) : [];
	} catch {
		return [];
	}
}

export function saveNotificationCache(items) {
	try {
		localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(items.slice(0, MAX_PREVIEW_ITEMS)));
	} catch {
		// Ignore quota errors
	}
}

export function getLastSeenAt() {
	return localStorage.getItem(LAST_SEEN_STORAGE_KEY);
}

export function setLastSeenAt(isoTimestamp = new Date().toISOString()) {
	localStorage.setItem(LAST_SEEN_STORAGE_KEY, isoTimestamp);
}

export function mergeNotifications(existing = [], incoming = []) {
	const byId = new Map();

	[...incoming, ...existing].forEach((item) => {
		if (item?.id) {
			byId.set(item.id, item);
		}
	});

	return Array.from(byId.values()).sort(
		(a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime()
	);
}

export function countUnread(items = []) {
	return items.filter((item) => !item.read).length;
}
