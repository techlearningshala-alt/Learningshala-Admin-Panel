"use client";

import DataTable from "../table/DataTable";
import { createTableActions } from "@/utils/tableActions";

export default function FaqCategoryTable({ categories, onEdit, onDelete }) {
  const columns = [
    { key: "id", label: "ID" },
    { key: "heading", label: "Heading" },
    {
      key: "priority",
      label: "Priority",
    },
    {
      key: "updated_at",
      label: "Updated Date",
      render: (row) =>
        row.updated_at ? new Date(row.updated_at).toLocaleString() : "-",
    },
  ];

  const actions = createTableActions(onEdit, onDelete, {
    // editVariant: "outline",
    // deleteVariant: "destructive",
  });

  return <DataTable columns={columns} data={categories} actions={actions} />;
}
