"use client";

import { Button } from "../ui/button";
import { Pencil, Trash } from "lucide-react";
import DataTable from "../table/DataTable";
import PermissionGuard from "../common/PermissionGuard";
import { usePermissions } from "@/hooks/usePermissions";

export default function WebsiteBannerTable({ banners, onEdit, onDelete }) {
  const { canRead } = usePermissions();

  const columns = [
    {
      key: "sr_no",
      label: "Sr. No.",
      render: (row, index) => index + 1,
      style: { width: "80px" },
      headerClassName: "border px-2 py-1 text-left",
      cellClassName: "border px-2 py-1 text-left",
    },
    {
      key: "banner_image",
      label: "Banner Image",
      render: (row) =>
        row.banner_image ? (
          <img
            src={`${process.env.NEXT_PUBLIC_thumbnail_URL}${row.banner_image}`}
            className="h-16 w-32 object-cover rounded"
            alt="Banner"
          />
        ) : (
          <span className="text-gray-400">No image</span>
        ),
    },
    {
      key: "video_id",
      label: "Video ID",
      render: (row) => row.video_id || "-",
    },
    {
      key: "video_title",
      label: "Video Title",
      render: (row) => row.video_title || "-",
    },
    {
      key: "url",
      label: "URL",
      render: (row) =>
        row.url ? (
          <a
            href={row.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline truncate max-w-xs block"
          >
            {row.url}
          </a>
        ) : (
          "-"
        ),
    },
    {
      key: "banner_type",
      label: "Banner Type",
      render: (row) => {
        const type = row.banner_type || "website";
        return (
          <span className="capitalize px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
            {type}
          </span>
        );
      },
    },
    {
      key: "updated_at",
      label: "Updated At",
      render: (row) => new Date(row.updated_at).toLocaleDateString(),
    },
  ];

  const actions = [
    {
      key: (props) => (
        <PermissionGuard permission="update">
          <Button size="sm" variant="outline" onClick={() => onEdit(props.row)}>
            <Pencil className="h-4 w-4" />
          </Button>
        </PermissionGuard>
      ),
    },
    {
      key: (props) => (
        <PermissionGuard permission="delete">
          <Button size="sm" variant="destructive" onClick={() => onDelete(props.row.id)}>
            <Trash className="h-4 w-4" />
          </Button>
        </PermissionGuard>
      ),
    },
  ];

  return <DataTable columns={columns} data={banners} actions={actions} />;
}
