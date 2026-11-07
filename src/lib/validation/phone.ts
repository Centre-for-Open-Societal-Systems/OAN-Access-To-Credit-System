/** Local mobile number digits, excluding any country/dial code prefix. */
export const PHONE_NUMBER_LENGTH = 9;

/** Nine digits with no trunk `0`: a 9-character "091234567" is only 8 once the 0 is dropped. */
export const PHONE_NUMBER_REGEX = /^[1-9]\d{8}$/;

/** Strips every non-digit character (spaces, dashes, parens, `+`, letters). */
export function toDigitsOnly(value: string): string {
  return value.replace(/\D/g, '');
}

/**
 * Drops a single leading trunk `0` from a local number before it's
 * concatenated with a country/dial code (e.g. domestic "0911000000" ->
 * "911000000" so "+251" + result is valid E.164, not "+2510911000000").
 * Only one `0` is stripped — a valid local number never starts with a trunk 0.
 */
export function stripLeadingZero(digits: string): string {
  return digits.replace(/^0/, '');
}

/**
 * Sanitizes a local-number input as it's typed or pasted: digits only, trunk 0
 * dropped, capped at PHONE_NUMBER_LENGTH. The cap lives here rather than in a
 * `maxLength` attribute, which would truncate a pasted "0912345678" to
 * "091234567" before the trunk 0 could be dropped, losing the last digit.
 */
export function toLocalPhoneDigits(value: string): string {
  return stripLeadingZero(toDigitsOnly(value)).slice(0, PHONE_NUMBER_LENGTH);
}

/** Dial codes used anywhere in the app's registration/registration-adjacent forms. */
export const KNOWN_COUNTRY_CODES = ['+251', '+255', '+254', '+256', '+250', '+1'];

/**
 * Splits an already-combined phone number (e.g. "+251912345678", as stored
 * by registration) into its dial code and local digits, so a field with no
 * country-code selector of its own can still edit just the local part
 * without corrupting the prefix.
 *
 * Two different fallbacks when the value doesn't start with a known code:
 * - No `+` at all: legacy data saved as a bare domestic number (e.g.
 *   "0911000000") — the leading trunk 0 is stripped, matching every other
 *   form's local-digits convention, so displaying it as "+251" + local
 *   digits doesn't imply one digit too many.
 * - A `+` followed by an unrecognized code: an actually-foreign number this
 *   app doesn't have a flag/option for. There's no way to know where its
 *   dial code ends, so it's kept opaque rather than guessing which digits
 *   are "local" — stripping a leading 0 here could remove a real digit.
 */
export function splitPhoneNumber(value: string): { countryCode: string; localDigits: string } {
  const trimmed = value.trim();
  const countryCode = KNOWN_COUNTRY_CODES.find((code) => trimmed.startsWith(code));
  if (countryCode) {
    return { countryCode, localDigits: toDigitsOnly(trimmed.slice(countryCode.length)) };
  }
  if (trimmed.startsWith('+')) {
    return { countryCode: '+251', localDigits: toDigitsOnly(trimmed) };
  }
  return { countryCode: '+251', localDigits: stripLeadingZero(toDigitsOnly(trimmed)) };
}

/**
 * Most digits a phone-style login identifier can hold: 9 local digits, plus the
 * trunk 0 or the dial code when the value carries one.
 */
function loginPhoneMaxDigits(value: string): number {
  const digits = toDigitsOnly(value);
  if (value.trimStart().startsWith('+') || digits.startsWith('251')) return PHONE_NUMBER_LENGTH + 3;
  return digits.startsWith('0') ? PHONE_NUMBER_LENGTH + 1 : PHONE_NUMBER_LENGTH;
}

/** Caps phone-style (no `@`) login input to its required digit count; emails pass through. */
export function normalizeLoginIdentifierInput(value: string): string {
  if (value.includes('@') || /[a-z]/i.test(value)) return value;
  const maxDigits = loginPhoneMaxDigits(value);
  let digits = 0;
  let out = '';
  for (const ch of value) {
    if (/\d/.test(ch)) {
      if (digits >= maxDigits) continue;
      digits += 1;
    }
    out += ch;
  }
  return out;
}

/** E.164 form of a phone-style login identifier, or null if its local part isn't valid. */
function loginPhoneToE164(value: string): string | null {
  const digits = toDigitsOnly(value);
  const hasPlus = value.startsWith('+');
  const countryCode = hasPlus ? KNOWN_COUNTRY_CODES.find((code) => `+${digits}`.startsWith(code)) : '+251';
  if (!countryCode) return null;
  const local = hasPlus
    ? digits.slice(countryCode.length - 1)
    : stripLeadingZero(digits.replace(/^251(?=\d{9}$)/, ''));
  return PHONE_NUMBER_REGEX.test(local) ? `${countryCode}${local}` : null;
}

/** Login identifier is an email, or a phone whose local part is exactly PHONE_NUMBER_LENGTH digits. */
export function isValidLoginIdentifier(value: string): boolean {
  const v = value.trim();
  if (!v) return false;
  if (v.includes('@') || /[a-z]/i.test(v)) return true;
  return loginPhoneToE164(v) !== null;
}

/**
 * The identifier to send at login. The backend matches `mobile_no` exactly and
 * stores it as E.164, so "+251-912345678" or "0912345678" must become
 * "+251912345678" or it would never match the account.
 */
export function toCanonicalLoginIdentifier(value: string): string {
  const v = value.trim();
  if (v.includes('@') || /[a-z]/i.test(v)) return v;
  return loginPhoneToE164(v) ?? v;
}
