import { z } from 'zod';

/**
 * Single source of truth for phone number entry across the app.
 *
 * Before this module, seven forms each rolled their own dial-code list,
 * `maxLength`, and digit-stripping rule, and no two agreed — a number typed
 * into one form could be rejected by another. Everything phone-shaped now
 * flows through here, and every form submits the same E.164 string.
 */

export interface Country {
  /** ISO 3166-1 alpha-2, lowercased — also the flag asset's basename. */
  iso2: string;
  name: string;
  /** E.164 country calling code, with the leading '+'. */
  dialCode: string;
  flagUrl: string;
  /** Exact length of the national (subscriber) number, excluding the dial code. */
  nationalDigits: number;
  /** Example national number, shown as the input's placeholder. */
  placeholder: string;
}

/**
 * All four supported countries happen to use 9-digit national numbers today,
 * but the length is stored per-country anyway: supporting a country that
 * doesn't should be one row here, not a change to every caller.
 */
export const COUNTRIES: readonly Country[] = [
  { iso2: 'et', name: 'Ethiopia', dialCode: '+251', flagUrl: '/images/flags/et.svg', nationalDigits: 9, placeholder: '912 345 678' },
  { iso2: 'ke', name: 'Kenya', dialCode: '+254', flagUrl: '/images/flags/ke.svg', nationalDigits: 9, placeholder: '712 345 678' },
  { iso2: 'ug', name: 'Uganda', dialCode: '+256', flagUrl: '/images/flags/ug.svg', nationalDigits: 9, placeholder: '712 345 678' },
  { iso2: 'rw', name: 'Rwanda', dialCode: '+250', flagUrl: '/images/flags/rw.svg', nationalDigits: 9, placeholder: '712 345 678' },
];

export const DEFAULT_COUNTRY: Country = COUNTRIES[0]!;

export function findCountryByDialCode(dialCode: string): Country | undefined {
  return COUNTRIES.find((c) => c.dialCode === dialCode);
}

/**
 * Reduce anything a user can type to bare national digits.
 *
 * Strips non-digits (so pasting "091 123-4567" works), then strips leading
 * zeros: locally these numbers are written "0911234567", but the trunk prefix
 * is not part of the international form. Truncates to the country's length so
 * the field can't overflow regardless of how the value arrived.
 */
export function sanitizeNationalDigits(raw: string, maxDigits: number): string {
  return raw.replace(/\D/g, '').replace(/^0+/, '').slice(0, maxDigits);
}

/** Assemble E.164. Empty digits yield '' — never a bare dangling dial code. */
export function toE164(dialCode: string, nationalDigits: string): string {
  return nationalDigits ? `${dialCode}${nationalDigits}` : '';
}

/**
 * Split a stored value back into (country, national digits).
 *
 * Deliberately tolerant and never throws: these fields load whatever the
 * backend already has, which predates this module and may be '0911234567',
 * '911234567', or '+251 911 234 567'. Anything without a recognised dial code
 * is read as a national number under the default country, so legacy rows keep
 * rendering instead of appearing blank.
 */
export function splitE164(value: string): { country: Country; nationalDigits: string } {
  const trimmed = (value ?? '').trim();

  if (trimmed.startsWith('+')) {
    const digits = `+${trimmed.slice(1).replace(/\D/g, '')}`;
    // Longest prefix first, so a future '+1' can't shadow a '+1XXX'.
    const match = [...COUNTRIES]
      .sort((a, b) => b.dialCode.length - a.dialCode.length)
      .find((c) => digits.startsWith(c.dialCode));

    if (match) {
      return {
        country: match,
        nationalDigits: sanitizeNationalDigits(digits.slice(match.dialCode.length), match.nationalDigits),
      };
    }
  }

  return {
    country: DEFAULT_COUNTRY,
    nationalDigits: sanitizeNationalDigits(trimmed, DEFAULT_COUNTRY.nationalDigits),
  };
}

/**
 * Validates a submitted E.164 string: known dial code, exact digit count.
 *
 * Stricter than the rule it replaces (which accepted any 7-15 characters and
 * so let through numbers the backend would reject).
 */
export const phoneSchema = z
  .string()
  .transform((value) => {
    const trimmed = (value ?? '').trim();
    const digits = trimmed.replace(/\D/g, '');
    return trimmed.startsWith('+') ? `+${digits}` : digits;
  })
  .superRefine((value, ctx) => {
    if (!value) {
      ctx.addIssue({ code: 'custom', message: 'Phone number is required' });
      return;
    }
    if (!value.startsWith('+')) {
      ctx.addIssue({ code: 'custom', message: 'Include a country code, e.g. +251' });
      return;
    }
    const country = COUNTRIES.find((c) => value.startsWith(c.dialCode));
    if (!country) {
      ctx.addIssue({ code: 'custom', message: 'Unsupported country code' });
      return;
    }
    const national = value.slice(country.dialCode.length);
    if (national.length < country.nationalDigits) {
      ctx.addIssue({ code: 'custom', message: 'Phone number is too short' });
    } else if (national.length > country.nationalDigits) {
      ctx.addIssue({ code: 'custom', message: 'Phone number is too long' });
    }
  });

/** Same rules, but an empty value is allowed through as ''. */
export const optionalPhoneSchema = z
  .string()
  .optional()
  .transform((value) => (value ?? '').trim())
  .pipe(z.union([z.literal(''), phoneSchema]));
