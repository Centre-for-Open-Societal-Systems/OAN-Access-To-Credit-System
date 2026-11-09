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

function showNotification(overrides: Partial<NotificationItem> = {}) {
  const store = configureStore({ reducer: { notifications: notificationReducer } });
  vi.mocked(notificationService.getNotifications).mockResolvedValue({ notifications: [{ ...item, ...overrides }], unread_count: 1 });
  const onClose = vi.fn();
  render(<Provider store={store}><NotificationDropdown isOpen onClose={onClose} /></Provider>);
  return { store, onClose };
}

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
