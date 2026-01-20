"use client";

import { Button } from "../ui/button";
import { Pencil, Trash } from "lucide-react";
import DataTable from "../table/DataTable";
import PermissionGuard from "../common/PermissionGuard";

export default function BlogFaqCategoryTable({ categories, onEdit, onDelete }) {
  const columns = [
    {
      key: "priority",
      label: "Priority",
    },
    { key: "heading", label: "Heading" },
    {
      key: "updated_at",
      label: "Updated Date",
      render: (row) =>
        row.updated_at ? new Date(row.updated_at).toLocaleString() : "-",
    },
  ];

  const actions = [
    {
      key: (props) => (
        <PermissionGuard permission="update">
          <Button
            size="sm"
            variant="outline"
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
            variant="destructive"
            onClick={() => onDelete(props.row.id)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </PermissionGuard>
      ),
    },
  ];

  return <DataTable columns={columns} data={categories} actions={actions} />;
}
