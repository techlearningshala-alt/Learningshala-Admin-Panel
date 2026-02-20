"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchUploads, deleteUpload } from "@/lib/menuApi";
import { notifySuccess, notifyError } from "@/lib/notify";
import AddUploadForm from "@/components/uploads/AddUploadForm";
import UploadTable from "@/components/uploads/UploadTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import PermissionGuard from "@/components/common/PermissionGuard";
import TableContainer from "@/components/common/TableContainer";
import FiltersSection from "@/components/common/FiltersSection";
import PaginationControls from "@/components/common/PaginationControls";
import { useHeader } from "@/context/HeaderContext";

export default function UploadsPage() {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();
  const { setActionButton, setTotalCount } = useHeader();

  useEffect(() => {
    setShowForm(false);
    setEditItem(null);
    setSearch("");
    setPage(1);
  }, [router.pathname]);

  const { data, isLoading } = useQuery({
    queryKey: ["uploads", page],
    queryFn: () => fetchUploads({ page, limit: 10 }),
    keepPreviousData: true,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUpload,
    onSuccess: () => {
      notifySuccess("Upload deleted successfully");
      queryClient.invalidateQueries(["uploads"]);
    },
    onError: (err) => notifyError(err.response?.data?.message || "Delete failed"),
  });

  const items = data?.data?.data || [];
  const filteredItems = items.filter((item) => {
    if (!search.trim()) return true;
    const searchLower = search.toLowerCase();
    const name = item.name || "";
    const path = item.file_path || item.image || "";
    return name.toLowerCase().includes(searchLower) || path.toLowerCase().includes(searchLower);
  });
  const total = data?.data?.total || 0;
  const displayTotal = search.trim().length > 0 ? filteredItems.length : total;

  const handleAdd = () => {
    setEditItem(null);
    setShowForm(true);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!showForm) {
      const actionBtn = (
        <PermissionGuard permission="create">
          <Button
            onClick={handleAdd}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
          >
            <Plus className="mr-2 h-3 w-5" /> Add Upload
          </Button>
        </PermissionGuard>
      );
      setActionButton(actionBtn);
      setTotalCount(displayTotal);
    } else {
      setActionButton(null);
      setTotalCount(null);
    }
    return () => {
      setActionButton(null);
      setTotalCount(null);
    };
  }, [setActionButton, setTotalCount, displayTotal, showForm]);

  const handleEdit = (item) => {
    setEditItem(item);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this upload?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditItem(null);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditItem(null);
    queryClient.invalidateQueries(["uploads"]);
  };

  if (showForm) {
    return (
      <AddUploadForm
        item={editItem}
        onCancel={handleFormClose}
        onSuccess={handleFormSuccess}
      />
    );
  }

  return (
    <div className="p-1 bg-gray-100 min-h-screen">
      <FiltersSection
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        searchPlaceholder="Search by name or path..."
        showClearButton={!!search}
        onClearFilters={() => {
          setSearch("");
          setPage(1);
        }}
      />

      <TableContainer
        isLoading={isLoading}
        isEmpty={!isLoading && filteredItems.length === 0}
        loadingText="Loading uploads..."
        emptyText="No uploads found."
      >
        <UploadTable
          items={filteredItems}
          onEdit={handleEdit}
          onDelete={handleDelete}
          page={page}
          limit={10}
          isFiltered={search.trim().length > 0}
        />
      </TableContainer>

      {!search && (
        <PaginationControls
          currentPage={page}
          totalPages={data?.data?.pages || 1}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
