"use client";

import { useState } from "react";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { fetchEditorActivities } from "@/lib/editorActivityApi";
import { Input } from "@/components/ui/input";
import FiltersSection from "@/components/common/FiltersSection";
import TableContainer from "@/components/common/TableContainer";
import PaginationControls from "@/components/common/PaginationControls";
import { useHeader } from "@/context/HeaderContext";

function EditorActivityPageContent() {
  const [page, setPage] = useState(1);
  const limit = 20;
  const [entityType, setEntityType] = useState("");
  const [actorRole, setActorRole] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const { setTotalCount, setActionButton } = useHeader();

  const { data, isLoading } = useQuery({
    queryKey: ["editor-activity", page, limit, entityType, actorRole, fromDate, toDate],
    queryFn: () =>
      fetchEditorActivities({
        page,
        limit,
        entity_type: entityType || undefined,
        actor_role: actorRole || undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
      }),
    keepPreviousData: true,
  });

  const result = data?.data || {};
  const logs = result?.data || [];
  const total = result?.total || 0;

  useEffect(() => {
    setActionButton(null);
    setTotalCount(total);
    return () => {
      setActionButton(null);
      setTotalCount(null);
    };
  }, [setActionButton, setTotalCount, total]);

  return (
    <div className="p-1 bg-gray-100 min-h-screen">
      <FiltersSection
        search={entityType}
        onSearchChange={(value) => {
          setEntityType(value);
          setPage(1);
        }}
        searchPlaceholder="Search by entity type..."
        showClearButton={!!entityType || !!actorRole || !!fromDate || !!toDate}
        onClearFilters={() => {
          setEntityType("");
          setActorRole("");
          setFromDate("");
          setToDate("");
          setPage(1);
        }}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
        <Input
          className="bg-white"
          placeholder="Filter actor role (e.g. mentor)"
          value={actorRole}
          onChange={(e) => {
            setActorRole(e.target.value);
            setPage(1);
          }}
        />
        <Input
          className="bg-white"
          type="date"
          value={fromDate}
          onChange={(e) => {
            setFromDate(e.target.value);
            setPage(1);
          }}
        />
        <Input
          className="bg-white"
          type="date"
          value={toDate}
          onChange={(e) => {
            setToDate(e.target.value);
            setPage(1);
          }}
        />
      </div>

      <TableContainer
        isLoading={isLoading}
        isEmpty={!isLoading && logs.length === 0}
        loadingText="Loading editor activity..."
        emptyText="No activity logs found."
      >
        <div className="rounded-md border bg-white overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="p-2 bg-blue-100">Created At</th>
                <th className="p-2 bg-blue-100">User Name</th>
                <th className="p-2 bg-blue-100">Role</th>
                <th className="p-2 bg-blue-100">Entity</th>
                <th className="p-2 bg-blue-100">Entity Name</th>
                <th className="p-2 bg-blue-100">Page</th>
                <th className="p-2 bg-blue-100">Changed Fields</th>
              </tr>
            </thead>
            <tbody>
              {!isLoading &&
                logs.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b align-top bg-blue-50 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-all duration-200"
                  >
                    <td className="p-2 whitespace-nowrap">
                      {row.created_at ? new Date(row.created_at).toLocaleString() : "-"}
                    </td>
                    <td className="p-2">{row.admin_user_name || "-"}</td>
                    <td className="p-2">{row.actor_role || "-"}</td>
                    <td className="p-2">{row.entity_type || "-"}</td>
                    <td className="p-2">{row.entity_name || "-"}</td>
                    <td className="p-2">{row.page_key || "-"}</td>
                    <td className="p-2">
                      {Array.isArray(row.changed_fields) && row.changed_fields.length
                        ? row.changed_fields.join(", ")
                        : "-"}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </TableContainer>

      <PaginationControls
        currentPage={page}
        totalPages={result?.pages || 1}
        onPageChange={setPage}
      />
    </div>
  );
}

export default function EditorActivityPage() {
  return (
    <ProtectedRoute roles={["admin"]}>
      <EditorActivityPageContent />
    </ProtectedRoute>
  );
}
