"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchMentors, deleteMentor } from "@/lib/api";
import { notifySuccess, notifyError } from "@/lib/notify";
import AddMentorForm from "@/components/mentor/AddMentorForm";
import MentorTable from "@/components/mentor/MentorTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import PermissionGuard from "@/components/common/PermissionGuard";
import TableContainer from "@/components/common/TableContainer";
import PaginationControls from "@/components/common/PaginationControls";
import { useHeader } from "@/context/HeaderContext";

export default function MentorsPage() {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editMentor, setEditMentor] = useState(null);
  const [page, setPage] = useState(1);   // pagination state
  const limit = 10;
  const queryClient = useQueryClient();
  const { setActionButton, setTotalCount } = useHeader();

  // Reset state when route changes
  useEffect(() => {
    setShowForm(false);
    setEditMentor(null);
    setPage(1);
  }, [router.pathname]);

  const { data, isLoading } = useQuery({
    queryKey: ["mentors", page],   // depend on page
    queryFn: () => fetchMentors({ page, limit }),
    keepPreviousData: true,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMentor,
    onSuccess: () => {
      notifySuccess("Mentor deleted successfully");
      queryClient.invalidateQueries(["mentors"]);
    },
    onError: (err) => notifyError(err.response?.data?.message || "Delete failed"),
  });

  const handleAdd = () => {
    setEditMentor(null);
    setShowForm(true);
  };

  const handleEdit = (mentor) => {
    setEditMentor(mentor);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this mentor?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditMentor(null);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditMentor(null);
    queryClient.invalidateQueries(["mentors"]);
  };

  // Calculate total and items (before any early returns)
  const total = data?.data?.total || 0;
  const items = data?.data?.data || [];

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
            <Plus className="mr-2 h-3 w-5" /> Add Mentor
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
      <AddMentorForm
        mentor={editMentor}
        onCancel={handleFormClose}
        onSuccess={handleFormSuccess}
      />
    );
  }

  // Show table view
  return (
    <div className="p-1 bg-gray-100 min-h-screen">
      <TableContainer
        isLoading={isLoading}
        isEmpty={!isLoading && items.length === 0}
        loadingText="Loading mentors..."
        emptyText="No mentors found."
      >
        <MentorTable
          mentors={items}
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
