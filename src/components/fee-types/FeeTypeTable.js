import DataTable from "@/components/table/DataTable";
import { Button } from "@/components/ui/button";
import { Pencil, Trash } from "lucide-react";
import PermissionGuard from "@/components/common/PermissionGuard";

const columns = [
  {
    key: "index",
    label: "ID",
    style: { width: "60px" },
    render: (_, index) => index + 1,
    cellClassName: "border px-2 py-1 align-middle text-center",
  },
  {
    key: "title",
    label: "Title",
    style: { width: "35%" },
    cellClassName: "border px-2 py-1 align-middle font-medium",
  },
  {
    key: "updated_at",
    label: "Updated",
    style: { width: "40%" },
    cellClassName: "border px-2 py-1 align-middle whitespace-nowrap text-muted-foreground",
    render: (row) =>
      row.updated_at ? new Date(row.updated_at).toLocaleDateString() : "-",
  },
];

export default function FeeTypeTable({ data = [], isLoading, onEdit, onDelete }) {
  const actions = [
    {
      key: ({ row }) => (
        <PermissionGuard permission="update">
          <Button
            size="sm"
            variant="ghost"
            type="button"
            className="h-8 w-8 p-0"
            onClick={() => onEdit?.(row)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </PermissionGuard>
      ),
    },
    {
      key: ({ row }) => (
        <PermissionGuard permission="delete">
          <Button
            size="sm"
            variant="ghost"
            type="button"
            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            onClick={() => onDelete?.(row)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </PermissionGuard>
      ),
    },
  ];

  if (isLoading) {
    return <p>Loading fee types...</p>;
  }

  return <DataTable columns={columns} data={data} actions={actions} />;
}


