"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import FaqTable from "@/components/faq/FaqTable";
import PermissionGuard from "@/components/common/PermissionGuard";
import AddFaqForm from "@/components/faq/AddFaqForm";
import TableContainer from "@/components/common/TableContainer";
import PaginationControls from "@/components/common/PaginationControls";
import { useHeader } from "@/context/HeaderContext";
import {
  fetchFaqs,
  fetchCategories,
  deleteFaq,
  addFaq,
  updateFaq,
} from "@/lib/api";
import { notifySuccess, notifyError } from "@/lib/notify";

export default function FaqPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const limit = 10;
  const [showForm, setShowForm] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const { setActionButton, setTotalCount } = useHeader();

  // Reset state when route changes
  useEffect(() => {
    setShowForm(false);
    setEditingFaq(null);
    setPage(1);
  }, [router.pathname]);

  // Fetch FAQs
  const { data, isLoading } = useQuery({
    queryKey: ["faqs", page],
    queryFn: () => fetchFaqs({ page, limit }),
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

  // Calculate total (before any early returns)
  const total = data?.data?.total || 0;

  const handleAdd = () => {
    setEditingFaq(null);
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
            <Plus className="mr-2 h-3 w-5" /> Add FAQ
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
    <div className="p-1 bg-gray-100 min-h-screen">
      <TableContainer
        isLoading={isLoading}
        isEmpty={!isLoading && (data?.data?.data || []).length === 0}
        loadingText="Loading FAQs..."
        emptyText="No FAQs found."
      >
        <FaqTable
          data={data?.data?.data || []}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </TableContainer>

      <PaginationControls
        currentPage={page}
        totalPages={data?.data?.pages || 1}
        onPageChange={setPage}
      />
    </div>
  );
}
