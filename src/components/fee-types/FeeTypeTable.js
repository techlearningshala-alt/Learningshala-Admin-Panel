import DataTable from "@/components/table/DataTable";
import { Button } from "@/components/ui/button";
import { Pencil, Trash } from "lucide-react"; 
import { createTableActions } from "@/utils/tableActions";

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
      const actions = createTableActions(onEdit, onDelete);

  if (isLoading) {
    return <p>Loading fee types...</p>;
  }

  return <DataTable columns={columns} data={data} actions={actions} />;
}


