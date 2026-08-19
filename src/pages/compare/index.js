"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import PermissionGuard from "@/components/common/PermissionGuard";
import TableContainer from "@/components/common/TableContainer";
import PaginationControls from "@/components/common/PaginationControls";
import { useHeader } from "@/context/HeaderContext";
import {
  deleteCompareSet,
  fetchCompareSetById,
  fetchCompareSets,
} from "@/lib/api";
import { notifyError, notifySuccess } from "@/lib/notify";
import AddCompareForm from "@/components/compare/AddCompareForm";
import CompareTable from "@/components/compare/CompareTable";

function ComparePageContent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { setActionButton, setTotalCount } = useHeader();
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [page, setPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    setShowForm(false);
    setEditItem(null);
    setPage(1);
  }, [router.pathname]);

  const { data, isLoading } = useQuery({
    queryKey: ["compares", page],
    queryFn: () => fetchCompareSets({ page, limit }),
    keepPreviousData: true,
    enabled: !showForm,
  });

  const result = data?.data || data;
  const items = result?.data || [];
  const total = result?.total || 0;

  const deleteMutation = useMutation({
    mutationFn: deleteCompareSet,
    onSuccess: () => {
      notifySuccess("Compare set deleted successfully");
      queryClient.invalidateQueries(["compares"]);
    },
    onError: (err) =>
      notifyError(err?.response?.data?.message || "Delete failed"),
  });

  const handleAdd = () => {
    setEditItem(null);
    setShowForm(true);
  };

  const handleEdit = async (row) => {
    try {
      const res = await fetchCompareSetById(row.id);
      const item = res?.data || res;
      setEditItem(item);
      setShowForm(true);
    } catch (err) {
      notifyError(err?.response?.data?.message || "Failed to load compare set");
    }
  };

  const handleDelete = (rowOrId) => {
    const id = typeof rowOrId === "object" ? rowOrId?.id : rowOrId;
    if (!id) return;
    if (!window.confirm("Delete this compare set?")) return;
    deleteMutation.mutate(id);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!showForm) {
      setActionButton(
        <PermissionGuard permission="create">
          <Button
            onClick={handleAdd}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
          >
            <Plus className="mr-2 h-3 w-5" /> Add Compare
          </Button>
        </PermissionGuard>
      );
      setTotalCount(total);
    } else {
      setActionButton(null);
      setTotalCount(null);
    }

    return () => {
      setActionButton(null);
      setTotalCount(null);
    };
  }, [showForm, total, setActionButton, setTotalCount]);

  if (showForm) {
    return (
      <AddCompareForm
        item={editItem}
        onCancel={() => {
          setShowForm(false);
          setEditItem(null);
        }}
        onSuccess={() => {
          setShowForm(false);
          setEditItem(null);
          queryClient.invalidateQueries(["compares"]);
        }}
      />
    );
  }

  return (
    <div className="p-4 space-y-4">
      <TableContainer
        isLoading={isLoading}
        isEmpty={!isLoading && items.length === 0}
        loadingText="Loading compare sets..."
        emptyText="No compare sets found."
      >
        <CompareTable
          items={items}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </TableContainer>

      <PaginationControls
        currentPage={page}
        totalPages={Math.max(1, Math.ceil(total / limit))}
        onPageChange={setPage}
      />
    </div>
  );
}

export default function ComparePage() {
  return (
    <ProtectedRoute roles={["admin", "mentor"]}>
      <ComparePageContent />
    </ProtectedRoute>
  );
}
