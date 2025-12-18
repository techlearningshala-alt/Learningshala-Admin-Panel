"use client";

import { Button } from "@/components/ui/button";
import { Pencil, Trash } from "lucide-react";
import DataTable from "../table/DataTable";

export default function SpecializationImageTable({
  items,
  onEdit,
  onDelete,
  page = 1,
  limit = 10,
  isFiltered = false,
}) {
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
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(row)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onDelete(row.id)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return <DataTable columns={columns} data={items} />;
}

