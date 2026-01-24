"use client";

import { Button } from "../ui/button";
import { Pencil, Trash } from "lucide-react";
import DataTable from "../table/DataTable";
import PermissionGuard from "../common/PermissionGuard";
import { usePermissions } from "@/hooks/usePermissions";

export default function AuthorTable({ authors, onEdit, onDelete }) {
  const { canRead } = usePermissions();

  const columns = [
    {
      key: "sr_no",
      label: "Sr. No.",
      render: (row, index) => index + 1,
      style: { width: "80px" },
      headerClassName: "border px-2 py-1 text-left",
      cellClassName: "border px-2 py-1 text-left",
    },
    {
      key: "author_name",
      label: "Author Name",
      render: (row) =>
        canRead ? (
          <Button variant="link" onClick={() => onEdit(row)}>
            {row.author_name}
          </Button>
        ) : (
          <span className="text-gray-700">{row.author_name}</span>
        ),
    },
    { key: "label", label: "Label" },
    {
      key: "author_details",
      label: "Author Details",
      render: (row) => {
        const details = row.author_details || "";
        return details.length > 50 ? `${details.substring(0, 50)}...` : details || "-";
      },
    },
    {
      key: "image",
      label: "Image",
      render: (row) =>
        row.image ? (
          <img
            src={`${process.env.NEXT_PUBLIC_thumbnail_URL}${row.image}`}
            className="h-10 w-10 object-cover rounded"
            alt={row.author_name}
          />
        ) : (
          "-"
        ),
    },
    {
      key: "updated_at",
      label: "Updated At",
      render: (row) => (row.updated_at ? new Date(row.updated_at).toLocaleDateString() : "-"),
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

  return <DataTable columns={columns} data={authors} actions={actions} />;
}
