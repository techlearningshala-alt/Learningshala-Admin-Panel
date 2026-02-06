"use client";

import { Button } from "@/components/ui/button";

/**
 * Reusable Page Header component with gradient background
 * 
 * @param {Object} props
 * @param {string} props.title - Page title
 * @param {number} props.total - Total count of items
 * @param {string} props.search - Current search term (optional, for search indicator)
 * @param {React.ReactNode} props.actionButton - Action button component (e.g., "Add New" button)
 * @param {string} props.subtitle - Optional subtitle text
 */
export default function PageHeader({ title, total, search, actionButton, subtitle }) {
  return (
    <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-xl shadow-lg p-2 mb-3 text-white">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          {title && (
            <div className="flex items-center gap-3 mb-2">
              <div className="w-1 h-6 bg-white rounded-full"></div>
              <h3 className="text-xl font-bold">{title}</h3>
            </div>
          )}
          <p className={`text-blue-100 text-sm ${title ? 'ml-4' : ''}`}>
            {subtitle || (
              <>
                Total: <span className="font-semibold text-white">{total}</span>
                {search && ` • Searching: "${search}"`}
              </>
            )}
          </p>
        </div>
        {actionButton && (
          <div className="flex-shrink-0">
            {actionButton}
          </div>
        )}
      </div>
    </div>
  );
}
