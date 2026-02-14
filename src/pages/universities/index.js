"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchUniversities, deleteUniversity, toggleUniversityStatus, toggleUniversityPageCreated, toggleUniversityMenuVisibility, toggleUniversityProvideEmi, fetchApprovals, fetchAllPlacementPartners, fetchAllEmiPartners } from "@/lib/universityApi";
import { fetchUniversityTypes } from "@/lib/api";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import UniversityTable from "@/components/universities/UniversityTable";
import AddUniversityForm from "@/components/universities/AddUniversityForm";
import { notifySuccess, notifyError } from "@/lib/notify";
import PermissionGuard from "@/components/common/PermissionGuard";
import FiltersSection from "@/components/common/FiltersSection";
import TableContainer from "@/components/common/TableContainer";
import PaginationControls from "@/components/common/PaginationControls";
import { useHeader } from "@/context/HeaderContext";

export default function UniversitiesPage() {
  const [selectedUniversity, setSelectedUniversity] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [universityTypeFilter, setUniversityTypeFilter] = useState("");

  const queryClient = useQueryClient();
  const { setActionButton, setTotalCount } = useHeader();

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

  const toggleProvideEmiMutation = useMutation({
    mutationFn: ({ id, provideEmi }) => toggleUniversityProvideEmi(id, provideEmi),
    onSuccess: () => {
      notifySuccess("University provide EMI status updated successfully");
      queryClient.invalidateQueries(["universities"]);
    },
    onError: (err) => notifyError(err.response?.data?.message || "Provide EMI update failed"),
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

  const handleToggleProvideEmi = (id, provideEmi) => {
    toggleProvideEmiMutation.mutate({ id, provideEmi });
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

  // Calculate total and items (before any early returns)
  const items = data?.data?.data || [];
  const total = data?.data?.total || 0;

  // Set action button and total count in header (must be before early return)
  // Use useEffect with immediate execution to ensure it works in both local and production
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    if (!showForm) {
      const actionBtn = (
        <PermissionGuard permission="create">
          <Button 
            onClick={handleAdd}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
            >
            <Plus className="mr-2 h-3 w-5" /> Add New University
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
  return (
    <div className="p-1 bg-gray-100 min-h-screen">
      <FiltersSection
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        searchPlaceholder="Search by university name..."
        showClearButton={!!(universityTypeFilter || search)}
        onClearFilters={() => {
          setUniversityTypeFilter("");
          setSearch("");
          setPage(1);
        }}
      >
        <div className="relative">
          <select
            value={universityTypeFilter}
            onChange={(e) => {
              setUniversityTypeFilter(e.target.value);
              setPage(1);
            }}
            className="border border-gray-300 rounded-md px-4 py-0.5 pr-8 focus:border-blue-500 focus:ring-blue-500  text-gray-700 min-w-[200px]"
          >
            <option value="">All University Types</option>
            {universityTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>
      </FiltersSection>

      <TableContainer
        isLoading={isLoading}
        isEmpty={!isLoading && items.length === 0}
        loadingText="Loading universities..."
        emptyText="No universities found."
      >
            <UniversityTable
              items={items}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleStatus={handleToggleStatus}
              onTogglePageCreated={handleTogglePageCreated}
              onToggleMenuVisibility={handleToggleMenuVisibility}
              onToggleProvideEmi={handleToggleProvideEmi}
            />
      </TableContainer>

      <PaginationControls
        currentPage={page}
        totalPages={data?.data?.pages || 1}
        onPageChange={setPage}
      />
    </div>
  );
}
