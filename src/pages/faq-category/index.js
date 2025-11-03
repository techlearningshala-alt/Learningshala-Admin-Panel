"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchFaqCategories,
  deleteFaqCategory,
} from "@/lib/api";
import { notifyError } from "@/lib/notify";
import AddFaqCategoryDialog from "@/components/faq/AddFaqCategoryDialog";
import FaqCategoryTable from "@/components/faq/CategoryTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function FaqCategoriesPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["faq-categories", page],
    queryFn: () => fetchFaqCategories({ page, limit: 10 }),
    keepPreviousData: true,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteFaqCategory,
    onSuccess: () => queryClient.invalidateQueries(["faq-categories"]),
    onError: (err) =>
      notifyError(err.response?.data?.message || "Delete failed"),
  });

  const openAddModal = () => {
    setEditCategory(null);
    setModalOpen(true);
  };
  const openEditModal = (cat) => {
    setEditCategory(cat);
    setModalOpen(true);
  };
  const handleDelete = (id) => {
    if (confirm("Are you sure?")) deleteMutation.mutate(id);
  };

  return (
    <div className="p-6 bg-gray-200">
      <div className="flex justify-between mb-4">
        <h1 className="text-lg font-semibold">FAQ Categories</h1>
        <Button onClick={openAddModal}>
          <Plus className="w-4 h-4 mr-1" /> Add Category
        </Button>
      </div>

      <FaqCategoryTable
        categories={data?.data?.data || []}
        onEdit={openEditModal}
        onDelete={handleDelete}
      />

      {/* Pagination */}
      <div className="flex justify-center mt-4 gap-2">
        <Button size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
          Prev
        </Button>
        <span className="px-3 py-1">
          Page {page} of {data?.data.pages}
        </span>
        <Button size="sm" disabled={page === data?.data.pages} onClick={() => setPage(page + 1)}>
          Next
        </Button>
      </div>

      <AddFaqCategoryDialog
        item={editCategory}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
}
