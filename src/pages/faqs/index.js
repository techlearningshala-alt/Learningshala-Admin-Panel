"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import FaqTable from "@/components/faq/FaqTable";
import AddFaqForm from "@/components/faq/AddFaqForm";
import {
  fetchFaqs,
  fetchCategories,
  deleteFaq,
  addFaq,
  updateFaq,
} from "@/lib/api";
import { notifySuccess, notifyError } from "@/lib/notify";

export default function FaqPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);

  // Fetch FAQs
  const { data, isLoading } = useQuery({
    queryKey: ["faqs", page],
    queryFn: () => fetchFaqs({ page, limit: 10 }),
    keepPreviousData: true,
  });

  // Fetch Categories
  const { data: categoriesData } = useQuery({
    queryKey: ["faqCategories"],
    queryFn: fetchCategories,
  });
  const categories = categoriesData?.data?.data || [];

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteFaq,
    onSuccess: () => {
      notifySuccess("FAQ deleted successfully");
      queryClient.invalidateQueries(["faqs"]);
    },
    onError: (err) => notifyError(err.response?.data?.message || "Delete failed"),
  });

  // Add mutation
  const addMutation = useMutation({
    mutationFn: addFaq,
    onSuccess: () => {
      notifySuccess("FAQ added successfully");
      queryClient.invalidateQueries(["faqs"]);
    },
    onError: (err) => notifyError(err.response?.data?.message || "Add failed"),
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateFaq(id, data),
    onSuccess: () => {
      notifySuccess("FAQ updated successfully");
      queryClient.invalidateQueries(["faqs"]);
    },
    onError: (err) => notifyError(err.response?.data?.message || "Update failed"),
  });

  const handleAdd = () => {
    setEditingFaq(null);
    setShowForm(true);
  };

  const handleEdit = (faq) => {
    setEditingFaq(faq);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this FAQ?")) {
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
    queryClient.invalidateQueries({ queryKey: ["faqs"], exact: false });
  };

  // Show form view
  if (showForm) {
    return (
      <AddFaqForm
        item={editingFaq}
        categories={categories}
        onCancel={handleFormClose}
        onSuccess={handleFormSuccess}
      />
    );
  }

  // Show table view
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">FAQs</h1>
        <Button onClick={handleAdd}>
          <Plus className="mr-1 h-4 w-4" /> Add FAQ
        </Button>
      </div>

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <FaqTable
          data={data?.data?.data || []}
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
