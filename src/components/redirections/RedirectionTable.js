"use client";

import { Button } from "@/components/ui/button";
import { Pencil, Trash } from "lucide-react";

export default function RedirectionTable({ redirections, onEdit, onDelete }) {
  if (!redirections || redirections.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No redirections found. Click &quot;Add New Redirection&quot; to create one.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse bg-white rounded-lg shadow-sm">
        <thead>
          <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Old URL
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
              New URL
            </th>
            <th className="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {redirections.map((redirection) => (
            <tr key={redirection.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-6 py-4 text-sm text-slate-900 break-all max-w-md">
                {redirection.old_url}
              </td>
              <td className="px-6 py-4 text-sm text-slate-900 break-all max-w-md">
                {redirection.new_url}
              </td>
              <td className="px-6 py-4 text-sm text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    size="sm"
                        variant="ghost"
                    onClick={() => onEdit(redirection)}
                    className="h-8 w-8 p-0 text-blue-500 hover:text-blue-600"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => onDelete(redirection.id)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
