"use client";

import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import AddUniversityForm from "@/components/universities/AddUniversityForm";
import {
  fetchUniversityByIdAdmin,
  fetchApprovals,
  fetchAllPlacementPartners,
  fetchAllEmiPartners,
} from "@/lib/universityApi";
import { fetchUniversityTypes } from "@/lib/api";
import { Loader2 } from "lucide-react";

export default function EditUniversityPage() {
  const router = useRouter();
  const { id } = router.query; // numeric university ID for admin route

  const { data: university, isLoading, error } = useQuery({
    queryKey: ["university-admin", id],
    queryFn: () => fetchUniversityByIdAdmin(id),
    enabled: !!id,
  });

  const { data: approvalsData } = useQuery({
    queryKey: ["university-approvals"],
    queryFn: fetchApprovals,
  });
  const approvals = approvalsData?.data || [];

  const { data: placementPartnersData } = useQuery({
    queryKey: ["placement-partners-all"],
    queryFn: fetchAllPlacementPartners,
  });
  const placementPartners = placementPartnersData?.data?.data || [];

  const { data: emiPartnersData } = useQuery({
    queryKey: ["emi-partners-all"],
    queryFn: fetchAllEmiPartners,
  });
  const emiPartners = emiPartnersData?.data?.data || [];

  const { data: universityTypesData } = useQuery({
    queryKey: ["university-types-all"],
    queryFn: () => fetchUniversityTypes({ page: 1, limit: 1000 }),
  });
  const universityTypes = universityTypesData?.data?.data || [];

  const handleCancel = () => {
    router.push("/universities");
  };

  const handleSuccess = () => {
    router.push("/universities");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !university) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-600 mb-4">
          {error ? "Error loading university" : "University not found"}
        </p>
        <button
          onClick={handleCancel}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Back to List
        </button>
      </div>
    );
  }

  return (
    <AddUniversityForm
      item={university}
      approvals={approvals}
      placementPartners={placementPartners}
      emiPartners={emiPartners}
      universityTypes={universityTypes}
      onCancel={handleCancel}
      onSuccess={handleSuccess}
    />
  );
}

