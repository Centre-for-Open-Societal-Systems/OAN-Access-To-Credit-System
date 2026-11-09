import type { UserKind } from '@/features/auth/rbac';
import type { NotificationItem } from '@/features/notifications/api/notification.service';
import { describe, expect, it } from 'vitest';
import { notificationRoute } from './notification-route';

const item: NotificationItem = { id: 'notification-1', subject: 'Updated', read: false, document_name: 'REC/1 ?#&' };

describe('notification record routes', () => {
  it('encodes the lead ID as one route segment', () => {
    expect(notificationRoute({ ...item, document_type: 'A2C Lead' }, 'dev_agent'))
      .toBe('/leads/REC%2F1%20%3F%23%26');
  });

  it.each<[UserKind, string, string, string]>([
    ['bank_admin', 'A2C Loan Product', '/loan-products', 'product'],
    ['bank_agent', 'A2C Loan Product', '/agent-loan-products', 'product'],
    ['marketplace', 'A2C Loan Product', '/loan-products', 'product'],
    ['bank_admin', 'A2C Loan Application', '/application-lists', 'application'],
    ['bank_agent', 'A2C Loan Application', '/agent-application-lists', 'application'],
    ['marketplace', 'A2C Loan Application', '/application-lists', 'application'],
    ['dev_agent', 'A2C Loan Application', '/dev-application-lists', 'application'],
  ])('opens the referenced record for %s / %s', (kind, document_type, path, param) => {
    const href = notificationRoute({ ...item, document_type }, kind);
    expect(href).not.toBeNull();
    const url = new URL(href ?? '', 'https://a2c.test');
    expect(url.pathname).toBe(path);
    expect(url.searchParams.get(param)).toBe(item.document_name);
  });

  it.each<[string, UserKind | null]>([
    ['A2C Lead', 'bank_admin'], ['A2C Loan Product', 'dev_agent'],
    ['A2C Loan Application', 'farmer'], ['User', 'bank_admin'], ['A2C Lead', null],
  ])('does not invent a destination for %s / %s', (document_type, kind) => {
    expect(notificationRoute({ ...item, document_type }, kind)).toBeNull();
  });

  it.each([null, '', '   '])('does not link a missing record ID (%s)', (document_name) => {
    expect(notificationRoute({ ...item, document_type: 'A2C Lead', document_name }, 'dev_agent')).toBeNull();
  });
  it('does not link a notification without record metadata', () => {
    expect(notificationRoute({ id: 'n1', subject: 'Welcome', read: false }, 'dev_agent')).toBeNull();
  });
});
