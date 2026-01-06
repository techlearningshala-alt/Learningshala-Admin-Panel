"use client";

import { Button } from "@/components/ui/button";
import { Pencil, Trash } from "lucide-react";
import DataTable from "../table/DataTable";
import PermissionGuard from "../common/PermissionGuard";
import { usePermissions } from "@/hooks/usePermissions";

export default function UserTable({ items, onEdit, onDelete, page = 1, limit = 10 }) {
  const { canRead, canUpdate, canDelete } = usePermissions();

  const columns = [
    {
      key: "sr_no",
      label: "Sr. No.",
      render: (_row, rowIndex) => (page - 1) * limit + rowIndex + 1,
      style: { width: "80px" },
      headerClassName: "border px-2 py-1 text-left",
      cellClassName: "border px-2 py-1 text-left",
    },
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
    { key: "email", label: "Email" },
    {
      key: "role",
      label: "Role",
      render: (row) => row.role === "mentor" ? "User" : row.role,
    },
    {
      key: "permissions",
      label: "Permissions",
      render: (row) => {
        if (row.role === "admin") {
          return <span className="text-green-600 font-semibold">All Permissions</span>;
        }
        const perms = [];
        if (row.can_create) perms.push("Create");
        if (row.can_read) perms.push("Read");
        if (row.can_update) perms.push("Update");
        if (row.can_delete) perms.push("Delete");
        return <span className="text-gray-600">{perms.length > 0 ? perms.join(", ") : "No Permissions"}</span>;
      },
    },
    {
      key: "created_at",
      label: "Created At",
      render: (row) =>
        row.created_at ? new Date(row.created_at).toLocaleDateString() : "-",
    },
    {
      key: "updated_at",
      label: "Updated At",
      render: (row) =>
        row.updated_at ? new Date(row.updated_at).toLocaleDateString() : "-",
    },
  ];

  const actions = [
    {
      key: (props) => (
        <PermissionGuard permission="update">
          <Button size="sm" variant="outline" onClick={() => onEdit(props.row)}>
            <Pencil className="h-4 w-4" />
          </Button>
        </PermissionGuard>
      ),
    },
    {
      key: (props) => (
        <PermissionGuard permission="delete">
          <Button size="sm" variant="destructive" onClick={() => onDelete(props.row.id)}>
            <Trash className="h-4 w-4" />
          </Button>
        </PermissionGuard>
      ),
    },
  ];

  return <DataTable columns={columns} data={items} actions={actions} />;
}

