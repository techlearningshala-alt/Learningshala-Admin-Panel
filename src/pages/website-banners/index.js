"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWebsiteBanners, deleteWebsiteBanner } from "@/lib/api";
import { notifySuccess, notifyError } from "@/lib/notify";
import AddWebsiteBannerForm from "@/components/website-banners/AddWebsiteBannerForm";
import WebsiteBannerTable from "@/components/website-banners/WebsiteBannerTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import PermissionGuard from "@/components/common/PermissionGuard";
import TableContainer from "@/components/common/TableContainer";
import PaginationControls from "@/components/common/PaginationControls";
import { useHeader } from "@/context/HeaderContext";

export default function WebsiteBannersPage() {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editBanners, setEditBanners] = useState(null);
  const [page, setPage] = useState(1);
  const limit = 10;
  const [filterType, setFilterType] = useState("all"); // "all", "website", "mobile"
  const queryClient = useQueryClient();
  const { setActionButton, setTotalCount } = useHeader();

  // Reset state when route changes
  useEffect(() => {
    setShowForm(false);
    setEditBanners(null);
    setPage(1);
    setFilterType("all");
  }, [router.pathname]);

  const { data, isLoading } = useQuery({
    queryKey: ["website-banners", page],
    queryFn: () => fetchWebsiteBanners({ page, limit }),
    keepPreviousData: true,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteWebsiteBanner,
    onSuccess: () => {
      notifySuccess("Banner deleted successfully");
      queryClient.invalidateQueries(["website-banners"]);
    },
    onError: (err) => notifyError(err.response?.data?.message || "Delete failed"),
  });

  const handleAdd = () => {
    setEditBanners(null);
    setShowForm(true);
  };

  const handleEdit = (banner) => {
    setEditBanners([banner]); // Pass as array for form compatibility
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this banner?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditBanners(null);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditBanners(null);
    queryClient.invalidateQueries(["website-banners"]);
  };

  // Filter banners based on selected type
  const filteredBanners = useMemo(() => {
    const allBanners = data?.data?.data || [];
    if (filterType === "all") {
      return allBanners;
    }
    return allBanners.filter((banner) => banner.banner_type === filterType);
  }, [data, filterType]);

  // Calculate total (before any early returns)
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
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
            >
            <Plus className="mr-2 h-3 w-5" /> Add Banner
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

  if (showForm) {
    return (
      <AddWebsiteBannerForm
        banners={editBanners}
        onCancel={handleFormClose}
        onSuccess={handleFormSuccess}
      />
    );
  }

  return (
    <div className="p-1 bg-gray-100 min-h-screen">
      {/* Filter Dropdown */}
      <div className="mb-4 flex items-center gap-2">
        <label htmlFor="banner-type-filter" className="text-sm font-medium">
          Filter by Type:
        </label>
        <select
          id="banner-type-filter"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="all">All</option>
          <option value="website">Website</option>
          <option value="mobile">Mobile</option>
        </select>
      </div>

      <TableContainer
        isLoading={isLoading}
        isEmpty={!isLoading && filteredBanners.length === 0}
        loadingText="Loading banners..."
        emptyText="No banners found."
      >
        <WebsiteBannerTable
          banners={filteredBanners}
          onEdit={handleEdit}
          onDelete={handleDelete}
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
