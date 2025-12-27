"use client";

import DataTable from "@/components/table/DataTable";
import { maskEmail, maskPhone } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";

const defaultCellClass =
  "border px-2 py-1 align-middle whitespace-nowrap text-sm text-muted-foreground";
const defaultColumnStyle = { minWidth: "160px" };

const columns = [
  {
    key: "index",
    label: "Sr. No.",
    style: { width: "80px" },
    cellClassName: `${defaultCellClass} text-center`,
    render: (_row, index) => index + 1,
  },
  {
    key: "name",
    label: "Name",
    style: { minWidth: "200px" },
    cellClassName: "border px-2 py-1 align-middle font-medium",
  },
  {
    key: "email",
    label: "Email",
    style: { minWidth: "220px" },
    cellClassName: defaultCellClass,
    render: (row) => maskEmail(row.email),
  },
  {
    key: "phone",
    label: "Phone",
    style: { minWidth: "100px" },
    cellClassName: defaultCellClass,
    render: (row) => maskPhone(row.phone),
  },
  {
    key: "message",
    label: "Message",
    style: { minWidth: "300px" },
    cellClassName: defaultCellClass,
    contentClassName: "break-words whitespace-pre-wrap",
    render: (row) => {
      const message = row.message || "";
      if (message.length > 100) {
        return (
          <div className="max-w-md">
            <div className="line-clamp-3">{message}</div>
          </div>
        );
      }
      return message || "-";
    },
  },
  {
    key: "created_at",
    label: "Created Date",
    style: { minWidth: "220px" },
    cellClassName: defaultCellClass,
    render: (row) => {
      if (!row.created_at) return "-";
      const date = new Date(row.created_at);
      return Number.isNaN(date.getTime())
        ? "-"
        : `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}`;
    },
  },
];

export default function ContactUsTable({ data = [], isLoading, onDelete }) {
  if (isLoading) {
    return <p>Loading contact messages...</p>;
  }

  const actions = onDelete
    ? [
        {
          key: (props) => (
            <Button
              size="sm"
              variant="ghost"
              type="button"
              onClick={() => onDelete(props.row.id)}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              title="Delete"
            >
              <Trash className="h-4 w-4" />
            </Button>
          ),
        },
      ]
    : [];

  return <DataTable columns={columns} data={data} actions={actions} />;
}

