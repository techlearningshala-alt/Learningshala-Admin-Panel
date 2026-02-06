"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchUniversityCourseSpecializations,
  deleteUniversityCourseSpecialization,
  fetchAllUniversities,
  toggleUniversityCourseSpecializationStatus,
  toggleUniversityCourseSpecializationPageCreated,
} from "@/lib/universityApi";
import { notifySuccess, notifyError } from "@/lib/notify";
import UniversityCourseSpecializationTable from "@/components/university-course-specializations/UniversityCourseSpecializationTable";
import AddUniversityCourseSpecializationForm from "@/components/university-course-specializations/AddUniversityCourseSpecializationForm";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import FiltersSection from "@/components/common/FiltersSection";
import TableContainer from "@/components/common/TableContainer";
import PaginationControls from "@/components/common/PaginationControls";
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
    ],
    queryFn: () =>
      fetchUniversityCourseSpecializations({
        page,
        limit: PAGE_SIZE,
        university_id: selectedUniversity || undefined,
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
    <div className="p-6 bg-gray-50 min-h-screen">
      <PageHeader
        title="University Course Specializations"
        total={total}
        search={search}
        actionButton={
          <PermissionGuard permission="create">
            <Button 
              onClick={() => openForm()}
              className="bg-white text-blue-600 hover:bg-blue-50 hover:text-blue-700 shadow-md hover:shadow-lg transition-all duration-200 font-semibold px-6 py-2.5"
            >
              <Plus className="mr-2 h-3 w-5" /> Add New Specialization
            </Button>
          </PermissionGuard>
        }
      />

      <FiltersSection
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        searchPlaceholder="Search by specialization name..."
        showClearButton={!!(selectedUniversity || search)}
        onClearFilters={() => {
          setSelectedUniversity("");
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
            className="border border-gray-300 rounded-md px-4 py-2 pr-8 focus:border-blue-500 focus:ring-blue-500 bg-white text-gray-700 min-w-[200px]"
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
          onEdit={openForm}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
          onTogglePageCreated={handleTogglePageCreated}
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
