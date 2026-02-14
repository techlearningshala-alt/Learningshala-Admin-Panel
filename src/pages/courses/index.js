"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchCourses,
  deleteCourse,
  toggleCourseStatus,
  toggleCourseMenuVisibility,
} from "@/lib/menuApi";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import AddCourseForm from "@/components/courses/AddCourseForm";
import { notifySuccess, notifyError } from "@/lib/notify";
import CourseTable from "@/components/courses/CourseTable";
import PermissionGuard from "@/components/common/PermissionGuard";
import FiltersSection from "@/components/common/FiltersSection";
import TableContainer from "@/components/common/TableContainer";
import PaginationControls from "@/components/common/PaginationControls";
import { useHeader } from "@/context/HeaderContext";

export default function CoursesPage() {
  const limit = 20;
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();
  const { setActionButton, setTotalCount } = useHeader();

  // Reset state when route changes
  useEffect(() => {
    setShowForm(false);
    setEditItem(null);
    setPage(1);
    setSearch("");
  }, [router.pathname]);

  // ✅ Fetch all courses
  const { data, isLoading } = useQuery({
    queryKey: ["courses", page],
    queryFn: () => fetchCourses({ page, limit }),
    keepPreviousData: true,
  });

  // ✅ Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteCourse,
    onSuccess: () => {
      notifySuccess("Course deleted successfully");
      queryClient.invalidateQueries(["courses"]);
    },
    onError: (err) => {
      notifyError(err.response?.data?.message || "Delete failed");
    },
  });


  const handleEdit = (item) => {
    setEditItem(item);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this course?")) {
      deleteMutation.mutate(id);
    }
  };

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, value }) => toggleCourseStatus(id, value),
    onSuccess: () => {
      notifySuccess("Course status updated");
      queryClient.invalidateQueries(["courses"]);
    },
    onError: (err) => {
      notifyError(err.response?.data?.message || "Failed to update status");
    },
  });

  const toggleMenuVisibilityMutation = useMutation({
    mutationFn: ({ id, value }) => toggleCourseMenuVisibility(id, value),
    onSuccess: () => {
      notifySuccess("Menu visibility updated");
      queryClient.invalidateQueries(["courses"]);
    },
    onError: (err) => {
      notifyError(err.response?.data?.message || "Failed to update menu visibility");
    },
  });

  const handleFormClose = () => {
    setShowForm(false);
    setEditItem(null);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditItem(null);
    queryClient.invalidateQueries(["courses"]);
  };

  const handleAdd = () => {
    setEditItem(null);
    setShowForm(true);
  };

  // Calculate total and items (before any early returns)
  const total = data?.data?.total || 0;
  const items = data?.data?.data || [];

  // Set action button and total count in header (must be before early return)
  useEffect(() => {
    if (!showForm) {
      const actionBtn = (
        <PermissionGuard permission="create">
          <Button 
            onClick={handleAdd}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
            >
            <Plus className="mr-2 h-3 w-5" /> Add New Course
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

  // Show form view
  if (showForm) {
    return (
      <AddCourseForm
        item={editItem}
        onCancel={handleFormClose}
        onSuccess={handleFormSuccess}
      />
    );
  }

  const filteredItems = search
    ? items.filter((item) => {
        const term = search.toLowerCase();
        return (
          item.name?.toLowerCase().includes(term) ||
          item.domain_name?.toLowerCase().includes(term) ||
          item.slug?.toLowerCase().includes(term)
        );
      })
    : items;
  
  return (
    <div className="p-1 bg-gray-50 min-h-screen">
      <FiltersSection
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name, domain, or slug..."
      />

      <TableContainer
        isLoading={isLoading}
        isEmpty={!isLoading && filteredItems.length === 0}
        loadingText="Loading courses..."
        emptyText="No courses found."
      >
        <CourseTable
          items={filteredItems}
          page={page}
          limit={limit}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleActive={(id, value) => toggleActiveMutation.mutate({ id, value })}
          onToggleMenuVisibility={(id, value) =>
            toggleMenuVisibilityMutation.mutate({ id, value })
          }
        />
      </TableContainer>

      {/* Pagination - Only show when not searching (client-side filtering) */}
      {!search && (
        <PaginationControls
          currentPage={page}
          totalPages={data?.data?.pages || 1}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
