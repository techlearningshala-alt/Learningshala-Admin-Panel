"use client";

import { Button } from "@/components/ui/button";
import DataTable from "@/components/table/DataTable";
import { createTableActions } from "@/utils/tableActions";
import { usePermissions } from "@/hooks/usePermissions";

const formatUniversityLabel = (pair, index) => {
  if (!pair) return null;
  const university = pair.university_name || "-";
  const course = pair.course_name || "-";
  return `University ${index + 1}: ${university} / ${course}`;
};

export default function CompareTable({ items, onEdit, onDelete }) {
  const { canRead } = usePermissions();

  const columns = [
    {
      key: "sr_no",
      label: "Sr. No.",
      render: (_row, index) => index + 1,
      style: { width: "80px" },
    },
    {
      key: "title",
      label: "Title",
      render: (row) =>
        canRead ? (
          <Button variant="link" onClick={() => onEdit(row)}>
            {row.title || `Compare #${row.id}`}
          </Button>
        ) : (
          <span>{row.title || `Compare #${row.id}`}</span>
        ),
    },
    {
      key: "description",
      label: "Description",
      wrap: true,
      render: (row) => row.description || "-",
    },
    {
      key: "university_url",
      label: "University URL",
      wrap: true,
      render: (row) =>
        row.university_url ? (
          <a
            href={row.university_url}
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 underline break-all"
          >
            {row.university_url}
          </a>
        ) : (
          "-"
        ),
    },
    {
      key: "pairs",
      label: "Universities",
      wrap: true,
      render: (row) => {
        const pairs = Array.isArray(row.pairs) ? row.pairs : [];
        if (!pairs.length) return "-";
        return (
          <div className="space-y-1 text-left">
            {pairs.map((pair, index) => (
              <div key={pair.id || index}>
                {formatUniversityLabel(pair, index)}
              </div>
            ))}
          </div>
        );
      },
    },
    {
      key: "created_at",
      label: "Created On",
      render: (row) => {
        if (!row.created_at) return "-";
        const date = new Date(row.created_at);
        return isNaN(date.getTime())
          ? "-"
          : `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}`;
      },
    },
  ];

  const actions = createTableActions(onEdit, onDelete);

  return <DataTable columns={columns} data={items || []} actions={actions} />;
}
