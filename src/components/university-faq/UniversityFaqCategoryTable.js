"use client";

import { Button } from "../ui/button";
import { Pencil, Trash } from "lucide-react";
import DataTable from "../table/DataTable";
import PermissionGuard from "../common/PermissionGuard";

export default function UniversityFaqCategoryTable({ categories, onEdit, onDelete }) {
  const columns = [
    {
      key: "heading",
      label: "Heading",
      style: { width: "100%" },
      cellClassName: "border px-3 py-2 font-medium",
      headerClassName: "border px-3 py-2 text-left",
    },
  ];

  const actions = [
    {
      key: (props) => (
        <PermissionGuard permission="update">
          <Button
            size="sm"
            variant="ghost"
            type="button"
            className="h-8 w-8 p-0"
            onClick={() => onEdit(props.row)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </PermissionGuard>
      ),
    },
    {
      key: (props) => (
        <PermissionGuard permission="delete">
          <Button
            size="sm"
            variant="ghost"
            type="button"
            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            onClick={() => onDelete(props.row.id)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </PermissionGuard>
      ),
    },
  ];

  return <DataTable columns={columns} data={categories} actions={actions} />;
}

