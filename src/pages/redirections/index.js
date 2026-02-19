"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchRedirections,
  addRedirection,
  updateRedirection,
  deleteRedirection,
} from "@/lib/api/redirections";
import { notifySuccess, notifyError } from "@/lib/notify";
import RedirectionTable from "@/components/redirections/RedirectionTable";
import AddRedirectionForm from "@/components/redirections/AddRedirectionForm";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useHeader } from "@/context/HeaderContext";
import FiltersSection from "@/components/common/FiltersSection";
import TableContainer from "@/components/common/TableContainer";
import PaginationControls from "@/components/common/PaginationControls";

export default function RedirectionsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const { setActionButton, setTotalCount } = useHeader();
  const queryClient = useQueryClient();

  // Reset state when route changes
  useEffect(() => {
    setShowForm(false);
    setEditingItem(null);
    setSearch("");
    setPage(1);
  }, [router.pathname]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["redirections", page, limit, search],
    queryFn: () => fetchRedirections(page, limit, search),
  });

  // Calculate total (before any early returns)
  const total = data?.data?.total || 0;

  const handleAdd = () => {
    setEditingItem(null);
    setShowForm(true);
  };

  // Set action button and total count in header (must be before early return)
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    if (!showForm) {
      const actionBtn = (
        <Button
          onClick={handleAdd}
          className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
        >
          <Plus className="mr-2 h-3 w-5" />
          Add New Redirection
        </Button>
      );
      setActionButton(actionBtn);
      setTotalCount(total);
    } else {
      setActionButton(null);
      setTotalCount(null);
    }

    // Cleanup: clear action button and total count when component unmounts
    return () => {
      setActionButton(null);
      setTotalCount(null);
    };
  }, [setActionButton, setTotalCount, total, showForm]);

  const createMutation = useMutation({
    mutationFn: addRedirection,
    onSuccess: () => {
      notifySuccess("Redirection created successfully");
      queryClient.invalidateQueries(["redirections"]);
      setShowForm(false);
      setEditingItem(null);
    },
    onError: (error) => {
      notifyError(error.response?.data?.message || "Failed to create redirection");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateRedirection(id, data),
    onSuccess: () => {
      notifySuccess("Redirection updated successfully");
      queryClient.invalidateQueries(["redirections"]);
      setShowForm(false);
      setEditingItem(null);
    },
    onError: (error) => {
      notifyError(error.response?.data?.message || "Failed to update redirection");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRedirection,
    onSuccess: () => {
      notifySuccess("Redirection deleted successfully");
      queryClient.invalidateQueries(["redirections"]);
    },
    onError: (error) => {
      notifyError(error.response?.data?.message || "Failed to delete redirection");
    },
  });

  const handleEdit = (redirection) => {
    setEditingItem(redirection);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this redirection?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleFormSubmit = async (formData) => {
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingItem(null);
  };

  if (showForm) {
    return (
      <AddRedirectionForm
        item={editingItem}
        onCancel={handleCancel}
        onSuccess={handleFormSubmit}
      />
    );
  }

  const handleSearchChange = (value) => {
    setSearch(value);
    setPage(1); // Reset to first page when search changes
  };

  return (
    <div className="p-1 bg-gray-100 min-h-screen">
      <FiltersSection
        search={search}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search by old URL or new URL..."
        showClearButton={!!search}
        onClearFilters={() => {
          setSearch("");
          setPage(1);
        }}
      />

      <TableContainer
        isLoading={isLoading}
        isEmpty={!isLoading && (data?.data?.data || []).length === 0}
        loadingText="Loading redirections..."
        emptyText="No redirections found."
      >
        {error ? (
          <div className="text-center py-8 text-red-500">
            Error loading redirections: {error.message}
          </div>
        ) : (
          <RedirectionTable
            redirections={data?.data?.data || []}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </TableContainer>

      {data?.data && data.data.pages > 1 && (
        <PaginationControls
          currentPage={page}
          totalPages={data.data.pages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
