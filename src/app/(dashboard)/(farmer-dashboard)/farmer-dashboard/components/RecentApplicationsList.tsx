import Button from '@/components/ui/Button';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface RecentApplication {
  application_id: string;
  bank: string;
  loan_product_name: string;
  requested_amount: number;
  status: string;
  creation: string;
}

export default function RecentApplicationsList({ applications = [] }: { applications?: RecentApplication[] }) {
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
      case 'Disbursed':
      case 'Active':
        return 'bg-green-100 text-green-700';
      case 'Processed':
      case 'Processing':
      case 'Under Review':
        return 'bg-yellow-100 text-yellow-700';
      case 'Rejected':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700'; // Draft
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#F1F3F4] flex flex-col h-full shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05),0px_2px_4px_-1px_rgba(0,0,0,0.03)] hover:-translate-y-1 hover:shadow-lg transition-all">
      <div className="px-6 py-4.5 border-b border-gray-200 flex items-center justify-between min-h-[72px]">
        <h3 className="text-lg font-bold text-gray-900">Recent Applications</h3>
        <Button as={Link} href="/my-applications" variant="outline" size="md" className="gap-1 !border-[#16A34A]/30 hover:bg-[#16A34A]/5">
          My Applications
          <ChevronRight className="w-3.5 h-3.5" />
        </Button>
      </div>

      <div className="p-6 flex flex-col gap-5">
        {applications.length === 0 ? (
          <div className="text-center text-gray-400 font-medium py-4">No recent applications</div>
        ) : (
          applications.map((app, idx) => {
            const dateStr = app.creation ? app.creation.split(' ')[0] : '';
            return (
              <div key={app.application_id || idx} className={`flex items-start justify-between ${idx !== applications.length - 1 ? 'border-b border-gray-50 pb-5' : ''}`}>
                <div>
                  <div className="font-bold text-gray-900 mb-1">{app.bank || '—'}</div>
                  <div className="text-sm font-medium text-gray-400">
                    {app.loan_product_name || 'Unknown Product'} · {dateStr || '—'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900 mb-1">
                    {app.requested_amount != null ? `ETB ${app.requested_amount.toLocaleString()}` : '—'}
                  </div>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[12px] font-bold ${getStatusColor(app.status)}`}>
                    {app.status}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
