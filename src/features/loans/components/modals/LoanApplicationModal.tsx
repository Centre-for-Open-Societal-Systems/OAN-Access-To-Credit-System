'use client';

import { Portal } from '@/components/Portal';
import { toast } from '@/lib/toast';
import { useModalA11y } from '@/hooks/useModalA11y';
import type { LoanStage } from '@/lib/api/api.schemas';
import { ChevronDown, Loader2, Package, RefreshCw, X } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { LoanApplicationFull } from '../../api/loan.service';
import { LoanTableRow } from '../LoanTable';
import { PINNED_OR_META_KEYS, useLoanApplicationModal } from './useLoanApplicationModal';

interface LoanApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: LoanTableRow | null;
  /**
   * The owning bank's pipeline, from `get_stages`. The picker offers exactly
   * these — a bank names its own stages, so there is no fixed set of outcomes
   * to fall back on, and an empty list means the picker is not offered at all.
   */
  stages?: readonly LoanStage[];
  /** `status` is a stage ID the backend resolves against the bank's pipeline. */
  onStatusChange?: (id: string, status: string, reason?: string) => void;
}

/** Stages an application can no longer be moved out of; the API 400s on these. */
const TERMINAL_ARCHETYPES = new Set(['Completed', 'Rejected', 'Cancelled']);

/** Matches the endpoint's own cap on the audit remark. */
const REASON_MAX_LENGTH = 2000;

/** Tone for a stage, taken from its archetype rather than its label — labels are
 *  tenant free text and cannot be matched against a fixed vocabulary. */
function toneForArchetype(archetype: string): { border: string; ring: string; button: string } {
  if (archetype === 'Rejected' || archetype === 'Cancelled') {
    return {
      border: 'border-red-200 bg-red-50/30',
      ring: 'focus:ring-red-500/20 focus:border-red-500',
      button: 'bg-[#DC2626] hover:bg-[#B91C1C]',
    };
  }
  if (archetype === 'Completed') {
    return {
      border: 'border-emerald-200 bg-emerald-50/30',
      ring: 'focus:ring-emerald-500/20 focus:border-emerald-500',
      button: 'bg-[#16A34A] hover:bg-[#15803d]',
    };
  }
  return {
    border: 'border-blue-200 bg-blue-50/30',
    ring: 'focus:ring-blue-500/20 focus:border-blue-500',
    button: 'bg-[#2563EB] hover:bg-[#1D4ED8]',
  };
}

export default function LoanApplicationModal({ isOpen, onClose, data, stages = [], onStatusChange }: LoanApplicationModalProps) {
  const { isLoading, fullProfile: rawProfile } = useLoanApplicationModal(isOpen, data);
  const fullProfile = rawProfile as LoanApplicationFull | null;

  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [selectedStageId, setSelectedStageId] = useState('');
  const [reason, setReason] = useState('');

  const endRef = useRef<HTMLDivElement>(null);
  const stageSelectRef = useRef<HTMLSelectElement>(null);
  const stageFieldId = useId();
  const reasonFieldId = useId();
  const dialogRef = useModalA11y<HTMLDivElement>(isOpen, onClose);

  useEffect(() => {
    // This modal stays mounted while closed (isOpen just gates the render via
    // the early return below), so its form state must be reset here on
    // reopen rather than relying on unmount/remount to clear stale values.
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsChangingStatus(false);
      setSelectedStageId('');
      setReason('');
    }
  }, [isOpen]);

  if (!isOpen || !data) return null;

  // The stage the application is on now, matched against the bank's pipeline so
  // its archetype can be read. Falls back to no match when a label was renamed
  // between the two requests, which leaves the picker open rather than locked.
  const currentStage = stages.find(
    (stage) =>
      stage.label.toLowerCase() === (data.status || '').toLowerCase() ||
      stage.stage_id.toLowerCase() === (data.status || '').toLowerCase()
  );
  const isTerminal = currentStage ? TERMINAL_ARCHETYPES.has(currentStage.archetype_state) : false;
  // Moving a stage to itself is not a transition; offering it invites a call
  // that changes nothing but still writes an audit entry.
  const availableStages = stages.filter((stage) => stage.stage_id !== currentStage?.stage_id);
  const canChangeStatus = Boolean(onStatusChange) && !isTerminal && availableStages.length > 0;

  // Keyed on the archetype, not on the label: 'Approved' and 'Rejected' were the
  // only two labels this recognised, so every stage of a bank that names its
  // pipeline anything else rendered in the same amber "pending" badge.
  const statusBadgeColor =
    currentStage?.archetype_state === 'Completed'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : currentStage?.archetype_state === 'Rejected' || currentStage?.archetype_state === 'Cancelled'
        ? 'bg-red-50 text-red-700 border-red-200'
        : 'bg-amber-50 text-amber-700 border-amber-200';

  const selectedStage = stages.find((stage) => stage.stage_id === selectedStageId);
  const tone = toneForArchetype(selectedStage?.archetype_state ?? 'In Transition');

  const handleConfirmStatusChange = () => {
    if (!selectedStage) {
      toast.error('Select a status to move this application to');
      return;
    }
    if (onStatusChange) {
      // The stage ID, not the label: the endpoint accepts either, and an ID
      // survives a bank renaming its own stage between load and submit.
      onStatusChange(data.id, selectedStage.stage_id, reason.trim() || undefined);
    }
    toast.success(`Application #${data.id} moved to ${selectedStage.label}`);
    setIsChangingStatus(false);
    onClose();
  };

  const handleOpenStatusChange = () => {
    setIsChangingStatus(true);
    setTimeout(() => {
      endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      stageSelectRef.current?.focus();
    }, 100);
  };

  // Extract dynamic values safely from data & fullProfile
  const farmerName = data.applicant || (fullProfile?.first_name || fullProfile?.last_name ? `${fullProfile.first_name || ''} ${fullProfile.last_name || ''}`.trim() : '—');
  const phone = data.phone || fullProfile?.phone_number || '—';
  const loanProduct = fullProfile?.loan_product_name || '—';
  const amount = data.amount || (data.loanAmount && data.loanAmount !== '—' ? `ETB ${data.loanAmount}` : null) || (fullProfile?.loan_amount ? `ETB ${fullProfile.loan_amount.toLocaleString()}` : ('—'));
  const appliedDate = data.updated || data.creation || '—';
  const purpose = fullProfile?.loan_reason || null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="loan-application-modal-title"
        tabIndex={-1}
        className="relative flex flex-col w-full max-w-[620px] bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 sm:px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
              <Package className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 id="loan-application-modal-title" className="text-lg font-bold text-gray-900 truncate">Application Details</h2>
              </div>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500 mt-1">
                <span className="font-semibold text-gray-700 whitespace-nowrap">#{data.id}</span>
                <span className="hidden sm:inline text-gray-400">&bull;</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-semibold border whitespace-nowrap ${statusBadgeColor}`}>
                  <span className="mr-1 sm:hidden">&bull;</span>
                  {data.status || 'Pending'}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="px-6 py-6 overflow-y-auto max-h-[70vh] space-y-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-3">
              <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
              <p className="text-xs font-medium text-gray-500">Loading application details...</p>
            </div>
          ) : (
            <>
              {/* Section 1: LOAN DETAILS */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">LOAN DETAILS</h3>
                <div className="bg-[#F9FAFB] rounded-2xl p-5 border border-gray-100 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">APPLICATION ID</p>
                      <p className="text-sm font-bold text-gray-900 mt-0.5">#{data.id}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">LOAN PRODUCT</p>
                      <p className="text-sm font-bold text-gray-900 mt-0.5">{loanProduct}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">REQUESTED AMOUNT</p>
                      <p className="text-sm font-bold text-gray-900 mt-0.5">{amount}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">SUBMISSION DATE</p>
                      <p className="text-sm font-bold text-gray-900 mt-0.5">{appliedDate}</p>
                    </div>
                  </div>
                  {purpose && (
                    <div className="pt-2 border-t border-gray-200/60">
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">PURPOSE OF LOAN</p>
                      <p className="text-sm font-bold text-gray-900 mt-0.5">{purpose}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Section 2: FARMER DETAILS */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">FARMER DETAILS</h3>
                <div className="bg-[#F9FAFB] rounded-2xl p-5 border border-gray-100 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">FULL NAME</p>
                      <p className="text-sm font-bold text-gray-900 mt-0.5">{farmerName}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">PHONE NUMBER</p>
                      <p className="text-sm font-bold text-gray-900 mt-0.5">{phone}</p>
                    </div>

                    {fullProfile && Object.entries(fullProfile)
                      .filter(([key, value]) =>
                        !PINNED_OR_META_KEYS.has(key) && value != null && value !== '' && typeof value !== 'object'
                      )
                      .map(([key, value]) => {
                        // Some values like source_of_income might be long, so we handle them below or let them span 2 cols if needed.
                        // Here we just render them normally. If we want them to look good, we can just use normal div.
                        return (
                          <div key={key} className={String(value).length > 40 ? "col-span-2 pt-2 border-t border-gray-200/60" : ""}>
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                              {key.replace(/_/g, ' ')}
                            </p>
                            <p className="text-sm font-bold text-gray-900 mt-0.5">
                              {String(value)}
                            </p>
                          </div>
                        );
                      })
                    }
                  </div>
                </div>
              </div>

              {/* Section 3: INTERNAL NOTES (Conditional) */}
              {fullProfile?.internal_notes && fullProfile.internal_notes.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">INTERNAL NOTES</h3>
                  <div className="space-y-2">
                    {fullProfile.internal_notes.map((note, idx: number) => (
                      <div key={idx} className="bg-[#F9FAFB] rounded-2xl p-4 border border-gray-100 flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                          {note.author?.[0]?.toUpperCase() || 'N'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-bold text-gray-900">{note.author || 'Officer'}</p>
                            <span className="text-xs text-gray-400">{note.timestamp || ''}</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{note.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Status Change Form */}
              {isChangingStatus && (
                <div className={`border-2 rounded-2xl p-5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200 ${tone.border}`}>
                  <h4 className="text-sm font-bold text-gray-900">Update Status</h4>

                  <div>
                    <label htmlFor={stageFieldId} className="block text-xs font-bold text-gray-700 mb-1.5">
                      Move to stage
                    </label>
                    <div className="relative">
                      <select
                        id={stageFieldId}
                        ref={stageSelectRef}
                        value={selectedStageId}
                        onChange={(e) => setSelectedStageId(e.target.value)}
                        className={`w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 appearance-none ${tone.ring}`}
                      >
                        <option value="">Select a stage...</option>
                        {availableStages.map((stage) => (
                          <option key={stage.stage_id} value={stage.stage_id}>
                            {stage.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                    {selectedStage?.description && (
                      <p className="mt-1.5 text-xs text-gray-500">{selectedStage.description}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor={reasonFieldId} className="block text-xs font-bold text-gray-700 mb-1.5">
                      Reason (Optional)
                    </label>
                    <textarea
                      id={reasonFieldId}
                      rows={3}
                      value={reason}
                      maxLength={REASON_MAX_LENGTH}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Recorded on the application's audit timeline."
                      className={`w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 ${tone.ring}`}
                    />
                    <p className="mt-1 text-right text-xs text-gray-400">
                      {reason.length} / {REASON_MAX_LENGTH}
                    </p>
                  </div>

                  <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsChangingStatus(false);
                        setSelectedStageId('');
                        setReason('');
                      }}
                      className="w-full sm:w-auto px-5 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl text-sm transition-colors flex justify-center"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmStatusChange}
                      disabled={!selectedStage}
                      className={`w-full sm:w-auto px-5 py-2 text-white font-bold rounded-xl text-sm transition-colors shadow-sm disabled:cursor-not-allowed disabled:opacity-50 flex justify-center ${tone.button}`}
                    >
                      Update Status
                    </button>
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-4 sm:px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center sm:justify-between gap-4 bg-white">
          <div className="w-full sm:w-auto text-center sm:text-left">
            {/* Terminal applications accept no further transitions — the endpoint
                rejects them outright, so say why the control is absent rather than
                offering a button that can only fail. */}
            {!isChangingStatus && isTerminal && (
              <p className="text-sm font-medium text-gray-500">
                This application is {currentStage?.label ?? data.status} and can no longer be moved.
              </p>
            )}
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-lg text-sm transition-colors flex justify-center"
            >
              <span className='font-semibold'>Close</span>
            </button>

            {!isChangingStatus && canChangeStatus && (
              <button
                type="button"
                onClick={handleOpenStatusChange}
                className="w-full sm:w-auto px-6 py-2.5 bg-[#16A34A] hover:bg-[#15803d] text-white font-bold rounded-lg text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="font-semibold">Update Status</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );

  return <Portal>{modalContent}</Portal>;
}
