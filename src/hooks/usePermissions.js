"use client";

import { useAuth } from "@/context/AuthContext";

/**
 * Custom hook to check user permissions
 * @returns {Object} Permission check functions
 */
export function usePermissions() {
  const { user } = useAuth();

  // Admin has all permissions
  const isAdmin = user?.role === "admin";

  // Check if user can perform a specific action
  const canCreate = isAdmin || user?.can_create === true;
  const canRead = isAdmin || user?.can_read === true;
  const canUpdate = isAdmin || user?.can_update === true;
  const canDelete = isAdmin || user?.can_delete === true;

  // Check specific permission
  const hasPermission = (permission) => {
    if (isAdmin) return true;
    return user?.[`can_${permission}`] === true;
  };

  // Get permission message
  const getPermissionMessage = () => {
    return "You are not authorized to perform this action.";
  };

  return {
    canCreate,
    canRead,
    canUpdate,
    canDelete,
    hasPermission,
    getPermissionMessage,
    isAdmin,
  };
}

