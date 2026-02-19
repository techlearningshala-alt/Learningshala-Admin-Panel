"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchCourseImages, deleteCourseImage } from "@/lib/menuApi";
import { notifySuccess, notifyError } from "@/lib/notify";
import AddCourseImageForm from "@/components/course-images/AddCourseImageForm";
import CourseImageTable from "@/components/course-images/CourseImageTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import PermissionGuard from "@/components/common/PermissionGuard";
import TableContainer from "@/components/common/TableContainer";
import FiltersSection from "@/components/common/FiltersSection";
import PaginationControls from "@/components/common/PaginationControls";
import { useHeader } from "@/context/HeaderContext";

export default function CourseImagesPage() {
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
    setSearch("");
    setPage(1);
  }, [router.pathname]);

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

  // Calculate filtered items and total (before any early returns)
  const items = data?.data?.data || [];
  const filteredItems = items.filter((item) => {
    if (!search.trim()) return true;
    const searchLower = search.toLowerCase();
    return item.name?.toLowerCase().includes(searchLower);
  });
  
  // Use filtered count when searching, otherwise use total from API
  const total = data?.data?.total || 0;
  const displayTotal = search.trim().length > 0 ? filteredItems.length : total;

  const handleAdd = () => {
    setEditItem(null);
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
            <Plus className="mr-2 h-3 w-5" /> Add Course Image
          </Button>
        </PermissionGuard>
      );
      setActionButton(actionBtn);
      setTotalCount(displayTotal);
    } else {
      setActionButton(null);
      setTotalCount(null);
    }

    // Cleanup: clear action button and total count when component unmounts
    return () => {
      setActionButton(null);
      setTotalCount(null);
    };
  }, [setActionButton, setTotalCount, displayTotal, showForm]);

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
  return (
    <div className="p-1 bg-gray-100 min-h-screen">
      <FiltersSection 
        search={search} 
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }} 
        searchPlaceholder="Search by name..."
        showClearButton={!!search}
        onClearFilters={() => {
          setSearch("");
          setPage(1);
        }}
      />

      <TableContainer
        isLoading={isLoading}
        isEmpty={!isLoading && filteredItems.length === 0}
        loadingText="Loading course images..."
        emptyText="No course images found."
      >
        <CourseImageTable
          items={filteredItems}
          onEdit={handleEdit}
          onDelete={handleDelete}
          page={page}
          limit={10}
          isFiltered={search.trim().length > 0}
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

