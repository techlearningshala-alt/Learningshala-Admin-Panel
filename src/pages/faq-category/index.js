"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchFaqCategories,
  deleteFaqCategory,
  addFaqCategory,
  updateFaqCategory,
} from "@/lib/api";
import { notifySuccess, notifyError } from "@/lib/notify";
import AddFaqCategoryForm from "@/components/faq/AddFaqCategoryForm";
import FaqCategoryTable from "@/components/faq/CategoryTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import PermissionGuard from "@/components/common/PermissionGuard";
import TableContainer from "@/components/common/TableContainer";
import PaginationControls from "@/components/common/PaginationControls";
import { useHeader } from "@/context/HeaderContext";

export default function FaqCategoriesPage() {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [page, setPage] = useState(1);
  const limit = 10;
  const queryClient = useQueryClient();
  const { setActionButton, setTotalCount } = useHeader();

  // Reset state when route changes
  useEffect(() => {
    setShowForm(false);
    setEditCategory(null);
    setPage(1);
  }, [router.pathname]);

  const { data, isLoading } = useQuery({
    queryKey: ["faq-categories", page],
    queryFn: () => fetchFaqCategories({ page, limit }),
    keepPreviousData: true,
  });

  // Calculate total (before any early returns)
  const total = data?.data?.total || 0;

  const deleteMutation = useMutation({
    mutationFn: deleteFaqCategory,
    onSuccess: () => {
      notifySuccess("Category deleted successfully");
      queryClient.invalidateQueries(["faq-categories"]);
    },
    onError: (err) =>
      notifyError(err.response?.data?.message || "Delete failed"),
  });

  // Add mutation
  const addMutation = useMutation({
    mutationFn: addFaqCategory,
    onSuccess: () => {
      notifySuccess("Category added successfully");
      queryClient.invalidateQueries(["faq-categories"]);
    },
    onError: (err) =>
      notifyError(err.response?.data?.message || "Add failed"),
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateFaqCategory(id, data),
    onSuccess: () => {
      notifySuccess("Category updated successfully");
      queryClient.invalidateQueries(["faq-categories"]);
    },
    onError: (err) =>
      notifyError(err.response?.data?.message || "Update failed"),
  });

  const handleAdd = () => {
    setEditCategory(null);
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
            <Plus className="mr-2 h-3 w-5" /> Add Category
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

  const handleEdit = (cat) => {
    setEditCategory(cat);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this category?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditCategory(null);
  };

  const handleFormSuccess = (data) => {
    const { saveWithDate, ...formData } = data;
    if (editCategory?.id) {
      updateMutation.mutate({ id: editCategory.id, data: { ...formData, saveWithDate } });
    } else {
      addMutation.mutate({ ...formData, saveWithDate });
    }
    setShowForm(false);
    setEditCategory(null);
    queryClient.invalidateQueries({ queryKey: ["faq-categories"], exact: false });
  };

  // Show form view
  if (showForm) {
    return (
      <AddFaqCategoryForm
        item={editCategory}
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
        loadingText="Loading categories..."
        emptyText="No categories found."
      >
        <FaqCategoryTable
          categories={data?.data?.data || []}
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
