import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';

interface AccessDeniedProps {
  /** Optional context shown beneath the heading, e.g. the feature name. */
  message?: string;
}

// Shown when an authenticated user is denied (403) due to insufficient
// permissions — distinct from a 404 (resource missing) and from a 401
// (session expired, which logs the user out). The user stays signed in.
export function AccessDenied({ message }: AccessDeniedProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] w-full p-6 text-center">
      <div className="w-16 h-16 mb-6 rounded-full bg-amber-100 flex items-center justify-center">
        <ShieldAlert className="w-8 h-8 text-amber-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2 font-display">Access Denied</h2>
      <p className="text-gray-600 mb-8 max-w-md">
        {message || "You don't have permission to view this. If you think this is a mistake, contact your administrator."}
      </p>
      <Link
        href="/leads"
        className="px-6 py-2 bg-[var(--button-bg)] text-white rounded-md font-medium hover:opacity-90 transition-opacity"
      >
        Return to Dashboard
      </Link>
    </div>
  );
}
