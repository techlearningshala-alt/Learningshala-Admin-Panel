"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X } from "lucide-react";
import PermissionGuard from "@/components/common/PermissionGuard";
import AddBlogFaqCategoryForm from "@/components/blog-faq/AddBlogFaqCategoryForm";
import BlogFaqCategoryTable from "@/components/blog-faq/BlogFaqCategoryTable";
import {
  fetchBlogFaqCategories,
  deleteBlogFaqCategory,
  addBlogFaqCategory,
  updateBlogFaqCategory,
} from "@/lib/api";
import { notifySuccess, notifyError } from "@/lib/notify";

export default function BlogFaqCategoriesPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [search, setSearch] = useState("");

  // Fetch Categories
  const { data: categoriesData } = useQuery({
    queryKey: ["blogFaqCategories"],
    queryFn: () => fetchBlogFaqCategories({ page: 1, limit: 1000 }),
    keepPreviousData: true,
  });
  const categories = categoriesData?.data?.data || [];

  // Category mutations
  const deleteCategoryMutation = useMutation({
    mutationFn: deleteBlogFaqCategory,
    onSuccess: () => {
      notifySuccess("Blog FAQ category deleted successfully");
      queryClient.invalidateQueries(["blogFaqCategories"]);
      queryClient.invalidateQueries(["blog-faq-inline-categories"]);
    },
    onError: (err) => notifyError(err.response?.data?.message || "Delete failed"),
  });

  const addCategoryMutation = useMutation({
    mutationFn: addBlogFaqCategory,
    onSuccess: () => {
      notifySuccess("Blog FAQ category added successfully");
      queryClient.invalidateQueries(["blogFaqCategories"]);
      queryClient.invalidateQueries(["blog-faq-inline-categories"]);
    },
    onError: (err) => notifyError(err.response?.data?.message || "Add failed"),
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }) => updateBlogFaqCategory(id, data),
    onSuccess: () => {
      notifySuccess("Blog FAQ category updated successfully");
      queryClient.invalidateQueries(["blogFaqCategories"]);
      queryClient.invalidateQueries(["blog-faq-inline-categories"]);
    },
    onError: (err) => notifyError(err.response?.data?.message || "Update failed"),
  });

  // Category handlers
  const handleAdd = () => {
    setEditingCategory(null);
    setShowForm(true);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this blog FAQ category?")) {
      deleteCategoryMutation.mutate(id);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingCategory(null);
  };

  const handleFormSuccess = (data, editingCategory) => {
    if (editingCategory) {
      updateCategoryMutation.mutate({ id: editingCategory.id, data });
    } else {
      addCategoryMutation.mutate(data);
    }
    setShowForm(false);
    setEditingCategory(null);
  };

  // Show form view
  if (showForm) {
    return (
      <AddBlogFaqCategoryForm
        item={editingCategory}
        onCancel={handleFormClose}
        onSuccess={handleFormSuccess}
      />
    );
  }

  // Show table view
  const filteredCategories = search
    ? categories.filter((category) => {
        const term = search.toLowerCase();
        return (
          category.heading?.toLowerCase().includes(term)
        );
      })
    : categories;

  return (
    <div className="p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold">Blog FAQ Categories</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Total: {filteredCategories.length} {search && `(filtered from ${categories.length})`}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <div className="relative w-72">
              <Input
                placeholder="Search by heading"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pr-8"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
        <PermissionGuard permission="create">
          <Button onClick={handleAdd}>
            <Plus className="mr-1 h-4 w-4" /> Add Blog FAQ Category
          </Button>
        </PermissionGuard>
      </div>

      <BlogFaqCategoryTable
        categories={filteredCategories}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
