"use client";

import { Button } from "@/components/ui/button";
import { Pencil, Trash } from "lucide-react";
import DataTable from "../table/DataTable";

export default function SpecializationTable({
  items,
  onEdit,
  onDelete,
  onToggleActive,
  onToggleMenuVisibility,
  currentPage = 1,
  limit = 10,
}) {
  const columns = [
    {
      key: "sr_no",
      label: "Sr. No.",
      render: (row, rowIndex) => (currentPage - 1) * limit + rowIndex + 1,
    },
    { key: "course_name", label: "Course" },
    {
      key: "name",
      label: "Name",
      render: (row) => (
        <Button variant="link" onClick={() => onEdit(row)}>
          {row.name}
        </Button>
      ),
    },
    {
      key: "thumbnail",
      label: "Thumbnail",
      render: (row) =>
        row.thumbnail ? (
          <img
            src={`${process.env.NEXT_PUBLIC_thumbnail_URL}${row.thumbnail}`}
            alt="thumbnail"
            className="h-10 w-10 object-contain rounded"
          />
        ) : null,
    },
    { key: "priority", label: "Priority" },
    {
      key: "is_active",
      label: "Active / Inactive",
      render: (row) => (
        <Button
          size="sm"
          variant={row.is_active ? "default" : "outline"}
          className={
            row.is_active
              ? ""
              : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300"
          }
          onClick={() => onToggleActive?.(row.id, !row.is_active)}
        >
          {row.is_active ? "Active" : "Inactive"}
        </Button>
      ),
    },
    {
      key: "menu_visibility",
      label: "Menu Visibility",
      render: (row) => (
        <Button
          size="sm"
          variant={row.menu_visibility ? "default" : "outline"}
          className={
            row.menu_visibility
              ? ""
              : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300"
          }
          onClick={() => onToggleMenuVisibility?.(row.id, !row.menu_visibility)}
        >
          {row.menu_visibility ? "Visible" : "Hidden"}
        </Button>
      ),
    },
    {
      key: "updated_at",
      label: "Updated At",
      render: (row) =>
        row.updated_at ? new Date(row.updated_at).toLocaleDateString() : "-",
    },
  ];

  const actions = [
    {
      key: (props) => (
        <Button size="sm" variant="outline" onClick={() => onEdit(props.row)}>
          <Pencil  />
        </Button>
      ),
    },
    {
      key: (props) => (
        <Button
          size="sm"
          variant="destructive"
          onClick={() => onDelete(props.row.id)}
        >
          <Trash /> 
        </Button>
      ),
    },
  ];

  return <DataTable columns={columns} data={items} actions={actions} />;
}
