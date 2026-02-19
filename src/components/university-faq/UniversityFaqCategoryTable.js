"use client";

import { Button } from "../ui/button";
import { Pencil, Trash } from "lucide-react";
import DataTable from "../table/DataTable"; 
import { createTableActions } from "@/utils/tableActions";

export default function UniversityFaqCategoryTable({ categories, onEdit, onDelete }) {
  const columns = [
    {
      key: "heading",
      label: "Heading",
      style: { width: "100%" },
      cellClassName: "border px-3 py-2 font-medium",
      headerClassName: "border px-3 py-2 text-left",
    },
    {
      key: "priority",
      label: "Priority",
      cellClassName: "border px-3 py-2",
      headerClassName: "border px-3 py-2 text-left",
    },
  ];

  const actions = createTableActions(onEdit, onDelete);

  return <DataTable columns={columns} data={categories} actions={actions} />;
}

