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
    { key: "priority", label: "Priority" },
    {
      key: "name",
      label: "Name",
      render: (row) => (
        <Button variant="link" onClick={() => onEdit(row)}>
          {row.name}
        </Button>
      ),
    },
    { key: "course_name", label: "Course" },
    {
      key: "duration",
      label: "Duration",
      render: (row) => row.course_duration || row.duration || "-",
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
