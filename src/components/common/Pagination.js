"use client";

import { Button } from "@/components/ui/button";

/**
 * Reusable Pagination component with rows-per-page selector
 * 
 * @param {Object} props
 * @param {number} props.total - Total number of items
 * @param {number} props.page - Current page number
 * @param {number} props.rowsPerPage - Current rows per page
 * @param {Function} props.onPageChange - Callback when page changes: (newPage) => void
 * @param {Function} props.onRowsPerPageChange - Callback when rows per page changes: (newRowsPerPage) => void
 * @param {number[]} props.rowsPerPageOptions - Array of rows per page options (default: [10, 25, 50, 100])
 */
export default function Pagination({
  total,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  rowsPerPageOptions = [20, 50, 100, 200],
}) {
  const totalPages = Math.max(1, Math.ceil(total / rowsPerPage));

  if (total === 0) {
    return null;
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
      {/* Rows per page selector */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Rows per page:</span>
        <select
          className="border rounded-md px-2 py-1 bg-white text-sm"
          value={rowsPerPage}
          onChange={(e) => {
            const newRowsPerPage = Number(e.target.value);
            onRowsPerPageChange(newRowsPerPage);
            // Reset to page 1 when rows per page changes
            onPageChange(1);
          }}
        >
          {rowsPerPageOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button
            size="sm"
            variant="outline"
            disabled={page === 1}
            onClick={() => onPageChange(Math.max(page - 1, 1))}
          >
            Prev
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={page >= totalPages}
            onClick={() => onPageChange(Math.min(page + 1, totalPages))}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
