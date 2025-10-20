// Notification Service for Real-time Notifications
// Handles WebSocket connections and notification management

import { getCurrentUser } from "@/lib/auth";

export interface Notification {
  id: string;
  type: 'email' | 'sla' | 'team' | 'system' | 'assignment';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  userId: string;
  data?: any; // Additional data for specific notification types
}

export interface NotificationSubscription {
  id: string;
  userId: string;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

class NotificationService {
  private ws: WebSocket | null = null;
  private subscribers: Map<string, Set<(notification: Notification) => void>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second
  private isConnecting = false;
  private notificationQueue: Notification[] = [];
  private userId: string | null = null;

  // Initialize WebSocket connection
  connect(userId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnecting) {
        reject(new Error('Connection already in progress'));
        return;
      }

      this.userId = userId;
      this.isConnecting = true;

      try {
        // Close existing connection if any
        if (this.ws) {
          this.ws.close();
        }

        // Create WebSocket connection
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/api/notifications/ws`;
        
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.reconnectDelay = 1000;
          
          // Authenticate with user ID
          this.send({
            type: 'auth',
            userId: this.userId
          });
          
          // Process queued notifications
          this.processQueue();
          
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        this.ws.onclose = (event) => {
          console.log('WebSocket disconnected:', event.code, event.reason);
          this.isConnecting = false;
          this.ws = null;
          
          // Attempt to reconnect if not a normal closure
          if (event.code !== 1000) {
            this.attemptReconnect();
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.isConnecting = false;
          reject(error);
        };

      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  // Disconnect WebSocket
  disconnect(): void {
    if (this.ws) {
      this.ws.close(1000, 'User disconnected');
      this.ws = null;
    }
    this.subscribers.clear();
    this.notificationQueue = [];
  }

  // Send message through WebSocket
  private send(data: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  // Handle incoming WebSocket messages
  private handleMessage(data: any): void {
    switch (data.type) {
      case 'notification':
        this.handleNotification(data.notification);
        break;
      case 'notifications':
        // Batch notifications
        data.notifications.forEach((notification: Notification) => {
          this.handleNotification(notification);
        });
        break;
      case 'ping':
        // Respond to server ping
        this.send({ type: 'pong' });
        break;
      default:
        console.log('Unknown message type:', data.type);
    }
  }

  // Handle individual notification
  private handleNotification(notification: Notification): void {
    // Convert timestamp to Date object if it's a string
    if (typeof notification.timestamp === 'string') {
      notification.timestamp = new Date(notification.timestamp);
    }

    // Add to subscribers
    const userIdSubscribers = this.subscribers.get(notification.userId);
    if (userIdSubscribers) {
      userIdSubscribers.forEach(callback => {
        try {
          callback(notification);
        } catch (error) {
          console.error('Error in notification callback:', error);
        }
      });
    }

    // Store in local storage for persistence
    this.storeNotification(notification);
  }

  // Store notification in local storage
  private storeNotification(notification: Notification): void {
    try {
      const key = `notifications_${notification.userId}`;
      const existing = localStorage.getItem(key);
      const notifications = existing ? JSON.parse(existing) : [];
      
      // Add new notification at the beginning
      notifications.unshift(notification);
      
      // Keep only last 50 notifications
      if (notifications.length > 50) {
        notifications.splice(50);
      }
      
      localStorage.setItem(key, JSON.stringify(notifications));
    } catch (error) {
      console.error('Error storing notification:', error);
    }
  }

  // Get stored notifications
  getStoredNotifications(userId: string): Notification[] {
    try {
      const key = `notifications_${userId}`;
      const existing = localStorage.getItem(key);
      return existing ? JSON.parse(existing) : [];
    } catch (error) {
      console.error('Error getting stored notifications:', error);
      return [];
    }
  }

  // Mark notification as read
  markAsRead(notificationId: string, userId: string): void {
    try {
      const key = `notifications_${userId}`;
      const existing = localStorage.getItem(key);
      const notifications = existing ? JSON.parse(existing) : [];
      
      const notification = notifications.find((n: Notification) => n.id === notificationId);
      if (notification) {
        notification.read = true;
        localStorage.setItem(key, JSON.stringify(notifications));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  // Mark all notifications as read
  markAllAsRead(userId: string): void {
    try {
      const key = `notifications_${userId}`;
      const existing = localStorage.getItem(key);
      const notifications = existing ? JSON.parse(existing) : [];
      
      notifications.forEach((notification: Notification) => {
        notification.read = true;
      });
      
      localStorage.setItem(key, JSON.stringify(notifications));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }

  // Clear all notifications
  clearNotifications(userId: string): void {
    try {
      const key = `notifications_${userId}`;
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  }

  // Subscribe to notifications
  subscribe(userId: string, callback: (notification: Notification) => void): () => void {
    if (!this.subscribers.has(userId)) {
      this.subscribers.set(userId, new Set());
    }
    
    this.subscribers.get(userId)!.add(callback);
    
    // Return unsubscribe function
    return () => {
      const userSubscribers = this.subscribers.get(userId);
      if (userSubscribers) {
        userSubscribers.delete(callback);
        if (userSubscribers.size === 0) {
          this.subscribers.delete(userId);
        }
      }
    };
  }

  // Attempt to reconnect WebSocket
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts || !this.userId) {
      console.log('Max reconnect attempts reached or no user ID');
      return;
    }

    this.reconnectAttempts++;
    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);

    setTimeout(() => {
      this.connect(this.userId!).catch(error => {
        console.error('Reconnect failed:', error);
        // Exponential backoff
        this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30000);
      });
    }, this.reconnectDelay);
  }

  // Process queued notifications
  private processQueue(): void {
    while (this.notificationQueue.length > 0) {
      const notification = this.notificationQueue.shift()!;
      this.handleNotification(notification);
    }
  }

  // Queue notification for when connection is restored
  private queueNotification(notification: Notification): void {
    this.notificationQueue.push(notification);
    
    // Keep only last 20 queued notifications
    if (this.notificationQueue.length > 20) {
      this.notificationQueue.splice(0, this.notificationQueue.length - 20);
    }
  }

  // Get connection status
  get isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  // Get unread count
  getUnreadCount(userId: string): number {
    try {
      const key = `notifications_${userId}`;
      const existing = localStorage.getItem(key);
      const notifications = existing ? JSON.parse(existing) : [];
      return notifications.filter((n: Notification) => !n.read).length;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }
}

// Create singleton instance
export const notificationService = new NotificationService();

// Send notification to specific user
export async function sendNotificationToUser(
  userId: string,
  notification: Omit<Notification, 'id' | 'timestamp'>
): Promise<boolean> {
  try {
    const response = await fetch('/api/notifications/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        notification: {
          ...notification,
          id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date(),
        }
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('Error sending notification:', error);
    return false;
  }
}

// Send notification to multiple users
export async function sendNotificationToUsers(
  userIds: string[],
  notification: Omit<Notification, 'id' | 'timestamp'>
): Promise<boolean> {
  try {
    const response = await fetch('/api/notifications/send-batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userIds,
        notification: {
          ...notification,
          id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date(),
        }
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('Error sending batch notification:', error);
    return false;
  }
}

// Helper function to create email notifications
export function createEmailNotification(
  type: 'received' | 'replied' | 'assigned' | 'overdue',
  emailData: any
): Omit<Notification, 'id' | 'timestamp' | 'userId'> {
  const baseNotification = {
    type: 'email' as const,
    read: false,
  };

  switch (type) {
    case 'received':
      return {
        ...baseNotification,
        title: 'New Email Received',
        message: `From: ${emailData.senderEmail} - ${emailData.subject}`,
        priority: emailData.priority === 'high' ? 'high' as const : 'medium' as const,
        data: emailData,
      };
    
    case 'replied':
      return {
        ...baseNotification,
        title: 'Email Replied',
        message: `Response sent to: ${emailData.recipientEmail}`,
        priority: 'low' as const,
        data: emailData,
      };
    
    case 'assigned':
      return {
        ...baseNotification,
        title: 'Email Assigned',
        message: `Assigned to: ${emailData.assignedToName}`,
        priority: 'medium' as const,
        data: emailData,
      };
    
    case 'overdue':
      return {
        ...baseNotification,
        title: 'Email Overdue',
        message: `From: ${emailData.senderEmail} - ${emailData.subject}`,
        priority: 'urgent' as const,
        data: emailData,
      };
    
    default:
      return {
        ...baseNotification,
        title: 'Email Notification',
        message: 'New email activity',
        priority: 'medium' as const,
      };
  }
}