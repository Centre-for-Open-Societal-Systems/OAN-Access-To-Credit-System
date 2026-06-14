import { History, UserPlus, Phone, UserCheck, Calendar, FileText, CheckCircle } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import { selectActivities } from '../store/newLeadSlice';

function getIconForEventType(eventType: string) {
  const et = eventType.toLowerCase();
  if (et.includes('create') || et.includes('imported')) {
    return UserPlus;
  }
  if (et.includes('contact') || et.includes('call') || et.includes('phone')) {
    return Phone;
  }
  if (et.includes('assign')) {
    return UserCheck;
  }
  if (et.includes('status') || et.includes('update') || et.includes('changed')) {
    return CheckCircle;
  }
  if (et.includes('visit') || et.includes('schedule') || et.includes('meeting')) {
    return Calendar;
  }
  return FileText;
}

export function InteractionTimelineCard() {
  const activities = useAppSelector(selectActivities);
  const auditActivities = activities.filter((activity) => activity.type !== 'Commented');

  if (auditActivities.length === 0) {
    return (
      <section className="flex flex-col items-center pb-6 gap-6 w-full bg-white border border-[#F1F3F4] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05),0px_2px_4px_-1px_rgba(0,0,0,0.03)] hover:-translate-y-1 hover:shadow-lg transition-all duration-300 rounded-xl">
        <div className="flex flex-row items-center p-5 px-6 w-full border-b border-[#F1F3F4]">
          <h2 className="font-inter font-semibold text-lg leading-7 flex items-center gap-2 text-[#232F34]">
            <History size={16} className="text-[#16335A]" />
            Audit History
          </h2>
        </div>



        <div className="flex flex-col items-center justify-center py-6 w-full text-center animate-in fade-in zoom-in duration-500">
          <div className="bg-[#EFF6FF] rounded-full p-4 mb-3 border border-[#DBEAFE] shadow-sm">
            <History size={32} className="text-[#3b82f6] animate-bounce" />
          </div>
          <h3 className="text-[#64748B] font-medium text-[15px]">No history logs available yet.</h3>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col items-center pb-6 gap-6 w-full bg-white border border-[#F1F3F4] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05),0px_2px_4px_-1px_rgba(0,0,0,0.03)] hover:-translate-y-1 hover:shadow-lg transition-all duration-300 rounded-xl">
      {/* Header */}
      <div className="flex flex-row items-center p-5 px-6 w-full border-b border-[#F1F3F4]">
        <h2 className="font-inter font-semibold text-lg leading-7 flex items-center gap-2 text-[#232F34]">
          <History size={16} className="text-[#16335A]" />
          Audit History
        </h2>
      </div>

      {/* Timeline Container */}
      <div className="flex flex-col items-start px-4 sm:px-6 w-full mt-2">
        {auditActivities.map((activity, index) => {
          const Icon = getIconForEventType(activity.title || activity.type || '');

          return (
            <div key={activity.id} className="flex flex-row items-start w-full gap-4">
              <div className="flex flex-col items-center relative shrink-0 self-stretch">
                {/* Icon Bubble */}
                <div className="flex justify-center items-center w-[30px] h-[30px] bg-white border-[2px] border-[#16335A] rounded-full z-10 relative">
                  <Icon size={14} className="text-[#16335A]" />
                </div>
                {/* Vertical line connecting to next item */}
                {index < auditActivities.length - 1 && (
                  <div className="absolute w-[2px] bg-[#D4D4D4] top-[30px] bottom-0 z-0" />
                )}
              </div>

              <div className="flex flex-col items-start flex-1 min-w-0 pt-0.5 pb-8">
                <div className="flex flex-col items-start w-full gap-0.5">
                  <h4 className="font-roboto font-semibold text-[16px] text-[#111827]">
                    {activity.title || activity.type}
                  </h4>
                  <span className="font-roboto font-normal text-[14px] text-[#6B7280]">
                    {activity.timestamp}
                  </span>
                </div>
                <div className="flex flex-col gap-1.5 mt-2.5">
                  {(activity.content || '').split('\n').map((line, i) => {
                    const trimmedLine = line.trim();
                    if (!trimmedLine) return null;
                    return (
                      <div key={i} className="flex flex-row items-start gap-2.5 w-full">
                        <span className="w-1.5 h-1.5 bg-[#9CA3AF] rounded-full mt-[9px] shrink-0" />
                        <span className="font-roboto font-normal text-[14px] leading-6 text-[#4B5563]">
                          {trimmedLine}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
