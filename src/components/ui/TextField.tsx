'use client';

import { ReactNode } from 'react';

interface TextFieldProps {
  id?: string;
  label?: string;
  placeholder?: string;
  value: string;
  onChange?: (val: string) => void;
  type?: string;
  hint?: string;
  required?: boolean;
  readOnly?: boolean;
  error?: string;
  icon?: ReactNode;
  max?: string | number;
  min?: string | number;
}

export function TextField({ id, label, placeholder, value, onChange, type = 'text', hint, required, readOnly, error, icon, max, min }: TextFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label htmlFor={id} className="text-sm font-medium text-gray-700">{label} {required && <span className="text-red-500">*</span>}</label>}
      <div className="relative">
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</span>}
        <input id={id} type={type} placeholder={placeholder} value={value ?? ''} onChange={onChange ? e => onChange(e.target.value) : undefined} readOnly={readOnly} max={max} min={min} required={required}
          className={`w-full rounded-lg border px-3 py-3 text-sm shadow-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 ${icon ? 'pl-9' : ''} ${error ? 'border-red-400 bg-red-50/40 focus:border-red-400 focus:ring-red-100' : readOnly ? 'border-gray-200 bg-gray-50 text-gray-500 cursor-default focus:outline-none' : 'border-gray-300 bg-white text-gray-900 focus:border-[#16A34A] focus:ring-[#16A34A]/20'}`} />
      </div>
      {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
