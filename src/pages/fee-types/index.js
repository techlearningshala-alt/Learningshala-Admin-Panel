"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchFeeTypes,
  deleteFeeType,
} from "@/lib/universityApi";
import { notifyError, notifySuccess } from "@/lib/notify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import FeeTypeTable from "@/components/fee-types/FeeTypeTable";
import AddFeeTypeForm from "@/components/fee-types/AddFeeTypeForm";
import PermissionGuard from "@/components/common/PermissionGuard";
import TableContainer from "@/components/common/TableContainer";
import { useHeader } from "@/context/HeaderContext";
import FiltersSection from "@/components/common/FiltersSection";

export default function FeeTypesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingFeeType, setEditingFeeType] = useState(null);
  const { setActionButton, setTotalCount } = useHeader();

  // Reset state when route changes
  useEffect(() => {
    setShowForm(false);
    setEditingFeeType(null);
    setSearch("");
  }, [router.pathname]);

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

  // Calculate total (before any early returns)
  const total = feeTypes.length;

  const openForm = (feeType = null) => {
    setEditingFeeType(feeType);
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
            onClick={() => openForm()}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
          >
            <Plus className="mr-2 h-3 w-5" /> Add Fee Type
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
    <div className="p-1 bg-gray-100 min-h-screen">
      <FiltersSection search={search} onSearchChange={setSearch} searchPlaceholder="Search by title" />

      <TableContainer
        isLoading={isLoading}
        isEmpty={!isLoading && feeTypes.length === 0}
        loadingText="Loading fee types..."
        emptyText="No fee types found."
      >
        <FeeTypeTable
          data={feeTypes}
          isLoading={isLoading}
          onEdit={openForm}
          onDelete={handleDelete}
        />
      </TableContainer>
    </div>
  );
}


