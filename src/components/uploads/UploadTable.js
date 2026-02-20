"use client";

import { Button } from "@/components/ui/button";
import { FileText, Video } from "lucide-react";
import DataTable from "../table/DataTable";
import { createTableActions } from "@/utils/tableActions";
import { usePermissions } from "@/hooks/usePermissions";

const baseUrl = process.env.NEXT_PUBLIC_thumbnail_URL || "";

export default function UploadTable({ items, onEdit, onDelete, page = 1, limit = 10, isFiltered = false }) {
  const { canRead } = usePermissions();

  const columns = [
    {
      key: "sr_no",
      label: "Sr. No.",
      render: (row, index) =>
        isFiltered ? index + 1 : (page - 1) * limit + index + 1,
    },
    {
      key: "image",
      label: "Image",
      render: (row) => {
        const path = row.file_path || row.image || "";
        const type = (row.file_type || "").toLowerCase();
        const pathLower = path ? path.toLowerCase() : "";
        const isPdf = type === "pdf" || pathLower.endsWith(".pdf");
        const isVideo = type === "video" || pathLower.match(/\.(mp4|webm|ogg|mov)$/);
        if (isPdf) {
          return (
            <div className="flex items-center justify-center h-16 w-16 rounded border bg-gray-100">
              <FileText className="h-8 w-8 text-red-500" />
            </div>
          );
        }
        if (isVideo) {
          return (
            <div className="flex items-center justify-center h-16 w-16 rounded border bg-gray-100">
              <Video className="h-8 w-8 text-blue-500" />
            </div>
          );
        }
        if (path) {
          return (
            <img
              src={`${baseUrl}${path}`}
              alt={row.name || "Upload"}
              className="h-16 w-16 object-contain rounded border"
            />
          );
        }
        return <span className="text-muted-foreground">No file</span>;
      },
    },
    {
      key: "file_path",
      label: "Complete Image / File Path",
      cellClassName: "text-gray-900 px-2 py-2 align-top whitespace-normal break-all min-w-[200px] max-w-[500px]",
      render: (row) => {
        const path = row.file_path || row.image || "";
        if (!path) return <span className="text-muted-foreground">—</span>;
        const fullPath = path.startsWith("http") ? path : `${baseUrl}${path}`;
        return (
          <span className="text-gray-700 text-xs" title={fullPath}>
            {fullPath}
          </span>
        );
      },
    },
    {
      key: "name",
      label: "Name",
      render: (row) =>
        canRead ? (
          <Button variant="link" onClick={() => onEdit(row)}>
            {row.name || "—"}
          </Button>
        ) : (
          <span className="text-gray-700">{row.name || "—"}</span>
        ),
    },
    {
      key: "file_type",
      label: "Type",
      render: (row) => {
        const path = row.file_path || row.image || "";
        const type = (row.file_type || "").toLowerCase();
        const pathLower = path ? path.toLowerCase() : "";
        if (type === "pdf" || pathLower.endsWith(".pdf")) return <span>PDF</span>;
        if (type === "video" || pathLower.match(/\.(mp4|webm|ogg|mov)$/)) return <span>Video</span>;
        return <span>Image</span>;
      },
    },
    {
      key: "updated_at",
      label: "Updated At",
      render: (row) => (row.updated_at ? new Date(row.updated_at).toLocaleDateString() : "—"),
    },
  ];

  const actions = createTableActions(onEdit, onDelete);

  return <DataTable columns={columns} data={items} actions={actions} />;
}
