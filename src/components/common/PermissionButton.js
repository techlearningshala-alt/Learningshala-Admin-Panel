"use client";

import { Button } from "@/components/ui/button";
import { usePermissions } from "@/hooks/usePermissions";
import { notifyError } from "@/lib/notify";

/**
 * Button component that checks permission before allowing action
 * @param {string} permission - 'create', 'read', 'update', 'delete'
 * @param {function} onClick - Click handler
 * @param {ReactNode} children - Button content
 * @param {Object} props - Other button props
 */
export default function PermissionButton({ permission, onClick, children, ...props }) {
  const { hasPermission, getPermissionMessage } = usePermissions();

  const handleClick = (e) => {
    if (!hasPermission(permission)) {
      notifyError(getPermissionMessage());
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <Button onClick={handleClick} {...props}>
      {children}
    </Button>
  );
}

