import { useState } from 'react';
import { X, ChevronDown } from 'lucide-react';

interface CreditInformationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { loanType: string; loanAmount: string; purposeMessage: string }) => void;
}

export function CreditInformationModal({ isOpen, onClose, onSubmit }: CreditInformationModalProps) {
  const [loanType, setLoanType] = useState('Input Financing');
  const [loanAmount, setLoanAmount] = useState('');
  const [purposeMessage, setPurposeMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    onSubmit({
      loanType,
      loanAmount,
      purposeMessage,
    });
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal Container */}
        <div 
          className="relative flex flex-col items-start p-0 w-[95%] sm:w-[799px] max-w-full bg-white rounded-[10px] shadow-xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="box-border flex flex-row justify-between items-center p-6 w-full h-[77px] border-b border-[#E5E7EB]">
            <h2 className="font-inter font-semibold text-[18px] leading-[28px] tracking-[-0.439453px] text-[#0A0A0A]">
              Credit Information
            </h2>
            <button 
              onClick={onClose}
              className="flex flex-col items-start p-[4px_4px_0px] w-[28px] h-[28px] rounded-[4px] hover:bg-gray-100 transition-colors"
            >
              <X size={20} color="#0A0A0A" strokeWidth={1.66667} />
            </button>
          </div>

          {/* Body */}
          <div className="flex flex-col items-start p-[24px_24px_0px] gap-[16px] w-full">
            {/* Form Fields Container */}
            <div className="flex flex-col sm:flex-row flex-wrap items-start content-start p-0 gap-[24px] w-full">
              
              {/* Loan Type Row */}
              <div className="flex flex-col items-start p-0 gap-[6px] w-full sm:w-[358px]">
                <label className="font-roboto font-medium text-[14px] leading-[20px] text-[#111827]">
                  Loan Type <span className="text-red-500">*</span>
                </label>
                <div className="relative w-full">
                  <select
                    value={loanType}
                    onChange={(e) => setLoanType(e.target.value)}
                    className="box-border flex flex-row items-center p-[8px_16px] w-full h-[44px] bg-white border border-[#D1D5DB] rounded-[8px] appearance-none font-roboto font-normal text-[14px] leading-[16px] text-[#111827] outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
                  >
                    <option value="Input Financing">Input Financing</option>
                    <option value="Machinery / Equipment">Machinery / Equipment</option>
                    <option value="Fertilizer Loan">Fertilizer Loan</option>
                    <option value="Equipment Financing">Equipment Financing</option>
                    <option value="Seed Advance">Seed Advance</option>
                    <option value="Irrigation Pump">Irrigation Pump</option>
                    <option value="Livestock Loan">Livestock Loan</option>
                  </select>
                  <div className="absolute right-[16px] top-[14px] pointer-events-none opacity-50">
                    <ChevronDown size={16} color="#717182" strokeWidth={1.33333} />
                  </div>
                </div>
              </div>

              {/* Loan Amount Row */}
              <div className="flex flex-col items-start p-0 gap-[6px] w-full sm:w-[358px]">
                <label className="font-roboto font-medium text-[14px] leading-[20px] text-[#111827]">
                  Loan Amount <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  placeholder="Enter Loan Amount"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                  className="box-border flex flex-row items-center p-[8px_16px] w-full h-[44px] bg-white border border-[#D1D5DB] rounded-[8px] font-roboto font-normal text-[14px] leading-[16px] text-[#111827] placeholder:text-[#C6C6C6] outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
                />
              </div>

              {/* Purpose Message Row */}
              <div className="flex flex-col items-start p-0 gap-[6px] w-full">
                <label className="font-roboto font-medium text-[14px] leading-[20px] text-[#111827]">
                  Purpose Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  placeholder="Enter purpose message"
                  value={purposeMessage}
                  onChange={(e) => setPurposeMessage(e.target.value)}
                  className="box-border flex flex-row justify-center items-start p-[12px_16px] w-full h-[140px] bg-white border border-[#D1D5DB] rounded-[8px] font-roboto font-normal text-[14px] leading-[16px] text-[#111827] placeholder:text-[#C6C6C6] outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] resize-none"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="box-border flex flex-row justify-end items-center p-[24px] gap-[12px] w-full h-[87px] border-t border-[#E5E7EB] mt-[24px]">
            <button 
              onClick={onClose}
              className="box-border flex flex-col justify-center items-center p-[8px_16px] w-[76.86px] h-[40px] bg-white border border-[#D4D4D4] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded-[8px] hover:bg-gray-50 transition-colors"
            >
              <span className="font-roboto font-medium text-[14px] leading-[20px] text-center text-[#111827]">
                Cancel
              </span>
            </button>
            
            <button 
              onClick={handleSubmit}
              className="relative flex flex-row justify-center items-center p-[10px_24px] min-w-[93px] h-[40px] bg-[#16A34A] rounded-[8px] hover:bg-[#15803d] transition-colors overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/0 shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)] rounded-[8px]" />
              <span className="relative z-10 font-roboto font-semibold text-[14px] leading-[20px] text-center text-white">
                Submit
              </span>
            </button>
          </div>
          
        </div>
      </div>
    </>
  );
}
