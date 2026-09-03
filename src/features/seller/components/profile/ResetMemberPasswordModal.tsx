'use client';

import { Portal } from '@/components/Portal';
import { teamService } from '@/features/seller/api/team.service';
import { generateTemporaryPassword } from '@/features/seller/utils/team.utils';
import { useModalA11y } from '@/hooks/useModalA11y';
import { logger } from '@/lib/logger';
import { toast } from '@/lib/toast';
import type { TeamUser } from '@/lib/api/api.schemas';
import { RefreshCw, X } from 'lucide-react';
import { useRef, useState } from 'react';

interface ResetMemberPasswordModalProps {
  member: TeamUser;
  onClose: () => void;
  /** Called after a successful reset so the caller can refresh the team list. */
  onReset: () => void;
}

const memberLabel = (member: TeamUser) => member.first_name || member.name || member.email;

export function ResetMemberPasswordModal({ member, onClose, onReset }: ResetMemberPasswordModalProps) {
  const [password, setPassword] = useState(() => generateTemporaryPassword());
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const passwordInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useModalA11y<HTMLDivElement>(true, onClose, passwordInputRef);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldError(null);
    setIsLoading(true);
    try {
      await teamService.resetMemberPassword({ email: member.email, password });
      toast.success(
        `Temporary password issued for ${memberLabel(member)}. Share it with them — they'll set their own at next sign-in.`
      );
      onReset();
      onClose();
    } catch (error) {
      const details = (error as { responseData?: { message?: { details?: Record<string, string> } } })
        .responseData?.message?.details;
      if (details?.password) {
        setFieldError(details.password);
      }
      logger.error('resetMemberPassword failed', { email: member.email, error });
      toast.error((error instanceof Error && error.message) || 'Failed to reset the password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Portal>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
        <div
          ref={containerRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="reset-password-title"
          tabIndex={-1}
          className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        >
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
            <h3 id="reset-password-title" className="font-bold text-gray-900">
              Reset password
            </h3>
            <button onClick={onClose} aria-label="Close" className="text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <p className="text-sm text-gray-600">
              Issue a new temporary password for{' '}
              <span className="font-semibold text-gray-900">{memberLabel(member)}</span> ({member.email}).
              This signs them out of any active session immediately, and they must set their own password
              before they can sign in again.
            </p>

            <div>
              <label htmlFor="reset-temp-password" className="block text-sm font-medium text-gray-900 mb-1.5">
                Temporary Password
              </label>
              <div className="flex gap-2">
                <input
                  id="reset-temp-password"
                  ref={passwordInputRef}
                  type="text"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={fieldError ? true : undefined}
                  aria-describedby={fieldError ? 'reset-temp-password-error' : undefined}
                  className={`flex-1 px-3 py-2 bg-white border ${fieldError ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green`}
                />
                <button
                  type="button"
                  onClick={() => setPassword(generateTemporaryPassword())}
                  title="Generate a new password"
                  className="px-3 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" aria-hidden="true" />
                  <span className="sr-only">Generate a new password</span>
                </button>
              </div>
              {fieldError && (
                <p id="reset-temp-password-error" className="mt-1 text-xs text-red-500">
                  {fieldError}
                </p>
              )}
            </div>

            <div className="-mx-6 px-6 pt-4 flex justify-end gap-3 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <span className='font-semibold'>Cancel</span>
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-brand-green rounded-lg hover:bg-brand-green-hover disabled:opacity-50"
              >
                <span className='font-semibold'>{isLoading ? 'Issuing…' : 'Issue password'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Portal>
  );
}
