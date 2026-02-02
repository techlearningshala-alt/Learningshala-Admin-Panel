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
    queryKey: ["universities", page, universityTypeFilter, search],
    queryFn: () => fetchUniversities({ 
      page, 
      limit: 20, 
      university_type_id: universityTypeFilter ? parseInt(universityTypeFilter) : undefined,
      search: search || undefined
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

  // Show table view - no client-side filtering needed, backend handles it
  const items = data?.data?.data || [];
  const total = data?.data?.total || 0;
  
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header Section with Gradient Background */}
      <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-xl shadow-lg p-2 mb-3 text-white">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-1 h-6 bg-white rounded-full"></div>
              <h3 className="text-xl font-bold">Universities</h3>
            </div>
            <p className="text-blue-100 text-sm ml-4">
              Total: <span className="font-semibold text-white">{total}</span> {search && `• Searching: "${search}"`}
            </p>
          </div>
          <PermissionGuard permission="create">
            <Button 
              onClick={handleAdd}
              className="bg-white text-blue-600 hover:bg-blue-50 hover:text-blue-700 shadow-md hover:shadow-lg transition-all duration-200 font-semibold px-6 py-2.5"
            >
              <Plus className="mr-2 h-3 w-5" /> Add New University
            </Button>
          </PermissionGuard>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6 border border-gray-200">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[280px]">
            <Input
              placeholder="Search by university name..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1); // Reset to first page when search changes
              }}
              className="pr-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
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
              className="border border-gray-300 rounded-md px-4 py-2 pr-8 focus:border-blue-500 focus:ring-blue-500 bg-white text-gray-700 min-w-[200px]"
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
              className="border-gray-300 hover:bg-gray-50 hover:border-gray-400"
            >
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading universities...</span>
          </div>
        ) : (
          <UniversityTable
            items={items}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleStatus={handleToggleStatus}
            onTogglePageCreated={handleTogglePageCreated}
            onToggleMenuVisibility={handleToggleMenuVisibility}
          />
        )}
      </div>

      {/* Pagination - Show for all cases (search works with pagination now) */}
      <div className="flex justify-center items-center mt-6 gap-3">
        <Button 
          size="sm" 
          disabled={page === 1} 
          onClick={() => setPage(page - 1)}
          className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          Prev
        </Button>
        <div className="bg-white border border-gray-300 rounded-md px-4 py-2 shadow-sm">
          <span className="text-sm font-medium text-gray-700">
            Page <span className="text-blue-600 font-semibold">{page}</span> of <span className="text-blue-600 font-semibold">{data?.data?.pages || 1}</span>
          </span>
        </div>
        <Button 
          size="sm" 
          disabled={page === (data?.data?.pages || 1)} 
          onClick={() => setPage(page + 1)}
          className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
