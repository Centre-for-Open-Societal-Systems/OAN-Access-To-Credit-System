'use client';

import { History, Check, Clock, XCircle, MapPin } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import { selectVisitState } from '../store/visitSlice';

export function VisitHistoryCard() {
    const { visitHistory } = useAppSelector(selectVisitState);

    return (
        <div className="flex flex-col items-start p-5 gap-6 w-full bg-white border border-[#F1F3F4] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05),0px_2px_4px_-1px_rgba(0,0,0,0.03)] hover:-translate-y-1 hover:shadow-lg transition-all duration-300 rounded-xl">

            {/* Header */}
            <div className="flex flex-row items-center pb-3 w-full border-b border-black/10">
                <div className="flex flex-row items-center gap-2">
                    <History size={16} className="text-[#16335A]" />
                    <h2 className="font-roboto font-semibold text-base leading-6 text-gray-900">
                        Visit History
                    </h2>
                </div>
            </div>

            {/* Timeline Container */}
            <div className="flex flex-col items-start pl-3 gap-6 w-full relative">
                {visitHistory && visitHistory.length > 0 ? (
                    visitHistory.map((visit, index) => {
                        const isCompleted = visit.status === 'Completed';
                        const isMissed = visit.status === 'Missed';
                        const isScheduled = visit.status === 'Scheduled';

                        let Icon = Clock;
                        let iconColorClass = "text-gray-500";
                        let bgClass = "bg-gray-100";
                        let borderColorClass = "border-gray-200";

                        if (isCompleted) {
                            Icon = Check;
                            iconColorClass = "text-green-600";
                            bgClass = "bg-green-50";
                            borderColorClass = "border-green-200";
                        } else if (isMissed) {
                            Icon = XCircle;
                            iconColorClass = "text-red-500";
                            bgClass = "bg-red-50";
                            borderColorClass = "border-red-200";
                        } else if (isScheduled) {
                            Icon = Clock;
                            iconColorClass = "text-blue-500";
                            bgClass = "bg-blue-50";
                            borderColorClass = "border-blue-200";
                        }

                        // Format date
                        let formattedDate = visit.visit_date;
                        try {
                            const d = new Date(visit.visit_date);
                            if (!isNaN(d.getTime())) {
                                formattedDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                            }
                        } catch(e) {}

                        const locationText = visit.meeting_location || (visit.region ? `${visit.region}, ${visit.zone}` : '');

                        return (
                            <div key={visit.name || index} className="flex flex-col items-start w-full relative group">
                                {/* Connector Line (except for last item) */}
                                {index < visitHistory.length - 1 && (
                                    <div className="absolute left-0 top-6 bottom-[-24px] w-[1px] bg-gray-200 z-0"></div>
                                )}

                                {/* Icon Bubble */}
                                <div className={`absolute flex justify-center items-center w-6 h-6 left-[-12px] top-[4px] ${bgClass} border ${borderColorClass} rounded-full z-10 transition-transform group-hover:scale-110`}>
                                    <Icon size={12} className={iconColorClass} strokeWidth={2.5} />
                                </div>

                                <div className="flex flex-col items-start pl-6 gap-[2px] w-full">
                                    <div className="flex flex-row justify-between items-start w-full gap-2">
                                        <h4 className="font-roboto font-medium text-sm leading-5 text-gray-900">
                                            {visit.status === 'Completed' ? 'Completed Visit' : 
                                             visit.status === 'Missed' ? 'Missed Visit' : 'Scheduled Visit'}
                                        </h4>
                                        <span className="font-roboto font-normal text-xs leading-4 text-gray-500 whitespace-nowrap pt-[2px]">
                                            {formattedDate} {visit.visit_time?.substring(0, 5)}
                                        </span>
                                    </div>
                                    <div className="font-roboto font-normal text-[14px] leading-[1.4] text-gray-600 pr-4 mt-1 space-y-1">
                                        {locationText && (
                                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                                <MapPin size={12} />
                                                <span>{locationText}</span>
                                            </div>
                                        )}
                                        {visit.status === 'Scheduled' && (
                                            <span className="inline-block px-2 py-0.5 mt-1 rounded text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                                                Upcoming
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="flex items-center justify-center w-full py-4 text-sm text-gray-500 italic">
                        No visit history available.
                    </div>
                )}
            </div>
        </div>
    );
}
