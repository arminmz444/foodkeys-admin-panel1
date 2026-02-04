import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import WebSocketClient from './WebSocketClient';
import { useAuth } from './AuthContext';
import api from '../api';

const NotificationContext = createContext();

/**
 * Provider component for notification management in the admin panel
 */
export const NotificationProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [wsConnected, setWsConnected] = useState(false);

  // Load initial notifications
  useEffect(() => {
    if (user && token) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [user, token]);

  // Connect to WebSocket when logged in
  useEffect(() => {
    if (user && token && !wsConnected) {
      connectWebSocket();
    }

    return () => {
      if (wsConnected) {
        WebSocketClient.disconnect();
        setWsConnected(false);
      }
    };
  }, [user, token, wsConnected]);

  /**
   * Connect to WebSocket and set up notification handlers
   */
  const connectWebSocket = useCallback(() => {
    const apiUrl = process.env.REACT_APP_API_URL || 'https://back.agfo.ir';

    WebSocketClient.connect(apiUrl, token)
      .then(() => {
        setWsConnected(true);

        // Subscribe to user-specific notifications
        WebSocketClient.subscribeToUserChannel('notifications', handleNewNotification);

        // If user has roles, subscribe to role channels
        if (user.roles && user.roles.length > 0) {
          user.roles.forEach(role => {
            WebSocketClient.subscribeToRoleChannel(role, handleNewNotification);
          });
        }

        // Register notification handlers
        WebSocketClient.registerNotificationHandler('NEW_REQUEST', handleNewRequest);
        WebSocketClient.registerNotificationHandler('FORWARDED_REQUEST', handleForwardedRequest);

        // Add reconnection event listener
        WebSocketClient.addEventListener('reconnected', () => {
          fetchUnreadCount();
        });
      })
      .catch(error => {
        console.error('Failed to connect to WebSocket:', error);
      });
  }, [user, token]);

  /**
   * Fetch user notifications from API
   */
  const fetchNotifications = useCallback(async (archived = false) => {
    try {
      setLoading(true);
      const response = await api.get(`/notifications?archived=${archived}`);
      
      if (response.data && response.data.data) {
        setNotifications(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch unread notification count
   */
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await api.get('/notifications/count');
      
      if (response.data && response.data.data !== undefined) {
        setUnreadCount(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  }, []);

  /**
   * Handle new notification from WebSocket
   */
  const handleNewNotification = useCallback((notification) => {
    // Update unread count
    setUnreadCount(prev => prev + 1);
    
    // Add to notifications list if not already present
    setNotifications(prev => {
      const exists = prev.some(n => 
        n.id === notification.id || 
        (n.requestId === notification.data?.requestId && notification.data?.requestId)
      );
      
      if (exists) {
        return prev;
      }
      
      return [{
        id: notification.id || `temp-${Date.now()}`,
        title: notification.title,
        message: notification.message,
        isRead: false,
        isArchived: false,
        createdAt: new Date().toISOString(),
        requestId: notification.data?.requestId,
        entityType: notification.data?.entityType,
        entityId: notification.data?.entityId
      }, ...prev];
    });
  }, []);

  /**
   * Handle new request notification
   */
  const handleNewRequest = useCallback((notification) => {
    // Play notification sound
    const audio = new Audio('/sounds/notification.mp3');
    audio.play();
  }, []);

  /**
   * Handle forwarded request notification
   */
  const handleForwardedRequest = useCallback((notification) => {
    // Play notification sound
    const audio = new Audio('/sounds/notification.mp3');
    audio.play();
  }, []);

  /**
   * Mark a notification as read
   */
  const markAsRead = useCallback(async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);

  /**
   * Archive a notification
   */
  const archiveNotification = useCallback(async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/archive`);
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, isArchived: true } : n)
      );
      
      // If notification was unread, update unread count
      const notification = notifications.find(n => n.id === notificationId);
      if (notification && !notification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error archiving notification:', error);
    }
  }, [notifications]);

  /**
   * Unarchive a notification
   */
  const unarchiveNotification = useCallback(async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/unarchive`);
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, isArchived: false } : n)
      );
    } catch (error) {
      console.error('Error unarchiving notification:', error);
    }
  }, []);

  // Context value
  const value = {
    notifications,
    unreadCount,
    loading,
    wsConnected,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    archiveNotification,
    unarchiveNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

/**
 * Hook for accessing notification context
 */
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationContext;