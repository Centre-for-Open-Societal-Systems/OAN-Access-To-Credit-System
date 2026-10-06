export const TAX_REGISTRATION_NUMBER_MIN_LENGTH = 9;
export const TAX_REGISTRATION_NUMBER_MAX_LENGTH = 10;

export function isValidTaxRegistrationLength(value: string): boolean {
  const length = value.trim().length;
  return length >= TAX_REGISTRATION_NUMBER_MIN_LENGTH && length <= TAX_REGISTRATION_NUMBER_MAX_LENGTH;
}
