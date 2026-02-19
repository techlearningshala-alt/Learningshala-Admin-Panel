"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
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
import TableContainer from "@/components/common/TableContainer";
import FiltersSection from "@/components/common/FiltersSection";
import { useHeader } from "@/context/HeaderContext";

export default function UniversityFaqPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [search, setSearch] = useState("");
  const { setActionButton, setTotalCount } = useHeader();

  // Reset state when route changes
  useEffect(() => {
    setShowCategoryForm(false);
    setEditingCategory(null);
    setSearch("");
  }, [router.pathname]);

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

  // Calculate filtered categories (before any early returns)
  const filteredCategories = categories.filter((cat) =>
    (cat.heading || "").toLowerCase().includes(search.toLowerCase())
  );
  const total = filteredCategories.length;

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

  // Set action button and total count in header (must be before early return)
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    if (!showCategoryForm) {
      const actionBtn = (
        <PermissionGuard permission="create">
          <Button 
            onClick={handleAddCategory}
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
  }, [setActionButton, setTotalCount, total, showCategoryForm]);

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
    <div className="p-1 bg-gray-100 min-h-screen">
      <FiltersSection 
        search={search} 
        onSearchChange={setSearch} 
        searchPlaceholder="Search categories"
        showClearButton={!!search}
        onClearFilters={() => setSearch("")}
      />

      <TableContainer
        isLoading={categoriesData?.isLoading}
        isEmpty={!categoriesData?.isLoading && filteredCategories.length === 0}
        loadingText="Loading categories..."
        emptyText="No categories found. Add your first category."
      >
        <UniversityFaqCategoryTable
          categories={filteredCategories}
          onEdit={handleEditCategory}
          onDelete={handleDeleteCategory}
        />
      </TableContainer>
    </div>
  );
}

