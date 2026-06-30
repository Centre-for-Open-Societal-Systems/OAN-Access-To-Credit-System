export default function DashboardLoading() {
  return (
    <div className="flex items-center justify-center h-full min-h-[400px] w-full">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-[var(--button-bg)] rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium">Loading content...</p>
      </div>
    </div>
  );
}
