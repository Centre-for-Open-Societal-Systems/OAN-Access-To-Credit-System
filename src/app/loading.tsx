export default function GlobalLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-[var(--button-bg)] rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium">Loading...</p>
      </div>
    </div>
  );
}
