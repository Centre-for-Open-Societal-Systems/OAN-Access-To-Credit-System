import { describe, expect, it } from 'vitest';
import { maskSensitiveId, normalizeLeadId, toProxiedFileUrl } from './utils';

describe('toProxiedFileUrl', () => {
  it('returns undefined for empty/null/undefined input', () => {
    expect(toProxiedFileUrl(undefined)).toBeUndefined();
    expect(toProxiedFileUrl(null)).toBeUndefined();
    expect(toProxiedFileUrl('')).toBeUndefined();
  });

  it('leaves already-proxied URLs unchanged', () => {
    expect(toProxiedFileUrl('/api/files/test.pdf')).toBe('/api/files/test.pdf');
    expect(toProxiedFileUrl('/api/files/private/kyc.pdf')).toBe('/api/files/private/kyc.pdf');
  });

  it('rewrites relative public file paths', () => {
    expect(toProxiedFileUrl('/files/logo.png')).toBe('/api/files/logo.png');
    expect(toProxiedFileUrl('/files/docs/cert.pdf')).toBe('/api/files/docs/cert.pdf');
  });

  it('rewrites absolute public file URLs', () => {
    expect(toProxiedFileUrl('http://127.0.0.1:8000/files/logo.png')).toBe('/api/files/logo.png');
    expect(toProxiedFileUrl('https://example.com/files/image.jpg')).toBe('/api/files/image.jpg');
  });

  it('leaves external non-file URLs untouched', () => {
    expect(toProxiedFileUrl('https://external.com/other/path')).toBe('https://external.com/other/path');
  });
});

describe('normalizeLeadId', () => {
  it('strips leading # character and decodes uri', () => {
    expect(normalizeLeadId('#LEAD-001')).toBe('LEAD-001');
    expect(normalizeLeadId('LEAD-002')).toBe('LEAD-002');
    expect(normalizeLeadId(null)).toBe('');
  });
});

describe('maskSensitiveId', () => {
  it('masks sensitive identifier keeping visible count', () => {
    expect(maskSensitiveId('12345678', 4)).toBe('••••5678');
    expect(maskSensitiveId('1234', 4)).toBe('••••');
    expect(maskSensitiveId('', 4)).toBe('');
  });
});
