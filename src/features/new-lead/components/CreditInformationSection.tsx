import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { selectNewLeadState, selectIsLeadFinalized, addCreditInfoThunk, fetchCreditInfoThunk } from '../store/newLeadSlice';
import { CreditInformationModal } from './modals/CreditInformationModal';
import { CreditCard } from 'lucide-react';

export function CreditInformationSection() {
  const dispatch = useAppDispatch();
  const { creditInfo } = useAppSelector(selectNewLeadState);
  const isFinalized = useAppSelector(selectIsLeadFinalized);
  const params = useParams();
  const leadId = params?.id as string;
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (leadId) {
      dispatch(fetchCreditInfoThunk(leadId));
    }
  }, [dispatch, leadId]);

  const handleSubmit = async (data: { loanType: string; loanAmount: string; purposeMessage: string }) => {
    if (!leadId) return;
    await dispatch(addCreditInfoThunk({
      leadId,
      loan_type: data.loanType,
      loan_amount: parseFloat(data.loanAmount.replace(/,/g, '')),
      purpose_message: data.purposeMessage
    }));
    setIsModalOpen(false);
  };

  return (
    <section className="flex flex-col items-center pb-6 gap-6 w-full bg-white border border-[#F1F3F4] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05),0px_2px_4px_-1px_rgba(0,0,0,0.03)] hover:-translate-y-1 hover:shadow-lg transition-all duration-300 rounded-xl">
      <div className="flex flex-row justify-between items-center p-5 pt-4 pb-4 w-full border-b border-[#F1F3F4] font-semibold">
        <h2 className="font-inter font-semibold text-lg leading-7 flex items-center gap-2 text-[#232F34]">
          <CreditCard size={20} className="text-[#6B7280]" />
          Credit Information
        </h2>
        {!isFinalized && (
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex flex-row justify-center items-center px-4 py-5 gap-2 h-8 bg-white border border-[#16A34A] rounded-lg text-[#16A34A] font-roboto font-bold text-base leading-6 hover:bg-[#F0FDFA] transition-colors"
          >
            + Add
          </button>
        )}
      </div>

      <div className="flex flex-col items-start px-4 sm:px-6 w-full overflow-hidden">
        <div className="w-full overflow-x-auto">
          <div className="min-w-[500px] w-full">
            <div className="w-full bg-[#EEF4FB]/50 border-b border-[#D4D4D4] flex flex-row">
              <div className="p-3 px-4 w-[140px] sm:w-[177px]">
                <span className="font-inter font-semibold text-sm leading-4 tracking-wide text-[#4F4F58]">Loan Type</span>
              </div>
              <div className="p-3 px-4 w-[140px] sm:w-[177px]">
                <span className="font-roboto font-semibold text-sm leading-4 tracking-wide text-[#4F4F58]">Loan Amount</span>
              </div>
              <div className="p-3 px-4 flex-1">
                <span className="font-roboto font-semibold text-sm leading-4 tracking-wide text-[#4F4F58]">Purpose Message</span>
              </div>
            </div>

            <div className="flex flex-col w-full">
              {creditInfo.map((info) => (
                <div key={info.id} className="flex flex-row w-full border-b border-[#D4D4D4]/50 hover:bg-slate-50 transition-colors">
                  <div className="p-2 px-4 w-[140px] sm:w-[177px] flex flex-col justify-center">
                    <div className="inline-flex items-center px-2.5 py-1 gap-1.5 bg-[#F0FDFA] border border-[#CCFBF1] rounded-md w-fit">
                      <span className="font-inter font-sm text-xs leading-4 text-[#1E6865]">
                        {info.type}
                      </span>
                    </div>
                  </div>
                  <div className="p-2 px-4 w-[140px] sm:w-[177px] flex flex-col justify-center">
                    <span className="font-inter font-sm text-sm leading-5 text-[#232F34]">
                      {info.amount}
                    </span>
                  </div>
                  <div className="p-2 px-4 flex-1 flex flex-col justify-center">
                    <span className="font-roboto font-light text-sm leading-5 text-[#232F34]">
                      {info.purpose}
                    </span>
                  </div>
                </div>
              ))}
              {creditInfo.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 w-full animate-in fade-in zoom-in duration-500">
                  <div className="bg-[#F0FDFA] rounded-full p-4 mb-3 border border-[#CCFBF1] shadow-sm">
                    <CreditCard size={32} className="text-[#16A34A] animate-pulse" />
                  </div>
                  <h3 className="text-[#232F34] font-semibold text-[15px]">No credit information added yet</h3>
                  <p className="text-[#6B7280] text-[13px] mt-1">Click the + Add button to record new credit details.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <CreditInformationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </section>
  );
}
