import React from 'react';
import { Bell, Calendar } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import { selectVisibleNotifications } from '../store/loanDashboardSlice';

const LoanNotifications = React.memo(() => {
  const notifications = useAppSelector(selectVisibleNotifications);

  return (
    <div className="flex h-full flex-col rounded-[20px] border border-border-subtle bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-text-primary">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-50 text-amber-600">
            <Bell size={16} strokeWidth={2.2} />
          </span>
          Notifications
        </h3>
        <button type="button" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700">
          View All
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-1" style={{ maxHeight: '28rem' }}>
        {notifications.length === 0 ? (
          <p className="py-8 text-center text-sm text-text-muted">No notifications for this period.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {notifications.map((notification) => {
              const Icon = notification.icon;

              let iconClasses = "bg-slate-50 text-slate-600";
              if (notification.tone === 'success') iconClasses = "bg-green-50 text-green-600";
              if (notification.tone === 'info') iconClasses = "bg-emerald-50 text-emerald-600";
              if (notification.tone === 'warning') iconClasses = "bg-amber-50 text-amber-600";

              return (
                <article
                  key={notification.title}
                  className={`flex gap-4 rounded-xl border border-border-subtle bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md ${notification.highlight ? 'bg-slate-50/50' : ''}`}
                >
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${iconClasses}`}>
                    <Icon size={16} strokeWidth={2.4} />
                  </span>

                  <div className="flex flex-col">
                    <strong className="text-sm font-bold text-slate-900">{notification.title}</strong>
                    <p className="mt-1 text-[13px] leading-relaxed text-slate-500">{notification.description}</p>
                    <span className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
                      <Calendar size={12} strokeWidth={2} />
                      {notification.time}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
});

LoanNotifications.displayName = 'LoanNotifications';
export default LoanNotifications;
