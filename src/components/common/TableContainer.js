"use client";

/**
 * Reusable Table Container component with loading and empty states
 * 
 * @param {Object} props
 * @param {boolean} props.isLoading - Whether data is loading
 * @param {boolean} props.isEmpty - Whether there's no data to display
 * @param {string} props.loadingText - Loading message (default: "Loading...")
 * @param {string} props.emptyText - Empty state message (default: "No data found.")
 * @param {React.ReactNode} props.children - Table content to display
 */
export default function TableContainer({
  isLoading,
  isEmpty,
  loadingText = "Loading...",
  emptyText = "No data found.",
  children,
}) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">{loadingText}</span>
        </div>
      ) : isEmpty ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-sm text-gray-500">{emptyText}</p>
        </div>
      ) : (
        children
      )}
    </div>
  );
}
