"use client";

import { useRouter } from "next/router";
import AddUniversityForm from "@/components/universities/AddUniversityForm";
import { useQuery } from "@tanstack/react-query";
import {
  fetchApprovals,
  fetchAllPlacementPartners,
  fetchAllEmiPartners,
} from "@/lib/universityApi";
import { fetchUniversityTypes } from "@/lib/api";

export default function AddUniversityPage() {
  const router = useRouter();

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

  return (
    <AddUniversityForm
      item={null}
      approvals={approvals}
      placementPartners={placementPartners}
      emiPartners={emiPartners}
      universityTypes={universityTypes}
      onCancel={handleCancel}
      onSuccess={handleSuccess}
    />
  );
}

