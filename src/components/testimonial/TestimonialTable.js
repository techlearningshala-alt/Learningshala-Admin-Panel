"use client";

import { Button } from "../ui/button";
import { Pencil, Trash } from "lucide-react";
import DataTable from "../table/DataTable";

export default function TestimonialTable({ testimonials, onEdit, onDelete }) {
  const columns = [
    { key: "id", label: "ID" },
    {
      key: "name",
      label: "Name",
      render: (row) => (
        <Button variant="link" onClick={() => onEdit(row)}>
          {row.name}
        </Button>
      ),
    },
    { key: "video_title", label: "Video Title" },
    {
      key: "video_id",
      label: "Video ID",
      render: (row) => (
        <a
          href={`https://youtube.com/watch?v=${row.video_id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline hover:text-blue-800"
        >
          {row.video_id}
        </a>
      ),
    },
    {
      key: "thumbnail",
      label: "Thumbnail",
      render: (row) =>
        row.thumbnail ? (
          <img
            src={`${process.env.NEXT_PUBLIC_thumbnail_URL}${row.thumbnail}`}
            className="h-10 w-10 object-cover rounded"
          />
        ) : null,
    },
    {
      key: "updated_at",
      label: "Updated At",
      render: (row) => new Date(row.updated_at).toLocaleString(),
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

  return <DataTable columns={columns} data={testimonials} actions={actions} />;
}
