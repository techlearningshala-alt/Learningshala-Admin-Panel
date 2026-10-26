"use client";

import { Button } from "@/components/ui/button";
import { Pencil, Trash } from "lucide-react";
import DataTable from "../table/DataTable";
import { createTableActions } from "@/utils/tableActions";
import { usePermissions } from "@/hooks/usePermissions";  

export default function UniversityTable({ items, onEdit, onDelete, onToggleStatus, onTogglePageCreated, onToggleMenuVisibility, onToggleProvideEmi, onToggleCompare }) {
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
      key: "priority",
      label: "Priority",
      render: (row) => (
        <span className="text-gray-700">{row.priority ?? "—"}</span>
      ),
    },
    {
      key: "university_name",
      label: "University Name",
      wrap: true,
      style: { minWidth: "200px", maxWidth: "360px" },
      cellClassName:
        "whitespace-normal break-words text-left align-top overflow-hidden max-w-[360px]",
      render: (row) =>
        canRead && onEdit ? (
          <Button 
            variant="link" 
            onClick={() => onEdit(row)}
            title={row.university_name}
            className="h-auto min-h-0 whitespace-normal break-words text-left justify-start items-start py-0 px-0 w-full max-w-full shrink font-medium leading-5 hover:text-blue-700 hover:underline"
          >
            {row.university_name}
          </Button>
        ) : (
          <span
            title={row.university_name}
            className="font-medium whitespace-normal break-words text-left block leading-5"
          >
            {row.university_name}
          </span>
        ),
    },
    {
      key: "university_slug",
      label: "University Slug",
      wrap: true,
      style: { minWidth: "160px", maxWidth: "280px" },
      cellClassName:
        "whitespace-normal break-words text-left align-top overflow-hidden max-w-[280px]",
      render: (row) =>
        canRead && onEdit ? (
          <Button 
            variant="link" 
            onClick={() => onEdit(row)}
            title={row.university_slug}
            className="h-auto min-h-0 whitespace-normal break-words text-left justify-start items-start py-0 px-0 w-full max-w-full shrink font-medium leading-5 hover:text-blue-700 hover:underline"
          >
            <code className="whitespace-normal break-words">{row.university_slug}</code>
          </Button>
        ) : (
          <code className="whitespace-normal break-words">{row.university_slug}</code>
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
      label: "Page Live",
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
      label: "Home Visibility",
      render: (row) =>
        canUpdate ? (
          <Button
            size="sm"
            variant={row.menu_visibility ? "default" : "outline"}
            className={
              row.menu_visibility 
                ? "bg-gradient-to-r from-blue-400 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0 shadow-sm" 
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
      key: "provide_emi",
      label: "EMI",
      render: (row) =>
        canUpdate ? (
          <Button
            size="sm"
            variant={row.provide_emi ? "default" : "outline"}
            className={
              row.provide_emi 
                ? "bg-gradient-to-r from-blue-400 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0 shadow-sm" 
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300"
            }
            onClick={() => onToggleProvideEmi?.(row.id, !row.provide_emi)}
          >
            {row.provide_emi ? "Yes" : "No"}
          </Button>
        ) : (
          <span className={row.provide_emi ? "text-green-600" : "text-gray-500"}>
            {row.provide_emi ? "Yes" : "No"}
          </span>
        ),
    },
    {
      key: "compare",
      label: "Compare",
      render: (row) =>
        canUpdate ? (
          <Button
            size="sm"
            variant={row.compare ? "default" : "outline"}
            className={
              row.compare
                ? "bg-gradient-to-r from-blue-400 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0 shadow-sm"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300"
            }
            onClick={() => onToggleCompare?.(row.id, !row.compare)}
          >
            {row.compare ? "On" : "Off"}
          </Button>
        ) : (
          <span className={row.compare ? "text-green-600" : "text-gray-500"}>
            {row.compare ? "On" : "Off"}
          </span>
        ),
    },
  ];

  const actions = createTableActions(onEdit, onDelete, {
    // Use numeric ID for admin edit; dedicated admin route handles ID lookup
    editUrl: (row) => `/universities/edit/${row.id}`,
  });

  const columnsAfterActions = [
    {
      key: "updated_at",
      label: "Updated",
      render: (row) => (
        <span className="">
          {row.updated_at ? new Date(row.updated_at).toLocaleDateString() : "-"}
        </span>
      ),
    },
  ];

  return <DataTable columns={columns} data={items} actions={actions} columnsAfterActions={columnsAfterActions} />;
}
