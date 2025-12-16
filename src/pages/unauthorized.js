"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

export default function UnauthorizedPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, logout } = useAuth();
  const error = searchParams.get("error") || "Access denied";

  const handleGoBack = () => {
    router.back();
  };

  const handleGoToDashboard = () => {
    if (user) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
      <div className="bg-white shadow-xl rounded-2xl p-10 max-w-md w-full text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Access Denied</h1>
          <p className="text-gray-600 mt-2">{error}</p>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-gray-500">
            You don&apos;t have permission to access this page.
          </p>
          {user && (
            <p className="text-sm text-gray-500">
              Current role: <span className="font-semibold">{user.role}</span>
            </p>
          )}

          <div className="flex flex-col gap-2 mt-6">
            <Button onClick={handleGoToDashboard} className="w-full">
              {user ? "Go to Dashboard" : "Go to Login"}
            </Button>
            <Button onClick={handleGoBack} variant="outline" className="w-full">
              Go Back
            </Button>
            {user && (
              <Button onClick={handleLogout} variant="ghost" className="w-full">
                Logout
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

