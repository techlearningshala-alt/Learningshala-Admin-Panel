"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X } from "lucide-react";
import PermissionGuard from "@/components/common/PermissionGuard";
import AddUniversityTypeForm from "@/components/university-types/AddUniversityTypeForm";
import UniversityTypeTable from "@/components/university-types/UniversityTypeTable";
import {
  fetchUniversityTypes,
  deleteUniversityType,
  addUniversityType,
  updateUniversityType,
} from "@/lib/api";
import { notifySuccess, notifyError } from "@/lib/notify";

export default function UniversityTypesPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [search, setSearch] = useState("");

  // Fetch Types
  const { data: typesData } = useQuery({
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

  // Type handlers
  const handleAdd = () => {
    setEditingType(null);
    setShowForm(true);
  };

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
  const filteredTypes = search
    ? types.filter((type) => {
        const term = search.toLowerCase();
        return type.name?.toLowerCase().includes(term);
      })
    : types;

  return (
    <div className="p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold">University Types</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Total: {filteredTypes.length} {search && `(filtered from ${types.length})`}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <div className="relative w-72">
              <Input
                placeholder="Search by name"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pr-8"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
        <PermissionGuard permission="create">
          <Button onClick={handleAdd}>
            <Plus className="mr-1 h-4 w-4" /> Add University Type
          </Button>
        </PermissionGuard>
      </div>

      <UniversityTypeTable
        items={filteredTypes}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}

