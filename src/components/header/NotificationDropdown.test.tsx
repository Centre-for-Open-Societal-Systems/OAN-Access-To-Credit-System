import { notificationService, type NotificationItem } from '@/features/notifications/api/notification.service';
import { notificationReducer } from '@/features/notifications/store/notificationSlice';
import { configureStore } from '@reduxjs/toolkit';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { AnchorHTMLAttributes } from 'react';
import { Provider } from 'react-redux';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NotificationDropdown } from './NotificationDropdown';

vi.mock('@/features/auth/store/authSlice', () => ({ selectUserKind: () => 'dev_agent' }));
vi.mock('@/features/notifications/api/notification.service', () => ({
  notificationService: { getNotifications: vi.fn(), markRead: vi.fn(), clearNotifications: vi.fn() },
}));
vi.mock('next/link', () => ({
  default: ({ prefetch: _prefetch, onClick, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { prefetch?: boolean }) => (
    <a {...props} onClick={(event) => { event.preventDefault(); onClick?.(event); }} />
  ),
}));

const item: NotificationItem = {
  id: 'notification-1', subject: 'Lead updated', read: false,
  document_type: 'A2C Lead', document_name: 'LEAD-42',
};

const errorStateItem: NotificationItem = {
  id: 'notif-1',
  subject: 'Review Pending',
  message: 'Document review required',
  read: false,
  created_at: '2026-11-04T10:00:00Z',
};

function renderDropdown() {
  const store = configureStore({ reducer: { notifications: notificationReducer } });
  return render(
    <Provider store={store}>
      <NotificationDropdown isOpen onClose={vi.fn()} />
    </Provider>
  );
}

function showNotification(overrides: Partial<NotificationItem> = {}) {
  const store = configureStore({ reducer: { notifications: notificationReducer } });
  vi.mocked(notificationService.getNotifications).mockResolvedValue({ notifications: [{ ...item, ...overrides }], unread_count: 1 });
  const onClose = vi.fn();
  render(<Provider store={store}><NotificationDropdown isOpen onClose={onClose} /></Provider>);
  return { store, onClose };
}

describe('NotificationDropdown errors', () => {
  beforeEach(() => vi.resetAllMocks());

  it('shows an initial loading error instead of the empty state and allows retry', async () => {
    vi.mocked(notificationService.getNotifications)
      .mockRejectedValueOnce(new Error('Could not load notifications'))
      .mockResolvedValueOnce({ notifications: [], unread_count: 0 });

    renderDropdown();

    expect(await screen.findByRole('alert')).toHaveTextContent('Could not load notifications');
    expect(screen.queryByText('No notifications found')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(await screen.findByText('No notifications found')).toBeInTheDocument();
    expect(notificationService.getNotifications).toHaveBeenCalledTimes(2);
  });

  it('keeps loaded notifications visible when marking one as read fails', async () => {
    vi.mocked(notificationService.getNotifications).mockResolvedValue({
      notifications: [errorStateItem],
      unread_count: 1,
    });
    vi.mocked(notificationService.markRead).mockRejectedValue(new Error('Could not mark notification as read'));

    renderDropdown();
    fireEvent.click(await screen.findByText('Review Pending'));

    expect(await screen.findByRole('alert')).toHaveTextContent('Could not mark notification as read');
    expect(screen.getByText('Review Pending')).toBeInTheDocument();
  });

  it('keeps loaded notifications visible when deletion fails', async () => {
    vi.mocked(notificationService.getNotifications).mockResolvedValue({
      notifications: [errorStateItem],
      unread_count: 1,
    });
    vi.mocked(notificationService.clearNotifications).mockRejectedValue(new Error('Could not delete notification'));

    renderDropdown();
    fireEvent.click(await screen.findByRole('button', { name: 'Delete notification' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Could not delete notification');
    expect(screen.getByText('Review Pending')).toBeInTheDocument();
  });
});

describe('notification navigation', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(notificationService.markRead).mockResolvedValue({ status: 'success' });
    vi.mocked(notificationService.clearNotifications).mockResolvedValue({ status: 'success' });
  });

  it('links the record and closes immediately while marking it read', async () => {
    vi.mocked(notificationService.markRead).mockReturnValue(new Promise(() => {}));
    const { onClose } = showNotification();
    const link = await screen.findByRole('link', { name: 'Lead updated' });
    expect(link).toHaveAttribute('href', '/leads/LEAD-42');
    fireEvent.click(link);
    expect(notificationService.markRead).toHaveBeenCalledWith({ ids: ['notification-1'] });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('keeps read notifications navigable without another mutation', async () => {
    const { onClose } = showNotification({ read: true });
    fireEvent.click(await screen.findByRole('link', { name: 'Lead updated' }));
    expect(notificationService.markRead).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('does not make navigation depend on a successful mark-read request', async () => {
    vi.mocked(notificationService.markRead).mockRejectedValue(new Error('Offline'));
    const { onClose, store } = showNotification();
    fireEvent.click(await screen.findByRole('link', { name: 'Lead updated' }));
    expect(onClose).toHaveBeenCalledOnce();
    await waitFor(() => expect(store.getState().notifications.error).toBe('Offline'));
  });

  it('deletes without opening the record or marking it read', async () => {
    const { onClose } = showNotification();
    fireEvent.click(await screen.findByRole('button', { name: 'Delete notification' }));
    expect(notificationService.clearNotifications).toHaveBeenCalledWith({ ids: ['notification-1'] });
    expect(notificationService.markRead).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('keeps unlinked notifications readable without a broken destination', async () => {
    const { onClose } = showNotification({ document_name: null });
    fireEvent.click(await screen.findByRole('button', { name: 'Lead updated' }));
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(notificationService.markRead).toHaveBeenCalledWith({ ids: ['notification-1'] });
    expect(onClose).not.toHaveBeenCalled();
  });
});
