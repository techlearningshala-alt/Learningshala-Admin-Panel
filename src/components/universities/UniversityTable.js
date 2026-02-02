"use client";

import { Button } from "@/components/ui/button";
import { Pencil, Trash } from "lucide-react";
import DataTable from "../table/DataTable";
import PermissionGuard from "../common/PermissionGuard";
import { usePermissions } from "@/hooks/usePermissions";

export default function UniversityTable({ items, onEdit, onDelete, onToggleStatus, onTogglePageCreated, onToggleMenuVisibility }) {
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
      style: { width: "200px", maxWidth: "200px" },
      cellClassName: "px-6 py-4 align-middle",
      render: (row) =>
        canRead ? (
          <Button 
            variant="link" 
            onClick={() => onEdit(row)}
            className="text-gray-600 hover:text-blue-700 font-medium hover:underline p-0 h-auto break-words whitespace-normal text-left"
          >
            {row.university_name}
          </Button>
        ) : (
          <span className="text-gray-900 font-medium break-words whitespace-normal">
            {row.university_name}
          </span>
        ),
    },
    {
      key: "university_slug",
      label: "University Slug",
      style: { width: "200px", maxWidth: "200px" },
      cellClassName: "px-6 py-4 align-middle",
      render: (row) =>
        canRead ? (
          <Button 
            variant="link" 
            onClick={() => onEdit(row)}
            className="text-gray-600 hover:text-blue-700 font-medium hover:underline p-0 h-auto break-words whitespace-normal text-left"
          >
            <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-700 break-words whitespace-normal inline-block max-w-full">{row.university_slug}</code>
          </Button>
        ) : (
          <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-700 break-words whitespace-normal inline-block max-w-full">{row.university_slug}</code>
        ),
    },
    {
      key: "is_active",
      label: "Status",
      render: (row) =>
        canUpdate ? (
          <Button
            size="sm"
            variant={row.is_active ? "default" : "outline"}
            className={
              row.is_active 
                ? "bg-gradient-to-r from-green-400 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 shadow-sm" 
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300"
            }
            onClick={() => onToggleStatus(row.id, !row.is_active)}
          >
            {row.is_active ? "Active" : "Inactive"}
          </Button>
        ) : (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            row.is_active 
              ? "bg-green-100 text-green-800" 
              : "bg-gray-100 text-gray-800"
          }`}>
            {row.is_active ? "Active" : "Inactive"}
          </span>
        ),
    },
    {
      key: "is_page_created",
      label: "Page Created",
      render: (row) =>
        canUpdate ? (
          <Button
            size="sm"
            variant={row.is_page_created ? "default" : "outline"}
            className={
              row.is_page_created 
                ? "bg-gradient-to-r from-blue-400 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0 shadow-sm" 
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300"
            }
            onClick={() => onTogglePageCreated?.(row.id, !row.is_page_created)}
          >
            {row.is_page_created ? "Yes" : "No"}
          </Button>
        ) : (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            row.is_page_created 
              ? "bg-blue-100 text-blue-800" 
              : "bg-gray-100 text-gray-800"
          }`}>
            {row.is_page_created ? "Yes" : "No"}
          </span>
        ),
    },
    {
      key: "menu_visibility",
      label: "Home Page Visibility",
      render: (row) =>
        canUpdate ? (
          <Button
            size="sm"
            variant={row.menu_visibility ? "default" : "outline"}
            className={
              row.menu_visibility 
                ? "bg-gradient-to-r from-purple-400 to-pink-500 hover:from-purple-600 hover:to-pink-700 text-white border-0 shadow-sm" 
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300"
            }
            onClick={() => onToggleMenuVisibility?.(row.id, !row.menu_visibility)}
          >
            {row.menu_visibility ? "Visible" : "Hidden"}
          </Button>
        ) : (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            row.menu_visibility 
              ? "bg-purple-100 text-purple-800" 
              : "bg-gray-100 text-gray-800"
          }`}>
            {row.menu_visibility ? "Visible" : "Hidden"}
          </span>
        ),
    },
    {
      key: "university_logo",
      label: "Logo",
      render: (row) =>
        row.university_logo ? (
          <div className="flex items-center justify-center">
            <img 
              src={`${process.env.NEXT_PUBLIC_thumbnail_URL}${row.university_logo}`} 
              className="h-12 w-12 object-contain rounded-lg border border-gray-200 shadow-sm bg-white p-1" 
              alt={row.university_name}
            />
          </div>
        ) : (
          <span className="text-gray-400 text-xs">No logo</span>
        ),
    },
    {
      key: "updated_at",
      label: "Updated At",
      render: (row) => (
        <span className="text-gray-600 text-sm">
          {new Date(row.updated_at).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
          })}
        </span>
      ),
    },
  ];

  const actions = [
    {
      key: (props) => (
        <PermissionGuard permission="update">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => onEdit(props.row)}
            className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-colors"
          >
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
            variant="outline"
            onClick={() => onDelete(props.row.id)}
            className="hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-all"
          >
            <Trash className="h-4 w-4" />
          </Button>
        </PermissionGuard>
      ),
    },
  ];

  return <DataTable columns={columns} data={items} actions={actions} />;
}
