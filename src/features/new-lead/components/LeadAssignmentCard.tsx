import { useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { selectNewLeadState, assignLeadThunk } from '../store/newLeadSlice';
import AssignOwnerModal from './modals/AssignOwnerModal';
import { useParams } from 'next/navigation';

export function LeadAssignmentCard() {
  const { assignment } = useAppSelector(selectNewLeadState);
  const dispatch = useAppDispatch();
  const params = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAssign = async (user: any) => {
    const activeLeadId = params?.id as string;
    if (!activeLeadId) {
      alert("Error: Missing Lead ID");
      return;
    }
    await dispatch(assignLeadThunk({
      leadId: activeLeadId,
      assigneeName: user.name,
      assigneeId: user.id,
      email: user.email,
      region: user.region
    }));
    setIsModalOpen(false);
  };
  const hasAssignment = !!assignment?.assigneeName;

  return (
    <div className="flex flex-col items-start p-[13px] px-6 pb-6 gap-4 w-full bg-white border border-[#D4D4D4] rounded-lg">
      <div className="flex flex-col items-start pb-4 w-full border-b border-[#D4D4D4]/30">
        <h3 className="font-roboto font-bold text-lg leading-7 text-[#16335A]">
          Lead Assignment
        </h3>
      </div>

      <div className="flex flex-row items-center pb-4 w-full">
        <h4 className="font-roboto font-bold text-lg leading-7 text-[#16335A]">
          {assignment?.assigneeName || 'Unassigned'}
        </h4>
      </div>

      {hasAssignment && (
        <div className="flex flex-col items-start gap-3 w-full">
          {assignment.agentId && (
            <div className="flex flex-row justify-between items-center w-full">
              <span className="font-roboto font-normal text-sm leading-5 text-[#4B5563]">
                Agent ID
              </span>
              <span className="font-roboto font-bold text-sm leading-5 text-[#16335A]">
                {assignment.agentId}
              </span>
            </div>
          )}
          {assignment.region && (
            <div className="flex flex-row justify-between items-center w-full">
              <span className="font-roboto font-normal text-sm leading-5 text-[#4B5563]">
                Region
              </span>
              <span className="font-roboto font-bold text-sm leading-5 text-[#16335A]">
                {assignment.region}
              </span>
            </div>
          )}
          {assignment.date && (
            <div className="flex flex-row justify-between items-center w-full">
              <span className="font-roboto font-normal text-sm leading-5 text-[#4B5563]">
                Assigned Date
              </span>
              <span className="font-roboto font-bold text-sm leading-5 text-[#16335A]">
                {assignment.date}
              </span>
            </div>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="flex flex-row justify-center items-center px-4 py-3 gap-2 w-full bg-[#16A34A] rounded-lg text-white font-roboto font-bold text-base hover:bg-[#15803d] transition-colors mt-2"
      >
        {hasAssignment ? 'Change Assignee' : 'Assign Owner'}
      </button>

      {isModalOpen && (
        <AssignOwnerModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          currentOwnerName={assignment?.assigneeName || ''}
          onAssign={handleAssign}
        />
      )}
    </div>
  );
}
