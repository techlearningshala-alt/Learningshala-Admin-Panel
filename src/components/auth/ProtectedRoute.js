// src/components/ProtectedRoute.js
"use client";

import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import {
  canAccessPathBySection,
  getDefaultSectionHome,
  isSectionRestrictedUser,
} from "@/lib/sectionAccess";

export default function ProtectedRoute({ children, roles = [], sections = [] }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/login?error=Please login first");
        return;
      }

      if (roles.length > 0) {
        const normalizedUserRole = String(user.role).trim().toLowerCase();
        const normalizedAllowedRoles = roles.map((r) => String(r).trim().toLowerCase());

        if (!normalizedAllowedRoles.includes(normalizedUserRole)) {
          router.replace("/unauthorized?error=Access denied");
          return;
        }
      }

      // Section-restricted users: only allowed section routes
      if (isSectionRestrictedUser(user) && !canAccessPathBySection(user, router.pathname)) {
        const home = getDefaultSectionHome(user);
        if (home && home !== router.pathname) {
          router.replace(home);
        } else {
          router.replace("/unauthorized?error=Section access denied");
        }
      }
    }
  }, [user, roles, sections, loading, router]);

  const normalizedUserRole = user ? String(user.role).trim().toLowerCase() : null;
  const normalizedAllowedRoles = roles.map((r) => String(r).trim().toLowerCase());
  const hasRoleAccess =
    roles.length === 0 || (user && normalizedAllowedRoles.includes(normalizedUserRole));

  const hasSectionAccess =
    !user ||
    !isSectionRestrictedUser(user) ||
    canAccessPathBySection(user, router.pathname);

  if (loading || !user || !hasRoleAccess || !hasSectionAccess) return null;

  return children;
}
