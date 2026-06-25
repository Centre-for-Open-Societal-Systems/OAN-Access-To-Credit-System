import Link from 'next/link';

export default function DashboardNotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] w-full p-6 text-center">
      <h2 className="text-4xl font-bold text-gray-900 mb-4 font-display">404</h2>
      <p className="text-xl text-gray-700 mb-8 max-w-md">
        The dashboard page you're looking for doesn't exist.
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
