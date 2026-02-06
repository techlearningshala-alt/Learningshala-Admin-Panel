"use client";

import { Button } from "@/components/ui/button";
import { Pencil, Trash } from "lucide-react";
import DataTable from "../table/DataTable";
import PermissionGuard from "../common/PermissionGuard";
import { usePermissions } from "@/hooks/usePermissions";

export default function SpecializationTable({
  items,
  onEdit,
  onDelete,
  onToggleActive,
  onToggleMenuVisibility,
  currentPage = 1,
  limit = 10,
}) {
  const { canRead, canUpdate } = usePermissions();

  const columns = [
    { key: "priority", label: "Priority" },
    {
      key: "name",
      label: "Name",
      render: (row) =>
        canRead ? (
          <Button variant="link" onClick={() => onEdit(row)}>
            {row.name}
          </Button>
        ) : (
          <span className="text-gray-700">{row.name}</span>
        ),
    },
    { key: "course_name", label: "Course" },
    {
      key: "duration",
      label: "Duration",
      render: (row) => row.course_duration || row.duration || "-",
    },
    {
      key: "menu_visibility",
      label: "Menu Visibility",
      render: (row) =>
        canUpdate ? (
          <Button
            size="sm"
            variant={row.menu_visibility ? "default" : "outline"}
            className={
              row.menu_visibility
                ? "bg-gradient-to-r from-purple-400 to-pink-500 hover:from-purple-600 hover:to-pink-700 text-white border-0 shadow-sm"
                : "bg-red-100 text-red-700 hover:bg-red-200 border-red-300"
            }
            onClick={() => onToggleMenuVisibility?.(row.id, !row.menu_visibility)}
          >
            {row.menu_visibility ? "Visible" : "Hidden"}
          </Button>
        ) : (
          <span className={row.menu_visibility ? "text-green-600" : "text-gray-500"}>
            {row.menu_visibility ? "Visible" : "Hidden"}
          </span>
        ),
    },
    {
      key: "is_active",
      label: "Active / Inactive",
      render: (row) =>
        canUpdate ? (
          <Button
            size="sm"
            variant={row.is_active ? "default" : "outline"}
            className={
              row.is_active
                ? "bg-gradient-to-r from-green-400 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 shadow-sm"
                : "bg-red-100 text-red-700 hover:bg-red-200 border-red-300"
            }
            onClick={() => onToggleActive?.(row.id, !row.is_active)}
          >
            {row.is_active ? "Active" : "Inactive"}
          </Button>
        ) : (
          <span className={row.is_active ? "text-green-600" : "text-gray-500"}>
            {row.is_active ? "Active" : "Inactive"}
          </span>
        ),
    },
    {
      key: "created_at",
      label: "Created Date",
      render: (row) =>
        row.created_at ? new Date(row.created_at).toLocaleDateString() : "-",
    },
    {
      key: "updated_at",
      label: "Updated Date",
      render: (row) =>
        row.updated_at ? new Date(row.updated_at).toLocaleDateString() : "-",
    },
  ];

  const actions = [
    {
      key: (props) => (
        <PermissionGuard permission="update">
          <Button size="sm" variant="ghost" type="button" onClick={() => onEdit(props.row)}>
            <Pencil className="h-8 w-8 p-0 text-blue-500 hover:text-blue-600" />
          </Button>
        </PermissionGuard>
      ),
    },
    {
      key: (props) => (
        <PermissionGuard permission="delete">
          <Button
            size="sm"
            variant="ghost"
            type="button"
            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            onClick={() => onDelete(props.row.id)}
          >
            <Trash className="h-8 w-8 p-0 text-destructive hover:text-destructive" />
          </Button>
        </PermissionGuard>
      ),
    },
  ]; 

  return <DataTable columns={columns} data={items} actions={actions} />;
}
