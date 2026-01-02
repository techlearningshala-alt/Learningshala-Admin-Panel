"use client";

import { Button } from "@/components/ui/button";
import { Pencil, Trash } from "lucide-react";
import DataTable from "../table/DataTable";
import PermissionGuard from "../common/PermissionGuard";
import { usePermissions } from "@/hooks/usePermissions";

export default function CourseImageTable({ items, onEdit, onDelete, page = 1, limit = 10, isFiltered = false }) {
  const { canRead } = usePermissions();

  const columns = [
    {
      key: "sr_no",
      label: "Sr. No.",
      render: (row, index) => {
        // If filtered, show index + 1, otherwise use pagination calculation
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
      render: (row) =>
        row.image ? (
          <img
            src={`${process.env.NEXT_PUBLIC_thumbnail_URL}${row.image}`}
            alt={row.name}
            className="h-16 w-16 object-contain rounded border"
          />
        ) : (
          <span className="text-muted-foreground">No image</span>
        ),
    },
    {
      key: "updated_at",
      label: "Updated At",
      render: (row) => new Date(row.updated_at).toLocaleDateString(),
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

  return <DataTable columns={columns} data={items} actions={actions} />;
}

