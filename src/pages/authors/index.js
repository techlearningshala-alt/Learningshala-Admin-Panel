"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAuthors, deleteAuthor } from "@/lib/api";
import { notifySuccess, notifyError } from "@/lib/notify";
import AddAuthorForm from "@/components/author/AddAuthorForm";
import AuthorTable from "@/components/author/AuthorTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import PermissionGuard from "@/components/common/PermissionGuard";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import TableContainer from "@/components/common/TableContainer";
import PaginationControls from "@/components/common/PaginationControls";
import { useHeader } from "@/context/HeaderContext";

function AuthorsPageContent() {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editAuthor, setEditAuthor] = useState(null);
  const [page, setPage] = useState(1);
  const limit = 10;
  const queryClient = useQueryClient();
  const { setActionButton, setTotalCount } = useHeader();

  // Reset state when route changes
  useEffect(() => {
    setShowForm(false);
    setEditAuthor(null);
    setPage(1);
  }, [router.pathname]);

  const { data, isLoading } = useQuery({
    queryKey: ["authors", page],
    queryFn: () => fetchAuthors({ page, limit }),
    keepPreviousData: true,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAuthor,
    onSuccess: () => {
      notifySuccess("Author deleted successfully");
      queryClient.invalidateQueries(["authors"]);
    },
    onError: (err) => notifyError(err.response?.data?.message || "Delete failed"),
  });

  // Calculate total (before any early returns)
  const total = data?.data?.total || 0;

  const handleAdd = () => {
    setEditAuthor(null);
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
            <Plus className="mr-2 h-3 w-5" /> Add Author
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

  const handleEdit = (author) => {
    setEditAuthor(author);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this author?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditAuthor(null);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditAuthor(null);
    queryClient.invalidateQueries(["authors"]);
  };

  // Show form view
  if (showForm) {
    return (
      <AddAuthorForm
        author={editAuthor}
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
        isEmpty={!isLoading && (data?.data?.data || []).length === 0}
        loadingText="Loading authors..."
        emptyText="No authors found."
      >
        <AuthorTable
          authors={data?.data?.data || []}
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

export default function AuthorsPage() {
  return (
    <ProtectedRoute roles={["admin", "mentor"]}>
      <AuthorsPageContent />
    </ProtectedRoute>
  );
}
