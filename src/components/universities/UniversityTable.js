"use client";

import { Button } from "@/components/ui/button";
import { Pencil, Trash } from "lucide-react";
import DataTable from "../table/DataTable";
import PermissionGuard from "../common/PermissionGuard";
import { usePermissions } from "@/hooks/usePermissions";

export default function UniversityTable({ items, onEdit, onDelete, onToggleStatus, onTogglePageCreated }) {
  const { canRead, canUpdate } = usePermissions();

  const columns = [
    // {
    //   key: "index",
    //   label: "ID",
    //   style: { width: "60px" },
    //   render: (_, index) => index + 1,
    //   cellClassName: "border px-2 py-1 align-middle text-center",
    // },
    {
      key: "university_name",
      label: "University Name",
      render: (row) =>
        canRead ? (
          <Button variant="link" onClick={() => onEdit(row)}>
            {row.university_name}
          </Button>
        ) : (
          <span className="text-gray-700">{row.university_name}</span>
        ),
    },
    {
      key: "university_slug",
      label: "University Slug",
      render: (row) =>
        canRead ? (
          <Button variant="link" onClick={() => onEdit(row)}>
            {row.university_slug}
          </Button>
        ) : (
          <span className="text-gray-700">{row.university_slug}</span>
        ),
    },
    {
      key: "is_active",
      label: "Active / Inactive",
      render: (row) =>
        canUpdate ? (
          <Button
            size="sm"
            variant={row.is_active ? "default" : "outline"}
            className={row.is_active ? "" : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300"}
            onClick={() => onToggleStatus(row.id, !row.is_active)}
          >
            {row.is_active ? "Active" : "Inactive"}
          </Button>
        ) : (
          <span className={row.is_active ? "text-green-600" : "text-gray-500"}>
            {row.is_active ? "Active" : "Inactive"}
          </span>
        ),
    },
    {
      key: "menu_visibility",
      label: "Visibility",
      render: (row) =>
        canUpdate ? (
          <Button
            size="sm"
            variant={row.menu_visibility ? "default" : "outline"}
            className={row.menu_visibility ? "" : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300"}
            onClick={() => onTogglePageCreated?.(row.id, !row.menu_visibility)}
          >
            {row.menu_visibility ? "Visible" : "Hidden"}
          </Button>
        ) : (
          <span className={row.menu_visibility ? "text-green-600" : "text-gray-500"}>
            {row.menu_visibility ? "Visible" : "Hidden"}
          </span>
        ),
    },
    {
      key: "university_logo",
      label: "Logo",
      render: (row) =>
        row.university_logo ? (
          <img src={`${process.env.NEXT_PUBLIC_thumbnail_URL}${row.university_logo}`} className="h-10 w-10 object-contain" />
        ) : null,
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
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onDelete(props.row.id)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </PermissionGuard>
      ),
    },
  ];

  return <DataTable columns={columns} data={items} actions={actions} />;
}
