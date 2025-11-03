"use client";

import { Button } from "../ui/button";
import { Pencil, Trash } from "lucide-react";
import DataTable from "../table/DataTable";

export default function PlacementPartnerTable({ partners, onEdit, onDelete }) {
  const columns = [
    { key: "id", label: "ID" },
    {
      key: "name",
      label: "Partner Name",
      render: (row) => (
        <Button variant="link" onClick={() => onEdit(row)}>
          {row.name || "N/A"}
        </Button>
      ),
    },
    {
      key: "logo",
      label: "Logo",
      render: (row) =>
        row.logo ? (
          <img
            src={`${process.env.NEXT_PUBLIC_thumbnail_URL}${row.logo}`}
            alt={row.name}
            className="h-12 w-12 object-contain rounded border"
          />
        ) : (
          <span className="text-gray-400">No logo</span>
        ),
    },
    { 
      key: "created_at", 
      label: "Created At", 
      render: (row) => new Date(row.created_at).toLocaleDateString() 
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

  return <DataTable columns={columns} data={partners} actions={actions} />;
}

