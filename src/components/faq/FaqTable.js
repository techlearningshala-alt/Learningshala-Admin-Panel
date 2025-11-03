"use client";

import { Button } from "@/components/ui/button";
import DataTable from "@/components/table/DataTable";

export default function FaqTable({ data, onEdit, onDelete }) {
  console.log(data,"data")
  const columns = [
    { key: "title", label: "Question" },
    { key: "description", label: "Answer" },
    { key: "heading", label: "Category" },
    { key: "updated_at", label: "Updated Date",render: (row) => new Date(row.updated_at).toLocaleDateString(), },
    {
      key: "actions",
      label: "Actions",
      render: (item) => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => onEdit(item)}>
            Edit
          </Button>
          <Button size="sm" variant="destructive" onClick={() => onDelete(item.id)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return <DataTable columns={columns} data={data} />;
}
