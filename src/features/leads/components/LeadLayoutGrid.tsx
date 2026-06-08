"use client";

import { ReactNode, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import { ArrowLeft } from 'lucide-react';
import { useAppDispatch } from '@/store/hooks';
import { clearForm, submitNewLeadThunk } from '@/features/new-lead/store/newLeadSlice';

interface LeadLayoutGridProps {
    children: ReactNode;
    sidebar?: ReactNode;
    titleBanner: ReactNode;
}

export function LeadLayoutGrid({ children, sidebar, titleBanner }: LeadLayoutGridProps) {
    const router = useRouter();
    const dispatch = useAppDispatch();

    const [showErrorPopup, setShowErrorPopup] = useState(false);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleClear = () => {
        dispatch(clearForm());
    };

    const handleSubmit = async () => {
        // Validation logic can be passed in or handled via Form context, 
        // but for now we keep the simple redux dispatch intact.
        setIsSubmitting(true);
        try {
            await dispatch(submitNewLeadThunk()).unwrap();
            setShowSuccessPopup(true);
        } catch (error) {
            console.error("Failed to create lead:", error);
            // Wait, previous code showed success popup even on error?
            // Yes, the original code had: catch(e) { setShowSuccessPopup(true); } 
            // We'll preserve that behavior or fix it? Let's fix it properly.
            setShowErrorPopup(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="flex flex-col items-start flex-1 w-full">
            <div className="flex flex-col items-start gap-6 w-full">
                {/* Breadcrumb Nav */}
                <div className="flex flex-col items-start gap-4 w-full">
                    <button
                        onClick={() => router.back()}
                        className="flex flex-row justify-center items-center gap-2 h-6 text-[#374151] hover:text-[#111827] transition-colors"
                    >
                        <ArrowLeft size={16} />
                        <span className=" text-base leading-6">Back</span>
                    </button>
                </div>

                {/* Title Banner (Injected) */}
                {titleBanner}

                {/* Main 2-Column Grid */}
                <div className="flex flex-col-reverse lg:flex-row items-start gap-6 w-full">

                    {/* Left Column (Forms) */}
                    <div className="flex flex-col items-start gap-6 flex-1 w-full min-w-0">
                        {children}

                        {/* Form Actions Bottom */}
                        <div className="flex flex-col sm:flex-row justify-end items-center p-4 sm:p-6 w-full bg-white border border-[#D4D4D4] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05),0px_2px_4px_-1px_rgba(0,0,0,0.03)] rounded-xl gap-4 font-semibold">
                            <button
                                onClick={handleClear}
                                className="flex justify-center items-center px-5 py-2.5 w-full sm:w-auto bg-white border border-[#D1D5DC] rounded-[10px] text-[#364153] font-inter font-medium text-sm hover:bg-gray-50 transition-colors"
                            >
                                Clear Form
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="flex justify-center items-center px-5 py-2.5 w-full sm:w-auto bg-[#16A34A] rounded-[10px] text-white font-inter font-medium text-sm shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] hover:bg-[#15803d] transition-colors disabled:opacity-70"
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit Lead'}
                            </button>
                        </div>
                    </div>

                    {/* Right Column (Sidebar Cards) */}
                    {sidebar && (
                        <div className="flex flex-col items-start gap-6 w-full lg:w-[314px] shrink-0 lg:sticky lg:top-6">
                            {sidebar}
                        </div>
                    )}
                </div>

                {/* Error Popup */}
                {showErrorPopup && typeof document !== 'undefined' && createPortal(
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                        <div className="bg-white rounded-xl shadow-xl w-[400px] p-6 flex flex-col items-center text-center animate-in fade-in zoom-in duration-200">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                <span className="text-red-600 font-bold text-2xl">!</span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Error</h3>
                            <p className="text-sm text-gray-500 mb-6">Failed to submit the form. Please check your inputs.</p>
                            <button onClick={() => setShowErrorPopup(false)} className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors">
                                Close
                            </button>
                        </div>
                    </div>,
                    document.body
                )}

                {/* Success Popup */}
                {showSuccessPopup && typeof document !== 'undefined' && createPortal(
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                        <div className="bg-white rounded-xl shadow-xl w-[400px] p-6 flex flex-col items-center text-center animate-in fade-in zoom-in duration-200">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Lead Created Successfully</h3>
                            <p className="text-sm text-gray-500 mb-6">The new lead has been saved to the system.</p>
                            <button onClick={() => { setShowSuccessPopup(false); router.push('/leads'); }} className="w-full py-2.5 bg-[#16A34A] hover:bg-[#15803d] text-white font-medium rounded-lg transition-colors">
                                Go to Lead Dashboard
                            </button>
                        </div>
                    </div>,
                    document.body
                )}

            </div>
        </main>
    );
}
