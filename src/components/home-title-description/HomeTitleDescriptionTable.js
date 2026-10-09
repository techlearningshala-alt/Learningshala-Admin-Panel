"use client";

import { Button } from "../ui/button";
import DataTable from "../table/DataTable";
import { createTableActions } from "@/utils/tableActions";
import { usePermissions } from "@/hooks/usePermissions";

export default function HomeTitleDescriptionTable({ items, onEdit, onDelete }) {
  const { canRead } = usePermissions();

  const columns = [
    {
      key: "sr_no",
      label: "Sr. No.",
      render: (_row, index) => index + 1,
      style: { width: "80px" },
    },
    {
      key: "meta_title",
      label: "Meta Title",
      wrap: true,
      style: { minWidth: "200px", maxWidth: "320px" },
      cellClassName:
        "whitespace-normal break-words text-left align-top overflow-hidden max-w-[320px]",
      render: (row) =>
        canRead ? (
          <Button
            variant="link"
            onClick={() => onEdit(row)}
            title={row.meta_title}
            className="h-auto min-h-0 whitespace-normal break-words text-left justify-start items-start py-0 px-0 w-full max-w-full shrink font-medium leading-5"
          >
            {row.meta_title || "-"}
          </Button>
        ) : (
          <span className="text-gray-700 whitespace-normal break-words block leading-5">
            {row.meta_title || "-"}
          </span>
        ),
    },
    {
      key: "meta_description",
      label: "Meta Description",
      wrap: true,
      style: { minWidth: "260px", maxWidth: "420px" },
      cellClassName:
        "whitespace-normal break-words text-left align-top overflow-hidden max-w-[420px]",
      render: (row) => (
        <span
          title={row.meta_description}
          className="text-gray-700 whitespace-normal break-words block leading-5"
        >
          {row.meta_description || "-"}
        </span>
      ),
    },
    {
      key: "updated_at",
      label: "Updated",
      render: (row) =>
        row.updated_at ? new Date(row.updated_at).toLocaleDateString() : "-",
    },
  ];

  const actions = createTableActions(onEdit, onDelete);

  return <DataTable columns={columns} data={items} actions={actions} />;
}
