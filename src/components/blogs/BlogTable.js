"use client";

import { Button } from "../ui/button";
import { Pencil, Trash } from "lucide-react";
import DataTable from "../table/DataTable";
import { createTableActions } from "@/utils/tableActions";
import { usePermissions } from "@/hooks/usePermissions";

export default function BlogTable({ items, onEdit, onDelete, onToggleVerified }) {
  const { canUpdate } = usePermissions();

  const columns = [
    {
      key: "title",
      label: "Title",
      wrap: true,
      // className: "bg-blue-500",
      cellClassName: "whitespace-normal break-words text-left align-top",
      render: (row) => {
        const value = row.h1_tag || row.title || "-";
        return canUpdate && onEdit ? (
          <Button
            variant="link"
            onClick={() => onEdit(row)}
            className="whitespace-normal break-words text-left block w-full"
          >
            {value}
          </Button>
        ) : (
          <span className="text-gray-700 whitespace-normal break-words text-left block">
            {value}
          </span>
        );
      },
    },
    {
      key: "category_title",
      label: "Category",
      render: (row) => {
        return row.category_title ? row.category_title : "-";
      },
    },
    {
      key: "author_name",
      label: "Author",
      render: (row) => {
        return row.author_name ? row.author_name : "-";
      },
    }
  ];

  const actions = createTableActions(onEdit, onDelete, {
    editUrl: (row) => `/blogs/edit/${row.id}`,
  });

  const columnsAfterActions = [
    {
      key: "verified",
      label: "Act/Deact",
      render: (row) =>
        canUpdate && onToggleVerified ? (
          <Button
            size="sm"
            variant={row.verified ? "default" : "outline"}
            onClick={() => onToggleVerified(row.id, !row.verified)}
            className={
              row.verified
                ? "bg-gradient-to-r from-blue-400 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0 shadow-sm"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300"
            }
          >
            {row.verified ? "Active" : "Inactive"}
          </Button>
        ) : (
          <span className="text-gray-700">{row.verified ? "Active" : "Inactive"}</span>
        ),
    },
    {
      key: "created_at",
      label: "Created",
      render: (row) => (
        <span>
          {row.created_at ? new Date(row.created_at).toLocaleDateString() : "-"}
        </span>
      ),
    },
    {
      key: "updated_at",
      label: "Updated",
      render: (row) => (
        <span className="">
          {row.updated_at ? new Date(row.updated_at).toLocaleDateString() : "-"}
        </span>
      ),
    },
  ];

  return <DataTable columns={columns} data={items} actions={actions} columnsAfterActions={columnsAfterActions} />;
}
