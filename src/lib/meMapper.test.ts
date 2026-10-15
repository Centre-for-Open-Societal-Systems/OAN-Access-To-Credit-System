import { describe, expect, it } from 'vitest';

import { flattenMe } from './meMapper';

describe('flattenMe', () => {
  it('lifts user type and bank binding out of profiles.a2c', () => {
    expect(
      flattenMe({
        user: 'agent@bank.com',
        full_name: 'Haile G',
        login_email: null,
        roles: ['A2C Bank Agent'],
        profiles: {
          a2c: {
            user_type: 'bank_agent',
            bank: 'Example Bank',
            bank_id: 'BANK-1',
            bank_code: 'BNK001',
            bank_name: 'Example Bank',
            bank_status: 'Active',
          },
        },
      })
    ).toEqual({
      email: 'agent@bank.com',
      full_name: 'Haile G',
      roles: ['A2C Bank Agent'],
      user_type: 'bank_agent',
      bank: 'Example Bank',
      bank_id: 'BANK-1',
      bank_code: 'BNK001',
      bank_name: 'Example Bank',
      bank_status: 'Active',
    });
  });

  it('prefers the login email over a synthetic user id', () => {
    const user = flattenMe({
      user: 'abc123@id.openagrinet.internal',
      full_name: 'Abebe',
      login_email: 'abebe@example.com',
      roles: ['A2C Farmer'],
      profiles: { a2c: { user_type: 'farmer' } },
    });

    expect(user?.email).toBe('abebe@example.com');
    expect(user?.bank_id).toBeNull();
  });

  it('returns null when there is no user', () => {
    expect(flattenMe(undefined)).toBeNull();
    expect(flattenMe({})).toBeNull();
  });
});
