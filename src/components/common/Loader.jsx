/**
 * Full-screen centered spinner for page-level loading states.
 */
export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    </div>
  );
}

/**
 * Inline spinner for buttons / sections.
 */
export function Spinner({ className = 'w-5 h-5' }) {
  return (
    <svg className={`animate-spin text-current ${className}`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}

/**
 * Card skeleton for loading states.
 */
export function CardSkeleton({ count = 3 }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="skeleton h-4 w-3/4 mb-3" />
          <div className="skeleton h-3 w-1/2 mb-2" />
          <div className="skeleton h-3 w-full mb-2" />
          <div className="skeleton h-8 w-24 mt-4" />
        </div>
      ))}
    </div>
  );
}
