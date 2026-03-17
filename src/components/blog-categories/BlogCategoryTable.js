"use client";

import { Button } from "../ui/button";
import DataTable from "../table/DataTable";
import { createTableActions } from "@/utils/tableActions";      

export default function BlogCategoryTable({ items, onEdit, onDelete, onToggleVisibility }) {
  const actions = createTableActions(onEdit, onDelete);

  const columns = [
    { key: "title", label: "Title" },
    {
      key: "category_slug",
      label: "Category Slug",
      style: { width: "30%" },
      cellClassName: "border px-3 py-2",
      headerClassName: "border px-3 py-2 text-left",
      render: (row) => <span className="text-gray-700">{row.category_slug}</span>,
    },
    {
      key: "category_visibility",
      label: "Visible",
      render: (row) =>
        onToggleVisibility ? (
          <Button
            size="sm"
            variant={row.category_visibility ? "default" : "outline"}
            className="min-w-[80px]"
            onClick={() => onToggleVisibility(row.id, !row.category_visibility)}
          >
            {row.category_visibility ? "Yes" : "No"}
          </Button>
        ) : (
          <span className="text-gray-700">
            {row.category_visibility ? "Yes" : "No"}
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

      return <DataTable columns={columns} data={items} actions={actions} />;
}


