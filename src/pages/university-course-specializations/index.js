"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchUniversityCourseSpecializations,
  deleteUniversityCourseSpecialization,
  fetchAllUniversities,
  fetchUniversityCourses,
} from "@/lib/universityApi";
import { notifyError, notifySuccess } from "@/lib/notify";
import UniversityCourseSpecializationTable from "@/components/university-specializations/UniversityCourseSpecializationTable";
import AddUniversityCourseSpecializationForm from "@/components/university-specializations/AddUniversityCourseSpecializationForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";

const PAGE_SIZE = 10;

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
  const [editingItem, setEditingItem] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedUniversity, setSelectedUniversity] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");

  const { data: universitiesData } = useQuery({
    queryKey: ["universities", "all"],
    queryFn: fetchAllUniversities,
  });

  const universities = useMemo(() => {
    return normalizeApiList(universitiesData?.data ?? universitiesData);
  }, [universitiesData]);

  const { data: coursesData } = useQuery({
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
    return normalizeApiList(coursesData?.data ?? coursesData);
  }, [coursesData]);

  const { data: specializationResponse, isLoading } = useQuery({
    queryKey: [
      "university-course-specializations",
      page,
      selectedCourse,
      search,
    ],
    queryFn: () =>
      fetchUniversityCourseSpecializations({
        page,
        limit: PAGE_SIZE,
        university_course_id: selectedCourse || undefined,
        search: search || undefined,
      }),
    keepPreviousData: true,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUniversityCourseSpecialization,
    onSuccess: (res) => {
      notifySuccess(res?.message || "Specialization deleted successfully");
      queryClient.invalidateQueries(["university-course-specializations"]);
    },
    onError: (err) => notifyError(err?.response?.data?.message || "Delete failed"),
  });

  const specializations = specializationResponse?.data?.data || [];
  const total = specializationResponse?.data?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const openForm = (item = null) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingItem(null);
  };

  const handleDelete = (item) => {
    if (!item?.id) return;
    if (confirm(`Delete specialization "${item.name}"?`)) {
      deleteMutation.mutate(item.id);
    }
  };

  if (showForm) {
    return (
      <AddUniversityCourseSpecializationForm
        specialization={editingItem}
        universityId={selectedUniversity}
        courseId={selectedCourse}
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
        <h1 className="text-2xl font-bold">University Course Specializations</h1>
        <Button onClick={() => openForm()}>
          <Plus className="mr-2 h-4 w-4" />
          Add Specialization
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="specialization-search">Search</Label>
          <Input
            id="specialization-search"
            placeholder="Search specialization"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="filter-university">University</Label>
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
        </div>
        <div className="space-y-2">
          <Label htmlFor="filter-course">Course</Label>
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
        </div>
      </div>

      {isLoading ? (
        <p>Loading...</p>
      ) : specializations.length ? (
        <UniversityCourseSpecializationTable
          specializations={specializations}
          onEdit={openForm}
          onDelete={handleDelete}
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
