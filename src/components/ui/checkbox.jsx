"use client";

import React from "react";

export const Checkbox = React.forwardRef(
  ({ label, className, ...props }, ref) => {
    return (
      <label className={`inline-flex items-center gap-2 ${className || ""}`}>
        <input
          type="checkbox"
          ref={ref}
          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
          {...props}
        />
        {label && <span className="text-sm">{label}</span>}
      </label>
    );
  }
);

Checkbox.displayName = "Checkbox";
