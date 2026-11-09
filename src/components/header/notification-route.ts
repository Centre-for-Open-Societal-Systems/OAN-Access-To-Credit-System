import type { UserKind } from '@/features/auth/rbac';
import type { NotificationItem } from '@/features/notifications/api/notification.service';

/** Only link to record views implemented for the current portal. */
export function notificationRoute(item: NotificationItem, kind: UserKind | null): string | null {
  const id = item.document_name;
  if (!kind || !id?.trim()) return null;

  switch (item.document_type) {
    case 'A2C Lead':
      return kind === 'dev_agent' ? `/leads/${encodeURIComponent(id)}` : null;
    case 'A2C Loan Product': {
      const path = kind === 'bank_agent' ? '/agent-loan-products'
        : kind === 'bank_admin' || kind === 'marketplace' ? '/loan-products' : null;
      return path ? `${path}?${new URLSearchParams({ product: id })}` : null;
    }
    case 'A2C Loan Application': {
      const path = kind === 'bank_agent' ? '/agent-application-lists'
        : kind === 'bank_admin' || kind === 'marketplace' ? '/application-lists'
        : kind === 'dev_agent' ? '/dev-application-lists' : null;
      return path ? `${path}?${new URLSearchParams({ application: id })}` : null;
    }
    default:
      return null;
  }
}
