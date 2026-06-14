import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectActivities, fetchActivitiesThunk, addActivityNoteThunk } from '../store/newLeadSlice';
import { useParams } from 'next/navigation';
import { Edit, Paperclip, Image as ImageIcon } from 'lucide-react';

export function ActivitySection() {
  const activities = useAppSelector(selectActivities);
  const dispatch = useAppDispatch();
  const params = useParams();
  const leadId = params?.id as string;
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (leadId) {
      dispatch(fetchActivitiesThunk(leadId));
    }
  }, [dispatch, leadId]);

  const handleAddNote = async () => {
    if (note.trim() && leadId && !isSubmitting) {
      setIsSubmitting(true);
      try {
        await dispatch(addActivityNoteThunk({ leadId, content: note })).unwrap();
        setNote('');
      } catch (error) {
        console.error('Failed to add note', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'document' | 'image') => {
    const file = e.target.files?.[0];
    if (file && leadId && !isSubmitting) {
      setIsSubmitting(true);
      try {
        const message = `Uploaded ${type}: ${file.name}`;
        await dispatch(addActivityNoteThunk({ leadId, content: message })).unwrap();
        e.target.value = '';
      } catch (error) {
        console.error(`Failed to upload ${type}`, error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (



    <section className="flex flex-col items-center pb-6 gap-6 w-full bg-white border border-[#F1F3F4] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05),0px_2px_4px_-1px_rgba(0,0,0,0.03)] hover:-translate-y-1 hover:shadow-lg transition-all duration-300 rounded-xl">
      <div className="flex flex-row items-center p-5 px-6 w-full border-b border-[#F1F3F4]">
        <h2 className="font-inter font-semibold text-lg leading-7 flex items-center gap-2 text-[#232F34]">
          <Edit size={18} className="text-[#16335A]" />
          Activity
        </h2>
      </div>

      <div className="flex flex-col items-start px-4 sm:px-6 w-full overflow-hidden">
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add a note about this lead..."
          className="w-full h-24 p-3 bg-white border border-[#D4D4D4] rounded-lg text-sm placeholder:text-[#9CA3AF] text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A] resize-none"
        />
        <div className="flex flex-row justify-between items-center w-full mt-4">
          <div className="flex flex-row items-center gap-2 text-[#6B7280]">
            <button type="button" onClick={() => document.getElementById('activity-file-upload')?.click()} className="p-1 hover:bg-gray-100 rounded transition-colors">
              <Paperclip size={16} />
            </button>
            <button type="button" onClick={() => document.getElementById('activity-image-upload')?.click()} className="p-1 hover:bg-gray-100 rounded transition-colors">
              <ImageIcon size={16} />
            </button>
            <input type="file" id="activity-file-upload" onChange={(e) => handleFileUpload(e, 'document')} className="hidden" />
            <input type="file" id="activity-image-upload" accept="image/*" onChange={(e) => handleFileUpload(e, 'image')} className="hidden" />
          </div>
          <button
            type="button"
            onClick={handleAddNote}
            disabled={!note.trim() || !leadId || isSubmitting}
            className="flex flex-row justify-center items-center px-4 py-1.5 bg-white border border-[#16335A] rounded-lg text-[#16335A] font-roboto font-medium text-sm hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Adding...' : 'Add Note'}
          </button>
        </div>
      </div>

      <div className="flex flex-col w-full px-4 sm:px-6 pb-2 gap-3 mt-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex flex-col items-start p-4 sm:p-5 gap-3 w-full bg-white border border-[#F1F3F4] rounded-lg">
            <div className="flex flex-row items-start w-full gap-3">
              <div className="flex justify-center items-center shrink-0 w-10 h-10 bg-[#F1F3F4] rounded-full mt-0.5">
                <span className="font-roboto font-bold text-[14px] text-[#111827]">
                  {activity.author.substring(0, 2).toUpperCase()}
                </span>
              </div>
              <div className="flex flex-col items-start flex-1 min-w-0">
                <div className="flex flex-row justify-between items-center w-full gap-2">
                  <div className="flex flex-row flex-wrap items-center gap-2.5">
                    <span className="font-roboto font-semibold text-[14px] text-[#111827] break-all">
                      {activity.author}
                    </span>
                    <div className={`flex items-center shrink-0 px-2.5 py-1 border rounded font-roboto font-medium text-[12px] ${(() => {
                      const tag = ((activity as any).title || activity.type || 'Field Visit').toLowerCase();
                      if (tag.includes('agent note')) return 'bg-[#F3E8FF] border-[#E9D5FF] text-[#7E22CE]';
                      if (tag.includes('status updated')) return 'bg-[#EFF6FF] border-[#BFDBFE] text-[#1D4ED8]';
                      if (tag.includes('credit info')) return 'bg-[#ECFDF5] border-[#A7F3D0] text-[#047857]';
                      if (tag.includes('assigned')) return 'bg-[#FFF7ED] border-[#FED7AA] text-[#C2410C]';
                      if (tag.includes('visit')) return 'bg-[#ECFEFF] border-[#A5F3FC] text-[#0E7490]';
                      return 'bg-[#F8FAFC] border-[#E2E8F0] text-[#475569]';
                    })()
                      }`}>
                      {(activity as any).title || activity.type || 'Field Visit'}
                    </div>
                  </div>
                  <span className="font-roboto font-normal text-[14px] text-[#6B7280] whitespace-nowrap shrink-0">
                    {activity.timestamp}
                  </span>
                </div>
                <p className="font-roboto font-normal text-[14px] leading-6 text-[#374151] w-full whitespace-pre-line mt-1.5">
                  {activity.content}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
