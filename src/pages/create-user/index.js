"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchUsers, deleteUser } from "@/lib/api";
import { notifySuccess, notifyError } from "@/lib/notify";
import CreateUserForm from "@/components/users/CreateUserForm";
import UserTable from "@/components/users/UserTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import PermissionGuard from "@/components/common/PermissionGuard";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import TableContainer from "@/components/common/TableContainer";
import FiltersSection from "@/components/common/FiltersSection";
import PaginationControls from "@/components/common/PaginationControls";
import { useHeader } from "@/context/HeaderContext";

export default function CreateUserPage() {
  const router = useRouter();
  const limit = 10;
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
    setSearch("");
    setPage(1);
  }, [router.pathname]);

  const { data, isLoading } = useQuery({
    queryKey: ["users", page],
    queryFn: () => fetchUsers({ page, limit, role: "mentor" }), // Only fetch mentor users
    keepPreviousData: true,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      notifySuccess("User deleted successfully");
      queryClient.invalidateQueries(["users"]);
    },
    onError: (err) => {
      notifyError(err.response?.data?.message || "Delete failed");
    },
  });

  // Calculate filtered items and total (before any early returns)
  const items = data?.data?.data || [];
  const filteredItems = search
    ? items.filter((item) => {
        const term = search.toLowerCase();
        return (
          item.name?.toLowerCase().includes(term) ||
          item.email?.toLowerCase().includes(term) ||
          item.role?.toLowerCase().includes(term)
        );
      })
    : items;
  const total = data?.data?.total || items.length;

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
            <Plus className="mr-2 h-3 w-5" /> Add User
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
    if (confirm("Are you sure you want to delete this user?")) {
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
    queryClient.invalidateQueries(["users"]);
  };

  // Show form view
  if (showForm) {
    return (
      <ProtectedRoute roles={["admin"]}>
        <CreateUserForm
          item={editItem}
          onCancel={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      </ProtectedRoute>
    );
  }

  // Show table view
  return (
    <ProtectedRoute roles={["admin"]}>
      <div className="p-1 bg-gray-100 min-h-screen">
        <FiltersSection 
          search={search} 
          onSearchChange={(value) => {
            setSearch(value);
            setPage(1);
          }} 
          searchPlaceholder="Search by name, email, or role"
          showClearButton={!!search}
          onClearFilters={() => {
            setSearch("");
            setPage(1);
          }}
        />

        <TableContainer
          isLoading={isLoading}
          isEmpty={!isLoading && filteredItems.length === 0}
          loadingText="Loading users..."
          emptyText="No users found."
        >
          <UserTable
            items={filteredItems}
            page={page}
            limit={limit}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </TableContainer>

        {!search && (
          <PaginationControls
            currentPage={page}
            totalPages={data?.data?.pages || 1}
            onPageChange={setPage}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}

