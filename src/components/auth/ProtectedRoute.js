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
      } else if (roles.length > 0) {
        // Normalize roles for comparison (case-insensitive)
        const normalizedUserRole = String(user.role).trim().toLowerCase();
        const normalizedAllowedRoles = roles.map(r => String(r).trim().toLowerCase());
        
        console.log("🔍 ProtectedRoute - User role:", user.role, "Normalized:", normalizedUserRole);
        console.log("🔍 ProtectedRoute - Allowed roles:", roles, "Normalized:", normalizedAllowedRoles);
        console.log("🔍 ProtectedRoute - Has access:", normalizedAllowedRoles.includes(normalizedUserRole));
        
        if (!normalizedAllowedRoles.includes(normalizedUserRole)) {
          router.replace("/unauthorized?error=Access denied");
        }
      }
    }
  }, [user, roles, loading, router]);

  // Normalize for the render check too
  const normalizedUserRole = user ? String(user.role).trim().toLowerCase() : null;
  const normalizedAllowedRoles = roles.map(r => String(r).trim().toLowerCase());
  const hasAccess = roles.length === 0 || (user && normalizedAllowedRoles.includes(normalizedUserRole));

  if (loading || !user || !hasAccess) return null;

  return children;
}
