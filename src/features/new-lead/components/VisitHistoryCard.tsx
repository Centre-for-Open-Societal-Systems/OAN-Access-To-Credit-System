import { History, Check } from 'lucide-react';

export function VisitHistoryCard() {
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

                {/* Timeline Item 1: Initial Contact Meeting */}
                <div className="flex flex-col items-start w-full relative">

                    {/* Icon Bubble */}
                    <div className="absolute flex justify-center items-center w-6 h-6 left-[-12px] top-[4px] bg-[rgba(22,51,90,0.05)] border border-[rgba(22,51,90,0.1)] rounded-full z-10">
                        <Check size={12} className="text-[#16335A]" />
                    </div>

                    <div className="flex flex-col items-start pl-6 gap-[2px] w-full">
                        <div className="flex flex-row justify-between items-start w-full">
                            <h4 className="font-roboto font-medium text-sm leading-5 text-gray-900">
                                Initial Contact Meeting
                            </h4>
                            <span className="font-roboto font-normal text-xs leading-4 text-gray-500 whitespace-nowrap">
                                May 20, 2026
                            </span>
                        </div>
                        <p className="font-roboto font-normal text-[14px] leading-4 text-gray-500 pr-4">
                            Met at the local cooperative office to discuss loan requirements.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}
