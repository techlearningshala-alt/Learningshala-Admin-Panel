"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchUniversities, deleteUniversity, toggleUniversityStatus, fetchApprovals, fetchAllPlacementPartners, fetchAllEmiPartners } from "@/lib/universityApi";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import UniversityTable from "@/components/universities/UniversityTable";
import AddUniversityForm from "@/components/universities/AddUniversityForm";
import { notifySuccess, notifyError } from "@/lib/notify";

export default function UniversitiesPage() {
  const [selectedUniversity, setSelectedUniversity] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [page, setPage] = useState(1);

  const queryClient = useQueryClient();

  // Fetch paginated universities
  const { data, isLoading } = useQuery({
    queryKey: ["universities", page],
    queryFn: () => fetchUniversities({ page, limit: 10 }),
    keepPreviousData: true,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  const { data: approvalsData } = useQuery({
    queryKey: ["university-approvals"],
    queryFn: fetchApprovals,
  });
  const approvals = approvalsData?.data || [];

  const { data: placementPartnersData } = useQuery({
    queryKey: ["placement-partners-all"],
    queryFn: fetchAllPlacementPartners,
  });
  const placementPartners = placementPartnersData?.data?.data || [];

  const { data: emiPartnersData } = useQuery({
    queryKey: ["emi-partners-all"],
    queryFn: fetchAllEmiPartners,
  });
  const emiPartners = emiPartnersData?.data?.data || [];

  const deleteMutation = useMutation({
    mutationFn: deleteUniversity,
    onSuccess: () => {
      notifySuccess("University deleted successfully");
      queryClient.invalidateQueries(["universities"]);
    },
    onError: (err) => notifyError(err.response?.data?.message || "Delete failed"),
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, isActive }) => toggleUniversityStatus(id, isActive),
    onSuccess: () => {
      notifySuccess("University status updated successfully");
      queryClient.invalidateQueries(["universities"]);
    },
    onError: (err) => notifyError(err.response?.data?.message || "Status update failed"),
  });

  const handleAdd = () => {
    setSelectedUniversity(null);
    setShowForm(true);
  };

  const handleEdit = (university) => {
    setSelectedUniversity(university);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this university?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleToggleStatus = (id, isActive) => {
    toggleStatusMutation.mutate({ id, isActive });
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedUniversity(null);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setSelectedUniversity(null);
    queryClient.invalidateQueries({ queryKey: ["universities"], exact: false });
  };

  // Show form view
  if (showForm) {
    return (
      <AddUniversityForm
        item={selectedUniversity}
        approvals={approvals}
        placementPartners={placementPartners}
        emiPartners={emiPartners}
        onCancel={handleFormClose}
        onSuccess={handleFormSuccess}
      />
    );
  }

  // Show table view
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Universities</h1>
        <Button onClick={handleAdd}>
          <Plus className="mr-1 h-4 w-4" /> Add University
        </Button>
      </div>

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <UniversityTable
          items={data?.data?.data || []}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
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
        <Button size="sm" disabled={page === data?.data.pages} onClick={() => setPage(page + 1)}>
          Next
        </Button>
      </div>
    </div>
  );
}
