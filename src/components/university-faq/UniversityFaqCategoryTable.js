"use client";

import { Button } from "../ui/button";
import { Pencil, Trash } from "lucide-react";
import DataTable from "../table/DataTable";

export default function UniversityFaqCategoryTable({ categories, onEdit, onDelete }) {
  const columns = [
    { key: "id", label: "ID" },
    { key: "heading", label: "Heading" },
    {
      key: "updated_at",
      label: "Updated Date",
      render: (row) =>
        row.updated_at ? new Date(row.updated_at).toLocaleString() : "-",
    },
  ];

  const actions = [
    {
      key: (props) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => onEdit(props.row)}
        >
          <Pencil className="mr-1" /> Edit
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
          <Trash className="mr-1" /> Delete
        </Button>
      ),
    },
  ];

  return <DataTable columns={columns} data={categories} actions={actions} />;
}

