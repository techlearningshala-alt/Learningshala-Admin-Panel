"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchSpecialization, deleteSpecializations } from "@/lib/menuApi";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import AddSpecializationForm from "@/components/specialization/AddSpecializationForm";
import { notifySuccess, notifyError } from "@/lib/notify";
import SpecializationTable from "@/components/specialization/SpecializationTable";

export default function SpecializationsPage() {
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  // ✅ Fetch all specializations
  const { data, isLoading } = useQuery({
    queryKey: ["specialization", page],
    queryFn: () => fetchSpecialization({ page, limit: 10 }),
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
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Specializations</h1>
        <Button onClick={handleAdd}>
          <Plus className="mr-1 h-4 w-4" /> Add Specialization
        </Button>
      </div>

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <SpecializationTable
          items={data?.data?.data || []}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Pagination */}
      <div className="flex justify-center mt-4 gap-2">
        <Button size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
          Prev
        </Button>
        <span className="px-3 py-1">
          Page {page} of {data?.data.pages}
        </span>
        <Button
          size="sm"
          disabled={page === data?.data.pages}
          onClick={() => setPage(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
