'use client';

import {
  clearNotifications,
  fetchNotifications,
  getNotificationId,
  isItemUnread,
  markNotificationsRead
} from '@/features/notifications/store/notificationSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { CheckCircle2, FileText, Loader2, Trash2, X, XCircle } from 'lucide-react';
import React, { useEffect, useRef } from 'react';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ isOpen, onClose }) => {
  const dispatch = useAppDispatch();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { items, unreadCount, loading } = useAppSelector((state) => state.notifications);

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchNotifications({ read_status: 'all', limit: 20, start: 0 }));
    }
  }, [isOpen, dispatch]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleMarkAllRead = () => {
    dispatch(markNotificationsRead({ mark_all: true }));
  };

  const handleMarkSingleRead = (id: string) => {
    dispatch(markNotificationsRead({ notification_ids: [id] }));
  };

  const handleClearSingle = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(clearNotifications({ notification_ids: [id] }));
  };

  const getItemIcon = (subject?: string, content?: string) => {
    const text = `${subject || ''} ${content || ''}`.toLowerCase();
    if (text.includes('failed') || text.includes('error') || text.includes('rejected')) {
      return (
        <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center shrink-0">
          <XCircle className="w-4 h-4 text-red-500" />
        </div>
      );
    }
    if (text.includes('approved') || text.includes('updated') || text.includes('success') || text.includes('kyc')) {
      return (
        <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
        </div>
      );
    }
    return (
      <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
        <FileText className="w-4 h-4 text-blue-500" />
      </div>
    );
  };

  const formatTimestamp = (dateStr?: string) => {
    if (!dateStr) return 'Just now';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div
      ref={dropdownRef}
      className="absolute max-sm:-right-[3.25rem] sm:right-0 top-full mt-2 w-[calc(100vw-32px)] sm:w-[380px] max-w-[340px] sm:max-w-none bg-white border border-gray-100 rounded-2xl shadow-xl z-popover overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <h3 className="text-lg font-extrabold text-gray-900 tracking-tight">Notifications</h3>
          {unreadCount > 0 && (
            <span className="w-6 h-6 flex items-center justify-center text-xs font-bold text-white bg-red-500 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="max-h-[340px] overflow-y-auto divide-y divide-gray-100">
        {loading && items.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-gray-400 gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-xs">Loading notifications...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="py-8 text-center text-xs text-gray-400">No notifications found</div>
        ) : (
          items.map((item, index) => {
            const isUnread = isItemUnread(item);
            const notifId = getNotificationId(item, index);
            return (
              <div
                key={`${notifId}-${index}`}
                onClick={() => {
                  if (isUnread && notifId) {
                    handleMarkSingleRead(notifId);
                  }
                }}
                className={`p-4 flex items-start gap-3.5 transition-colors cursor-pointer group relative ${
                  isUnread ? 'bg-[#F0FDF4] hover:bg-[#DCFCE7]' : 'bg-white hover:bg-gray-50'
                }`}
              >
                {getItemIcon(item.subject, item.email_content)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-bold text-gray-900 leading-snug">
                      {item.subject || 'Notification'}
                    </h4>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {isUnread && (
                        <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] shrink-0 mt-1" />
                      )}
                      <button
                        type="button"
                        onClick={(e) => handleClearSingle(e, notifId)}
                        title="Delete notification"
                        aria-label="Delete notification"
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  {item.email_content && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                      {item.email_content.replace(/<[^>]*>?/gm, '')}
                    </p>
                  )}
                  {item.document_name && (
                    <p className="text-xs text-gray-400 mt-1">{item.document_name}</p>
                  )}
                  <p className="text-[11px] text-gray-400 mt-1.5 font-medium">
                    {formatTimestamp(item.creation)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-white border-t border-gray-100 text-xs font-semibold">
        <button
          type="button"
          onClick={handleMarkAllRead}
          className="text-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer"
        >
          Mark all as read
        </button>
        <button
          type="button"
          onClick={() => dispatch(clearNotifications({ clear_all: true }))}
          className="text-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer"
        >
          Clear all notifications
        </button>
      </div>
    </div>
  );
};
