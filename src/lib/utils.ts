import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function normalizeLeadId(id: string | null | undefined): string {
  if (!id) return '';
  return decodeURIComponent(id).replace(/^#/, '');
}

