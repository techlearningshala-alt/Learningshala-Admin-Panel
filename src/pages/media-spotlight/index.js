"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchMediaSpotlights, deleteMediaSpotlight } from "@/lib/api";
import { notifySuccess, notifyError } from "@/lib/notify";
import AddMediaSpotlightForm from "@/components/medaiSpotlight/AddMediaSpotlightForm";
import MediaSpotlightTable from "@/components/medaiSpotlight/MediaSpotlightTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function MediaSpotlightPage() {
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  // Fetch media spotlights with pagination
  const { data, isLoading } = useQuery({
    queryKey: ["media-spotlights", page],
    queryFn: () => fetchMediaSpotlights({ page, limit: 10 }),
    keepPreviousData: true,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteMediaSpotlight,
    onSuccess: () => {
      notifySuccess("Media spotlight deleted successfully");
      queryClient.invalidateQueries(["media-spotlights"]);
    },
    onError: (err) => notifyError(err.response?.data?.message || "Delete failed"),
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
    if (confirm("Are you sure you want to delete this media spotlight?")) {
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
    queryClient.invalidateQueries(["media-spotlights"]);
  };

  // Show form view
  if (showForm) {
    return (
      <AddMediaSpotlightForm
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
        <h2 className="text-xl font-bold">Media Spotlight</h2>
        <Button onClick={handleAdd}>
          <Plus className="mr-1 h-4 w-4" /> Add Spotlight
        </Button>
      </div>

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <MediaSpotlightTable
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
          Page {page} of {data?.data?.pages || 1}
        </span>
        <Button size="sm" disabled={page >= (data?.data?.pages || 0)} onClick={() => setPage(page + 1)}>
          Next
        </Button>
      </div>
    </div>
  );
}
