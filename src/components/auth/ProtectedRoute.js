// src/components/ProtectedRoute.js
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function ProtectedRoute({ children, roles = [] }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/login?error=Please login first");
      } else if (roles.length && !roles.includes(user.role)) {
        router.replace("/unauthorized?error=Access denied");
      }
    }
  }, [user, roles, loading, router]);

  if (loading || !user || (roles.length && !roles.includes(user.role))) return null;

  return children;
}
