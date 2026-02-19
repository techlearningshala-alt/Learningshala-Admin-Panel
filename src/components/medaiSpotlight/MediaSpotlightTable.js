"use client";

import { Button } from "../ui/button";
import { Pencil, Trash } from "lucide-react";
import DataTable from "../table/DataTable";
import { createTableActions } from "@/utils/tableActions";
import { usePermissions } from "@/hooks/usePermissions";

export default function MediaSpotlightTable({ items, onEdit, onDelete }) {
  const { canRead } = usePermissions();

  const columns = [
    {
      key: "sr_no",
      label: "Sr. No.",
      render: (row, index) => index + 1,
      style: { width: "80px" },
      headerClassName: "border px-2 py-1 text-left",
      cellClassName: "border px-2 py-1 text-left",
    },
    {
      key: "title",
      label: "Title",
      width: "50%",
      style: { width: "50%" },
      cellClassName: "border px-2 py-1 align-middle",
      render: (row) =>
        canRead ? (
          <Button variant="link" onClick={() => onEdit(row)}>
            {row.title}
          </Button>
        ) : (
          <span className="text-gray-700">{row.title}</span>
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

    const actions = createTableActions(onEdit, onDelete);


  return <DataTable columns={columns} data={items} actions={actions} />;
}
