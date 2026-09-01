"use client";

import { useState } from "react";
import DataTable from "@/components/table/DataTable";

const defaultCellClass =
  "border px-2 py-1 align-middle whitespace-nowrap text-sm text-muted-foreground";

const MESSAGE_PREVIEW_LENGTH = 100;

function MessageCell({ message }) {
  const [expanded, setExpanded] = useState(false);
  const text = message || "";

  if (!text) return "-";

  const isLong = text.length > MESSAGE_PREVIEW_LENGTH;
  const displayText =
    !isLong || expanded ? text : `${text.slice(0, MESSAGE_PREVIEW_LENGTH).trim()}...`;

  return (
    <div className="max-w-md">
      <div className="break-words whitespace-pre-wrap">{displayText}</div>
      {isLong ? (
        <button
          type="button"
          className="mt-1 text-xs font-medium text-blue-600 hover:underline"
          onClick={() => setExpanded((prev) => !prev)}
        >
          {expanded ? "View less" : "View more"}
        </button>
      ) : null}
    </div>
  );
}

const columns = [
  {
    key: "name",
    label: "Name",
    style: { minWidth: "140px" },
    cellClassName: "border px-2 py-1 align-middle font-medium",
  },
  {
    key: "email",
    label: "Email",
    style: { minWidth: "150px" },
    cellClassName: defaultCellClass,
    render: (row) => row.email || "-",
  },
  {
    key: "phone",
    label: "Phone",
    style: { minWidth: "100px" },
    cellClassName: defaultCellClass,
    render: (row) => row.phone || "-",
  },
  {
    key: "message",
    label: "Message",
    style: { minWidth: "300px" },
    cellClassName: "border px-2 py-1 align-middle text-sm text-muted-foreground",
    contentClassName: "break-words whitespace-pre-wrap",
    render: (row) => <MessageCell message={row.message} />,
  },
  {
    key: "created_at",
    label: "Created Date",
    style: { minWidth: "150px" },
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

export default function ContactUsTable({ data = [], isLoading }) {
  if (isLoading) {
    return <p>Loading contact messages...</p>;
  }

  return <DataTable columns={columns} data={data} actions={[]} />;
}
