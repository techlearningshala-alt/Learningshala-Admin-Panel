"use client";

import { Button } from "@/components/ui/button";
import { Pencil, Trash } from "lucide-react";
import DataTable from "../table/DataTable";

export default function DomainTable({ items, onEdit, onDelete }) {
  const columns = [
    { key: "id", label: "ID" },
    {
      key: "name",
      label: "Name",
      render: (row) => (
        <Button variant="link" onClick={() => onEdit(row)}>
          {row.name}
        </Button>
      ),
    },
    { key: "description", label: "Description" },
    { key: "priority", label: "Priority" },
    {
      key: "is_active",
      label: "Active",
      render: (row) => (row.is_active ? "Yes" : "No"),
    },
    {
      key: "menu_visibility",
      label: "Menu Visibility",
      render: (row) => (row.menu_visibility ? "Yes" : "No"),
    },
    {
      key: "updated_at",
      label: "Updated At",
      render: (row) => new Date(row.updated_at).toLocaleString(),
    },
  ];

  const actions = [
    {
      key: (props) => (
        <Button size="sm" variant="outline" onClick={() => onEdit(props.row)}>
          <Pencil />
        </Button>
      ),
    },
    {
      key: (props) => (
        <Button size="sm" variant="destructive" onClick={() => onDelete(props.row.id)}>
          <Trash /> 
        </Button>
      ),
    },
  ];

  return <DataTable columns={columns} data={items} actions={actions} />;
}
