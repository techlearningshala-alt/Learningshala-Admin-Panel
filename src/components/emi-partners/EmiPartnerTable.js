"use client";

import { Button } from "../ui/button";
import { Pencil, Trash } from "lucide-react";
import DataTable from "../table/DataTable";
import { createTableActions } from "@/utils/tableActions";
import { usePermissions } from "@/hooks/usePermissions";

export default function EmiPartnerTable({ partners, onEdit, onDelete }) {
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
      key: "name",
      label: "Partner Name",
      render: (row) =>
        canRead ? (
          <Button variant="link" onClick={() => onEdit(row)}>
            {row.name || "N/A"}
          </Button>
        ) : (
          <span className="text-gray-700">{row.name || "N/A"}</span>
        ),
    },
    {
      key: "logo",
      label: "Logo",
      render: (row) =>
        row.logo ? (
          <img
            src={`${process.env.NEXT_PUBLIC_thumbnail_URL}${row.logo}`}
            alt={row.name}
            className="h-12 w-12 object-contain rounded border"
          />
        ) : (
          <span className="text-gray-400">No logo</span>
        ),
    },
    { 
      key: "created_at", 
      label: "Created At", 
      render: (row) => new Date(row.created_at).toLocaleDateString() 
    },
  ];

  const actions = createTableActions(onEdit, onDelete);

  return <DataTable data={partners} columns={columns} actions={actions} />;
}

