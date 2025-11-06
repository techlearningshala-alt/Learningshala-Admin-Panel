"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, Filter, X } from "lucide-react";
import UniversityFaqTable from "@/components/university-faq/UniversityFaqTable";
import AddUniversityFaqForm from "@/components/university-faq/AddUniversityFaqForm";
import AddUniversityFaqCategoryForm from "@/components/university-faq/AddUniversityFaqCategoryForm";
import {
  fetchUniversityFaqs,
  fetchUniversityFaqCategories,
  deleteUniversityFaq,
  addUniversityFaq,
  updateUniversityFaq,
  deleteUniversityFaqCategory,
  addUniversityFaqCategory,
  updateUniversityFaqCategory,
  fetchAllUniversities,
} from "@/lib/api";
import { notifySuccess, notifyError } from "@/lib/notify";

export default function UniversityFaqPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [categoryPage, setCategoryPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [selectedUniversity, setSelectedUniversity] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch Universities for filter
  const { data: universitiesData } = useQuery({
    queryKey: ["all-universities"],
    queryFn: fetchAllUniversities,
  });
  const universities = universitiesData?.data?.data || [];

  // Fetch University FAQs with filters
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["university-faqs", page, selectedUniversity, selectedCategory],
    queryFn: () => {
      const params = { page, limit: 10 };
      if (selectedUniversity) {
        params.university_id = selectedUniversity;
      }
      if (selectedCategory) {
        params.category_id = selectedCategory;
      }
      console.log("Fetching FAQs with params:", params);
      return fetchUniversityFaqs(params);
    },
    keepPreviousData: true,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  // Fetch Categories
  const { data: categoriesData } = useQuery({
    queryKey: ["universityFaqCategories", categoryPage],
    queryFn: () => fetchUniversityFaqCategories({ page: categoryPage, limit: 10 }),
    keepPreviousData: true,
  });
  const categories = categoriesData?.data?.data || [];

  // Delete FAQ mutation
  const deleteMutation = useMutation({
    mutationFn: deleteUniversityFaq,
    onSuccess: () => {
      notifySuccess("University FAQ deleted successfully");
      queryClient.invalidateQueries(["university-faqs"]);
    },
    onError: (err) => notifyError(err.response?.data?.message || "Delete failed"),
  });

  // Add FAQ mutation
  const addMutation = useMutation({
    mutationFn: addUniversityFaq,
    onSuccess: () => {
      notifySuccess("University FAQ added successfully");
      queryClient.invalidateQueries({ queryKey: ["university-faqs"], exact: false });
      queryClient.refetchQueries({ queryKey: ["university-faqs"] });
    },
    onError: (err) => notifyError(err.response?.data?.message || "Add failed"),
  });

  // Update FAQ mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateUniversityFaq(id, data),
    onSuccess: () => {
      notifySuccess("University FAQ updated successfully");
      queryClient.invalidateQueries(["university-faqs"]);
    },
    onError: (err) => notifyError(err.response?.data?.message || "Update failed"),
  });

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

  // FAQ handlers
  const handleAdd = () => {
    setEditingFaq(null);
    setShowForm(true);
  };

  const handleEdit = (faq) => {
    setEditingFaq(faq);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this University FAQ?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingFaq(null);
  };

  const handleFormSuccess = (data) => {
    const { saveWithDate, ...formData } = data;
    if (editingFaq?.id) {
      updateMutation.mutate({ id: editingFaq.id, data: { ...formData, saveWithDate } });
    } else {
      addMutation.mutate({ ...formData, saveWithDate });
    }
    setShowForm(false);
    setEditingFaq(null);
    queryClient.invalidateQueries({ queryKey: ["university-faqs"], exact: false });
  };

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

  // Filter handlers
  const handleClearFilters = () => {
    setSelectedUniversity(null);
    setSelectedCategory(null);
    setPage(1);
  };

  // Show form views
  if (showForm) {
    return (
      <AddUniversityFaqForm
        item={editingFaq}
        categories={categories}
        onCancel={handleFormClose}
        onSuccess={handleFormSuccess}
      />
    );
  }

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
        <h1 className="text-2xl font-bold">University FAQs</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="mr-1 h-4 w-4" /> Filters
          </Button>
          <Button variant="outline" onClick={handleAddCategory}>
            <Plus className="mr-1 h-4 w-4" /> Add Category
          </Button>
          <Button onClick={handleAdd}>
            <Plus className="mr-1 h-4 w-4" /> Add FAQ
          </Button>
        </div>
      </div>

      {/* Filters Section */}
      {showFilters && (
        <div className="bg-gray-50 border rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold">Filter FAQs</h3>
            <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">University</label>
              <select
                value={selectedUniversity || ""}
                onChange={(e) => {
                  setSelectedUniversity(e.target.value ? parseInt(e.target.value) : null);
                  setPage(1);
                }}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">All Universities</option>
                {universities.map((univ) => (
                  <option key={univ.id} value={univ.id}>
                    {univ.university_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select
                value={selectedCategory || ""}
                onChange={(e) => {
                  setSelectedCategory(e.target.value ? parseInt(e.target.value) : null);
                  setPage(1);
                }}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.heading}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" onClick={handleClearFilters} className="w-full">
                Clear Filters
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded mb-4">
          <p className="text-red-600">Error loading FAQs: {error.message}</p>
          <Button size="sm" onClick={() => refetch()} className="mt-2">Retry</Button>
        </div>
      )}

    <div className="grid grid-cols-12 gap-1">
        {/* Quick Categories Section */}
        <div className="mb-6 col-span-3">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold">Categories</h2>
          {/* <Button variant="ghost" size="sm" onClick={handleAddCategory}>
            <Plus className="mr-1 h-3 w-3" /> Add
          </Button> */}
        </div>
        <div className="bg-white border rounded-lg p-4">
          {categoriesData?.isLoading ? (
            <p className="text-sm text-gray-500">Loading categories...</p>
          ) : categories.length > 0 ? (
            <div className="grid grid-cols-12">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className={`p-2 col-span-12 mb-2 bg-gray-100 border rounded cursor-pointer transition-colors ${
                    selectedCategory === cat.id
                      ? "bg-blue-100 border-blue-500"
                      : "hover:bg-gray-50"
                  }`}
                  onClick={() => {
                    setSelectedCategory(selectedCategory === cat.id ? null : cat.id);
                    setPage(1);
                  }}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-medium">{cat.heading}</span>
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditCategory(cat);
                        }}
                        className="text-blue-600 hover:text-blue-800 text-xs"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCategory(cat.id);
                        }}
                        className="text-red-600 hover:text-red-800 text-xs"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">No categories yet. Add your first category!</p>
          )}
          {categoriesData?.data?.pages > 1 && (
            <div className="flex justify-center mt-4 gap-2">
              <Button size="sm" disabled={categoryPage === 1} onClick={() => setCategoryPage(categoryPage - 1)}>
                Prev
              </Button>
              <span className="px-3 py-1 text-sm">
                Page {categoryPage} of {categoriesData?.data?.pages || 1}
              </span>
              <Button size="sm" disabled={categoryPage >= (categoriesData?.data?.pages || 0)} onClick={() => setCategoryPage(categoryPage + 1)}>
                Next
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* FAQs Section */}
      <div className="col-span-9">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold">FAQs</h2>
        </div>
        
        {isLoading ? (
          <p className="text-center py-8 text-gray-500">Loading FAQs...</p>
        ) : (
          <>
            {(!data?.data?.data || data?.data?.data?.length === 0) ? (
              <div className="bg-white border rounded-lg p-8 text-center">
                <p className="text-gray-500 mb-4">
                  {selectedUniversity || selectedCategory
                    ? "No FAQs found matching your filters."
                    : "No FAQs found. Add your first FAQ!"}
                </p>
                <Button onClick={handleAdd}>
                  <Plus className="mr-1 h-4 w-4" /> Add FAQ
                </Button>
              </div>
            ) : (
              <div className="bg-white border rounded-lg">
                <UniversityFaqTable
                  data={data.data.data}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              </div>
            )}
          </>
        )}

        {/* Pagination */}
        {data?.data?.pages > 1 && (
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
        )}
      </div>
    </div>
    </div>
  );
}

