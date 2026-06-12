import { useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { selectNewLeadState, selectIsLeadFinalized, assignLeadThunk } from '../store/newLeadSlice';
import AssignOwnerModal from './modals/AssignOwnerModal';
import { Edit } from 'lucide-react';
import { useParams } from 'next/navigation';
export function LeadAssignmentCard() {
  const { assignment } = useAppSelector(selectNewLeadState);
  const isFinalized = useAppSelector(selectIsLeadFinalized);
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
    <section className="flex flex-col items-start pb-6 w-full bg-white border border-[#F1F3F4] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05),0px_2px_4px_-1px_rgba(0,0,0,0.03)] hover:-translate-y-1 hover:shadow-lg transition-all duration-300 rounded-xl">
      <div className="flex flex-row items-center p-5 px-6 w-full border-b border-[#F1F3F4]">
        <h2 className="font-inter font-semibold text-lg leading-7 flex items-center gap-2 text-[#232F34]">
          <Edit size={18} className="text-[#16335A]" />
          Lead Assignment
        </h2>
      </div>

      <div className="flex flex-col items-start px-6 pt-6 gap-6 w-full">
        <div className="flex flex-row items-center pb-1 w-full border-b border-[#F1F3F4]">
          <h4 className="font-roboto font-bold text-[16px] leading-8 text-[#16335A]">
            {assignment?.assigneeName || 'Unassigned'}
          </h4>
        </div>

        {hasAssignment && (
          <div className="flex flex-col items-start gap-4 w-full">
            {assignment.agentId && (
              <div className="flex flex-row justify-between items-center w-full">
                <span className="font-roboto font-normal text-base leading-6 text-[#4B5563]">
                  Agent ID
                </span>
                <span className="font-roboto font-bold text-base leading-6 text-[#16335A]">
                  {assignment.agentId}
                </span>
              </div>
            )}
            {assignment.region && (
              <div className="flex flex-row justify-between items-center w-full">
                <span className="font-roboto font-normal text-base leading-6 text-[#4B5563]">
                  Region
                </span>
                <span className="font-roboto font-bold text-base leading-6 text-[#16335A]">
                  {assignment.region}
                </span>
              </div>
            )}
            {assignment.date && (
              <div className="flex flex-row justify-between items-center w-full">
                <span className="font-roboto font-normal text-base leading-6 text-[#4B5563]">
                  Assigned Date
                </span>
                <span className="font-roboto font-bold text-base leading-6 text-[#16335A]">
                  {new Date(assignment.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            )}
          </div>
        )}

        <button
          type="button"
          disabled={isFinalized}
          onClick={() => setIsModalOpen(true)}
          className={`flex flex-row justify-center items-center px-4 py-3 gap-2 w-full rounded-lg font-roboto font-bold text-base transition-colors mt-2 ${isFinalized
            ? 'bg-[#E5E7EB] border border-[#D1D5DB] text-[#9CA3AF] cursor-not-allowed'
            : 'bg-[#16A34A] text-white hover:bg-[#15803d]'
            }`}
        >
          {hasAssignment ? 'Change Assignee' : 'Assign Owner'}
        </button>
      </div>

      {isModalOpen && (
        <AssignOwnerModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          currentOwnerName={assignment?.assigneeName || ''}
          onAssign={handleAssign}
        />
      )}

    </section>
  );
}
