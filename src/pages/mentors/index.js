"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchMentors, deleteMentor } from "@/lib/api";
import { notifySuccess, notifyError } from "@/lib/notify";
import AddMentorForm from "@/components/mentor/AddMentorForm";
import MentorTable from "@/components/mentor/MentorTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function MentorsPage() {
  const [showForm, setShowForm] = useState(false);
  const [editMentor, setEditMentor] = useState(null);
  const [page, setPage] = useState(1);   // pagination state
  const limit = 10;
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["mentors", page],   // depend on page
    queryFn: () => fetchMentors({ page, limit }),
    keepPreviousData: true,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMentor,
    onSuccess: () => {
      notifySuccess("Mentor deleted successfully");
      queryClient.invalidateQueries(["mentors"]);
    },
    onError: (err) => notifyError(err.response?.data?.message || "Delete failed"),
  });

  const handleAdd = () => {
    setEditMentor(null);
    setShowForm(true);
  };

  const handleEdit = (mentor) => {
    setEditMentor(mentor);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this mentor?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditMentor(null);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditMentor(null);
    queryClient.invalidateQueries(["mentors"]);
  };

  // Show form view
  if (showForm) {
    return (
      <AddMentorForm
        mentor={editMentor}
        onCancel={handleFormClose}
        onSuccess={handleFormSuccess}
      />
    );
  }

  // Show table view
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Mentors</h2>
        <Button onClick={handleAdd}>
          <Plus className="mr-1 h-4 w-4" /> Add Mentor
        </Button>
      </div>

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <MentorTable
          mentors={data?.data?.data || []}
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
