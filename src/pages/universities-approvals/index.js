"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchUniversityApprovals, deleteUniversityApprovals } from "@/lib/universityApi";
import { notifyError, notifySuccess } from "@/lib/notify";
import AddUniversityApprovalForm from "@/components/universities/AddUniversityApprovalForm";
import UniversityApprovalTable from "@/components/universities/UniversityApprovalTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import PermissionGuard from "@/components/common/PermissionGuard";
import TableContainer from "@/components/common/TableContainer";
import { useHeader } from "@/context/HeaderContext";

export default function UniversityApprovalsPage() {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const { setActionButton, setTotalCount } = useHeader();

  // Reset state when route changes
  useEffect(() => {
    setShowForm(false);
    setEditItem(null);
    setSearch("");
  }, [router.pathname]);

  // Fetch list
  const { data, isLoading } = useQuery({
    queryKey: ["university-approvals"],
    queryFn: () => fetchUniversityApprovals({ page: 1, limit: 1000 }),
    keepPreviousData: true,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteUniversityApprovals,
    onSuccess: () => {
      notifySuccess("University approval deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["university-approvals"], exact: false });
    },
    onError: (err) => notifyError(err.response?.data?.message || "Delete failed"),
  });

  // Calculate total (before any early returns)
  const filteredItems = (data?.data?.data || []).filter((item) => {
    const query = search.toLowerCase();
    return (
      !query ||
      (item.title || "").toLowerCase().includes(query) ||
      (item.description || "").toLowerCase().includes(query)
    );
  });
  const total = filteredItems.length;

  const handleAdd = () => {
    setEditItem(null);
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
            <Plus className="mr-2 h-3 w-5" /> Add Approval
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

  const handleEdit = (item) => {
    setEditItem(item);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this university approval?")) {
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
    queryClient.invalidateQueries({ queryKey: ["university-approvals"], exact: false });
  };

  // Show form view
  if (showForm) {
    return (
      <AddUniversityApprovalForm
        item={editItem}
        onCancel={handleFormClose}
        onSuccess={handleFormSuccess}
      />
    );
  }

  // Show table view
  return (
    <div className="p-1 bg-gray-100 min-h-screen">
      <div className="max-w-6xl mb-1 mx-auto mt-1">
        <Input
          id="approval-search"
          placeholder="Search by title or description"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-md px-4 py-0.5 pr-8 focus:border-blue-500 focus:ring-blue-500 bg-white text-gray-700 min-w-[200px]"
          />
      </div>

      <TableContainer
        isLoading={isLoading}
        isEmpty={!isLoading && filteredItems.length === 0}
        loadingText="Loading approvals..."
        emptyText="No approvals found."
      >
        <UniversityApprovalTable
          items={filteredItems}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </TableContainer>
    </div>
  );
}
