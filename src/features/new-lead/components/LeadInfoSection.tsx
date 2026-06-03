import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectNewLeadState, setLeadSource } from '../store/newLeadSlice';
import { TextField } from '@/components/ui/TextField';

export function LeadInfoSection() {
  const dispatch = useAppDispatch();
  const { leadId, leadSource } = useAppSelector(selectNewLeadState);

  return (
    <section className="flex flex-col items-center px-6 pb-6 gap-6 w-full bg-white border border-[#F1F3F4] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05),0px_2px_4px_-1px_rgba(0,0,0,0.03)] rounded-xl">
      <div className="flex flex-row items-center p-5 w-full border-b border-[#F1F3F4]">
        <h2 className="font-inter font-semibold text-lg leading-7 flex items-center text-[#232F34]">
          Lead Information
        </h2>
      </div>

      <div className="flex flex-row flex-wrap items-start content-start p-0 gap-6 w-full">
        <div className="w-[345.5px]">
          <TextField
            label="LEAD ID"
            value={leadId || 'LD-XXXX'}
            readOnly
          />
        </div>
        <div className="w-[345.5px]">
          <TextField
            label="Lead Source"
            value={leadSource}
            onChange={(val) => dispatch(setLeadSource(val))}
            placeholder="Call Campaign"
          />
        </div>
      </div>
    </section>
  );
}
