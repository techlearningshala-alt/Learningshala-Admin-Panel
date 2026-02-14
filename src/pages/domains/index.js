"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchDomains, deleteDomain } from "@/lib/menuApi";
import { notifySuccess, notifyError } from "@/lib/notify";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import AddDomainForm from "@/components/menu/AddDomainForm";
import DomainTable from "@/components/menu/DomainTable";
import PermissionGuard from "@/components/common/PermissionGuard";
import FiltersSection from "@/components/common/FiltersSection";
import TableContainer from "@/components/common/TableContainer";
import PaginationControls from "@/components/common/PaginationControls";
import { useHeader } from "@/context/HeaderContext";

export default function DomainsPage() {
  const limit = 10;
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();
  const { setActionButton, setTotalCount } = useHeader();

  // Reset state when route changes
  useEffect(() => {
    setShowForm(false);
    setEditItem(null);
    setPage(1);
    setSearch("");
  }, [router.pathname]);

  const { data, isLoading } = useQuery({
    queryKey: ["domains", page],
    queryFn: () => fetchDomains({ page, limit }),
    keepPreviousData: true,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDomain,
    onSuccess: () => {
      notifySuccess("Domain deleted successfully");
      queryClient.invalidateQueries(["domains"]);
    },
    onError: (err) => notifyError(err.response?.data?.message || "Delete failed"),
  });

  const handleAdd = () => {
    setEditItem(null);
    setShowForm(true);
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this domain?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditItem(null);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditItem(null);
    queryClient.invalidateQueries(["domains"]);
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
            <Plus className="mr-2 h-3 w-5" /> Add New Domain
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
      <AddDomainForm
        item={editItem}
        onCancel={handleFormClose}
        onSuccess={handleFormSuccess}
      />
    );
  }

  // Show table view
  const filteredItems = search
    ? items.filter((item) => {
        const term = search.toLowerCase();
        return item.name?.toLowerCase().includes(term);
      })
    : items;

  return (
    <div className="p-1 bg-gray-100 min-h-screen">
      <FiltersSection
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name..."
      />

      <TableContainer
        isLoading={isLoading}
        isEmpty={!isLoading && filteredItems.length === 0}
        loadingText="Loading domains..."
        emptyText="No domains found."
      >
        <DomainTable
          items={filteredItems}
          page={page}
          limit={limit}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </TableContainer>

      {/* Pagination - Only show when not searching (client-side filtering) */}
      {!search && (
        <PaginationControls
          currentPage={page}
          totalPages={data?.data?.pages || 1}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
