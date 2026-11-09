import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
    ClearNotificationsParams,
    GetNotificationsParams,
    GetNotificationsResponse,
    MarkReadParams,
    NotificationItem,
    notificationService
} from '../api/notification.service';

export interface NotificationState {
  items: NotificationItem[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
}

const initialState: NotificationState = {
  items: [],
  unreadCount: 0,
  loading: false,
  error: null,
};

export function getNotificationId(item: NotificationItem, fallbackIndex?: number): string {
  return (
    item.id ||
    item.name ||
    (item as { notification_id?: string }).notification_id ||
    (fallbackIndex != null ? `notif-${fallbackIndex}` : '')
  );
}

export function isItemUnread(item: NotificationItem | { read?: unknown }): boolean {
  const readVal = item?.read as unknown;
  return (
    readVal === 0 ||
    readVal === false ||
    readVal === '0' ||
    readVal == null
  );
}

export const fetchNotifications = createAsyncThunk<
  GetNotificationsResponse,
  GetNotificationsParams | undefined,
  { rejectValue: string }
>('notifications/fetchNotifications', async (params, { rejectWithValue }) => {
  try {
    return await notificationService.getNotifications(params);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch notifications';
    return rejectWithValue(message);
  }
});

export const markNotificationsRead = createAsyncThunk<
  MarkReadParams,
  MarkReadParams,
  { rejectValue: string }
>('notifications/markNotificationsRead', async (params, { rejectWithValue }) => {
  try {
    await notificationService.markRead(params);
    return params;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to mark notifications as read';
    return rejectWithValue(message);
  }
});

export const clearNotifications = createAsyncThunk<
  ClearNotificationsParams,
  ClearNotificationsParams,
  { rejectValue: string }
>('notifications/clearNotifications', async (params, { rejectWithValue }) => {
  try {
    await notificationService.clearNotifications(params);
    return params;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to clear notifications';
    return rejectWithValue(message);
  }
});

export const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action: PayloadAction<GetNotificationsResponse>) => {
        state.loading = false;
        const payload = action.payload;
        
        const dataObj = payload?.data && typeof payload.data === 'object' && !Array.isArray(payload.data) 
          ? payload.data as { notifications?: NotificationItem[]; unread_count?: number } 
          : null;

        const rawList = payload?.notifications ?? dataObj?.notifications ?? payload?.items ?? (Array.isArray(payload?.data) ? payload.data : undefined);
        
        const list: NotificationItem[] = Array.isArray(rawList)
          ? rawList
          : Array.isArray(payload)
            ? payload
            : [];
            
        state.items = list;
        state.unreadCount =
          typeof payload?.unread_count === 'number'
            ? payload.unread_count
            : typeof dataObj?.unread_count === 'number'
            ? dataObj.unread_count
            : list.filter(isItemUnread).length;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Error fetching notifications';
      })
      // Mark Read (mutate on fulfilled)
      .addCase(markNotificationsRead.pending, (state) => {
        state.error = null;
      })
      .addCase(markNotificationsRead.fulfilled, (state, action: PayloadAction<MarkReadParams>) => {
        const arg = action.payload;
        const markAll = arg.all ?? arg.mark_all ?? false;
        const targetIds = arg.ids ?? arg.notification_ids;
        const read = arg.read ?? true;
        if (markAll) {
          state.items.forEach((item) => {
            item.read = read;
          });
          if (read) state.unreadCount = 0;
        } else if (targetIds?.length) {
          const ids = new Set(targetIds);
          let unreadDelta = 0;
          state.items.forEach((item) => {
            const id = getNotificationId(item);
            if (id && ids.has(id)) {
              const wasUnread = isItemUnread(item);
              item.read = read;
              const isUnread = isItemUnread(item);
              unreadDelta += Number(isUnread) - Number(wasUnread);
            }
          });
          // `unreadCount` is the server's total across every page. Adjust it by
          // only the items changed here instead of replacing it with the count
          // from the currently loaded page.
          state.unreadCount = Math.max(0, state.unreadCount + unreadDelta);
        }
      })
      .addCase(markNotificationsRead.rejected, (state, action) => {
        state.error = action.payload ?? 'Failed to mark notifications as read';
      })
      // Clear Notifications (mutate on fulfilled)
      .addCase(clearNotifications.pending, (state) => {
        state.error = null;
      })
      .addCase(clearNotifications.fulfilled, (state, action: PayloadAction<ClearNotificationsParams>) => {
        const arg = action.payload;
        const clearAll = arg.all ?? arg.clear_all ?? false;
        const targetIds = arg.ids ?? arg.notification_ids;
        if (clearAll) {
          state.items = [];
          state.unreadCount = 0;
        } else if (targetIds?.length) {
          const ids = new Set(targetIds);
          let removedUnreadCount = 0;
          state.items = state.items.filter((item) => {
            const id = getNotificationId(item);
            const shouldRemove = Boolean(id && ids.has(id));
            if (shouldRemove && isItemUnread(item)) removedUnreadCount += 1;
            return !shouldRemove;
          });
          state.unreadCount = Math.max(0, state.unreadCount - removedUnreadCount);
        }
      })
      .addCase(clearNotifications.rejected, (state, action) => {
        state.error = action.payload ?? 'Failed to clear notifications';
      });
  },
});

export const notificationReducer = notificationSlice.reducer;
