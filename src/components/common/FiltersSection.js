"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

/**
 * Reusable Filters Section component
 * 
 * @param {Object} props
 * @param {string} props.search - Current search value
 * @param {Function} props.onSearchChange - Callback when search changes: (value) => void
 * @param {string} props.searchPlaceholder - Placeholder text for search input
 * @param {React.ReactNode} props.children - Additional filter elements (dropdowns, etc.)
 * @param {boolean} props.showClearButton - Whether to show clear filters button
 * @param {Function} props.onClearFilters - Callback when clear filters is clicked
 */
export default function FiltersSection({
  search,
  onSearchChange,
  searchPlaceholder = "Search...",
  children,
  showClearButton = false,
  onClearFilters,
}) {
  return (
    <div className="bg-white rounded-lg shadow-md p-2 mb-1 border border-gray-200">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[280px]">
          <Input
            placeholder={searchPlaceholder}
            value={search || ""}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="pr-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
          {search && (
            <button
              onClick={() => onSearchChange?.("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              type="button"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        {children}
        {showClearButton && onClearFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="border-gray-300 hover:bg-gray-50 hover:border-gray-400"
          >
            Clear Filters
          </Button>
        )}
      </div>
    </div>
  );
}
