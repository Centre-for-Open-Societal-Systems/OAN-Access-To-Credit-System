'use client';

interface TextAreaFieldProps {
  id?: string;
  label?: string;
  placeholder?: string;
  value: string;
  onChange?: (val: string) => void;
  required?: boolean;
  rows?: number;
}

export function TextAreaField({ id, label, placeholder, value, onChange, required, rows = 4 }: TextAreaFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label htmlFor={id} className="text-sm font-medium text-gray-700">{label} {required && <span className="text-red-500">*</span>}</label>}
      <textarea id={id} placeholder={placeholder} value={value ?? ''} onChange={onChange ? e => onChange(e.target.value) : undefined} rows={rows} required={required}
        className="w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm text-gray-900 shadow-sm placeholder:text-gray-500 focus:border-[#16A34A] focus:outline-none focus:ring-2 focus:ring-[#4a7c59]/20" />
    </div>
  );
}
