import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { selectNewLeadState, fetchCallDetailsThunk } from '../store/newLeadSlice';
import { useParams } from 'next/navigation';

export function CallDetailsSection() {
  const { callDetails } = useAppSelector(selectNewLeadState);
  const dispatch = useAppDispatch();
  const params = useParams();
  const leadId = params?.id as string;

  useEffect(() => {
    if (leadId) {
      dispatch(fetchCallDetailsThunk(leadId));
    }
  }, [dispatch, leadId]);

  return (
    <section className="flex flex-col items-center pb-6 gap-6 w-full bg-white border border-[#F1F3F4] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05),0px_2px_4px_-1px_rgba(0,0,0,0.03)] rounded-xl">
      <div className="flex flex-row items-center p-5 px-6 w-full border-b border-[#F1F3F4]">
        <h2 className="font-inter font-semibold text-lg leading-7 flex items-center text-[#232F34]">
          Call Details
        </h2>
      </div>

      <div className="flex flex-col items-start px-4 sm:px-6 w-full overflow-hidden">
        <div className="w-full overflow-x-auto">
          <div className="min-w-[400px] w-full">
            <div className="w-full bg-[#EEF4FB]/50 border-b border-[#D4D4D4] flex flex-row">
              <div className="p-3 px-4 flex-1">
                <span className="font-roboto font-medium text-xs leading-4 tracking-wide text-[#6B7280]">Call Status</span>
              </div>
              <div className="p-3 px-4 flex-1">
                <span className="font-roboto font-medium text-xs leading-4 tracking-wide text-[#6B7280]">Call Timing</span>
              </div>
            </div>

            <div className="flex flex-col w-full">
              {callDetails.map((call) => (
                <div key={call.id} className="flex flex-row w-full border-b border-[#D4D4D4]/50 hover:bg-slate-50 transition-colors">
                  <div className="p-2 px-4 flex-1 flex flex-col justify-center items-start">
                    {call.status === 'Missed Call' ? (
                      <div className="inline-flex items-center px-2.5 py-1 gap-1.5 bg-[#FFEFEF] border border-[#FDD3D3] rounded-md">
                        <span className="font-inter font-medium text-xs leading-4 text-[#FF0000]">
                          {call.status}
                        </span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center px-2.5 py-1 gap-1.5 bg-gray-100 border border-gray-200 rounded-md">
                        <span className="font-inter font-medium text-xs leading-4 text-gray-700">
                          {call.status}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-2 px-4 flex-1 flex flex-col justify-center items-start">
                    <span className="font-inter font-normal text-sm leading-5 text-[#232F34]">
                      {call.timing}
                    </span>
                  </div>
                </div>
              ))}
              {callDetails.length === 0 && (
                <div className="p-4 text-center text-sm text-gray-500 w-full">
                  No call history found.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
