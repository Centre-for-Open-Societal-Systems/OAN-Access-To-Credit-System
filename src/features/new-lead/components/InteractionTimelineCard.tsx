import { History, UserPlus, Phone, UserCheck, Calendar, FileText, CheckCircle } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import { selectNewLeadState } from '../store/newLeadSlice';

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
  const { activities } = useAppSelector(selectNewLeadState);

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-start p-5 gap-6 w-full bg-white border border-[#D4D4D4] rounded-xl shadow-[0px_2px_4px_-1px_rgba(0,0,0,0.03)]">
        <div className="flex flex-row items-center pb-3 w-full border-b border-black/10">
          <div className="flex flex-row items-center gap-2">
            <History size={16} className="text-[#16335A]" />
            <h2 className="font-roboto font-semibold text-base leading-6 text-gray-900">
              Audit History
            </h2>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-6 w-full text-center">
          <p className="font-roboto font-normal text-sm text-gray-500">
            No history logs available yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start p-5 gap-6 w-full bg-white border border-[#D4D4D4] rounded-xl shadow-[0px_2px_4px_-1px_rgba(0,0,0,0.03)]">
      
      {/* Header */}
      <div className="flex flex-row items-center pb-3 w-full border-b border-black/10">
        <div className="flex flex-row items-center gap-2">
          <History size={16} className="text-[#16335A]" />
          <h2 className="font-roboto font-semibold text-base leading-6 text-gray-900">
            Audit History
          </h2>
        </div>
      </div>

      {/* Timeline Container */}
      <div className="flex flex-col items-start pl-3 gap-6 w-full relative">
        {activities.map((activity, index) => {
          const Icon = getIconForEventType(activity.title || activity.type || '');
          
          return (
            <div key={activity.id} className="flex flex-col items-start w-full relative">
              {/* Vertical line connecting to next item */}
              {index < activities.length - 1 && (
                <div className="absolute w-[2px] bg-[#D4D4D4] left-[-1px] top-[28px] bottom-[-24px]" />
              )}
              
              {/* Icon Bubble */}
              <div className="absolute flex justify-center items-center w-6 h-6 left-[-12px] top-[4px] bg-white border-2 border-[#16335A] rounded-full shadow-[0px_1px_2px_rgba(0,0,0,0.05)] z-10">
                <Icon size={10} className="text-[#16335A]" />
              </div>

              <div className="flex flex-col items-start pl-6 gap-[2px] w-full">
                <div className="flex flex-row justify-between items-start w-full gap-2">
                  <h4 className="font-roboto font-medium text-sm leading-5 text-gray-900">
                    {activity.title || activity.type}
                  </h4>
                  <span className="font-roboto font-normal text-xs leading-4 text-gray-500 whitespace-nowrap">
                    {activity.timestamp}
                  </span>
                </div>
                <p className="font-roboto font-normal text-xs leading-4 text-gray-500 whitespace-pre-wrap mt-0.5">
                  {activity.content}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
