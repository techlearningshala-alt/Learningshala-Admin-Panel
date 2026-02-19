"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import PermissionGuard from "@/components/common/PermissionGuard";
import AddBlogCategoryForm from "@/components/blog-categories/AddBlogCategoryForm";
import BlogCategoryTable from "@/components/blog-categories/BlogCategoryTable";
import {
  fetchBlogCategories,
  deleteBlogCategory,
  addBlogCategory,
  updateBlogCategory,
} from "@/lib/api";
import { notifySuccess, notifyError } from "@/lib/notify";
import TableContainer from "@/components/common/TableContainer";
import FiltersSection from "@/components/common/FiltersSection";
import { useHeader } from "@/context/HeaderContext";

export default function BlogCategoriesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [search, setSearch] = useState("");
  const { setActionButton, setTotalCount } = useHeader();

  // Reset state when route changes
  useEffect(() => {
    setShowForm(false);
    setEditingCategory(null);
    setSearch("");
  }, [router.pathname]);

  // Fetch Categories
  const { data: categoriesData } = useQuery({
    queryKey: ["blogCategories"],
    queryFn: () => fetchBlogCategories({ page: 1, limit: 1000 }),
    keepPreviousData: true,
  });
  const categories = categoriesData?.data?.data || [];

  // Category mutations
  const deleteCategoryMutation = useMutation({
    mutationFn: deleteBlogCategory,
    onSuccess: () => {
      notifySuccess("Blog category deleted successfully");
      queryClient.invalidateQueries(["blogCategories"]);
    },
    onError: (err) => notifyError(err.response?.data?.message || "Delete failed"),
  });

  const addCategoryMutation = useMutation({
    mutationFn: addBlogCategory,
    onSuccess: () => {
      notifySuccess("Blog category added successfully");
      queryClient.invalidateQueries(["blogCategories"]);
    },
    onError: (err) => notifyError(err.response?.data?.message || "Add failed"),
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }) => updateBlogCategory(id, data),
    onSuccess: () => {
      notifySuccess("Blog category updated successfully");
      queryClient.invalidateQueries(["blogCategories"]);
    },
    onError: (err) => notifyError(err.response?.data?.message || "Update failed"),
  });

  // Calculate filtered categories and total (before any early returns)
  const filteredCategories = search
    ? categories.filter((category) => {
        const term = search.toLowerCase();
        return (
          category.title?.toLowerCase().includes(term) ||
          category.category_slug?.toLowerCase().includes(term)
        );
      })
    : categories;
  const total = filteredCategories.length;

  // Category handlers
  const handleAdd = () => {
    setEditingCategory(null);
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
            <Plus className="mr-2 h-3 w-5" /> Add Blog Category
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

  const handleEdit = (category) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this blog category?")) {
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
      <AddBlogCategoryForm
        item={editingCategory}
        onCancel={handleFormClose}
        onSuccess={handleFormSuccess}
      />
    );
  }

  // Show table view
  return (
    <div className="p-1 bg-gray-100 min-h-screen">
      <FiltersSection 
        search={search} 
        onSearchChange={setSearch} 
        searchPlaceholder="Search by title or slug"
        showClearButton={!!search}
        onClearFilters={() => setSearch("")}
      />

      <TableContainer
        isLoading={categoriesData?.isLoading}
        isEmpty={!categoriesData?.isLoading && filteredCategories.length === 0}
        loadingText="Loading blog categories..."
        emptyText="No blog categories found."
      >
        <BlogCategoryTable
          items={filteredCategories}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </TableContainer>
    </div>
  );
}
