"use client";

import { useState } from "react";
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
import { useEffect } from "react";
import FiltersSection from "@/components/common/FiltersSection";
import TableContainer from "@/components/common/TableContainer";
import PaginationControls from "@/components/common/PaginationControls";

export default function RedirectionsPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const { setActionButton, setTotalCount } = useHeader();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["redirections", page, limit, search],
    queryFn: () => fetchRedirections(page, limit, search),
  });

  useEffect(() => {
    if (!showForm) {
      setActionButton(
        <Button
          onClick={() => {
            setEditingItem(null);
            setShowForm(true);
          }}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add New Redirection
        </Button>
      );

      if (data?.data?.total) {
        setTotalCount(`${data.data.total}`);
      }
    } else {
      setActionButton(null);
      setTotalCount(null);
    }

    return () => {
      setActionButton(null);
      setTotalCount(null);
    };
  }, [data, setActionButton, setTotalCount, showForm]);

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
    <div className="space-y-6">
      <FiltersSection
        search={search}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search by old URL or new URL..."
      />

      <TableContainer>
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : error ? (
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
