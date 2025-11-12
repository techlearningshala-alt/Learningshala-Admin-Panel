"use client";

import { Button } from "../ui/button";
import { Pencil, Trash } from "lucide-react";
import DataTable from "../table/DataTable";

export default function MediaSpotlightTable({ items, onEdit, onDelete }) {
  const columns = [
    { key: "id", label: "ID", width: "6%", style: { width: "6%" } },
    {
      key: "title",
      label: "Title",
      width: "50%",
      style: { width: "50%" },
      cellClassName: "border px-2 py-1 align-middle",
      render: (row) => (
        <Button variant="link" onClick={() => onEdit(row)}>
          {row.title}
        </Button>
      ),
    },
    {
      key: "logo",
      label: "Logo",
      width: "12%",
      style: { width: "12%" },
      render: (row) =>
        row.logo ? (
          <img
            src={`${process.env.NEXT_PUBLIC_thumbnail_URL}${row.logo}`}
            alt="logo"
            className="h-10 w-10 object-contain rounded"
          />
        ) : null,
    },
    {
      key: "link",
      label: "Link",
      width: "15%",
      style: { width: "15%" },
      cellClassName: "border px-2 py-1 align-middle",
      render: (row) => (
        <a
          href={row.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline hover:text-blue-800"
        >
          {row.link}
        </a>
      ),
    },
    {
      key: "updated_at",
      label: "Updated At",
      width: "10%",
      style: { width: "10%" },
      cellClassName: "border px-2 py-1 align-middle whitespace-nowrap",
      contentClassName: "whitespace-nowrap",
      render: (row) => new Date(row.updated_at).toLocaleDateString(),
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

  return <DataTable columns={columns} data={items} actions={actions} />;
}
