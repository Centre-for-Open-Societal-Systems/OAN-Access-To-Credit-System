import { ServerCrash } from 'lucide-react';

interface ConnectionErrorProps {
  /** Optional heading override. */
  title?: string;
  /** Optional context shown beneath the heading. */
  message?: string;
  /** Invoked when the user clicks Retry; should re-trigger the failed fetch. */
  onRetry?: () => void;
}

// Shown when a request fails for a reason that is not the user's fault and is
// not "no data" — e.g. the backend is unreachable (502), a server error (5xx),
// a timeout, or the network dropped. Distinct from AccessDenied (403) and from
// an empty state (a successful response with zero results). The failure is
// usually transient, so the primary action is Retry rather than navigation.
export function ConnectionError({ title, message, onRetry }: ConnectionErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] w-full p-6 text-center">
      <div className="w-16 h-16 mb-6 rounded-full bg-red-100 flex items-center justify-center">
        <ServerCrash className="w-8 h-8 text-red-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2 font-display">
        {title || "We couldn't load this right now"}
      </h2>
      <p className="text-gray-600 mb-8 max-w-md">
        {message || 'Our servers are not responding at the moment. Please try again in a few seconds.'}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="px-6 py-2 bg-[var(--button-bg)] text-white rounded-md font-medium hover:opacity-90 transition-opacity"
        >
          Try Again
        </button>
      )}
    </div>
  );
}