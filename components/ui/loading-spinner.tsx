export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-slate-600 rounded-full animate-spin">
          <div className="absolute top-0 left-0 w-12 h-12 border-4 border-transparent border-t-amber-400 rounded-full animate-spin"></div>
        </div>
        <div className="mt-4 text-center">
          <p className="text-slate-400 font-open-sans">Loading modules...</p>
        </div>
      </div>
    </div>
  );
}
