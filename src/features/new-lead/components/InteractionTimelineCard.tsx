import { History, UserPlus, Phone, UserCheck } from 'lucide-react';

export function InteractionTimelineCard() {
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
                
                {/* Timeline Item 1: Lead Created */}
                <div className="flex flex-col items-start w-full relative">
                    {/* Vertical line connecting to next item */}
                    <div className="absolute w-[2px] bg-[#D4D4D4] left-[-1px] top-[28px] bottom-[-24px]" />
                    
                    {/* Icon Bubble */}
                    <div className="absolute flex justify-center items-center w-6 h-6 left-[-12px] top-[4px] bg-[#16335A] border-2 border-white rounded-full shadow-[0px_1px_2px_rgba(0,0,0,0.05)] z-10">
                        <UserPlus size={10} className="text-white" />
                    </div>

                    <div className="flex flex-col items-start pl-6 gap-[2px] w-full">
                        <div className="flex flex-row justify-between items-start w-full">
                            <h4 className="font-roboto font-medium text-sm leading-5 text-gray-900">
                                Lead Created
                            </h4>
                            <span className="font-roboto font-normal text-xs leading-4 text-gray-500">
                                May 20, 2026
                            </span>
                        </div>
                        <p className="font-roboto font-normal text-xs leading-4 text-gray-500">
                            Imported from Bishoftu Cooperative List
                        </p>
                    </div>
                </div>

                {/* Timeline Item 2: Initial Contact */}
                <div className="flex flex-col items-start w-full relative">
                    {/* Vertical line connecting to next item */}
                    <div className="absolute w-[2px] bg-[#D4D4D4] left-[-1px] top-[28px] bottom-[-24px]" />
                    
                    {/* Icon Bubble */}
                    <div className="absolute flex justify-center items-center w-6 h-6 left-[-12px] top-[4px] bg-white border-2 border-[#16335A] rounded-full shadow-[0px_1px_2px_rgba(0,0,0,0.05)] z-10">
                        <Phone size={10} className="text-[#16335A]" />
                    </div>

                    <div className="flex flex-col items-start pl-6 gap-[2px] w-full">
                        <div className="flex flex-row justify-between items-start w-full">
                            <h4 className="font-roboto font-medium text-sm leading-5 text-gray-900">
                                Initial Contact
                            </h4>
                            <span className="font-roboto font-normal text-xs leading-4 text-gray-500">
                                May 22, 2026
                            </span>
                        </div>
                        <p className="font-roboto font-normal text-xs leading-4 text-gray-500">
                            Called to verify interest in Fertilizer Campaign.
                        </p>
                        <div className="mt-1 flex flex-row items-center px-2 py-0.5 bg-[#16335A]/10 border border-[#16335A]/20 rounded w-fit">
                            <span className="font-roboto font-medium text-[10px] leading-[15px] text-[#16335A]">
                                Connected
                            </span>
                        </div>
                    </div>
                </div>

                {/* Timeline Item 3: Assigned to Owner */}
                <div className="flex flex-col items-start w-full relative">
                    {/* Icon Bubble */}
                    <div className="absolute flex justify-center items-center w-6 h-6 left-[-12px] top-[4px] bg-white border-2 border-[#6D9F6C] rounded-full shadow-[0px_1px_2px_rgba(0,0,0,0.05)] z-10">
                        <UserCheck size={10} className="text-[#6D9F6C]" />
                    </div>

                    <div className="flex flex-col items-start pl-6 gap-[2px] w-full">
                        <div className="flex flex-row justify-between items-start w-full">
                            <h4 className="font-roboto font-medium text-sm leading-5 text-gray-900">
                                Assigned to Owner
                            </h4>
                            <span className="font-roboto font-normal text-xs leading-4 text-gray-500">
                                Today, 09:15 AM
                            </span>
                        </div>
                        <p className="font-roboto font-normal text-xs leading-4 text-gray-500">
                            Assigned to Abebe Kebede
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}
