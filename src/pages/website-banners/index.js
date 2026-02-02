"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWebsiteBanners, deleteWebsiteBanner } from "@/lib/api";
import { notifySuccess, notifyError } from "@/lib/notify";
import AddWebsiteBannerForm from "@/components/website-banners/AddWebsiteBannerForm";
import WebsiteBannerTable from "@/components/website-banners/WebsiteBannerTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import PermissionGuard from "@/components/common/PermissionGuard";
import Pagination from "@/components/common/Pagination";

export default function WebsiteBannersPage() {
  const [showForm, setShowForm] = useState(false);
  const [editBanners, setEditBanners] = useState(null);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterType, setFilterType] = useState("all"); // "all", "website", "mobile"
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["website-banners", page, rowsPerPage],
    queryFn: () => fetchWebsiteBanners({ page, limit: rowsPerPage }),
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

  if (showForm) {
    return (
      <AddWebsiteBannerForm
        banners={editBanners}
        onCancel={handleFormClose}
        onSuccess={handleFormSuccess}
      />
    );
  }

  const total = data?.data?.total || 0;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Banners</h3>
        <PermissionGuard permission="create">
          <Button onClick={handleAdd}>
            <Plus className="mr-1 h-4 w-4" /> Add Banner
          </Button>
        </PermissionGuard>
      </div>

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

      {isLoading ? (
        <p>Loading banners...</p>
      ) : (
        <>
          <WebsiteBannerTable
            banners={filteredBanners}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
          <Pagination
            total={total}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={setPage}
            onRowsPerPageChange={setRowsPerPage}
          />
        </>
      )}
    </div>
  );
}
