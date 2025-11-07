"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import AddUniversityFaqCategoryForm from "@/components/university-faq/AddUniversityFaqCategoryForm";
import UniversityFaqCategoryTable from "@/components/university-faq/UniversityFaqCategoryTable";
import {
  fetchUniversityFaqCategories,
  deleteUniversityFaqCategory,
  addUniversityFaqCategory,
  updateUniversityFaqCategory,
} from "@/lib/api";
import { notifySuccess, notifyError } from "@/lib/notify";

export default function UniversityFaqPage() {
  const queryClient = useQueryClient();
  const [categoryPage, setCategoryPage] = useState(1);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  // Fetch Categories
  const { data: categoriesData } = useQuery({
    queryKey: ["universityFaqCategories", categoryPage],
    queryFn: () => fetchUniversityFaqCategories({ page: categoryPage, limit: 10 }),
    keepPreviousData: true,
  });
  const categories = categoriesData?.data?.data || [];

  // Category mutations
  const deleteCategoryMutation = useMutation({
    mutationFn: deleteUniversityFaqCategory,
    onSuccess: () => {
      notifySuccess("Category deleted successfully");
      queryClient.invalidateQueries(["university-faq-categories"]);
      queryClient.invalidateQueries(["universityFaqCategories"]);
    },
    onError: (err) => notifyError(err.response?.data?.message || "Delete failed"),
  });

  const addCategoryMutation = useMutation({
    mutationFn: addUniversityFaqCategory,
    onSuccess: () => {
      notifySuccess("Category added successfully");
      queryClient.invalidateQueries(["university-faq-categories"]);
      queryClient.invalidateQueries(["universityFaqCategories"]);
    },
    onError: (err) => notifyError(err.response?.data?.message || "Add failed"),
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }) => updateUniversityFaqCategory(id, data),
    onSuccess: () => {
      notifySuccess("Category updated successfully");
      queryClient.invalidateQueries(["university-faq-categories"]);
      queryClient.invalidateQueries(["universityFaqCategories"]);
    },
    onError: (err) => notifyError(err.response?.data?.message || "Update failed"),
  });

  // Category handlers
  const handleAddCategory = () => {
    setEditingCategory(null);
    setShowCategoryForm(true);
  };

  const handleEditCategory = (cat) => {
    setEditingCategory(cat);
    setShowCategoryForm(true);
  };

  const handleDeleteCategory = (id) => {
    if (confirm("Are you sure you want to delete this category? All FAQs in this category will also be deleted.")) {
      deleteCategoryMutation.mutate(id);
    }
  };

  const handleCategoryFormClose = () => {
    setShowCategoryForm(false);
    setEditingCategory(null);
  };

  const handleCategoryFormSuccess = (data) => {
    const { saveWithDate, ...formData } = data;
    if (editingCategory?.id) {
      updateCategoryMutation.mutate({ id: editingCategory.id, data: { ...formData, saveWithDate } });
    } else {
      addCategoryMutation.mutate({ ...formData, saveWithDate });
    }
    setShowCategoryForm(false);
    setEditingCategory(null);
    queryClient.invalidateQueries({ queryKey: ["university-faq-categories"], exact: false });
  };

  // Show form views
  if (showCategoryForm) {
    return (
      <AddUniversityFaqCategoryForm
        item={editingCategory}
        onCancel={handleCategoryFormClose}
        onSuccess={handleCategoryFormSuccess}
      />
    );
  }

  // Show unified table view
  return (
    <div className="p-4">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">University FAQ Categories</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleAddCategory}>
            <Plus className="mr-1 h-4 w-4" /> Add Category
          </Button>
        </div>
      </div>
      {/* Category Table */}
      <div className="bg-white border rounded-lg">
        <div className="p-4">
          {categoriesData?.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading categories...</p>
          ) : categories.length > 0 ? (
            <UniversityFaqCategoryTable
              categories={categories}
              onEdit={handleEditCategory}
              onDelete={handleDeleteCategory}
            />
          ) : (
            <p className="text-sm text-muted-foreground">No categories found. Add your first category.</p>
          )}
        </div>
        {categoriesData?.data?.pages > 1 && (
          <div className="flex justify-center gap-2 p-4 border-t">
            <Button size="sm" disabled={categoryPage === 1} onClick={() => setCategoryPage(categoryPage - 1)}>
              Prev
            </Button>
            <span className="px-3 py-1 text-sm">
              Page {categoryPage} of {categoriesData?.data?.pages || 1}
            </span>
            <Button
              size="sm"
              disabled={categoryPage >= (categoriesData?.data?.pages || 0)}
              onClick={() => setCategoryPage(categoryPage + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

