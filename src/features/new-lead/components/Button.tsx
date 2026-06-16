import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { type ButtonHTMLAttributes } from 'react';

export const buttonVariants = cva(
  'px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center',
  {
    variants: {
      variant: {
        outline: [
          'bg-white border border-[#D4D4D4] text-[#374151] hover:bg-slate-50',
          'disabled:text-[#D1D5DB] disabled:cursor-not-allowed',
        ],
        primary: [
          'bg-[#087F50] text-white hover:bg-[#05774A]',
          'disabled:bg-[#E5E7EB] disabled:border disabled:border-[#D1D5DB] disabled:text-[#6B7280] disabled:cursor-not-allowed',
        ],
        success: [
          'bg-[#16A34A] text-white hover:bg-[#15803D]',
          'disabled:opacity-60 disabled:cursor-not-allowed',
        ],
      },
      size: {
        default: 'flex-1 md:flex-none',
        wide: 'w-full md:w-auto min-w-[170px]',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
