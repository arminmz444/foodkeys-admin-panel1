import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import {API_BASE_URL, API_WS_BASE_URL} from 'app/store/apiService';
import jwtAuthConfig from "@/app/auth/services/jwt/jwtAuthConfig.js";

let stompClient = null;
let reconnectAttempts = 0;

function getAccessToken() {
	return localStorage.getItem(jwtAuthConfig.tokenStorageKey) || '';
}

export function connectAdminNotificationWebSocket(onMessage) {
	const token = getAccessToken();

	if (!token) {
		return null;
	}

	if (stompClient?.active) {
		return stompClient;
	}

	stompClient = new Client({
		webSocketFactory: () => new SockJS(`${API_WS_BASE_URL}/ws`),
		connectHeaders: {
			Authorization: `Bearer ${token}`
		},
		reconnectDelay: Math.min(30000, 1000 * 2 ** reconnectAttempts),
		heartbeatIncoming: 25000,
		heartbeatOutgoing: 25000,
		onConnect: () => {
			reconnectAttempts = 0;
			stompClient.subscribe('/user/queue/admin-notifications', (message) => {
				try {
					onMessage(JSON.parse(message.body));
				} catch (error) {
					console.error('Failed to parse admin notification message', error);
				}
			});
		},
		onStompError: () => {
			reconnectAttempts += 1;
		},
		onWebSocketClose: () => {
			reconnectAttempts += 1;
		}
	});

	stompClient.activate();
	return stompClient;
}

export function disconnectAdminNotificationWebSocket() {
	if (stompClient) {
		stompClient.deactivate();
		stompClient = null;
	}

	reconnectAttempts = 0;
}

export function isAdminNotificationWebSocketActive() {
	return Boolean(stompClient?.active);
}
