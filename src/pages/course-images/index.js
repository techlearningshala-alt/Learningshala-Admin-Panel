"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchCourseImages, deleteCourseImage } from "@/lib/menuApi";
import { notifySuccess, notifyError } from "@/lib/notify";
import AddCourseImageForm from "@/components/course-images/AddCourseImageForm";
import CourseImageTable from "@/components/course-images/CourseImageTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";

export default function CourseImagesPage() {
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["course-images", page],
    queryFn: () => fetchCourseImages({ page, limit: 10 }),
    keepPreviousData: true,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCourseImage,
    onSuccess: () => {
      notifySuccess("Course image deleted successfully");
      queryClient.invalidateQueries(["course-images"]);
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
    if (confirm("Are you sure you want to delete this course image?")) {
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
    queryClient.invalidateQueries(["course-images"]);
  };

  // Show form view
  if (showForm) {
    return (
      <AddCourseImageForm
        item={editItem}
        onCancel={handleFormClose}
        onSuccess={handleFormSuccess}
      />
    );
  }

  // Show table view
  const total = data?.data?.total || 0;
  
  // Filter items based on search
  const filteredItems = (data?.data?.data || []).filter((item) => {
    if (!search.trim()) return true;
    const searchLower = search.toLowerCase();
    return item.name?.toLowerCase().includes(searchLower);
  });
  
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-xl font-bold">Course Images</h3>
          <p className="text-sm text-muted-foreground mt-1">Total: {total}</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-1 h-4 w-4" /> Add Course Image
        </Button>
      </div>

      {/* Search Input */}
      <div className="mb-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by name..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1); // Reset to first page when searching
            }}
            className="pl-10"
          />
        </div>
      </div>

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <CourseImageTable
          items={filteredItems}
          onEdit={handleEdit}
          onDelete={handleDelete}
          page={page}
          limit={10}
          isFiltered={search.trim().length > 0}
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

