import { fetchApi } from '@/lib/api/fetchApi';

export interface NotificationItem {
  name: string;
  subject?: string;
  email_content?: string;
  read: number;
  creation?: string;
  document_type?: string;
  document_name?: string;
  from_user?: string;
  for_user?: string;
  [key: string]: unknown;
}

export interface GetNotificationsParams {
  read_status?: 'unread' | 'read' | 'all';
  limit?: number;
  start?: number;
}

export interface GetNotificationsResponse {
  notifications?: NotificationItem[];
  items?: NotificationItem[];
  data?: NotificationItem[] | { notifications?: NotificationItem[]; unread_count?: number };
  unread_count?: number;
  total_count?: number;
  status?: string;
  message?: string;
}

export interface MarkReadParams {
  notification_ids?: string[];
  mark_all?: boolean;
}

export interface ClearNotificationsParams {
  notification_ids?: string[];
  clear_all?: boolean;
}

export const notificationService = {
  async getNotifications(params: GetNotificationsParams = {}): Promise<GetNotificationsResponse> {
    const { read_status = 'all', limit = 20, start = 0 } = params;
    const query = new URLSearchParams({
      read_status,
      limit: limit.toString(),
      start: start.toString(),
    });
    return fetchApi(`v1/notifications?${query.toString()}`);
  },

  async markRead(params: MarkReadParams): Promise<{ status: string; message?: string }> {
    return fetchApi('v1/notifications/read', {
      method: 'PATCH',
      body: JSON.stringify({
        notification_ids: params.notification_ids ?? [],
        mark_all: params.mark_all ?? false,
      }),
    });
  },

  async clearNotifications(params: ClearNotificationsParams): Promise<{ status: string; message?: string }> {
    return fetchApi('v1/notifications', {
      method: 'DELETE',
      body: JSON.stringify({
        notification_ids: params.notification_ids ?? [],
        clear_all: params.clear_all ?? false,
      }),
    });
  },
};
