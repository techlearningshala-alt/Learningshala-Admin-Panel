"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchEmiPartners, deleteEmiPartner } from "@/lib/universityApi";
import { notifySuccess, notifyError } from "@/lib/notify";
import AddEmiPartnerForm from "@/components/emi-partners/AddEmiPartnerForm";
import EmiPartnerTable from "@/components/emi-partners/EmiPartnerTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import PermissionGuard from "@/components/common/PermissionGuard";
import TableContainer from "@/components/common/TableContainer";
import FiltersSection from "@/components/common/FiltersSection";
import { useHeader } from "@/context/HeaderContext";

export default function EmiPartnersPage() {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editPartner, setEditPartner] = useState(null);
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();
  const { setActionButton, setTotalCount } = useHeader();

  // Reset state when route changes
  useEffect(() => {
    setShowForm(false);
    setEditPartner(null);
    setSearch("");
  }, [router.pathname]);

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

  // Calculate total (before any early returns)
  const filteredPartners = (data?.data?.data || []).filter((partner) =>
    (partner.name || "").toLowerCase().includes(search.toLowerCase())
  );
  const total = filteredPartners.length;

  const handleAdd = () => {
    setEditPartner(null);
    setShowForm(true);
  };

  // Set action button and total count in header (must be before early return)
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    if (!showForm) {
      const actionBtn = (
        <PermissionGuard permission="create">
          <Button 
            onClick={handleAdd}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
          >
            <Plus className="mr-2 h-3 w-5" /> Add Partner
          </Button>
        </PermissionGuard>
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
    <div className="p-1 bg-gray-100 min-h-screen">
      <FiltersSection 
        search={search} 
        onSearchChange={setSearch} 
        searchPlaceholder="Search partners"
        showClearButton={!!search}
        onClearFilters={() => setSearch("")}
      />

      <TableContainer
        isLoading={isLoading}
        isEmpty={!isLoading && filteredPartners.length === 0}
        loadingText="Loading partners..."
        emptyText="No partners found."
      >
        <EmiPartnerTable
          partners={filteredPartners}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </TableContainer>
    </div>
  );
}

