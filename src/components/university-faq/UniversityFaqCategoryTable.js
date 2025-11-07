"use client";

import { Button } from "../ui/button";
import { Pencil, Trash } from "lucide-react";
import DataTable from "../table/DataTable";

export default function UniversityFaqCategoryTable({ categories, onEdit, onDelete }) {
  const columns = [
    {
      key: "heading",
      label: "Heading",
      style: { width: "100%" },
      cellClassName: "border px-3 py-2 font-medium",
      headerClassName: "border px-3 py-2 text-left",
    },
  ];

  const actions = [
    {
      key: (props) => (
        <Button
          size="sm"
          variant="ghost"
          type="button"
          className="h-8 w-8 p-0"
          onClick={() => onEdit(props.row)}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      ),
    },
    {
      key: (props) => (
        <Button
          size="sm"
          variant="ghost"
          type="button"
          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
          onClick={() => onDelete(props.row.id)}
        >
          <Trash className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return <DataTable columns={columns} data={categories} actions={actions} />;
}

