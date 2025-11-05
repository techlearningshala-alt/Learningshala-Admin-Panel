"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchTestimonials, deleteTestimonial } from "@/lib/api";
import { notifySuccess, notifyError } from "@/lib/notify";
import AddTestimonialForm from "@/components/testimonial/AddTestimonialForm";
import TestimonialTable from "@/components/testimonial/TestimonialTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function TestimonialPage() {
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["testimonials", page],
    queryFn: () => fetchTestimonials({ page, limit: 10 }),
    keepPreviousData: true,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTestimonial,
    onSuccess: () => {
      notifySuccess("Testimonial deleted successfully");
      queryClient.invalidateQueries(["testimonials"]);
    },
    onError: (err) => notifyError(err.response?.data?.message || "Delete failed"),
  });

  const handleAdd = () => {
    setEditItem(null);
    setShowForm(true);
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this testimonial?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditItem(null);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditItem(null);
    queryClient.invalidateQueries(["testimonials"]);
  };

  // Show form view
  if (showForm) {
    return (
      <AddTestimonialForm
        item={editItem}
        onCancel={handleFormClose}
        onSuccess={handleFormSuccess}
      />
    );
  }

  // Show table view
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Student Testimonials</h2>
        <Button onClick={handleAdd}>
          <Plus className="mr-1 h-4 w-4" /> Add Testimonial
        </Button>
      </div>

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <TestimonialTable
          testimonials={data?.data || []}
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
          Page {page} of {data?.pages || 1}
        </span>
        <Button size="sm" disabled={page >= (data?.pages || 0)} onClick={() => setPage(page + 1)}>
          Next
        </Button>
      </div>
    </div>
  );
}
