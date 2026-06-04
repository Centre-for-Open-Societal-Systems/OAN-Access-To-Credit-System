import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface SelectFieldProps {
  id?: string;
  label?: string;
  placeholder?: string;
  options: string[];
  value: string;
  onChange: (val: string) => void;
  required?: boolean;
  error?: string;
  disabled?: boolean;
}

export function SelectField({ id, label, placeholder, options, value, onChange, required, error, disabled }: SelectFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function h(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    }
    if (isOpen) document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [isOpen]);

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label htmlFor={id} className="text-sm font-medium text-gray-700">{label} {required && <span className="text-red-500">*</span>}</label>}
      <div ref={ref} className="relative">
        <input type="text" className="absolute opacity-0 w-0 h-0 p-0 m-0 border-0" value={value} onChange={() => { }} required={required} tabIndex={-1} aria-hidden="true" />
        <button id={id} type="button" onClick={() => { if (disabled) return; setIsOpen(o => !o); }}
          className={`flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm shadow-sm transition-all focus:outline-none ${disabled ? 'border-gray-200 bg-gray-50 text-gray-500 cursor-default' : error ? 'border-red-400 bg-red-50/40' : isOpen ? 'border-[#4a7c59] bg-white ring-2 ring-[#4a7c59]/15' : 'border-gray-300 bg-white hover:border-[#4a7c59]/50'}`}>
          <span className={disabled ? 'text-gray-500' : value ? 'text-gray-900' : 'text-gray-400'}>{value || placeholder}</span>
          <ChevronDown size={15} className={`shrink-0 transition-transform ${isOpen ? 'rotate-180 text-[#4a7c59]' : 'text-gray-400'}`} />
        </button>
        <ul className={`absolute z-50 mt-1 w-full rounded-xl border border-gray-200 bg-white py-1 shadow-xl transition-all ${isOpen ? 'pointer-events-auto scale-y-100 opacity-100' : 'pointer-events-none scale-y-95 opacity-0'}`}
          style={{ maxHeight: '200px', overflowY: 'auto', transformOrigin: 'top' }}>
          {options.map(opt => {
            const sel = value === opt;
            return <li key={opt} onMouseDown={() => { onChange(opt); setIsOpen(false); }}
              className={`flex cursor-pointer items-center justify-between px-3 py-2 text-sm ${sel ? 'bg-[#4a7c59]/8 font-medium text-[#4a7c59]' : 'text-gray-800 hover:bg-gray-50'}`}>
              {opt}{sel && <Check size={13} strokeWidth={2.5} className="text-[#4a7c59]" />}
            </li>;
          })}
        </ul>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
