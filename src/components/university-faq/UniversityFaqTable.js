"use client";

import { Button } from "@/components/ui/button";
import DataTable from "@/components/table/DataTable";
import { Pencil, Trash } from "lucide-react";

export default function UniversityFaqTable({ data, onEdit, onDelete }) {
  const columns = [
    { key: "university_name", label: "University" },
    { key: "title", label: "Question" },
    { key: "description", label: "Answer" },
    { key: "heading", label: "Category" },
    // { key: "updated_at", label: "Updated Date", render: (row) => new Date(row.updated_at).toLocaleDateString() },
    {
      key: "actions",
      label: "Actions",
      render: (item) => (
        <div className="flex gap-1">
          <Button size="sm" variant="outline" onClick={() => onEdit(item)}>
            <Pencil className="h-2 w-2" />
          </Button>
          <Button size="sm" variant="destructive" onClick={() => onDelete(item.id)}>
            <Trash className="h-2 w-2" />
          </Button>
        </div>
      ),
    },
  ];

  return <DataTable columns={columns} data={data} />;
}

