"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchUniversityCourses,
  deleteUniversityCourse,
  fetchAllUniversities,
  toggleUniversityCourseStatus,
  toggleUniversityCoursePageCreated,
  toggleUniversityCourseCompare,
} from "@/lib/universityApi";
import { notifySuccess, notifyError } from "@/lib/notify";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import UniversityCourseTable from "@/components/university-courses/UniversityCourseTable";
import AddUniversityCourseForm from "@/components/university-courses/AddUniversityCourseForm";
import PermissionGuard from "@/components/common/PermissionGuard";
import FiltersSection from "@/components/common/FiltersSection";
import TableContainer from "@/components/common/TableContainer";
import PaginationControls from "@/components/common/PaginationControls";
import { useHeader } from "@/context/HeaderContext";

const PAGE_SIZE = 20;

const normalizeApiList = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  return [];
};

export default function UniversityCoursesPage() {
  const queryClient = useQueryClient();
  const { setActionButton, setTotalCount } = useHeader();
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedUniversity, setSelectedUniversity] = useState("");
  const [pageLiveFilter, setPageLiveFilter] = useState("");

  const { data: universitiesResponse } = useQuery({
    queryKey: ["universities", "all"],
    queryFn: fetchAllUniversities,
  });

  const universities = useMemo(() => {
    return normalizeApiList(universitiesResponse?.data ?? universitiesResponse);
  }, [universitiesResponse]);

  const { data: courseResponse, isLoading } = useQuery({
    queryKey: [
      "university-courses",
      page,
      selectedUniversity,
      search,
      pageLiveFilter,
    ],
    queryFn: () =>
      fetchUniversityCourses({
        page,
        limit: PAGE_SIZE,
        university_id: selectedUniversity || undefined,
        search: search || undefined,
        is_page_created:
          pageLiveFilter === "true" ? true : pageLiveFilter === "false" ? false : undefined,
      }),
    keepPreviousData: true,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUniversityCourse,
    onSuccess: (res) => {
      notifySuccess(res?.message || "University course deleted successfully");
      queryClient.invalidateQueries(["university-courses"]);
    },
    onError: (err) => notifyError(err?.response?.data?.message || "Delete failed"),
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, isActive }) => toggleUniversityCourseStatus(id, isActive),
    onSuccess: () => {
      notifySuccess("Course status updated successfully");
      queryClient.invalidateQueries(["university-courses"]);
    },
    onError: (err) => notifyError(err.response?.data?.message || "Status update failed"),
  });

  const togglePageCreatedMutation = useMutation({
    mutationFn: ({ id, isPageCreated }) => toggleUniversityCoursePageCreated(id, isPageCreated),
    onSuccess: () => {
      notifySuccess("Page created status updated successfully");
      queryClient.invalidateQueries(["university-courses"]);
    },
    onError: (err) => notifyError(err.response?.data?.message || "Page created status update failed"),
  });

  const toggleCompareMutation = useMutation({
    mutationFn: ({ id, compare }) => toggleUniversityCourseCompare(id, compare),
    onSuccess: () => {
      notifySuccess("Course compare status updated successfully");
      queryClient.invalidateQueries(["university-courses"]);
    },
    onError: (err) => notifyError(err.response?.data?.message || "Compare status update failed"),
  });

  const courses = courseResponse?.data?.data || [];
  const total = courseResponse?.data?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const handleAdd = () => {
    router.push("/university-courses/add");
  };

  const handleEdit = (course) => {
    router.push(`/university-courses/edit/${course.id}`);
  };

  // Set action button and total count in header (must be before early return)
  // Use useEffect with immediate execution to ensure it works in both local and production
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    const actionBtn = (
      <PermissionGuard permission="create">
        <Button 
          onClick={handleAdd}
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-700 hover:to-blue-800 text-white"
          >
          <Plus className="mr-2 h-3 w-5" /> Add New Course
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

  const handleDelete = (id) => {
    const course = courses.find((c) => c.id === id);
    if (!course) return;
    if (confirm(`Delete course "${course.name}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const handleToggleStatus = (id, isActive) => {
    toggleStatusMutation.mutate({ id, isActive });
  };

  const handleTogglePageCreated = (id, isPageCreated) => {
    togglePageCreatedMutation.mutate({ id, isPageCreated });
  };

  const handleToggleCompare = (id, compare) => {
    toggleCompareMutation.mutate({ id, compare });
  };

  return (
    <div className="p-1 bg-gray-100 min-h-screen">
      <FiltersSection
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        searchPlaceholder="Search by course name..."
        showClearButton={!!(selectedUniversity || search || pageLiveFilter)}
        onClearFilters={() => {
          setSelectedUniversity("");
          setPageLiveFilter("");
          setSearch("");
          setPage(1);
        }}
      >
        <div className="relative">
          <select
            value={selectedUniversity}
            onChange={(e) => {
              setSelectedUniversity(e.target.value);
              setPage(1);
            }}
            className="border border-gray-300 rounded-md px-4 py-0.5 pr-8 focus:border-blue-500 focus:ring-blue-500 bg-white text-gray-700 min-w-[200px]"
          >
            <option value="">All Universities</option>
            {universities.map((uni) => (
              <option key={uni.id} value={uni.id}>
                {uni.university_name || uni.name || uni.title}
              </option>
            ))}
          </select>
        </div>
        <div className="relative">
          <select
            value={pageLiveFilter}
            onChange={(e) => {
              setPageLiveFilter(e.target.value);
              setPage(1);
            }}
            className="border border-gray-300 rounded-md px-4 py-0.5 pr-8 focus:border-blue-500 focus:ring-blue-500 bg-white text-gray-700 min-w-[160px]"
          >
            <option value="">All Page Live</option>
            <option value="true">Page Live: Yes</option>
            <option value="false">Page Live: No</option>
          </select>
        </div>
      </FiltersSection>

      <TableContainer
        isLoading={isLoading}
        isEmpty={!isLoading && courses.length === 0}
        loadingText="Loading courses..."
        emptyText="No courses found."
      >
        <UniversityCourseTable
          data={courses}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
          onTogglePageCreated={handleTogglePageCreated}
          onToggleCompare={handleToggleCompare}
        />
      </TableContainer>

      <PaginationControls
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
