"use client";

import { Button } from "@/components/ui/button";
import { Pencil, Trash } from "lucide-react";
import DataTable from "../table/DataTable";
import { createTableActions } from "@/utils/tableActions";
import { usePermissions } from "@/hooks/usePermissions";

export default function SpecializationImageTable({
  items,
  onEdit,
  onDelete,
  page = 1,
  limit = 10,
  isFiltered = false,
}) {
  const { canRead } = usePermissions();
  const buildAssetUrl = (value) => {
    if (!value) return null;
    if (String(value).startsWith("http")) return value;
    const base = process.env.NEXT_PUBLIC_thumbnail_URL || "";
    return `${base}${value}`;
  };

  const columns = [
    {
      key: "sr_no",
      label: "Sr. No.",
      render: (row, index) => {
        const serialNumber = isFiltered
          ? index + 1
          : (page - 1) * limit + index + 1;
        return serialNumber;
      },
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
    {
      key: "image",
      label: "Image",
      render: (row) => (
        <img
          src={buildAssetUrl(row.image)}
          alt={row.name}
          className="h-16 w-16 object-contain rounded border"
        />
      ),
    },
    {
      key: "created_at",
      label: "Created Date",
      render: (row) =>
        row.created_at
          ? new Date(row.created_at).toLocaleDateString()
          : "-",
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex gap-2">
         
        </div>
      ),
    },
  ];

  const actions = createTableActions(onEdit, onDelete); 

  return <DataTable columns={columns} data={items} actions={actions} />;
}

