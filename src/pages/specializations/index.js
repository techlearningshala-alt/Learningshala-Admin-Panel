"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchSpecialization,
  deleteSpecializations,
  toggleSpecializationStatus,
  toggleSpecializationMenuVisibility,
  findAllCourseName,
} from "@/lib/menuApi";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { notifySuccess, notifyError } from "@/lib/notify";
import SpecializationTable from "@/components/specialization/SpecializationTable";
import PermissionGuard from "@/components/common/PermissionGuard";
import FiltersSection from "@/components/common/FiltersSection";
import TableContainer from "@/components/common/TableContainer";
import PaginationControls from "@/components/common/PaginationControls";
import { useHeader } from "@/context/HeaderContext";

export default function SpecializationsPage() {
  const limit = 25;
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const queryClient = useQueryClient();
  const { setActionButton, setTotalCount } = useHeader();

  // ✅ Fetch all specializations
  const { data, isLoading } = useQuery({
    queryKey: ["specialization", page, search, courseFilter],
    queryFn: () => fetchSpecialization({ 
      page: search || courseFilter ? 1 : page, // Reset to page 1 when searching/filtering
      limit, 
      search: search || undefined,
      course_id: courseFilter ? parseInt(courseFilter) : undefined
    }),
    keepPreviousData: true,
  });

  // ✅ Fetch courses for filter dropdown
  const { data: coursesData } = useQuery({
    queryKey: ["course-names"],
    queryFn: findAllCourseName,
    keepPreviousData: true,
  });
  const courses = coursesData?.data || [];

  // ✅ Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteSpecializations,
    onSuccess: () => {
      notifySuccess("Specialization deleted successfully");
      queryClient.invalidateQueries(["specialization"]);
    },
    onError: (err) => {
      notifyError(err.response?.data?.message || "Delete failed");
    },
  });

  const handleAdd = () => {
    router.push("/specializations/add");
  };

  const handleEdit = (item) => {
    router.push(`/specializations/edit/${item.id}`);
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this specialization?")) {
      deleteMutation.mutate(id);
    }
  };

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, value }) => toggleSpecializationStatus(id, value),
    onSuccess: () => {
      notifySuccess("Specialization status updated");
      queryClient.invalidateQueries(["specialization"]);
    },
    onError: (err) => {
      notifyError(err.response?.data?.message || "Failed to update status");
    },
  });

  const toggleMenuVisibilityMutation = useMutation({
    mutationFn: ({ id, value }) => toggleSpecializationMenuVisibility(id, value),
    onSuccess: () => {
      notifySuccess("Menu visibility updated");
      queryClient.invalidateQueries(["specialization"]);
    },
    onError: (err) => {
      notifyError(err.response?.data?.message || "Failed to update menu visibility");
    },
  });

  // Calculate total and items (before any early returns)
  const total = data?.data?.total || 0;
  const items = data?.data?.data || [];

  // Set action button and total count in header (must be before early return)
  useEffect(() => {
    const actionBtn = (
      <PermissionGuard permission="create">
        <Button 
          onClick={handleAdd}
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-700 hover:to-blue-800 text-white"
        >
          <Plus className="mr-2 h-3 w-5" /> Add Specialization
        </Button>
      </PermissionGuard>
    );
    setActionButton(actionBtn);
    setTotalCount(total);

    // Cleanup: clear action button and total count when component unmounts
    return () => {
      setActionButton(null);
      setTotalCount(null);
    };
  }, [setActionButton, setTotalCount, total]);

  const hasFilters = !!search || !!courseFilter;
  const totalPages = data?.data?.pages || 1;
  
  return (
    <div className="bg-gray-50 min-h-screen">
      <FiltersSection
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        searchPlaceholder="Search by name..."
        showClearButton={hasFilters}
        onClearFilters={() => {
          setSearch("");
          setCourseFilter("");
          setPage(1);
        }}
      >
        <div className="relative">
          <select
            value={courseFilter}
            onChange={(e) => {
              setCourseFilter(e.target.value);
              setPage(1);
            }}
            className="border border-gray-300 rounded-md px-4 py-1 pr-8 focus:border-blue-500 focus:ring-blue-500 bg-white text-gray-700 min-w-[200px]"
          >
            <option value="">All Courses</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </select>
        </div>
      </FiltersSection>

      <TableContainer
        isLoading={isLoading}
        isEmpty={!isLoading && items.length === 0}
        emptyMessage="No specializations found."
      >
        <SpecializationTable
          items={items}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleActive={(id, value) => toggleActiveMutation.mutate({ id, value })}
          onToggleMenuVisibility={(id, value) =>
            toggleMenuVisibilityMutation.mutate({ id, value })
          }
          currentPage={search || courseFilter ? 1 : page}
          limit={limit}
        />
      </TableContainer>

      {/* Pagination - Only show when not searching/filtering */}
      {!search && !courseFilter && (
        <PaginationControls
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
