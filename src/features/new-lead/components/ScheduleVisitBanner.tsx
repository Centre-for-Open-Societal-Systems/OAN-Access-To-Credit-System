"use client";

import { MapPin, Phone } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import { selectFarmerState } from '..';

export function ScheduleVisitBanner() {
  const { farmerDetails } = useAppSelector(selectFarmerState);

  return (
    <div className="flex flex-row items-center p-4 w-full gap-4 bg-white border border-[#F1F3F4] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05),0px_2px_4px_-1px_rgba(0,0,0,0.03)] hover:-translate-y-1 hover:shadow-lg transition-all duration-300 rounded-xl">
      <div className="flex justify-center items-center shrink-0 w-[48px] h-[48px] bg-[#DCFCE7] rounded-full">
        <span className="font-roboto font-bold text-[18px] text-[#15803D]">
          {farmerDetails ? `${farmerDetails.firstName?.[0] || ''}${farmerDetails.lastName?.[0] || ''}`.toUpperCase() || 'AK' : 'AK'}
        </span>
      </div>
      <div className="flex flex-col items-start gap-1">
        <span className="font-roboto font-semibold text-[16px] text-[#111827]">
          {farmerDetails ? `${farmerDetails.firstName || ''} ${farmerDetails.lastName || ''}`.trim() || 'Abebe Kebede' : 'Abebe Kebede'}
        </span>
        <div className="flex flex-row flex-wrap items-center gap-x-2 gap-y-1 text-[#6B7280] font-roboto font-normal text-[14px]">
          <div className="flex items-center gap-1">
            <MapPin size={14} className="shrink-0" />
            <span className="truncate">{farmerDetails?.location || 'Oromia, Jimma Zone'}</span>
          </div>
          <span className="text-[#D1D5DB] hidden sm:block">|</span>
          <div className="flex items-center gap-1">
            <Phone size={14} />
            <span>{farmerDetails?.phoneNumber || '+251 911 234 567'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
