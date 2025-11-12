"use client";

import { Button } from "@/components/ui/button";
import { Pencil, Trash } from "lucide-react";
import DataTable from "../table/DataTable";

export default function CourseTable({ items, onEdit, onDelete }) {
  const columns = [
    { key: "id", label: "ID" },
    { key: "domain_name", label: "Domain" },
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
      render: (row) => row.updated_at ? new Date(row.updated_at).toLocaleString() : "-",
    },
  ];

  const actions = [
    {
      key: (props) => (
        <Button size="sm" variant="outline" onClick={() => onEdit(props.row)}>
          <Pencil className=" h-4 w-4" />
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
          <Trash className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return <DataTable columns={columns} data={items} actions={actions} />;
}
