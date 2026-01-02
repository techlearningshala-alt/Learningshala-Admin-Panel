"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchFeeTypes,
  deleteFeeType,
} from "@/lib/universityApi";
import { notifyError, notifySuccess } from "@/lib/notify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import FeeTypeTable from "@/components/fee-types/FeeTypeTable";
import AddFeeTypeForm from "@/components/fee-types/AddFeeTypeForm";
import PermissionGuard from "@/components/common/PermissionGuard";

export default function FeeTypesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingFeeType, setEditingFeeType] = useState(null);

  const { data: feeTypeResponse, isLoading } = useQuery({
    queryKey: ["fee-types", search],
    queryFn: () =>
      fetchFeeTypes({
        page: 1,
        limit: 1000,
        search: search || undefined,
      }),
    keepPreviousData: true,
  });

  const deleteMutation = useMutation({
    mutationFn: (feeType) => deleteFeeType(feeType.id),
    onSuccess: (res) => {
      notifySuccess(res?.message || "Fee type deleted successfully");
      queryClient.invalidateQueries(["fee-types"]);
    },
    onError: (err) => {
      notifyError(err?.response?.data?.message || "Failed to delete fee type");
    },
  });

  const result = feeTypeResponse?.data || feeTypeResponse;
  const feeTypes = result?.data || [];

  const openForm = (feeType = null) => {
    setEditingFeeType(feeType);
    setShowForm(true);
  };

  const closeForm = () => {
    setEditingFeeType(null);
    setShowForm(false);
  };

  const handleDelete = (feeType) => {
    if (!feeType?.id) return;
    if (confirm(`Delete fee type "${feeType.title}"?`)) {
      deleteMutation.mutate(feeType);
    }
  };

  if (showForm) {
    return (
      <AddFeeTypeForm
        feeType={editingFeeType}
        onCancel={closeForm}
        onSuccess={closeForm}
      />
    );
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h3 className="text-xl font-bold">Fee Types</h3>
        <PermissionGuard permission="create">
          <Button onClick={() => openForm()}>
            <Plus className="mr-2 h-4 w-4" />
            Add Fee Type
          </Button>
        </PermissionGuard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Input
            id="fee-search"
            placeholder="Search by title"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
            }}
          />
        </div>
      </div>

      {feeTypes.length ? (
        <FeeTypeTable
          data={feeTypes}
          isLoading={isLoading}
          onEdit={openForm}
          onDelete={handleDelete}
        />
      ) : isLoading ? (
        <p>Loading fee types...</p>
      ) : (
        <p className="text-sm text-muted-foreground">No fee types found.</p>
      )}

    </div>
  );
}


