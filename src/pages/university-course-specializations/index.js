"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchUniversityCourseSpecializations,
  deleteUniversityCourseSpecialization,
  fetchAllUniversities,
  toggleUniversityCourseSpecializationStatus,
  toggleUniversityCourseSpecializationPageCreated,
  toggleUniversityCourseSpecializationCompare,
} from "@/lib/universityApi";
import { notifySuccess, notifyError } from "@/lib/notify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X } from "lucide-react";
import UniversityCourseSpecializationTable from "@/components/university-course-specializations/UniversityCourseSpecializationTable";
import AddUniversityCourseSpecializationForm from "@/components/university-course-specializations/AddUniversityCourseSpecializationForm";
import FiltersSection from "@/components/common/FiltersSection";
import TableContainer from "@/components/common/TableContainer";
import PaginationControls from "@/components/common/PaginationControls";
import PermissionGuard from "@/components/common/PermissionGuard";
import { useHeader } from "@/context/HeaderContext";

const PAGE_SIZE = 25;

const normalizeApiList = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  return [];
};

export default function UniversityCourseSpecializationsPage() {
  const queryClient = useQueryClient();
  const { setActionButton, setTotalCount } = useHeader();
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [courseSearch, setCourseSearch] = useState("");
  const [selectedUniversity, setSelectedUniversity] = useState(""); 

  const { data: universitiesResponse } = useQuery({
    queryKey: ["universities", "all"],
    queryFn: fetchAllUniversities,
  });

  const universities = useMemo(() => {
    return normalizeApiList(universitiesResponse?.data ?? universitiesResponse);
  }, [universitiesResponse]);

  const { data: specializationResponse, isLoading } = useQuery({
    queryKey: [
      "university-course-specializations",
      page,
      selectedUniversity,
      search,
      courseSearch,
    ],
    queryFn: () =>
      fetchUniversityCourseSpecializations({
        page,
        limit: PAGE_SIZE,
        university_id: selectedUniversity || undefined,
        search: search || undefined,
        course_search: courseSearch || undefined,
      }),
    keepPreviousData: true,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUniversityCourseSpecialization,
    onSuccess: (res) => {
      notifySuccess(res?.message || "University course specialization deleted successfully");
      queryClient.invalidateQueries(["university-course-specializations"]);
    },
    onError: (err) => notifyError(err?.response?.data?.message || "Delete failed"),
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, isActive }) => toggleUniversityCourseSpecializationStatus(id, isActive),
    onSuccess: () => {
      notifySuccess("Specialization status updated successfully");
      queryClient.invalidateQueries(["university-course-specializations"]);
    },
    onError: (err) => notifyError(err.response?.data?.message || "Status update failed"),
  });

  const togglePageCreatedMutation = useMutation({
    mutationFn: ({ id, isPageCreated }) => toggleUniversityCourseSpecializationPageCreated(id, isPageCreated),
    onSuccess: () => {
      notifySuccess("Page created status updated successfully");
      queryClient.invalidateQueries(["university-course-specializations"]);
    },
    onError: (err) => notifyError(err.response?.data?.message || "Page created status update failed"),
  });

  const toggleCompareMutation = useMutation({
    mutationFn: ({ id, compare }) => toggleUniversityCourseSpecializationCompare(id, compare),
    onSuccess: () => {
      notifySuccess("Specialization compare status updated successfully");
      queryClient.invalidateQueries(["university-course-specializations"]);
    },
    onError: (err) => notifyError(err.response?.data?.message || "Compare status update failed"),
  });

  const specializations = specializationResponse?.data?.data || [];
  const total = specializationResponse?.data?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const handleAdd = () => {
    router.push("/university-course-specializations/add");
  };

  const handleEdit = (specialization) => {
    router.push(`/university-course-specializations/edit/${specialization.id}`);
  };

  // Set action button and total count in header (must be before early return)
  useEffect(() => {
    const actionBtn = (
      <PermissionGuard permission="create">
        <Button 
          onClick={handleAdd}
          className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-600 text-white py-0.5 px-3 rounded-md shadow-md"
          >
          <Plus className="mr-2 h-3 w-5" /> Add New Specialization
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
    const specialization = specializations.find((s) => s.id === id);
    if (!specialization) return;
    if (confirm(`Delete specialization "${specialization.name}"?`)) {
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
        searchPlaceholder="Search by specialization name..."
        showClearButton={!!(selectedUniversity || search || courseSearch)}
        onClearFilters={() => {
          setSelectedUniversity("");
          setSearch("");
          setCourseSearch("");
          setPage(1);
        }}
      >
        <div className="relative">
          <Input
            value={courseSearch}
            onChange={(e) => {
              setCourseSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by course name..."
            className="h-8 min-w-[220px] pr-8"
          />
          {courseSearch ? (
            <button
              type="button"
              onClick={() => {
                setCourseSearch("");
                setPage(1);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="Clear course search"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>
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
      </FiltersSection>

      <TableContainer
        isLoading={isLoading}
        isEmpty={!isLoading && specializations.length === 0}
        loadingText="Loading specializations..."
        emptyText="No specializations found."
      >
        <UniversityCourseSpecializationTable
          data={specializations}
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
