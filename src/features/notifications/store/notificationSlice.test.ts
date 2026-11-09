import { describe, expect, it } from 'vitest';
import {
  clearNotifications,
  getNotificationId,
  isItemUnread,
  markNotificationsRead,
  notificationReducer,
  type NotificationState,
} from './notificationSlice';
import type { NotificationItem } from '../api/notification.service';

describe('notificationSlice', () => {
  const sampleItems: NotificationItem[] = [
    {
      id: 'notif-1',
      subject: 'Application Approved',
      message: 'Your application has been approved',
      read: false,
      created_at: '2026-10-25T10:00:00Z',
    },
    {
      id: 'notif-2',
      subject: 'Review Pending',
      message: 'Document review required',
      read: true,
      created_at: '2026-10-24T10:00:00Z',
    },
    {
      id: 'notif-3',
      name: 'notif-3',
      subject: 'Legacy item',
      email_content: 'Legacy message',
      read: 0,
      creation: '2026-10-23T10:00:00Z',
    },
  ];

  it('correctly resolves notification id from id or name', () => {
    expect(getNotificationId(sampleItems[0]!)).toBe('notif-1');
    expect(getNotificationId({ name: 'legacy-id', subject: '', read: true, created_at: '', id: '' })).toBe('legacy-id');
  });

  it('correctly detects unread items across boolean and number representations', () => {
    expect(isItemUnread({ read: false })).toBe(true);
    expect(isItemUnread({ read: 0 })).toBe(true);
    expect(isItemUnread({ read: true })).toBe(false);
    expect(isItemUnread({ read: 1 })).toBe(false);
  });

  describe('markNotificationsRead.fulfilled', () => {
    it('marks a single notification read by ids array', () => {
      const state: NotificationState = {
        items: [...sampleItems],
        unreadCount: 2,
        loading: false,
        error: null,
      };

      const nextState = notificationReducer(
        state,
        markNotificationsRead.fulfilled({ ids: ['notif-1'] }, '', { ids: ['notif-1'] })
      );

      expect(nextState.items[0]?.read).toBe(true);
      expect(nextState.unreadCount).toBe(1);
    });

    it('decrements the server unread total without recounting only the loaded page', () => {
      const state: NotificationState = {
        items: [...sampleItems],
        unreadCount: 12,
        loading: false,
        error: null,
      };

      const nextState = notificationReducer(
        state,
        markNotificationsRead.fulfilled({ ids: ['notif-1'] }, '', { ids: ['notif-1'] })
      );

      expect(nextState.unreadCount).toBe(11);
    });

    it('marks all notifications read when all is true', () => {
      const state: NotificationState = {
        items: [...sampleItems],
        unreadCount: 2,
        loading: false,
        error: null,
      };

      const nextState = notificationReducer(
        state,
        markNotificationsRead.fulfilled({ all: true }, '', { all: true })
      );

      expect(nextState.items.every((item) => item.read === true)).toBe(true);
      expect(nextState.unreadCount).toBe(0);
    });
  });

  describe('clearNotifications.fulfilled', () => {
    it('removes target notifications by ids array', () => {
      const state: NotificationState = {
        items: [...sampleItems],
        unreadCount: 2,
        loading: false,
        error: null,
      };

      const nextState = notificationReducer(
        state,
        clearNotifications.fulfilled({ ids: ['notif-1'] }, '', { ids: ['notif-1'] })
      );

      expect(nextState.items).toHaveLength(2);
      expect(nextState.items.some((item) => item.id === 'notif-1')).toBe(false);
      expect(nextState.unreadCount).toBe(1);
    });

    it('decrements the server unread total without recounting only the loaded page', () => {
      const state: NotificationState = {
        items: [...sampleItems],
        unreadCount: 12,
        loading: false,
        error: null,
      };

      const nextState = notificationReducer(
        state,
        clearNotifications.fulfilled({ ids: ['notif-1'] }, '', { ids: ['notif-1'] })
      );

      expect(nextState.unreadCount).toBe(11);
    });

    it('preserves the server unread total when deleting a read notification', () => {
      const state: NotificationState = {
        items: [...sampleItems],
        unreadCount: 12,
        loading: false,
        error: null,
      };

      const nextState = notificationReducer(
        state,
        clearNotifications.fulfilled({ ids: ['notif-2'] }, '', { ids: ['notif-2'] })
      );

      expect(nextState.unreadCount).toBe(12);
    });

    it('empties all notifications when all is true', () => {
      const state: NotificationState = {
        items: [...sampleItems],
        unreadCount: 2,
        loading: false,
        error: null,
      };

      const nextState = notificationReducer(
        state,
        clearNotifications.fulfilled({ all: true }, '', { all: true })
      );

      expect(nextState.items).toHaveLength(0);
      expect(nextState.unreadCount).toBe(0);
    });
  });
});
