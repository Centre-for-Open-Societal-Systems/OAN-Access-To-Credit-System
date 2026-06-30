"use client";

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ThumbsUp, Ban, AlertTriangle, Circle, CircleDot, Lock } from 'lucide-react';

export type LeadStatusOutcome = 'Verified' | 'Rejected' | null;

interface LeadStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (outcome: LeadStatusOutcome, notes: string) => void;
  variant: 'update' | 'finalize';
  currentStatus: string;
  leadId: string;
  initialOutcome?: LeadStatusOutcome;
}

export default function LeadStatusModal({
  isOpen,
  onClose,
  onConfirm,
  variant,
  currentStatus,
  leadId,
  initialOutcome = null,
}: LeadStatusModalProps) {
  const [outcome, setOutcome] = useState<LeadStatusOutcome>(initialOutcome);
  const [notes, setNotes] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setOutcome(initialOutcome);
      setNotes('');
    }
  }, [isOpen, initialOutcome]);

  if (!isOpen || !mounted) return null;

  const isFinalize = variant === 'finalize';

  const handleConfirm = () => {
    if (outcome) {
      onConfirm(outcome, notes);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0F172A]/40 backdrop-blur-sm p-4">
      {/* Modal Container */}
      <div
        className="relative flex flex-col bg-white border border-[#EDEFF1] shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.1),_0px_10px_10px_-5px_rgba(0,0,0,0.04)] rounded-xl w-full max-w-[600px] overflow-hidden"
        style={{ maxHeight: '90vh' }}
      >
        {/* Modal Header */}
        <div className="flex flex-row justify-between items-center px-6 py-5 border-b border-[#F1F3F4] h-[93px]">
          <div className="flex flex-col gap-1">
            <h2 className="font-inter font-bold text-2xl leading-8 text-[#232F34] m-0">
              {isFinalize ? 'Finalize Lead Processing' : 'Update Lead Status'}
            </h2>
            <p className="font-inter font-normal text-base leading-6 text-[#414141] m-0">
              Lead ID: {leadId} {isFinalize && `(Current: ${currentStatus.toUpperCase()})`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-[#F1F3F4] hover:bg-[#E2E8F0] transition-colors"
          >
            <X size={20} className="text-[#64748B]" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex flex-col px-6 py-6 gap-8 overflow-y-auto">

          {/* Status Selection */}
          <div className="flex flex-col gap-3">
            <div>
              <h3 className="font-inter font-semibold text-base leading-6 text-[#232F34] mb-1">
                {isFinalize ? 'Select Final Outcome *' : 'Select Outcome *'}
              </h3>
              <p className="font-inter font-normal text-sm leading-5 text-[#414141]">
                {isFinalize
                  ? 'This action is final and will lock the lead from further status updates.'
                  : 'Choose the appropriate status based on your interaction with this lead.'}
              </p>
            </div>

            <div className="flex flex-row gap-4">
              {/* VERIFIED OPTION */}
              <button
                type="button"
                onClick={() => setOutcome('Verified')}
                className={`flex flex-col flex-1 p-4 rounded-xl border-2 text-left transition-all ${outcome === 'Verified'
                  ? 'bg-[rgba(237,250,242,0.42)] border-[#16A34A]'
                  : 'bg-white border-[#EDEFF1] hover:border-[#D1DACE]'
                  }`}
              >
                <div className="flex flex-row justify-between items-start w-full mb-3">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full ${outcome === 'Verified' ? 'bg-[#F0FDFA]' : 'bg-[#F1F3F4]'
                    }`}>
                    <ThumbsUp size={24} className={outcome === 'Verified' ? 'text-[#0D9488]' : 'text-[#9CA3AF]'} />
                  </div>
                  {outcome === 'Verified' ? (
                    <CircleDot size={24} className="text-[#14B8A6]" />
                  ) : (
                    <Circle size={24} className="text-[#E5E7EB]" />
                  )}
                </div>
                <h4 className="font-inter font-bold text-lg leading-7 text-[#232F34] mb-1">Verified</h4>
                <p className="font-inter font-normal text-sm leading-5 text-[#414141]">
                  Lead meets criteria and is verified.
                </p>
              </button>

              {/* REJECTED OPTION */}
              <button
                type="button"
                onClick={() => setOutcome('Rejected')}
                className={`flex flex-col flex-1 p-4 rounded-xl border-2 text-left transition-all ${outcome === 'Rejected'
                  ? 'bg-[#FFE5E5] border-[#EF4444]'
                  : 'bg-white border-[#EDEFF1] hover:border-[#D1DACE]'
                  }`}
              >
                <div className="flex flex-row justify-between items-start w-full mb-3">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full ${outcome === 'Rejected' ? 'bg-[#FF7676]' : 'bg-[#F1F3F4]'
                    }`}>
                    <Ban size={24} className={outcome === 'Rejected' ? 'text-white' : 'text-[#9CA3AF]'} />
                  </div>
                  {outcome === 'Rejected' ? (
                    <CircleDot size={24} className="text-[#EF4444]" />
                  ) : (
                    <Circle size={24} className="text-[#E5E7EB]" />
                  )}
                </div>
                <h4 className="font-inter font-bold text-lg leading-7 text-[#232F34] mb-1">Rejected</h4>
                <p className="font-inter font-normal text-sm leading-5 text-[#414141]">
                  {isFinalize
                    ? 'Lead could not be processed or was rejected after processing.'
                    : 'Lead does not meet requirements or is uninterested.'}
                </p>
              </button>
            </div>
          </div>

          {/* Internal Notes */}
          <div className="flex flex-col gap-2">
            <label htmlFor="modal-notes" className="font-inter font-semibold text-base leading-6 text-[#232F34]">
              {isFinalize ? 'Finalization Notes' : 'Reason / Internal Notes'}
            </label>
            <div className="flex flex-col border border-[#E5E7EB] rounded-lg bg-white overflow-hidden focus-within:border-[#16A34A] focus-within:ring-1 focus-within:ring-[#16A34A] transition-all">
              <textarea
                id="modal-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value.substring(0, 500))}
                placeholder={isFinalize ? 'Provide details on why this lead was processed or rejected...' : 'Provide additional context about this decision (optional)...'}
                className="w-full h-[104px] p-4 text-base leading-6 text-[#414141] placeholder:text-[#bababa] resize-none outline-none"
              />
            </div>
            <div className="flex flex-row justify-between items-center w-full mt-1">
              <span className="font-inter font-normal text-sm leading-4 text-[#9CA3AF]">
                {isFinalize ? 'This note will be added to the lead\'s final audit log.' : 'This note will be added to the lead\'s audit history.'}
              </span>
              <span className="font-inter font-normal text-xs leading-4 text-[#D1DACE]">
                {notes.length}/500
              </span>
            </div>
          </div>

          {/* Warning Alert (Only for Finalize) */}
          {isFinalize && (
            <div className="flex flex-row items-start p-4 bg-[#F6F8FA] border-l-4 border-[#F59E0B] rounded-r-lg gap-3">
              <AlertTriangle size={20} className="text-[#F59E0B] shrink-0 mt-[2px]" />
              <div className="flex flex-col gap-1">
                <h5 className="font-inter font-semibold text-base leading-6 text-[#232F34] m-0">Confirm Action</h5>
                <p className="font-inter font-normal text-sm leading-5 text-[#9CA3AF] m-0">
                  Once marked as Verified or Rejected, this lead's status cannot be changed again. All further actions will be locked.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex flex-row justify-end items-center px-6 py-5 bg-[#F6F8FA] border-t border-[#F1F3F4] gap-4 font-semibold">
          <button
            onClick={onClose}
            className="px-6 py-[12px] bg-white border border-[#E5E7EB] rounded-lg font-inter font-semibold text-base leading-6 text-[#3A474E] hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!outcome}
            className={`flex flex-row items-center justify-center gap-2 px-6 py-[12px] rounded-lg font-inter font-semibold text-base leading-6 text-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)] transition-colors ${outcome ? 'bg-[#16A34A] hover:bg-[#15803D] cursor-pointer' : 'bg-[#D1DACE] cursor-not-allowed'
              }`}
          >
            {isFinalize && <Lock size={16} className="text-white font-semibold" />}
            {isFinalize ? 'Confirm Final Status' : 'Confirm Update'}
          </button>
        </div>

      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
