'use client';

import { useEffect, useRef, useState } from 'react';
import { Undo2, X } from 'lucide-react';

interface UndoToastProps {
  /** Message shown in the toast, e.g. "Document removed". */
  message: string;
  /** Called when the user clicks Undo (before the window elapses). */
  onUndo: () => void;
  /** Called when the window elapses without an undo — commit the action. */
  onCommit: () => void;
  /** Window length in milliseconds before the action is committed. */
  durationMs?: number;
}

// A self-contained "undo" toast: shows a message + Undo button and a shrinking
// progress bar. If the user doesn't undo within `durationMs`, onCommit fires.
// Used to make destructive actions (e.g. removing a document) feel instant while
// staying reversible — no fixed pre-action delay, just a reversible window after.
export function UndoToast({ message, onUndo, onCommit, durationMs = 5000 }: UndoToastProps) {
  const [remaining, setRemaining] = useState(durationMs);
  // Keep latest callbacks in refs so the timers don't restart on re-render.
  const onCommitRef = useRef(onCommit);
  onCommitRef.current = onCommit;

  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      const left = durationMs - (Date.now() - start);
      setRemaining(left > 0 ? left : 0);
    }, 100);
    const timeout = setTimeout(() => {
      onCommitRef.current();
    }, durationMs);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [durationMs]);

  const progress = Math.max(0, Math.min(100, (remaining / durationMs) * 100));

  return (
    <div className="fixed bottom-5 right-5 z-[9999] w-[min(88vw,320px)] overflow-hidden rounded-lg bg-gray-900 text-white shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div className="flex items-center justify-between gap-2 px-3 py-2">
        <span className="truncate text-sm font-medium">{message}</span>
        <div className="flex shrink-0 items-center gap-0.5">
          <button
            type="button"
            onClick={onUndo}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-sm font-semibold text-green-400 hover:bg-white/10 transition-colors"
          >
            <Undo2 className="h-3.5 w-3.5" /> Undo
          </button>
          <button
            type="button"
            onClick={onCommit}
            aria-label="Dismiss"
            className="rounded-md p-1 text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <div className="h-0.5 w-full bg-white/10">
        <div
          className="h-full bg-green-500 transition-[width] duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
