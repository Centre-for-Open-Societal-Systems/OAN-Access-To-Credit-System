import React from 'react';
import { Calendar, Clock, MapPin, ChevronDown } from 'lucide-react';

export const ScheduleNewVisitForm = () => {
    return (
        <div className="flex flex-col items-start w-full bg-white border border-[#D4D4D4] rounded-[12px] overflow-hidden">
            <div className="flex flex-row items-center w-full px-6 py-[19.5px] border-b border-[rgba(212,212,212,0.5)]">
                <h2 className="font-roboto font-semibold text-base leading-6 text-[#111827]">
                    Schedule New Visit
                </h2>
            </div>

            <div className="flex flex-col items-start px-6 pt-6 pb-8 gap-6 w-full">
                
                {/* Date & Time Row */}
                <div className="flex flex-row items-start gap-4 w-full">
                    <div className="flex flex-col gap-1 flex-1">
                        <label className="font-inter font-medium text-sm text-[#374151]">Visit Date</label>
                        <div className="relative w-full">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Calendar size={16} className="text-[#9CA3AF]" />
                            </div>
                            <input
                                type="text"
                                placeholder="mm/dd/yyyy"
                                className="w-full pl-10 pr-3 py-2 bg-white border border-[#D1D5DC] rounded-md text-sm text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#16A34A] focus:border-[#16A34A]"
                            />
                        </div>
                    </div>
                    <div className="flex flex-col gap-1 flex-1">
                        <label className="font-inter font-medium text-sm text-[#374151]">Visit Time</label>
                        <div className="relative w-full">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Clock size={16} className="text-[#9CA3AF]" />
                            </div>
                            <input
                                type="text"
                                placeholder="--:-- --"
                                className="w-full pl-10 pr-3 py-2 bg-white border border-[#D1D5DC] rounded-md text-sm text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#16A34A] focus:border-[#16A34A]"
                            />
                        </div>
                    </div>
                </div>

                {/* Meeting Location */}
                <div className="flex flex-col gap-1 w-full">
                    <label className="font-inter font-medium text-sm text-[#374151]">Meeting Location</label>
                    <div className="relative w-full">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MapPin size={16} className="text-[#9CA3AF]" />
                        </div>
                        <input
                            type="text"
                            placeholder="Farmer's Primary Farm (Jimma Zone)"
                            className="w-full pl-10 pr-3 py-2 bg-white border border-[#D1D5DC] rounded-md text-sm text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#16A34A] focus:border-[#16A34A]"
                        />
                    </div>
                </div>

                {/* Agenda / Notes */}
                <div className="flex flex-col gap-1 w-full">
                    <label className="font-inter font-medium text-sm text-[#374151]">Agenda / Notes</label>
                    <textarea
                        placeholder="What is the purpose of this visit?"
                        rows={4}
                        className="w-full px-3 py-2 bg-white border border-[#D1D5DC] rounded-md text-sm text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#16A34A] focus:border-[#16A34A] resize-none"
                    />
                </div>

                {/* Region & Zone Row */}
                <div className="flex flex-row items-start gap-4 w-full">
                    <div className="flex flex-col gap-1 flex-1">
                        <label className="font-inter font-medium text-sm text-[#374151]">
                            Region <span className="text-[#EF4444]">*</span>
                        </label>
                        <div className="relative w-full">
                            <select
                                className="w-full pl-3 pr-10 py-2 bg-white border border-[#D1D5DC] rounded-md text-sm text-[#9CA3AF] appearance-none focus:outline-none focus:ring-1 focus:ring-[#16A34A] focus:border-[#16A34A]"
                                defaultValue=""
                            >
                                <option value="" disabled hidden>Select Region</option>
                                <option value="oromia">Oromia</option>
                                <option value="amhara">Amhara</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <ChevronDown size={16} className="text-[#9CA3AF]" />
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-1 flex-1">
                        <label className="font-inter font-medium text-sm text-[#374151]">
                            Zone <span className="text-[#EF4444]">*</span>
                        </label>
                        <div className="relative w-full">
                            <select
                                className="w-full pl-3 pr-10 py-2 bg-white border border-[#D1D5DC] rounded-md text-sm text-[#9CA3AF] appearance-none focus:outline-none focus:ring-1 focus:ring-[#16A34A] focus:border-[#16A34A]"
                                defaultValue=""
                            >
                                <option value="" disabled hidden>Select Zone</option>
                                <option value="jimma">Jimma</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <ChevronDown size={16} className="text-[#9CA3AF]" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Woreda & Kebela Row */}
                <div className="flex flex-row items-start gap-4 w-full">
                    <div className="flex flex-col gap-1 flex-1">
                        <label className="font-inter font-medium text-sm text-[#374151]">
                            Woreda <span className="text-[#EF4444]">*</span>
                        </label>
                        <div className="relative w-full">
                            <select
                                className="w-full pl-3 pr-10 py-2 bg-white border border-[#D1D5DC] rounded-md text-sm text-[#9CA3AF] appearance-none focus:outline-none focus:ring-1 focus:ring-[#16A34A] focus:border-[#16A34A]"
                                defaultValue=""
                            >
                                <option value="" disabled hidden>Select Woreda</option>
                                <option value="limmu">Limmu Kosa</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <ChevronDown size={16} className="text-[#9CA3AF]" />
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-1 flex-1">
                        <label className="font-inter font-medium text-sm text-[#374151]">
                            Kebela <span className="text-[#EF4444]">*</span>
                        </label>
                        <input
                            type="text"
                            placeholder="Enter Kebela"
                            className="w-full px-3 py-2 bg-white border border-[#D1D5DC] rounded-md text-sm text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#16A34A] focus:border-[#16A34A]"
                        />
                    </div>
                </div>

                {/* Address/Landmark */}
                <div className="flex flex-col gap-1 w-full">
                    <label className="font-inter font-medium text-sm text-[#374151]">
                        Address/Landmark <span className="text-[#EF4444]">*</span>
                    </label>
                    <input
                        type="text"
                        placeholder="Enter Near the large well, House"
                        className="w-full px-3 py-2 bg-white border border-[#D1D5DC] rounded-md text-sm text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#16A34A] focus:border-[#16A34A]"
                    />
                </div>

            </div>

            {/* Footer */}
            <div className="flex flex-row justify-end items-center px-6 py-4 w-full gap-4">
                <button
                    className="flex justify-center items-center px-4 py-2 bg-white border border-[#D1D5DC] rounded-md text-[#374151] font-inter font-medium text-sm hover:bg-gray-50 transition-colors"
                >
                    Cancel
                </button>
                <button
                    className="flex justify-center items-center px-4 py-2 bg-[#16A34A] rounded-md text-white font-inter font-medium text-sm shadow-sm hover:bg-[#15803d] transition-colors"
                >
                    Save Schedule
                </button>
            </div>
        </div>
    );
};
