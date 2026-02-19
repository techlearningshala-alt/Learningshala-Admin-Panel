"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchPlacementPartners, deletePlacementPartner } from "@/lib/universityApi";
import { notifySuccess, notifyError } from "@/lib/notify";
import AddPlacementPartnerForm from "@/components/placements/AddPlacementPartnerForm";
import PlacementPartnerTable from "@/components/placements/PlacementPartnerTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import PermissionGuard from "@/components/common/PermissionGuard";
import TableContainer from "@/components/common/TableContainer";
import PaginationControls from "@/components/common/PaginationControls";
import FiltersSection from "@/components/common/FiltersSection";
import { useHeader } from "@/context/HeaderContext";

export default function PlacementsPage() {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editPartner, setEditPartner] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const limit = 25;
  const queryClient = useQueryClient();
  const { setActionButton, setTotalCount } = useHeader();

  // Reset state when route changes
  useEffect(() => {
    setShowForm(false);
    setEditPartner(null);
    setPage(1);
    setSearch("");
  }, [router.pathname]);

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

  // Calculate total (before any early returns)
  const filteredPartners = (data?.data?.data || []).filter((partner) =>
    (partner.name || "").toLowerCase().includes(search.toLowerCase())
  );
  const total = data?.data?.total || 0;

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
    <div className="p-1 bg-gray-100 min-h-screen">
      <FiltersSection 
        search={search} 
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        searchPlaceholder="Search partners"
        showClearButton={!!search}
        onClearFilters={() => {
          setSearch("");
          setPage(1);
        }}
      />

      <TableContainer
        isLoading={isLoading}
        isEmpty={!isLoading && filteredPartners.length === 0}
        loadingText="Loading partners..."
        emptyText="No partners found."
      >
        <PlacementPartnerTable
          partners={filteredPartners}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </TableContainer>

      <PaginationControls
        currentPage={page}
        totalPages={data?.data?.pages || Math.ceil((data?.data?.total || 0) / limit) || 1}
        onPageChange={setPage}
      />
    </div>
  );
}

