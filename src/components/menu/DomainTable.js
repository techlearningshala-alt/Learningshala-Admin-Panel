"use client";

import { Button } from "@/components/ui/button";
import DataTable from "../table/DataTable";
import { usePermissions } from "@/hooks/usePermissions";
import { createTableActions } from "@/utils/tableActions";

export default function DomainTable({ items, onEdit, onDelete, page = 1, limit = 10 }) {
  const { canRead } = usePermissions();

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
    { key: "description", label: "Description" },
    { key: "label", label: "Label" },
    { key: "priority", label: "Priority" },
    {
      key: "is_active",
      label: "Active",
      render: (row) => (row.is_active ? "Yes" : "No"),
    },
    {
      key: "menu_visibility",
      label: "Menu Visibility",
      render: (row) => (row.menu_visibility ? "Yes" : "No"),
    },
    {
      key: "updated_at",
      label: "Updated At",
      render: (row) => new Date(row.updated_at).toLocaleDateString(),
    },
  ];

  const actions = createTableActions(onEdit, onDelete, {
    editUrl: (row) => `/domains/edit/${row.id}`,
  });

  return <DataTable columns={columns} data={items} actions={actions} />;
}
