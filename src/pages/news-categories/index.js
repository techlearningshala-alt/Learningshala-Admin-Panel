"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import PermissionGuard from "@/components/common/PermissionGuard";
import AddNewsCategoryForm from "@/components/news-categories/AddNewsCategoryForm";
import NewsCategoryTable from "@/components/news-categories/NewsCategoryTable";
import {
  fetchNewsCategories,
  deleteNewsCategory,
  addNewsCategory,
  updateNewsCategory,
  toggleNewsCategoryVisibility,
} from "@/lib/api";
import { notifySuccess, notifyError } from "@/lib/notify";
import TableContainer from "@/components/common/TableContainer";
import FiltersSection from "@/components/common/FiltersSection";
import { useHeader } from "@/context/HeaderContext";

const normalizeApiList = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  return [];
};

export default function NewsCategoriesPage() {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [search, setSearch] = useState("");
  const { setActionButton, setTotalCount } = useHeader();

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  const loadCategories = async () => {
    setCategoriesLoading(true);
    try {
      const res = await fetchNewsCategories({ page: 1, limit: 200 });
      setCategories(normalizeApiList(res));
    } catch (err) {
      console.error("Failed to load news categories:", err);
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  };

  useEffect(() => {
    setShowForm(false);
    setEditingCategory(null);
    setSearch("");
  }, [router.pathname]);

  useEffect(() => {
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const deleteCategoryMutation = useMutation({
    mutationFn: deleteNewsCategory,
    onSuccess: () => {
      notifySuccess("News category deleted successfully");
      loadCategories();
    },
    onError: (err) => notifyError(err.response?.data?.message || "Delete failed"),
  });

  const addCategoryMutation = useMutation({
    mutationFn: addNewsCategory,
    onSuccess: () => {
      notifySuccess("News category added successfully");
      loadCategories();
    },
    onError: (err) => notifyError(err.response?.data?.message || "Add failed"),
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }) => updateNewsCategory(id, data),
    onSuccess: () => {
      notifySuccess("News category updated successfully");
      loadCategories();
    },
    onError: (err) => notifyError(err.response?.data?.message || "Update failed"),
  });

  const toggleVisibilityMutation = useMutation({
    mutationFn: ({ id, visible }) => toggleNewsCategoryVisibility(id, visible),
    onSuccess: () => {
      notifySuccess("Category visibility updated successfully");
      loadCategories();
    },
    onError: (err) =>
      notifyError(err.response?.data?.message || "Visibility update failed"),
  });

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

  const handleAdd = () => {
    setEditingCategory(null);
    setShowForm(true);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!showForm) {
      const actionBtn = (
        <PermissionGuard permission="create">
          <Button
            onClick={handleAdd}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
          >
            <Plus className="mr-2 h-3 w-5" /> Add News Category
          </Button>
        </PermissionGuard>
      );
      setActionButton(actionBtn);
      setTotalCount(total);
    } else {
      setActionButton(null);
      setTotalCount(null);
    }

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
    if (confirm("Are you sure you want to delete this news category?")) {
      deleteCategoryMutation.mutate(id);
    }
  };

  const handleToggleVisibility = (id, visible) => {
    toggleVisibilityMutation.mutate({ id, visible });
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingCategory(null);
  };

  const handleFormSuccess = (data, editingCat) => {
    const payload = { ...data };
    if (typeof payload.category_visibility === "boolean") {
      payload.category_visibility = payload.category_visibility ? "yes" : "no";
    }
    if (editingCat) {
      updateCategoryMutation.mutate({ id: editingCat.id, data: payload });
    } else {
      addCategoryMutation.mutate(payload);
    }
    setShowForm(false);
    setEditingCategory(null);
  };

  if (showForm) {
    return (
      <AddNewsCategoryForm
        item={editingCategory}
        onCancel={handleFormClose}
        onSuccess={handleFormSuccess}
      />
    );
  }

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
        isLoading={categoriesLoading}
        isEmpty={!categoriesLoading && filteredCategories.length === 0}
        loadingText="Loading news categories..."
        emptyText="No news categories found."
      >
        <NewsCategoryTable
          items={filteredCategories}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleVisibility={handleToggleVisibility}
        />
      </TableContainer>
    </div>
  );
}
