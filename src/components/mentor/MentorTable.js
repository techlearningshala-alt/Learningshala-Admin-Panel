"use client";

import DataTable from "../table/DataTable";
import { usePermissions } from "@/hooks/usePermissions";
import { createTableActions } from "@/utils/tableActions";
import { Button } from "../ui/button";

export default function MentorTable({ mentors, onEdit, onDelete }) {
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
      key: "name",
      label: "Name",
      render: (row) =>
        canRead ? (
          <Button size="sm" variant="link" onClick={() => onEdit(row)}>
            {row.name}
          </Button>
        ) : (
          <span className="text-gray-700">{row.name}</span>
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

    const actions = createTableActions(onEdit, onDelete);

  return <DataTable columns={columns} data={mentors} actions={actions} />;
}
