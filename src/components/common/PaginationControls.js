"use client";

import { Button } from "@/components/ui/button";

/**
 * Reusable Pagination Controls component
 * 
 * @param {Object} props
 * @param {number} props.currentPage - Current page number
 * @param {number} props.totalPages - Total number of pages
 * @param {Function} props.onPageChange - Callback when page changes: (newPage) => void
 * @param {boolean} props.hideIfSinglePage - Hide pagination if only one page (default: true)
 */
export default function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
  hideIfSinglePage = true,
}) {
  if (hideIfSinglePage && totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex justify-center items-center mt-6 gap-3">
      <Button
        size="sm"
        disabled={currentPage === 1}
        onClick={() => onPageChange?.(Math.max(currentPage - 1, 1))}
        className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
      >
        Prev
      </Button>
      <div className="bg-white border border-gray-300 rounded-md px-4 py-2 shadow-sm">
        <span className="text-sm font-medium text-gray-700">
          Page <span className="text-blue-600 font-semibold">{currentPage}</span> of{" "}
          <span className="text-blue-600 font-semibold">{totalPages}</span>
        </span>
      </div>
      <Button
        size="sm"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange?.(Math.min(currentPage + 1, totalPages))}
        className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
      >
        Next
      </Button>
    </div>
  );
}
