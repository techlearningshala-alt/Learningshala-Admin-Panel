"use client";

import { ReactNode } from "react";

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 relative overflow-hidden">
      {/* Background design */}
      <div className="absolute inset-0 opacity-10">
        <h1 className="text-8xl font-bold text-white flex items-center justify-center h-full">
          Learning Shala
        </h1>
      </div>

      {/* Form container */}
      <div className="relative z-10 w-full max-w-md p-8 bg-white rounded-xl shadow-lg">
        {children}
      </div>
    </div>
  );
}
