import { notificationService } from '@/features/notifications/api/notification.service';
import { notificationReducer } from '@/features/notifications/store/notificationSlice';
import { configureStore } from '@reduxjs/toolkit';
import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NotificationDropdown } from './NotificationDropdown';

vi.mock('@/features/notifications/api/notification.service', () => ({
  notificationService: {
    getNotifications: vi.fn(),
    markRead: vi.fn(),
    clearNotifications: vi.fn(),
  },
}));

const notification = {
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

describe('NotificationDropdown errors', () => {
  beforeEach(() => vi.clearAllMocks());

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
      notifications: [notification],
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
      notifications: [notification],
      unread_count: 1,
    });
    vi.mocked(notificationService.clearNotifications).mockRejectedValue(new Error('Could not delete notification'));

    renderDropdown();
    fireEvent.click(await screen.findByRole('button', { name: 'Delete notification' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Could not delete notification');
    expect(screen.getByText('Review Pending')).toBeInTheDocument();
  });
});
