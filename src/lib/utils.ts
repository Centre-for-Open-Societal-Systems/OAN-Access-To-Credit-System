import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function normalizeLeadId(id: string | null | undefined): string {
  if (!id) return '';
  return decodeURIComponent(id).replace(/^#/, '');
}

/**
 * Masks a sensitive identifier (e.g. National/Fayda ID), revealing only the last
 * `visibleCount` characters. Used to avoid exposing full IDs by default in the UI.
 * Returns an empty string for empty input so callers can fall back to a placeholder.
 */
export function maskSensitiveId(value: string | null | undefined, visibleCount = 4): string {
  if (!value) return '';
  const trimmed = value.trim();
  if (trimmed.length <= visibleCount) return '•'.repeat(trimmed.length);
  const visible = trimmed.slice(-visibleCount);
  return `${'•'.repeat(trimmed.length - visibleCount)}${visible}`;
}

