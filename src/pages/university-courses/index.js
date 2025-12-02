 "use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchUniversityCourses,
  deleteUniversityCourse,
  fetchAllUniversities,
  toggleUniversityCourseStatus,
  toggleUniversityCoursePageCreated,
} from "@/lib/universityApi";
import { notifySuccess, notifyError } from "@/lib/notify";
import UniversityCourseTable from "@/components/university-courses/UniversityCourseTable";
import AddUniversityCourseForm from "@/components/university-courses/AddUniversityCourseForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";

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
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedUniversity, setSelectedUniversity] = useState("");

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
    ],
    queryFn: () =>
      fetchUniversityCourses({
        page,
        limit: PAGE_SIZE,
        university_id: selectedUniversity || undefined,
        search: search || undefined,
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

  const courses = courseResponse?.data?.data || [];
  const total = courseResponse?.data?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const openForm = (course = null) => {
    setEditingCourse(course);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingCourse(null);
  };

  const handleDelete = (course) => {
    if (!course?.id) return;
    if (confirm(`Delete course "${course.name}"?`)) {
      deleteMutation.mutate(course.id);
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
      <AddUniversityCourseForm
        course={editingCourse}
        onCancel={closeForm}
        onSuccess={() => {
          closeForm();
          queryClient.invalidateQueries(["university-courses"]);
        }}
      />
    );
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold">University Courses</h3>
          <p className="text-sm text-muted-foreground mt-1">Total: {total}</p>
        </div>
        <Button onClick={() => openForm()}>
          <Plus className="mr-2 h-4 w-4" />
          Add Course
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="course-search">Search</Label>
          <Input
            id="course-search"
            placeholder="Search by course name"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="university-filter">Filter by University</Label>
          <div className="flex items-center gap-2">
            <select
              id="university-filter"
              className="w-full border rounded p-2"
              value={selectedUniversity}
              onChange={(e) => {
                setSelectedUniversity(e.target.value);
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
      ) : courses.length ? (
        <UniversityCourseTable
          data={courses}
          onEdit={openForm}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
          onTogglePageCreated={handleTogglePageCreated}
        />
      ) : (
        <p className="text-sm text-muted-foreground">No courses found.</p>
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
