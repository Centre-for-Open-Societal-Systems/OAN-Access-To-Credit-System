import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { KeyboardEvent } from 'react';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function normalizeLeadId(id: string | null | undefined): string {
  if (!id) return '';
  return decodeURIComponent(id).replace(/^#/, '');
}

/**
 * Rewrites a backend file URL to the same-origin proxy path `/api/files/x.jpg`.
 * Files served directly by the backend can't be rendered by the browser: they
 * require an auth header and are blocked by our CSP (`img-src 'self'`). The
 * `/api/files` proxy forwards the request with the auth token, so `<img src>`
 * works.
 *
 * Handles both shapes the backend returns:
 *  - absolute: `https://<backend>/files/x.jpg` → `/api/files/x.jpg`
 *  - relative: `/files/x.jpg`                  → `/api/files/x.jpg`
 *
 * Already-proxied paths (`/api/files/...`) and absolute non-`/files` URLs are
 * returned unchanged.
 */
export function toProxiedFileUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  if (url.startsWith('/api/files/')) return url;
  // Absolute backend URL: strip scheme+host, leaving the `/files/` path.
  const absPublicRewritten = url.replace(/^https?:\/\/[^/]+\/files\//, '/api/files/');
  if (absPublicRewritten !== url) return absPublicRewritten;
  // Relative backend path served from the frontend origin otherwise.
  if (url.startsWith('/files/')) return `/api/files/${url.slice('/files/'.length)}`;
  return url;
}

/**
 * Masks a sensitive identifier (e.g. National/Fayda ID), revealing only the last
 * `visibleCount` characters. Used to avoid exposing full IDs by default in the UI.
 * Returns an empty string for empty input so callers can fall back to a placeholder.
 */
export function maskSensitiveId(value: string | null | undefined, visibleCount = 0): string {
  if (!value) return '';
  const trimmed = value.trim();
  if (visibleCount <= 0 || trimmed.length <= visibleCount) return '•'.repeat(trimmed.length);
  const visible = trimmed.slice(-visibleCount);
  return `${'•'.repeat(trimmed.length - visibleCount)}${visible}`;
}

/**
 * A2C-316: Prevents exponent ('e', 'E') and special characters ('+', '-')
 * from being entered in number inputs.
 */
export function preventInvalidNumberChars(e: KeyboardEvent<HTMLInputElement>) {
  if (['e', 'E', '+', '-'].includes(e.key)) {
    e.preventDefault();
  }
}

/**
 * Sanitizes a string from a number input by removing exponent and special characters.
 */
export function sanitizeNumberInput(value: string): string {
  return value.replace(/[eE\+\-]/g, '');
}
