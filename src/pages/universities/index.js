"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchUniversities, deleteUniversity, toggleUniversityStatus, toggleUniversityPageCreated, toggleUniversityMenuVisibility, fetchApprovals, fetchAllPlacementPartners, fetchAllEmiPartners } from "@/lib/universityApi";
import { fetchUniversityTypes } from "@/lib/api";

import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import UniversityTable from "@/components/universities/UniversityTable";
import AddUniversityForm from "@/components/universities/AddUniversityForm";
import { notifySuccess, notifyError } from "@/lib/notify";
import { Input } from "@/components/ui/input";
import PermissionGuard from "@/components/common/PermissionGuard";

export default function UniversitiesPage() {
  const [selectedUniversity, setSelectedUniversity] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [universityTypeFilter, setUniversityTypeFilter] = useState("");

  const queryClient = useQueryClient();

  // Fetch paginated universities
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["universities", page, universityTypeFilter],
    queryFn: () => fetchUniversities({ 
      page, 
      limit: 20, 
      university_type_id: universityTypeFilter ? parseInt(universityTypeFilter) : undefined 
    }),
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

  const { data: universityTypesData } = useQuery({
    queryKey: ["university-types-all"],
    queryFn: () => fetchUniversityTypes({ page: 1, limit: 1000 }),
  });
  const universityTypes = universityTypesData?.data?.data || [];

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

  const togglePageCreatedMutation = useMutation({
    mutationFn: ({ id, isPageCreated }) => toggleUniversityPageCreated(id, isPageCreated),
    onSuccess: () => {
      notifySuccess("University page visibility updated successfully");
      queryClient.invalidateQueries(["universities"]);
    },
    onError: (err) => notifyError(err.response?.data?.message || "Page visibility update failed"),
  });

  const toggleMenuVisibilityMutation = useMutation({
    mutationFn: ({ id, menuVisibility }) => toggleUniversityMenuVisibility(id, menuVisibility),
    onSuccess: () => {
      notifySuccess("University home page visibility updated successfully");
      queryClient.invalidateQueries(["universities"]);
    },
    onError: (err) => notifyError(err.response?.data?.message || "Home page visibility update failed"),
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

  const handleTogglePageCreated = (id, isPageCreated) => {
    togglePageCreatedMutation.mutate({ id, isPageCreated });
  };

  const handleToggleMenuVisibility = (id, menuVisibility) => {
    toggleMenuVisibilityMutation.mutate({ id, menuVisibility });
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedUniversity(null);
  };

  const handleFormSuccess = () => {
    // Check if we're adding a new university (not editing) before resetting
    const isAddingNew = !selectedUniversity;
    setShowForm(false);
    setSelectedUniversity(null);
    // If adding new university, go to page 1 to see it (new items usually appear on first page)
    if (isAddingNew) {
      // Set page first, then refetch after a short delay to ensure state updates
      setPage(1);
      setTimeout(() => {
        // Force refetch all university queries
        queryClient.refetchQueries({ queryKey: ["universities"], type: "active" });
        refetch(); // Also refetch current query
      }, 300);
    } else {
      // For edits, just refetch current page
      setTimeout(() => {
        refetch();
        queryClient.refetchQueries({ queryKey: ["universities"], type: "active" });
      }, 300);
    }
  };

  // Show form view
  if (showForm) {
    return (
      <AddUniversityForm
        item={selectedUniversity}
        approvals={approvals}
        placementPartners={placementPartners}
        emiPartners={emiPartners}
        universityTypes={universityTypes}
        onCancel={handleFormClose}
        onSuccess={handleFormSuccess}
      />
    );
  }

  // Show table view
  const items = data?.data?.data || [];
  const filteredItems = search
    ? items.filter((item) => {
        const term = search.toLowerCase();
        return item.university_name?.toLowerCase().includes(term);
      })
    : items;

  const total = search ? filteredItems.length : (data?.data?.total || 0);
  
  return (
    <div className="p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold">Universities</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Total: {total} {search && `(filtered from ${data?.data?.total || items.length})`}
          </p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <div className="relative w-72">
              <Input
                placeholder="Search by university name"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pr-8"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="relative">
              <select
                value={universityTypeFilter}
                onChange={(e) => {
                  setUniversityTypeFilter(e.target.value);
                  setPage(1); // Reset to first page when filter changes
                }}
                className="w-50 border rounded px-4 py-2 pr-8"
              >
                <option value="">All University Types</option>
                {universityTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>
            {(universityTypeFilter || search) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setUniversityTypeFilter("");
                  setSearch("");
                  setPage(1);
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>
        <PermissionGuard permission="create">
          <Button onClick={handleAdd}>
            <Plus className="mr-1 h-4 w-4" /> Add University
          </Button>
        </PermissionGuard>
      </div>

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <UniversityTable
          items={filteredItems}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
          onTogglePageCreated={handleTogglePageCreated}
          onToggleMenuVisibility={handleToggleMenuVisibility}
        />
      )}

      {/* Pagination - Hide when searching or filtering */}
      {!search && !universityTypeFilter && (
        <div className="flex justify-center mt-4 gap-2">
          <Button size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
            Prev
          </Button>
          <span className="px-3 py-1">
            Page {page} of {data?.data?.pages || 1}
          </span>
          <Button size="sm" disabled={page === (data?.data?.pages || 1)} onClick={() => setPage(page + 1)}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
