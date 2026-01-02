"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchSpecialization,
  deleteSpecializations,
  toggleSpecializationStatus,
  toggleSpecializationMenuVisibility,
} from "@/lib/menuApi";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import AddSpecializationForm from "@/components/specialization/AddSpecializationForm";
import { notifySuccess, notifyError } from "@/lib/notify";
import SpecializationTable from "@/components/specialization/SpecializationTable";
import { Input } from "@/components/ui/input";
import PermissionGuard from "@/components/common/PermissionGuard";

export default function SpecializationsPage() {
  const limit = 10;
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  // ✅ Fetch all specializations
  const { data, isLoading } = useQuery({
    queryKey: ["specialization", page],
    queryFn: () => fetchSpecialization({ page, limit }),
    keepPreviousData: true,
  });

  // ✅ Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteSpecializations,
    onSuccess: () => {
      notifySuccess("Specialization deleted successfully");
      queryClient.invalidateQueries(["specialization"]);
    },
    onError: (err) => {
      notifyError(err.response?.data?.message || "Delete failed");
    },
  });

  const handleAdd = () => {
    setEditItem(null);
    setShowForm(true);
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this specialization?")) {
      deleteMutation.mutate(id);
    }
  };

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, value }) => toggleSpecializationStatus(id, value),
    onSuccess: () => {
      notifySuccess("Specialization status updated");
      queryClient.invalidateQueries(["specialization"]);
    },
    onError: (err) => {
      notifyError(err.response?.data?.message || "Failed to update status");
    },
  });

  const toggleMenuVisibilityMutation = useMutation({
    mutationFn: ({ id, value }) => toggleSpecializationMenuVisibility(id, value),
    onSuccess: () => {
      notifySuccess("Menu visibility updated");
      queryClient.invalidateQueries(["specialization"]);
    },
    onError: (err) => {
      notifyError(err.response?.data?.message || "Failed to update menu visibility");
    },
  });

  const handleFormClose = () => {
    setShowForm(false);
    setEditItem(null);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditItem(null);
    queryClient.invalidateQueries(["specialization"]);
  };

  // Show form view
  if (showForm) {
    return (
      <AddSpecializationForm
        item={editItem}
        onCancel={handleFormClose}
        onSuccess={handleFormSuccess}
      />
    );
  }

  // Show table view
  const total = data?.data?.total || 0;
  const items = data?.data?.data || [];
  const filteredItems = search
    ? items.filter((item) => {
        const term = search.toLowerCase();
        return (
          item.name?.toLowerCase().includes(term) ||
          item.course_name?.toLowerCase().includes(term) ||
          item.slug?.toLowerCase().includes(term)
        );
      })
    : items;
  
  return (
    <div className="p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div className="flex flex-col gap-1">
          <h3 className="text-xl font-bold">Specializations</h3>
          <p className="text-sm text-muted-foreground">Total: {total}</p>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search by name, course, or slug"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-72"
            />
          </div>
        </div>
        <PermissionGuard permission="create">
          <Button onClick={handleAdd}>
            <Plus className="mr-1 h-4 w-4" /> Add Specialization
          </Button>
        </PermissionGuard>
      </div>

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <SpecializationTable
          items={filteredItems}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleActive={(id, value) => toggleActiveMutation.mutate({ id, value })}
          onToggleMenuVisibility={(id, value) =>
            toggleMenuVisibilityMutation.mutate({ id, value })
          }
          currentPage={page}
          limit={limit}
        />
      )}

      {/* Pagination */}
      {!search && (
        <div className="flex justify-center mt-4 gap-2">
          <Button size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
            Prev
          </Button>
          <span className="px-3 py-1">
            Page {page} of {data?.data?.pages || 1}
          </span>
          <Button size="sm" disabled={page >= (data?.data?.pages || 0)} onClick={() => setPage(page + 1)}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
