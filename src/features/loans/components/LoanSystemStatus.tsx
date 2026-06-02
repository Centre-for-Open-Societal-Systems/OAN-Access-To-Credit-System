import React from 'react';
import { Wifi, Clock3, MapPin } from 'lucide-react';

const systemStatus = [
  { label: 'Network Status', value: 'Online', icon: Wifi, tone: 'success' },
  { label: 'Pending Sync', value: '0 items', icon: Clock3, tone: 'neutral' },
  { label: 'Location GPS', value: 'Active', icon: MapPin, tone: 'info' },
];

export default function LoanSystemStatus() {
  return (
    <aside className="flex flex-col rounded-[20px] border border-border-subtle bg-white p-6 shadow-sm">
      <h3 className="mb-6 text-lg font-semibold text-text-primary">System Status</h3>

      <div className="flex flex-col gap-5">
        {systemStatus.map((status) => {
          const Icon = status.icon;

          let iconBg = 'bg-slate-50 text-slate-600';
          let pillBg = 'bg-slate-100 text-slate-700';

          if (status.tone === 'success') {
            iconBg = 'bg-green-50 text-green-600';
            pillBg = 'bg-green-50 text-green-700';
          } else if (status.tone === 'info') {
            iconBg = 'bg-blue-50 text-blue-600';
            pillBg = 'bg-blue-50 text-blue-700';
          }

          return (
            <div key={status.label} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`flex h-8 w-8 items-center justify-center rounded-full ${iconBg}`}>
                  <Icon size={14} strokeWidth={2.5} />
                </span>
                <span className="text-sm font-medium text-text-primary">{status.label}</span>
              </div>
              
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${pillBg}`}>
                {status.value}
              </span>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
