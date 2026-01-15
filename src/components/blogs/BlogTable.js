"use client";

import { Button } from "../ui/button";
import { Pencil, Trash } from "lucide-react";
import DataTable from "../table/DataTable";
import PermissionGuard from "../common/PermissionGuard";
import { usePermissions } from "@/hooks/usePermissions";

export default function BlogTable({ items, onEdit, onDelete, onToggleVerified }) {
  const { canRead, canUpdate } = usePermissions();

  const columns = [
    {
      key: "title",
      label: "Title",
      style: { width: "30%" },
      cellClassName: "border px-3 py-2",
      headerClassName: "border px-3 py-2 text-left",
      render: (row) =>
        canRead ? (
          <Button variant="link" onClick={() => onEdit(row)} className="p-0 h-auto font-normal">
            {row.title}
          </Button>
        ) : (
          <span className="text-gray-700">{row.title}</span>
        ),
    },
    {
      key: "category_title",
      label: "Category",
      style: { width: "15%" },
      cellClassName: "border px-3 py-2",
      headerClassName: "border px-3 py-2 text-left",
      render: (row) => <span className="text-gray-700">{row.category_title || "-"}</span>,
    },
    {
      key: "author_name",
      label: "Author",
      style: { width: "15%" },
      cellClassName: "border px-3 py-2",
      headerClassName: "border px-3 py-2 text-left",
      render: (row) => <span className="text-gray-700">{row.author_name || "-"}</span>,
    },
    {
      key: "verified",
      label: "Verified",
      style: { width: "10%" },
      cellClassName: "border px-3 py-2",
      headerClassName: "border px-3 py-2 text-center",
      render: (row) =>
        canUpdate && onToggleVerified ? (
          <Button
            size="sm"
            variant={row.verified ? "default" : "outline"}
            onClick={() => onToggleVerified(row.id, !row.verified)}
            className="min-w-[80px]"
          >
            {row.verified ? "Verified" : "Not Verified"}
          </Button>
        ) : (
          <span className="text-gray-700">{row.verified ? "Verified" : "Not Verified"}</span>
        ),
    },
    {
      key: "updated_at",
      label: "Update Date",
      style: { width: "12%" },
      cellClassName: "border px-3 py-2",
      headerClassName: "border px-3 py-2 text-left",
      render: (row) =>
        row.updated_at ? new Date(row.updated_at).toLocaleDateString() : "-",
    },
  ];

  const actions = [
    {
      key: (props) => (
        <PermissionGuard permission="update">
          <Button
            size="sm"
            variant="ghost"
            type="button"
            className="h-8 w-8 p-0"
            onClick={() => onEdit(props.row)}
          >
            <Pencil className="h-4 w-4" />
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
            <Trash className="h-4 w-4" />
          </Button>
        </PermissionGuard>
      ),
    },
  ];

  return <DataTable columns={columns} data={items} actions={actions} />;
}
