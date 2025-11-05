"use client";

import { Button } from "../ui/button";
import { Pencil, Trash } from "lucide-react";
import DataTable from "../table/DataTable";

export default function MentorTable({ mentors, onEdit, onDelete }) {
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
    { key: "experience", label: "Experience", render: (row) => `${row.experience} yrs` },
    { key: "assist_student", label: "Student Assist" },
    { key: "label", label: "Label" },
    { key: "verified", label: "Verified", render: (row) => (row.verified ? "Yes" : "No") },
    { key: "updated_at", label: "Updated At",render: (row) => new Date(row.updated_at).toLocaleDateString(),},
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

  return <DataTable columns={columns} data={mentors} actions={actions} />;
}
