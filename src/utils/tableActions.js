"use client";

import { Button } from "@/components/ui/button";
import { Pencil, Trash } from "lucide-react";
import PermissionGuard from "@/components/common/PermissionGuard";
import Link from "next/link";

/**
 * Creates a reusable actions array for DataTable components
 * @param {Function} onEdit - Callback function for edit action: (row) => void (used when editUrl is not provided)
 * @param {Function} onDelete - Callback function for delete action: (id) => void
 * @param {Object} options - Optional configuration
 * @param {Function} options.editUrl - Function to generate edit URL: (row) => string. If provided, edit action will be a Link instead of Button
 * @param {string} options.editVariant - Button variant for edit button (default: "ghost")
 * @param {string} options.deleteVariant - Button variant for delete button (default: "ghost")
 * @param {string} options.editClassName - Additional className for edit button
 * @param {string} options.deleteClassName - Additional className for delete button
 * @returns {Array} Actions array compatible with DataTable component
 */
export function createTableActions(onEdit, onDelete, options = {}) {
  const {
    editUrl,
    editVariant = "ghost",
    deleteVariant = "ghost",
    editClassName = "",
    deleteClassName = "h-8 w-8 p-0 text-destructive hover:text-destructive",
  } = options;

  return [
    {
      key: (props) => (
        <PermissionGuard permission="update">
          {editUrl ? (
            <Link href={editUrl(props.row)} className="inline-block">
              <Button
                size="sm"
                variant={editVariant}
                className={editClassName}
                type="button"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <Button
              size="sm"
              variant={editVariant}
              onClick={() => onEdit(props.row)}
              className={editClassName}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
        </PermissionGuard>
      ),
    },
    {
      key: (props) => (
        <PermissionGuard permission="delete">
          <Button
            size="sm"
            variant={deleteVariant}
            type="button"
            className={deleteClassName}
            onClick={() => onDelete(props.row.id)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </PermissionGuard>
      ),
    },
  ];
}

/**
 * Creates inline action buttons for use in column render functions
 * @param {Function} onEdit - Callback function for edit action: (row) => void
 * @param {Function} onDelete - Callback function for delete action: (id) => void
 * @param {Object} options - Optional configuration
 * @param {string} options.editVariant - Button variant for edit button (default: "outline")
 * @param {string} options.deleteVariant - Button variant for delete button (default: "destructive")
 * @param {string} options.containerClassName - Additional className for container div
 * @returns {Function} Render function: (row) => JSX
 */
export function createInlineActions(onEdit, onDelete, options = {}) {
  const {
    editVariant = "ghost",
    deleteVariant = "ghost",
    containerClassName = "flex gap-2 justify-center items-center",
    editClassName = "",
    deleteClassName = "h-8 w-8 p-0 text-destructive hover:text-destructive",
  } = options;

  const InlineActions = (row) => (
    <div className={containerClassName}>
      <PermissionGuard permission="update">
        <Button size="sm" variant={editVariant} type="button" className={editClassName} onClick={() => onEdit(row)}>
          <Pencil className="h-4 w-4" />
        </Button>
      </PermissionGuard>
      <PermissionGuard permission="delete">
        <Button size="sm" variant={deleteVariant} type="button" className={deleteClassName} onClick={() => onDelete(row.id)}>
          <Trash className="h-4 w-4" />
        </Button>
      </PermissionGuard>
    </div>
  );
  
  InlineActions.displayName = 'InlineActions';
  
  return InlineActions;
}
