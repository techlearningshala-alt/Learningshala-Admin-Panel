"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchEmiPartners, deleteEmiPartner } from "@/lib/universityApi";
import { notifySuccess, notifyError } from "@/lib/notify";
import AddEmiPartnerForm from "@/components/emi-partners/AddEmiPartnerForm";
import EmiPartnerTable from "@/components/emi-partners/EmiPartnerTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";

export default function EmiPartnersPage() {
  const [showForm, setShowForm] = useState(false);
  const [editPartner, setEditPartner] = useState(null);
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["emi-partners"],
    queryFn: () => fetchEmiPartners({ page: 1, limit: 1000 }),
    keepPreviousData: true,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteEmiPartner,
    onSuccess: () => {
      notifySuccess("EMI partner deleted successfully");
      queryClient.invalidateQueries(["emi-partners"]);
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
    if (confirm("Are you sure you want to delete this EMI partner?")) {
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
    queryClient.invalidateQueries(["emi-partners"]);
  };

  // Show form view
  if (showForm) {
    return (
      <AddEmiPartnerForm
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
        <h2 className="text-xl font-bold">EMI/Financing Partners</h2>
        <Button onClick={handleAdd}>
          <Plus className="mr-1 h-4 w-4" /> Add Partner
        </Button>
      </div>

      <div className="mb-4 max-w-sm">
        <Input
          placeholder="Search partners"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <EmiPartnerTable
          partners={(data?.data?.data || []).filter((partner) =>
            (partner.name || "").toLowerCase().includes(search.toLowerCase())
          )}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

    </div>
  );
}

