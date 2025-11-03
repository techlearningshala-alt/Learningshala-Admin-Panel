"use client";

import { Button } from "@/components/ui/button";
import { Pencil, Trash } from "lucide-react";
import DataTable from "../table/DataTable";

export default function UniversityTable({ items, onEdit, onDelete, onToggleStatus }) {
  const columns = [
    { key: "id", label: "ID" },
    {
      key: "university_name",
      label: "University Name",
      render: (row) => (
        <Button variant="link" onClick={() => onEdit(row)}>
          {row.university_name}
        </Button>
      ),
    },
    {
      key: "university_slug",
      label: "University Slug",
      render: (row) => (
        <Button variant="link" onClick={() => onEdit(row)}>
          {row.university_slug}
        </Button>
      ),
    },
    {
      key: "is_active",
      label: "Status",
      render: (row) => (
        <Button
          size="sm"
          variant={row.is_active ? "default" : "secondary"}
          onClick={() => onToggleStatus(row.id, !row.is_active)}
        >
          {row.is_active ? "Active" : "Inactive"}
        </Button>
      ),
    },
    {
      key: "university_logo",
      label: "Logo",
      render: (row) =>
        row.university_logo ? (
          <img src={`${process.env.NEXT_PUBLIC_thumbnail_URL}${row.university_logo}`} className="h-10 w-10 object-contain" />
        ) : null,
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
        <Button size="sm" variant="outline" onClick={() => onEdit(props.row)}>
          <Pencil className="mr-1 h-4 w-4" /> 
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
          <Trash className="mr-1 h-4 w-4" />
        </Button>
      ),
    },
  ];

  return <DataTable columns={columns} data={items} actions={actions} />;
}
