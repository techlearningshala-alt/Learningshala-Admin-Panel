"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import FaqTable from "@/components/faq/FaqTable";
import AddFaqDialog from "@/components/faq/AddFaqDialog";
import {
  fetchFaqs,
  fetchCategories,
  deleteFaq,
  addFaq,
  updateFaq,
} from "@/lib/api";
import toast from "react-hot-toast";

export default function FaqPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);

  // Fetch FAQs
  const { data, isLoading } = useQuery({
    queryKey: ["faqs", page],
    queryFn: () => fetchFaqs({ page, limit: 10 }),
    keepPreviousData: true,
  });

  // console.log(data,"data")

  // Fetch Categories
  const { data: categoriesData } = useQuery({
    queryKey: ["faqCategories"],
    queryFn: fetchCategories,
  });
  const categories = categoriesData?.data?.data || [];
  console.log(categories,"categories")

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteFaq,
    onSuccess: () => {
      toast.success("FAQ deleted");
      queryClient.invalidateQueries(["faqs"]);
    },
    onError: () => toast.error("Failed to delete FAQ"),
  });

  // Add mutation
  const addMutation = useMutation({
    mutationFn: addFaq,
    onSuccess: () => {
      toast.success("FAQ added");
      queryClient.invalidateQueries(["faqs"]);
    },
    onError: () => toast.error("Failed to add FAQ"),
  });
  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateFaq(id, data),
    onSuccess: () => {
      toast.success("FAQ updated");
      queryClient.invalidateQueries(["faqs"]);
    },
    onError: () => toast.error("Failed to update FAQ"),
  });

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this FAQ?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleSave = (data, saveWithDate, item) => {
    if (item?.id) {
      updateMutation.mutate({ id: item.id, data: { ...data, saveWithDate } });
    } else {
      addMutation.mutate({ ...data, saveWithDate });
    }
    setOpen(false);
  };

  return (
    <div className="p-6">
      <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        {/* Header */}
        <div className="flex justify-between items-center bg-gray-100 px-4 py-3 border-b border-gray-200">
          <h1 className="text-lg font-semibold text-gray-800">FAQs</h1>
          <Button
            onClick={() => {
              setEditingFaq(null);
              setOpen(true);
            }}
          >
            Add New FAQ
          </Button>
        </div>

        {/* Table */}
        <FaqTable
          data={data?.data?.data || []}
          onEdit={(faq) => {
            setEditingFaq(faq);
            setOpen(true);
          }}
          onDelete={handleDelete}
        />
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-4 gap-2">
        <Button size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
          Prev
        </Button>
        <span className="px-3 py-1">
          Page {data?.data?.page} of {data?.data?.pages}
        </span>
        <Button
          size="sm"
          disabled={page === data?.data?.pages}
          onClick={() => setPage(page + 1)}
        >
          Next
        </Button>
      </div>

      {/* Add/Edit Modal */}
      <AddFaqDialog
        item={editingFaq}
        open={open}
        onOpenChange={setOpen}
        categories={categories}
        onSubmit={handleSave}
      />
    </div>
  );
}
