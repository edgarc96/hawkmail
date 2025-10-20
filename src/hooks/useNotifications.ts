"use client";

import { useState, useEffect, useCallback } from "react";
import { notificationService, Notification } from "@/lib/notifications/notification-service";

export function useNotifications(userId: string) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!userId) return;

    // Load stored notifications
    const stored = notificationService.getStoredNotifications(userId);
    setNotifications(stored);
    setUnreadCount(notificationService.getUnreadCount(userId));

    // Subscribe to new notifications
    const unsubscribe = notificationService.subscribe(userId, (notification) => {
      setNotifications(prev => [notification, ...prev]);
      if (!notification.read) {
        setUnreadCount(prev => prev + 1);
      }
    });

    // Connect to WebSocket
    notificationService.connect(userId)
      .then(() => setIsConnected(true))
      .catch(error => console.error('Failed to connect:', error));

    // Check connection status periodically
    const interval = setInterval(() => {
      setIsConnected(notificationService.isConnected);
    }, 5000);

    return () => {
      unsubscribe();
      clearInterval(interval);
      notificationService.disconnect();
    };
  }, [userId]);

  const markAsRead = useCallback((notificationId: string) => {
    notificationService.markAsRead(notificationId, userId);
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, [userId]);

  const markAllAsRead = useCallback(() => {
    notificationService.markAllAsRead(userId);
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
    setUnreadCount(0);
  }, [userId]);

  const clearNotifications = useCallback(() => {
    notificationService.clearNotifications(userId);
    setNotifications([]);
    setUnreadCount(0);
  }, [userId]);

  return {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    clearNotifications
  };
}