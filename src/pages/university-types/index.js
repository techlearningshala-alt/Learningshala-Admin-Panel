"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import PermissionGuard from "@/components/common/PermissionGuard";
import AddUniversityTypeForm from "@/components/university-types/AddUniversityTypeForm";
import UniversityTypeTable from "@/components/university-types/UniversityTypeTable";
import TableContainer from "@/components/common/TableContainer";
import FiltersSection from "@/components/common/FiltersSection";
import { useHeader } from "@/context/HeaderContext";
import {
  fetchUniversityTypes,
  deleteUniversityType,
  addUniversityType,
  updateUniversityType,
} from "@/lib/api";
import { notifySuccess, notifyError } from "@/lib/notify";

export default function UniversityTypesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [search, setSearch] = useState("");
  const { setActionButton, setTotalCount } = useHeader();

  // Reset state when route changes
  useEffect(() => {
    setShowForm(false);
    setEditingType(null);
    setSearch("");
  }, [router.pathname]);

  // Fetch Types
  const { data: typesData, isLoading } = useQuery({
    queryKey: ["universityTypes"],
    queryFn: () => fetchUniversityTypes({ page: 1, limit: 1000 }),
    keepPreviousData: true,
  });
  const types = typesData?.data?.data || [];

  // Type mutations
  const deleteTypeMutation = useMutation({
    mutationFn: deleteUniversityType,
    onSuccess: () => {
      notifySuccess("University type deleted successfully");
      queryClient.invalidateQueries(["universityTypes"]);
    },
    onError: (err) => notifyError(err.response?.data?.message || "Delete failed"),
  });

  const addTypeMutation = useMutation({
    mutationFn: addUniversityType,
    onSuccess: () => {
      notifySuccess("University type added successfully");
      queryClient.invalidateQueries(["universityTypes"]);
    },
    onError: (err) => notifyError(err.response?.data?.message || "Add failed"),
  });

  const updateTypeMutation = useMutation({
    mutationFn: ({ id, data }) => updateUniversityType(id, data),
    onSuccess: () => {
      notifySuccess("University type updated successfully");
      queryClient.invalidateQueries(["universityTypes"]);
    },
    onError: (err) => notifyError(err.response?.data?.message || "Update failed"),
  });

  // Calculate total (before any early returns)
  const filteredTypes = search
    ? types.filter((type) => {
        const term = search.toLowerCase();
        return type.name?.toLowerCase().includes(term);
      })
    : types;
  const total = filteredTypes.length;

  // Type handlers
  const handleAdd = () => {
    setEditingType(null);
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
            <Plus className="mr-2 h-3 w-5" /> Add University Type
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

  const handleEdit = (type) => {
    setEditingType(type);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this university type?")) {
      deleteTypeMutation.mutate(id);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingType(null);
  };

  const handleFormSuccess = (data, editingType) => {
    if (editingType) {
      updateTypeMutation.mutate({ id: editingType.id, data });
    } else {
      addTypeMutation.mutate(data);
    }
    setShowForm(false);
    setEditingType(null);
  };

  // Show form view
  if (showForm) {
    return (
      <AddUniversityTypeForm
        item={editingType}
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
        onSearchChange={setSearch} 
        searchPlaceholder="Search by name"
        showClearButton={!!search}
        onClearFilters={() => setSearch("")}
      />

      <TableContainer
        isLoading={isLoading}
        isEmpty={!isLoading && filteredTypes.length === 0}
        loadingText="Loading university types..."
        emptyText="No university types found."
      >
        <UniversityTypeTable
          items={filteredTypes}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </TableContainer>
    </div>
  );
}

