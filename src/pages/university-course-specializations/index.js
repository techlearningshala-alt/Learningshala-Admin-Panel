"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchUniversityCourseSpecializations,
  deleteUniversityCourseSpecialization,
  fetchAllUniversities,
  fetchUniversityCourses,
  toggleUniversityCourseSpecializationStatus,
  toggleUniversityCourseSpecializationPageCreated,
} from "@/lib/universityApi";
import { notifySuccess, notifyError } from "@/lib/notify";
import UniversityCourseSpecializationTable from "@/components/university-course-specializations/UniversityCourseSpecializationTable";
import AddUniversityCourseSpecializationForm from "@/components/university-course-specializations/AddUniversityCourseSpecializationForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import PermissionGuard from "@/components/common/PermissionGuard";

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
  const [showForm, setShowForm] = useState(false);
  const [editingSpecialization, setEditingSpecialization] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedUniversity, setSelectedUniversity] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(""); 

  const { data: universitiesResponse } = useQuery({
    queryKey: ["universities", "all"],
    queryFn: fetchAllUniversities,
  });

  const universities = useMemo(() => {
    return normalizeApiList(universitiesResponse?.data ?? universitiesResponse);
  }, [universitiesResponse]);

  const { data: coursesResponse } = useQuery({
    queryKey: ["university-courses", "options", selectedUniversity],
    queryFn: () =>
      fetchUniversityCourses({
        page: 1,
        limit: 200,
        university_id: selectedUniversity || undefined,
      }),
    enabled: Boolean(selectedUniversity),
  });

  const courses = useMemo(() => {
    return normalizeApiList(coursesResponse?.data?.data ?? coursesResponse?.data ?? coursesResponse);
  }, [coursesResponse]);

  const { data: specializationResponse, isLoading } = useQuery({
    queryKey: [
      "university-course-specializations",
      page,
      selectedUniversity,
      selectedCourse,
      search,
    ],
    queryFn: () =>
      fetchUniversityCourseSpecializations({
        page,
        limit: PAGE_SIZE,
        university_id: selectedUniversity || undefined,
        university_course_id: selectedCourse || undefined,
        search: search || undefined,
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

  const specializations = specializationResponse?.data?.data || [];
  const total = specializationResponse?.data?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const openForm = (specialization = null) => {
    setEditingSpecialization(specialization);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingSpecialization(null);
  };

  const handleDelete = (specialization) => {
    if (!specialization?.id) return;
    if (confirm(`Delete specialization "${specialization.name}"?`)) {
      deleteMutation.mutate(specialization.id);
    }
  };

  const handleToggleStatus = (id, isActive) => {
    toggleStatusMutation.mutate({ id, isActive });
  };

  const handleTogglePageCreated = (id, isPageCreated) => {
    togglePageCreatedMutation.mutate({ id, isPageCreated });
  };

  if (showForm) {
    return (
      <AddUniversityCourseSpecializationForm
        specialization={editingSpecialization}
        onCancel={closeForm}
        onSuccess={() => {
          closeForm();
          queryClient.invalidateQueries(["university-course-specializations"]);
        }}
      />
    );
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold">University Course Specializations</h3>
          <p className="text-sm text-muted-foreground mt-1">Total: {total}</p>
        </div>
        <PermissionGuard permission="create">
          <Button onClick={() => openForm()}>
            <Plus className="mr-2 h-4 w-4" />
            Add Specialization
          </Button>
        </PermissionGuard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="specialization-search">Search</Label>
          <Input
            id="specialization-search"
            placeholder="Search by specialization name"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="filter-university">Filter by University</Label>
          <div className="flex items-center gap-2">
            <select
              id="filter-university"
              className="w-full border rounded p-2"
              value={selectedUniversity}
              onChange={(e) => {
                const value = e.target.value;
                setSelectedUniversity(value);
                setSelectedCourse("");
                setPage(1);
              }}
            >
              <option value="">All Universities</option>
              {universities.map((uni) => (
                <option key={uni.id} value={uni.id}>
                  {uni.university_name || uni.name || uni.title}
                </option>
              ))}
            </select>
            {selectedUniversity && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedUniversity("");
                  setSelectedCourse("");
                  setPage(1);
                }}
              >
                Clear
              </Button>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="filter-course">Filter by Course</Label>
          <div className="flex items-center gap-2">
            <select
              id="filter-course"
              className="w-full border rounded p-2"
              value={selectedCourse}
              onChange={(e) => {
                setSelectedCourse(e.target.value);
                setPage(1);
              }}
              disabled={!selectedUniversity}
            >
              <option value="">All Courses</option>
              {courses.map((courseOption) => (
                <option key={courseOption.id} value={courseOption.id}>
                  {courseOption.name}
                </option>
              ))}
            </select>
            {selectedCourse && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedCourse("");
                  setPage(1);
                }}
              >
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>

      {isLoading ? (
        <p>Loading...</p>
      ) : specializations.length ? (
        <UniversityCourseSpecializationTable
          data={specializations}
          onEdit={openForm}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
          onTogglePageCreated={handleTogglePageCreated}
        />
      ) : (
        <p className="text-sm text-muted-foreground">No specializations found.</p>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 pt-4">
          <Button
            size="sm"
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          >
            Prev
          </Button>
          <span className="text-sm">
            Page {page} of {totalPages}
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={page >= totalPages}
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
