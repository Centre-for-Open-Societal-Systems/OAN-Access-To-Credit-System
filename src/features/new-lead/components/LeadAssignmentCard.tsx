import { useAppSelector } from '@/store/hooks';
import { selectNewLeadState } from '../store/newLeadSlice';

export function LeadAssignmentCard() {
  const { assignment } = useAppSelector(selectNewLeadState);

  if (!assignment) return null;

  return (
    <div className="flex flex-col items-start p-[13px] px-6 pb-6 gap-4 w-[314px] bg-white border border-[#D4D4D4] rounded-lg">
      <div className="flex flex-col items-start pb-4 w-[264px] border-b border-[#D4D4D4]/30">
        <h3 className="font-roboto font-bold text-lg leading-7 text-[#16335A]">
          Lead Assignment
        </h3>
      </div>

      <div className="flex flex-row items-center pb-4 w-[264px]">
        <h4 className="font-roboto font-bold text-lg leading-7 text-[#16335A]">
          {assignment.assigneeName}
        </h4>
      </div>

      <div className="flex flex-col items-start gap-3 w-[264px]">
        <div className="flex flex-row justify-between items-center w-full">
          <span className="font-roboto font-normal text-sm leading-5 text-[#4B5563]">
            Agent ID
          </span>
          <span className="font-roboto font-bold text-sm leading-5 text-[#16335A]">
            {assignment.agentId}
          </span>
        </div>
        <div className="flex flex-row justify-between items-center w-full">
          <span className="font-roboto font-normal text-sm leading-5 text-[#4B5563]">
            Region
          </span>
          <span className="font-roboto font-bold text-sm leading-5 text-[#16335A]">
            {assignment.region}
          </span>
        </div>
        <div className="flex flex-row justify-between items-center w-full">
          <span className="font-roboto font-normal text-sm leading-5 text-[#4B5563]">
            Assigned Date
          </span>
          <span className="font-roboto font-bold text-sm leading-5 text-[#16335A]">
            {assignment.date}
          </span>
        </div>
      </div>

      <button
        type="button"
        className="flex flex-row justify-center items-center px-4 py-3 gap-2 w-full bg-[#16A34A] rounded-lg text-white font-roboto font-bold text-base hover:bg-[#15803d] transition-colors mt-2"
      >
        Change Assignee
      </button>
    </div>
  );
}
