// Shared input length caps for seller account/registration forms, so the same
// number isn't re-typed as a magic `maxLength` across each form field.

import { PHONE_NUMBER_LENGTH } from '@/lib/validation/phone';

/** Local mobile number digits (excludes the country/dial code prefix). */
export const PHONE_NUMBER_MAX_LENGTH = PHONE_NUMBER_LENGTH;

/** Postal / ZIP code digits — intentionally generous (1–10) to cover all
 *  country-specific formats (e.g. Ethiopia 4, US 5, India 6, UK up to 8). */
export const POSTAL_CODE_MAX_LENGTH = 10;
