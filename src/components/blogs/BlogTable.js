"use client";

import { Button } from "../ui/button";
import { Pencil, Trash } from "lucide-react";
import DataTable from "../table/DataTable";
import { createTableActions } from "@/utils/tableActions";
import { usePermissions } from "@/hooks/usePermissions";

export default function BlogTable({ items, onEdit, onDelete, onToggleVerified }) {
  const { canUpdate } = usePermissions();

  const columns = [
    {
      key: "title",
      label: "Title",
      render: (row) => {
        const value = row.h1_tag || row.title || "-";
        return canUpdate && onEdit ? (
          <Button variant="link" onClick={() => onEdit(row)}>
            {value}
          </Button>
        ) : (
          <span className="text-gray-700">{value}</span>
        );
      },
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

  const actions = createTableActions(onEdit, onDelete, {
    editUrl: (row) => `/blogs/edit/${row.id}`,
  });

  return <DataTable columns={columns} data={items} actions={actions} />;
}
