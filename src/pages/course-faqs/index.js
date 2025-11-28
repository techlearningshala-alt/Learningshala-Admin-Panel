"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import AddCourseFaqCategoryForm from "@/components/course-faq/AddCourseFaqCategoryForm";
import CourseFaqCategoryTable from "@/components/course-faq/CourseFaqCategoryTable";
import {
  fetchCourseFaqCategories,
  deleteCourseFaqCategory,
  addCourseFaqCategory,
  updateCourseFaqCategory,
} from "@/lib/menuApi";
import { notifySuccess, notifyError } from "@/lib/notify";

export default function CourseFaqPage() {
  const queryClient = useQueryClient();
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [search, setSearch] = useState("");

  // Fetch Categories
  const { data: categoriesData } = useQuery({
    queryKey: ["courseFaqCategories"],
    queryFn: () => fetchCourseFaqCategories({ page: 1, limit: 1000 }),
    keepPreviousData: true,
  });
  const categories = categoriesData?.data?.data || [];

  // Category mutations
  const deleteCategoryMutation = useMutation({
    mutationFn: deleteCourseFaqCategory,
    onSuccess: () => {
      notifySuccess("Category deleted successfully");
      queryClient.invalidateQueries(["course-faq-categories"]);
      queryClient.invalidateQueries(["courseFaqCategories"]);
      queryClient.invalidateQueries(["course-faq-inline-categories"]);
    },
    onError: (err) => notifyError(err.response?.data?.message || "Delete failed"),
  });

  const addCategoryMutation = useMutation({
    mutationFn: addCourseFaqCategory,
    onSuccess: () => {
      notifySuccess("Category added successfully");
      queryClient.invalidateQueries(["course-faq-categories"]);
      queryClient.invalidateQueries(["courseFaqCategories"]);
      queryClient.invalidateQueries(["course-faq-inline-categories"]);
    },
    onError: (err) => notifyError(err.response?.data?.message || "Add failed"),
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }) => updateCourseFaqCategory(id, data),
    onSuccess: () => {
      notifySuccess("Category updated successfully");
      queryClient.invalidateQueries(["course-faq-categories"]);
      queryClient.invalidateQueries(["courseFaqCategories"]);
      queryClient.invalidateQueries(["course-faq-inline-categories"]);
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
    queryClient.invalidateQueries({ queryKey: ["course-faq-categories"], exact: false });
  };

  // Show form views
  if (showCategoryForm) {
    return (
      <AddCourseFaqCategoryForm
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
        <h3 className="text-xl font-bold">Course FAQ Categories</h3>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleAddCategory}>
            <Plus className="mr-1 h-4 w-4" /> Add Category
          </Button>
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
            <CourseFaqCategoryTable
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

