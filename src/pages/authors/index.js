"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAuthors, deleteAuthor } from "@/lib/api";
import { notifySuccess, notifyError } from "@/lib/notify";
import AddAuthorForm from "@/components/author/AddAuthorForm";
import AuthorTable from "@/components/author/AuthorTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import PermissionGuard from "@/components/common/PermissionGuard";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

function AuthorsPageContent() {
  const [showForm, setShowForm] = useState(false);
  const [editAuthor, setEditAuthor] = useState(null);
  const [page, setPage] = useState(1);
  const limit = 10;
  const queryClient = useQueryClient();

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

  const handleAdd = () => {
    setEditAuthor(null);
    setShowForm(true);
  };

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
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Authors</h3>
        <PermissionGuard permission="create">
          <Button onClick={handleAdd}>
            <Plus className="mr-1 h-4 w-4" /> Add Author
          </Button>
        </PermissionGuard>
      </div>

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <AuthorTable
          authors={data?.data?.data || []}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Pagination */}
      <div className="flex justify-center mt-4 gap-2">
        <Button size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
          Prev
        </Button>
        <span className="px-3 py-1">
          Page {page} of {data?.data?.pages || 1}
        </span>
        <Button size="sm" disabled={page >= (data?.data?.pages || 0)} onClick={() => setPage(page + 1)}>
          Next
        </Button>
      </div>
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
