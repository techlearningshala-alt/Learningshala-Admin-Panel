"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchUniversityFaqCategories,
  deleteUniversityFaqCategory,
  addUniversityFaqCategory,
  updateUniversityFaqCategory,
} from "@/lib/api";
import { notifySuccess, notifyError } from "@/lib/notify";
import AddUniversityFaqCategoryForm from "@/components/university-faq/AddUniversityFaqCategoryForm";
import UniversityFaqCategoryTable from "@/components/university-faq/UniversityFaqCategoryTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function UniversityFaqCategoriesPage() {
  const [showForm, setShowForm] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["university-faq-categories", page],
    queryFn: () => fetchUniversityFaqCategories({ page, limit: 10 }),
    keepPreviousData: true,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUniversityFaqCategory,
    onSuccess: () => {
      notifySuccess("Category deleted successfully");
      queryClient.invalidateQueries(["university-faq-categories"]);
    },
    onError: (err) =>
      notifyError(err.response?.data?.message || "Delete failed"),
  });

  // Add mutation
  const addMutation = useMutation({
    mutationFn: addUniversityFaqCategory,
    onSuccess: () => {
      notifySuccess("Category added successfully");
      queryClient.invalidateQueries(["university-faq-categories"]);
    },
    onError: (err) =>
      notifyError(err.response?.data?.message || "Add failed"),
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateUniversityFaqCategory(id, data),
    onSuccess: () => {
      notifySuccess("Category updated successfully");
      queryClient.invalidateQueries(["university-faq-categories"]);
    },
    onError: (err) =>
      notifyError(err.response?.data?.message || "Update failed"),
  });

  const handleAdd = () => {
    setEditCategory(null);
    setShowForm(true);
  };

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
    queryClient.invalidateQueries({ queryKey: ["university-faq-categories"], exact: false });
  };

  // Show form view
  if (showForm) {
    return (
      <AddUniversityFaqCategoryForm
        item={editCategory}
        onCancel={handleFormClose}
        onSuccess={handleFormSuccess}
      />
    );
  }

  // Show table view
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">University FAQ Categories</h1>
        <Button onClick={handleAdd}>
          <Plus className="mr-1 h-4 w-4" /> Add Category
        </Button>
      </div>

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <UniversityFaqCategoryTable
          categories={data?.data?.data || []}
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

