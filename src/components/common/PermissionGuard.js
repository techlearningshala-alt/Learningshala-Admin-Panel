"use client";

import { usePermissions } from "@/hooks/usePermissions";

/**
 * Component to conditionally render children based on permission
 * @param {string} permission - 'create', 'read', 'update', 'delete'
 * @param {ReactNode} children - Content to show if user has permission
 * @param {ReactNode} fallback - Content to show if user doesn't have permission (optional)
 */
export default function PermissionGuard({ permission, children, fallback = null }) {
  const { hasPermission } = usePermissions();

  if (hasPermission(permission)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}

