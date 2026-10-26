"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchHomeTitleDescriptions,
  deleteHomeTitleDescription,
} from "@/lib/api";
import { notifySuccess, notifyError } from "@/lib/notify";
import AddHomeTitleDescriptionForm from "@/components/home-title-description/AddHomeTitleDescriptionForm";
import HomeTitleDescriptionTable from "@/components/home-title-description/HomeTitleDescriptionTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import PermissionGuard from "@/components/common/PermissionGuard";
import TableContainer from "@/components/common/TableContainer";
import PaginationControls from "@/components/common/PaginationControls";
import { useHeader } from "@/context/HeaderContext";

export default function StaticPagesMetadataPage() {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [page, setPage] = useState(1);
  const limit = 10;
  const queryClient = useQueryClient();
  const { setActionButton, setTotalCount } = useHeader();

  useEffect(() => {
    setShowForm(false);
    setEditItem(null);
    setPage(1);
  }, [router.pathname]);

  const metadataType = "static";

  const { data, isLoading } = useQuery({
    queryKey: ["home-title-descriptions", metadataType, page],
    queryFn: () =>
      fetchHomeTitleDescriptions({ page, limit, type: metadataType }),
    keepPreviousData: true,
  });

  const total = data?.data?.total || 0;

  const deleteMutation = useMutation({
    mutationFn: deleteHomeTitleDescription,
    onSuccess: () => {
      notifySuccess("Deleted successfully");
      queryClient.invalidateQueries(["home-title-descriptions", metadataType]);
    },
    onError: (err) =>
      notifyError(err.response?.data?.message || "Delete failed"),
  });

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
            <Plus className="mr-2 h-3 w-5" /> Add Static Page Metadata
          </Button>
        </PermissionGuard>
      );
      setActionButton(actionBtn);
      setTotalCount(total);
    } else {
      setActionButton(null);
      setTotalCount(null);
    }

    return () => {
      setActionButton(null);
      setTotalCount(null);
    };
  }, [setActionButton, setTotalCount, total, showForm]);

  const handleEdit = (item) => {
    setEditItem(item);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this static page metadata?")) {
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
    queryClient.invalidateQueries(["home-title-descriptions", metadataType]);
  };

  if (showForm) {
    return (
      <AddHomeTitleDescriptionForm
        item={editItem}
        onCancel={handleFormClose}
        onSuccess={handleFormSuccess}
        entityLabel="Static Page Metadata"
        metadataType={metadataType}
      />
    );
  }

  return (
    <div className="p-1 bg-gray-100 min-h-screen">
      <TableContainer
        isLoading={isLoading}
        isEmpty={!isLoading && (data?.data?.data || []).length === 0}
        loadingText="Loading static pages metadata..."
        emptyText="No static pages metadata found."
      >
        <HomeTitleDescriptionTable
          items={data?.data?.data || []}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </TableContainer>

      <PaginationControls
        currentPage={page}
        totalPages={data?.data?.pages || 1}
        onPageChange={setPage}
      />
    </div>
  );
}
