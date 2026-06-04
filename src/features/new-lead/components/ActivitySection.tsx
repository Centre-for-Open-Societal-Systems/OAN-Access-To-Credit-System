import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectNewLeadState, addActivityNote } from '../store/newLeadSlice';
import { Edit, Paperclip, Image as ImageIcon } from 'lucide-react';

export function ActivitySection() {
  const dispatch = useAppDispatch();
  const { activities } = useAppSelector(selectNewLeadState);
  const [note, setNote] = useState('');

  const handleAddNote = () => {
    if (note.trim()) {
      dispatch(addActivityNote(note));
      setNote('');
    }
  };

  return (
    <section className="flex flex-col items-start p-6 gap-4 w-full bg-white border border-[#D4D4D4] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05),0px_2px_4px_-1px_rgba(0,0,0,0.03)] rounded-xl">
      <div className="flex flex-row items-center pb-3 w-full border-b border-[#D4D4D4]/50">
        <div className="flex flex-row items-center gap-2">
          <Edit size={18} className="text-[#16335A]" />
          <h2 className="font-roboto font-bold text-base leading-6 text-[#111827]">
            Activity
          </h2>
        </div>
      </div>

      <div className="flex flex-col items-start gap-2 w-full z-10">
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add a note about this lead..."
          className="w-full h-24 p-3 bg-white border border-[#D4D4D4] rounded-lg text-sm placeholder:text-[#9CA3AF] text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A] resize-none"
        />
        <div className="flex flex-row justify-between items-center w-full mt-1">
          <div className="flex flex-row items-center gap-2 text-[#6B7280]">
            <button type="button" className="p-1 hover:bg-gray-100 rounded transition-colors">
              <Paperclip size={16} />
            </button>
            <button type="button" className="p-1 hover:bg-gray-100 rounded transition-colors">
              <ImageIcon size={16} />
            </button>
          </div>
          <button
            type="button"
            onClick={handleAddNote}
            disabled={!note.trim()}
            className="flex flex-row justify-center items-center px-4 py-1.5 bg-white border border-[#16335A] rounded-lg text-[#16335A] font-roboto font-medium text-sm hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Note
          </button>
        </div>
      </div>

      {activities.map((activity) => (
        <div key={activity.id} className="flex flex-col items-start p-4 pt-6 gap-2 w-full bg-[#F9FAFB]/50 border border-[#D4D4D4]/30 rounded-lg mt-2 relative">
          <div className="flex flex-row justify-between items-start w-full">
            <div className="flex flex-row items-center gap-2.5">
              <div className="flex justify-center items-center w-6 h-6 bg-[#16335A]/10 rounded-full">
                <span className="font-roboto font-bold text-[10px] text-[#16335A]">
                  {activity.author.substring(0, 2).toUpperCase()}
                </span>
              </div>
              <span className="font-roboto font-medium text-sm text-[#111827]">
                {activity.author}
              </span>
              <div className="flex items-center px-2 py-0.5 bg-[#DEEBFF] border border-[#16335A]/20 rounded text-[#16335A] font-roboto font-medium text-[10px]">
                Field Visit
              </div>
            </div>
            <span className="font-roboto font-normal text-xs text-[#6B7280]">
              {activity.timestamp}
            </span>
          </div>
          <p className="font-roboto font-normal text-sm leading-5 text-[#111827] w-full mt-2">
            {activity.content}
          </p>
        </div>
      ))}
    </section>
  );
}
