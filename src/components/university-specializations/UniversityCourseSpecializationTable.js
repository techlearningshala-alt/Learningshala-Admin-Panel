"use client";

import DataTable from "@/components/table/DataTable";
import { Button } from "@/components/ui/button";
import { Pencil, Trash } from "lucide-react";

export default function UniversityCourseSpecializationTable({ specializations = [], onEdit, onDelete }) {
  const columns = [
    {
      key: "course_name",
      label: "Course",
      style: { width: "20%" },
      cellClassName: "border px-2 py-1 align-middle font-medium",
      render: (row) => row.course_name || "-",
    },
    {
      key: "name",
      label: "Specialization",
      style: { width: "25%" },
      cellClassName: "border px-2 py-1 align-middle font-medium",
    },
    {
      key: "duration",
      label: "Duration",
      style: { width: "15%" },
      cellClassName: "border px-2 py-1 align-middle text-muted-foreground",
      render: (row) => row.duration || "-",
    },
    {
      key: "full_fees",
      label: "Full Fees",
      style: { width: "15%" },
      cellClassName: "border px-2 py-1 align-middle text-muted-foreground",
      render: (row) => (row.full_fees ? `₹${Number(row.full_fees).toLocaleString()}` : "-"),
    },
    {
      key: "sem_fees",
      label: "Sem Fees",
      style: { width: "15%" },
      cellClassName: "border px-2 py-1 align-middle text-muted-foreground",
      render: (row) => (row.sem_fees ? `₹${Number(row.sem_fees).toLocaleString()}` : "-"),
    },
    {
      key: "label",
      label: "Label",
      style: { width: "10%" },
      cellClassName: "border px-2 py-1 align-middle",
      render: (row) => row.label || "-",
    },
  ];

  const actions = [
    {
      key: ({ row }) => (
        <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => onEdit?.(row)}>
          <Pencil className="h-4 w-4" />
        </Button>
      ),
    },
    {
      key: ({ row }) => (
        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
          onClick={() => onDelete?.(row)}
        >
          <Trash className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return <DataTable columns={columns} data={specializations} actions={actions} />;
}
