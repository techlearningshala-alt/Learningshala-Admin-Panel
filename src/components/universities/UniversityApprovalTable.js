"use client";

import { Button } from "@/components/ui/button";
import { Pencil, Trash } from "lucide-react";
import DataTable from "../table/DataTable";

export default function UniversityApprovalTable({ items, onEdit, onDelete }) {
  const columns = [
    { key: "id", label: "ID" },
    {
      key: "title",
      label: "Title",
      render: (row) => (
        <Button variant="link" onClick={() => onEdit(row)}>
          {row.title}
        </Button>
      ),
    },
    { key: "description", label: "Description" },
    {
      key: "logo",
      label: "Logo",
      render: (row) =>
        row.logo ? (
          <img
            src={`${process.env.NEXT_PUBLIC_thumbnail_URL}${row.logo}`}
            alt="logo"
            className="h-10 w-10 object-contain rounded"
          />
        ) : null,
    },
  ];

  const actions = [
    {
      key: (props) => (
        <Button size="sm" variant="outline" onClick={() => onEdit(props.row)}>
          <Pencil className="mr-1 h-4 w-4" /> Edit
        </Button>
      ),
    },
    {
      key: (props) => (
        <Button size="sm" variant="destructive" onClick={() => onDelete(props.row.id)}>
          <Trash className="mr-1 h-4 w-4" /> Delete
        </Button>
      ),
    },
  ];

  return <DataTable columns={columns} data={items} actions={actions} />;
}
