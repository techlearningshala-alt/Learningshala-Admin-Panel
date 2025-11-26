"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchUniversityApprovals, deleteUniversityApprovals } from "@/lib/universityApi";
import { notifyError, notifySuccess } from "@/lib/notify";
import AddUniversityApprovalForm from "@/components/universities/AddUniversityApprovalForm";
import UniversityApprovalTable from "@/components/universities/UniversityApprovalTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";

export default function UniversityApprovalsPage() {
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

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

  const handleAdd = () => {
    setEditItem(null);
    setShowForm(true);
  };

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
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">University Approvals</h1>
        <Button onClick={handleAdd}>
          <Plus className="mr-1 h-4 w-4" /> Add Approval
        </Button>
      </div>

      <div className="max-w-md mb-4">
        <Label htmlFor="approval-search">Search Approvals</Label>
        <Input
          id="approval-search"
          placeholder="Search by title or description"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <UniversityApprovalTable
          items={(data?.data?.data || []).filter((item) => {
            const query = search.toLowerCase();
            return (
              !query ||
              (item.title || "").toLowerCase().includes(query) ||
              (item.description || "").toLowerCase().includes(query)
            );
          })}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

    </div>
  );
}
