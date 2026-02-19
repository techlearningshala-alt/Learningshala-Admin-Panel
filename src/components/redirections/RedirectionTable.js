"use client";

import { Button } from "@/components/ui/button";
import { Pencil, Trash } from "lucide-react";
import DataTable from "../table/DataTable";
import { createTableActions } from "@/utils/tableActions";      
export default function RedirectionTable({ redirections, onEdit, onDelete }) {
  const actions = createTableActions(onEdit, onDelete);

  const columns = [
    {
      key: "old_url",
      label: "Old URL",
    },
    {
      key: "new_url",
      label: "New URL",
    },
    ];

  return (
    <DataTable columns={columns} data={redirections} actions={actions} />
  );
}
