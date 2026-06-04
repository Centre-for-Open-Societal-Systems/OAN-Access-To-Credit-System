import { useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { selectNewLeadState, addCreditInfo } from '../store/newLeadSlice';
import { CreditInformationModal } from './modals/CreditInformationModal';

export function CreditInformationSection() {
  const dispatch = useAppDispatch();
  const { creditInfo } = useAppSelector(selectNewLeadState);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubmit = (data: { loanType: string; loanAmount: string; purposeMessage: string }) => {
    dispatch(addCreditInfo({
      type: data.loanType,
      amount: data.loanAmount,
      purpose: data.purposeMessage
    }));
    setIsModalOpen(false);
  };

  return (
    <section className="flex flex-col items-center pb-6 gap-6 w-full bg-white border border-[#F1F3F4] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05),0px_2px_4px_-1px_rgba(0,0,0,0.03)] rounded-xl">
      <div className="flex flex-row justify-between items-center p-5 px-6 w-full border-b border-[#F1F3F4]">
        <h2 className="font-inter font-semibold text-lg leading-7 flex items-center text-[#232F34]">
          Credit Information
        </h2>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex flex-row justify-center items-center px-4 py-1 gap-2 h-8 bg-white border border-[#16A34A] rounded-lg text-[#16A34A] font-roboto font-bold text-base leading-6 hover:bg-[#F0FDFA] transition-colors"
        >
          + Add
        </button>
      </div>

      <div className="flex flex-col items-start px-4 sm:px-6 w-full overflow-hidden">
        <div className="w-full overflow-x-auto">
          <div className="min-w-[500px] w-full">
            <div className="w-full bg-[#EEF4FB]/50 border-b border-[#D4D4D4] flex flex-row">
              <div className="p-3 px-4 w-[140px] sm:w-[177px]">
                <span className="font-inter font-medium text-xs leading-4 tracking-wide text-[#4F4F58]">Loan Type</span>
              </div>
              <div className="p-3 px-4 w-[140px] sm:w-[177px]">
                <span className="font-roboto font-medium text-xs leading-4 tracking-wide text-[#4F4F58]">Loan Amount</span>
              </div>
              <div className="p-3 px-4 flex-1">
                <span className="font-roboto font-medium text-xs leading-4 tracking-wide text-[#4F4F58]">Purpose Message</span>
              </div>
            </div>

            <div className="flex flex-col w-full">
              {creditInfo.map((info) => (
                <div key={info.id} className="flex flex-row w-full border-b border-[#D4D4D4]/50 hover:bg-slate-50 transition-colors">
                  <div className="p-2 px-4 w-[140px] sm:w-[177px] flex flex-col justify-center">
                    <div className="inline-flex items-center px-2.5 py-1 gap-1.5 bg-[#F0FDFA] border border-[#CCFBF1] rounded-md w-fit">
                      <span className="font-inter font-medium text-xs leading-4 text-[#1E6865]">
                        {info.type}
                      </span>
                    </div>
                  </div>
                  <div className="p-2 px-4 w-[140px] sm:w-[177px] flex flex-col justify-center">
                    <span className="font-inter font-normal text-sm leading-5 text-[#232F34]">
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
                <div className="p-4 text-center text-sm text-gray-500 w-full">
                  No credit information added yet.
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
