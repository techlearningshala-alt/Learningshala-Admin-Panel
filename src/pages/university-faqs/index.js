"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import PermissionGuard from "@/components/common/PermissionGuard";
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
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [search, setSearch] = useState("");

  // Fetch Categories
  const { data: categoriesData } = useQuery({
    queryKey: ["universityFaqCategories"],
    queryFn: () => fetchUniversityFaqCategories({ page: 1, limit: 1000 }),
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <h3 className="text-xl font-bold">University FAQ Categories</h3>
        <div className="flex gap-2">
          <PermissionGuard permission="create">
            <Button variant="outline" onClick={handleAddCategory}>
              <Plus className="mr-1 h-4 w-4" /> Add Category
            </Button>
          </PermissionGuard>
        </div>
      </div>
      {/* Category Table */}
      <div className="bg-white border rounded-lg">
        <div className="p-4">
          <div className="max-w-sm mb-4">
            <Input
              placeholder="Search categories"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {categoriesData?.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading categories...</p>
          ) : categories.length > 0 ? (
            <UniversityFaqCategoryTable
              categories={categories.filter((cat) =>
                (cat.heading || "").toLowerCase().includes(search.toLowerCase())
              )}
              onEdit={handleEditCategory}
              onDelete={handleDeleteCategory}
            />
          ) : (
            <p className="text-sm text-muted-foreground">No categories found. Add your first category.</p>
          )}
        </div>
      </div>
    </div>
  );
}

