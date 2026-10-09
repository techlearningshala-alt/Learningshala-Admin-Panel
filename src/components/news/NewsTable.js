"use client";

import { Button } from "../ui/button";
import { Pencil, Trash } from "lucide-react";
import DataTable from "../table/DataTable";
import { createTableActions } from "@/utils/tableActions";
import { usePermissions } from "@/hooks/usePermissions";

export default function NewsTable({ items, onEdit, onDelete, onToggleVerified }) {
  const { canUpdate } = usePermissions();

  const columns = [
    {
      key: "title",
      label: "Title",
      wrap: true,
      style: { minWidth: "220px", maxWidth: "360px" },
      cellClassName:
        "whitespace-normal break-words text-left align-top overflow-hidden max-w-[360px]",
      render: (row) => {
        const value = row.h1_tag || row.title || "-";
        return canUpdate && onEdit ? (
          <Button
            variant="link"
            onClick={() => onEdit(row)}
            title={value}
            className="h-auto min-h-0 whitespace-normal break-words text-left justify-start items-start py-0 px-0 w-full max-w-full shrink font-medium leading-5"
          >
            {value}
          </Button>
        ) : (
          <span
            title={value}
            className="text-gray-700 whitespace-normal break-words text-left block leading-5"
          >
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
    },
    {
      key: "verifier_name",
      label: "Verifier",
      render: (row) => row.verifier_name || "-",
    },
  ];

  const actions = createTableActions(onEdit, onDelete, {
    editUrl: (row) => `/news/edit/${row.id}`,
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
