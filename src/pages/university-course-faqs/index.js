"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import AddUniversityCourseFaqForm from "@/components/university-course-faq/AddUniversityCourseFaqForm";
import UniversityCourseFaqTable from "@/components/university-course-faq/UniversityCourseFaqTable";
import {
  fetchUniversityCourseFaqs,
  deleteUniversityCourseFaq,
  addUniversityCourseFaq,
  updateUniversityCourseFaq,
} from "@/lib/universityApi";
import { fetchUniversityFaqCategories } from "@/lib/api";
import { fetchAllUniversities, fetchUniversityCourses } from "@/lib/universityApi";
import { notifySuccess, notifyError } from "@/lib/notify";

export default function UniversityCourseFaqPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  // Fetch FAQs
  const { data, isLoading } = useQuery({
    queryKey: ["universityCourseFaqs", page, selectedCourse, selectedCategory],
    queryFn: () =>
      fetchUniversityCourseFaqs({
        page,
        limit: 10,
        course_id: selectedCourse || undefined,
        category_id: selectedCategory || undefined,
      }),
    keepPreviousData: true,
  });

  const faqs = data?.data?.data || [];

  // Fetch Categories (shared with university FAQs)
  const { data: categoriesData } = useQuery({
    queryKey: ["universityFaqCategories"],
    queryFn: () => fetchUniversityFaqCategories({ page: 1, limit: 100 }),
  });
  const categories = categoriesData?.data?.data || [];

  // Fetch Universities
  const { data: universitiesData } = useQuery({
    queryKey: ["all-universities"],
    queryFn: fetchAllUniversities,
  });
  const universities = universitiesData?.data?.data || universitiesData?.data || [];

  // Fetch Courses (filtered by selected university if any)
  const { data: coursesData } = useQuery({
    queryKey: ["universityCourses", "all"],
    queryFn: () => fetchUniversityCourses({ page: 1, limit: 1000 }),
    enabled: true,
  });
  const allCourses = coursesData?.data?.data || [];

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteUniversityCourseFaq,
    onSuccess: () => {
      notifySuccess("FAQ deleted successfully");
      queryClient.invalidateQueries(["universityCourseFaqs"]);
    },
    onError: (err) => notifyError(err.response?.data?.message || "Delete failed"),
  });

  // Add mutation
  const addMutation = useMutation({
    mutationFn: addUniversityCourseFaq,
    onSuccess: () => {
      notifySuccess("FAQ added successfully");
      queryClient.invalidateQueries(["universityCourseFaqs"]);
    },
    onError: (err) => notifyError(err.response?.data?.message || "Add failed"),
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateUniversityCourseFaq(id, data),
    onSuccess: () => {
      notifySuccess("FAQ updated successfully");
      queryClient.invalidateQueries(["universityCourseFaqs"]);
    },
    onError: (err) => notifyError(err.response?.data?.message || "Update failed"),
  });

  // Handlers
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
  };

  // Show form view
  if (showForm) {
    return (
      <AddUniversityCourseFaqForm
        item={editingFaq}
        categories={categories}
        courses={allCourses}
        onCancel={handleFormClose}
        onSuccess={handleFormSuccess}
      />
    );
  }

  // Show table view
  return (
    <div className="p-4">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">University Course FAQs</h1>
        <Button onClick={handleAdd}>
          <Plus className="mr-1 h-4 w-4" /> Add FAQ
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-4 flex gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Filter by Course</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={selectedCourse}
            onChange={(e) => {
              setSelectedCourse(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Courses</option>
            {allCourses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Filter by Category</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.heading}
              </option>
            ))}
          </select>
        </div>
        {(selectedCourse || selectedCategory) && (
          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={() => {
                setSelectedCourse("");
                setSelectedCategory("");
                setPage(1);
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>

      {/* FAQ Table */}
      <div className="bg-white border rounded-lg">
        <div className="p-4">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading FAQs...</p>
          ) : faqs.length > 0 ? (
            <UniversityCourseFaqTable data={faqs} onEdit={handleEdit} onDelete={handleDelete} />
          ) : (
            <p className="text-sm text-muted-foreground">No FAQs found. Add your first FAQ.</p>
          )}
        </div>
        {data?.data?.pages > 1 && (
          <div className="flex justify-center gap-2 p-4 border-t">
            <Button size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
              Prev
            </Button>
            <span className="px-3 py-1 text-sm">
              Page {page} of {data?.data?.pages || 1}
            </span>
            <Button
              size="sm"
              disabled={page >= (data?.data?.pages || 0)}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

