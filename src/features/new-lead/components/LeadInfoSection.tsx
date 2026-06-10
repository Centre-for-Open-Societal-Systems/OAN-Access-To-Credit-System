import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectNewLeadState, setLeadSource, setLeadStatus } from '../store/newLeadSlice';
import { TextField } from '@/components/ui/TextField';
import { useParams } from 'next/navigation';

export function LeadInfoSection() {
  const dispatch = useAppDispatch();
  const { leadSource, leadStatus, leadSourcesOptions, leadStatusesOptions } = useAppSelector(selectNewLeadState);
  const params = useParams();
  const leadId = params?.id as string;

  return (





    <section className="flex flex-col items-center pb-6 gap-4 w-full bg-white border border-[#F1F3F4] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05),0px_2px_4px_-1px_rgba(0,0,0,0.03)] rounded-xl">
      <div className="flex flex-row items-center p-5 w-full border-b border-[#dedede]">
        <h2 className="font-inter font-semibold text-lg leading-7 flex items-center text-[#232F34]">
          Lead Information
        </h2>
      </div>


      <div className="flex flex-col md:flex-row px-6 gap-4 md:gap-6 w-full">
        <div className="flex flex-col gap-2 w-full md:w-1/2">
          <label className="text-[15px] font-semibold text-[#232F34]">
            LEAD ID
          </label>
          <input
            type="text"
            value={leadId || 'LD-1042'}
            readOnly
            className="w-full h-[42px] rounded-md border border-gray-200 px-4 text-[15px] text-[#232F34] focus:outline-none bg-gray-50"
          />
        </div>

        <div className="flex flex-col gap-2 w-full md:w-1/2">
          <label className="text-[15px] font-semibold text-[#232F34]">
            Lead Source
          </label>
          {leadId ? (
            <input
              type="text"
              value={leadSource || 'Call Campaign'}
              readOnly
              className="w-full h-[42px] rounded-md border border-gray-200 px-4 text-[15px] text-[#232F34] focus:outline-none bg-gray-50"
            />
          ) : (
            <select
              value={leadSource}
              onChange={(e) => dispatch(setLeadSource(e.target.value))}
              className="appearance-none w-full h-[42px] rounded-md border border-gray-300 px-4 text-[15px] text-[#232F34] focus:outline-none focus:ring-2 focus:ring-[#16335A]/20"
            >
              <option value="" disabled>Select Source</option>
              {leadSourcesOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          )}
        </div>
      </div>
    </section>
  );
}
