"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchPlacementPartners, deletePlacementPartner } from "@/lib/universityApi";
import { notifySuccess, notifyError } from "@/lib/notify";
import AddPlacementPartnerForm from "@/components/placements/AddPlacementPartnerForm";
import PlacementPartnerTable from "@/components/placements/PlacementPartnerTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function PlacementsPage() {
  const [showForm, setShowForm] = useState(false);
  const [editPartner, setEditPartner] = useState(null);
  const [page, setPage] = useState(1);
  const limit = 10;
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["placement-partners", page],
    queryFn: () => fetchPlacementPartners({ page, limit }),
    keepPreviousData: true,
  });

  const deleteMutation = useMutation({
    mutationFn: deletePlacementPartner,
    onSuccess: () => {
      notifySuccess("Placement partner deleted successfully");
      queryClient.invalidateQueries(["placement-partners"]);
    },
    onError: (err) => notifyError(err.response?.data?.message || "Delete failed"),
  });

  const handleAdd = () => {
    setEditPartner(null);
    setShowForm(true);
  };

  const handleEdit = (partner) => {
    setEditPartner(partner);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this placement partner?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditPartner(null);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditPartner(null);
    queryClient.invalidateQueries(["placement-partners"]);
  };

  // Show form view
  if (showForm) {
    return (
      <AddPlacementPartnerForm
        partner={editPartner}
        onCancel={handleFormClose}
        onSuccess={handleFormSuccess}
      />
    );
  }

  // Show table view
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Placement/Hiring Partners</h2>
        <Button onClick={handleAdd}>
          <Plus className="mr-1 h-4 w-4" /> Add Partner
        </Button>
      </div>

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <PlacementPartnerTable
          partners={data?.data?.data || []}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Pagination */}
      {data?.data?.total > 0 && (
        <div className="flex justify-center mt-4 gap-2">
          <Button size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
            Prev
          </Button>
          <span className="px-3 py-1">
            Page {page} of {Math.ceil((data?.data?.total || 0) / limit)}
          </span>
          <Button 
            size="sm" 
            disabled={page >= Math.ceil((data?.data?.total || 0) / limit)} 
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

