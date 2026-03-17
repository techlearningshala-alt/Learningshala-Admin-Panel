"use client";

import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import { fetchSpecializationById } from "@/lib/menuApi";
import AddSpecializationForm from "@/components/specialization/AddSpecializationForm";
import { Loader2 } from "lucide-react";

export default function EditSpecializationPage() {
  const router = useRouter();
  const { id } = router.query;

  const { data: specializationResponse, isLoading, error } = useQuery({
    queryKey: ["specialization", id],
    queryFn: () => fetchSpecializationById(id),
    enabled: !!id,
  });

  const handleCancel = () => {
    router.push("/specializations");
  };

  const handleSuccess = () => {
    router.push("/specializations");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-600 mb-4">Error loading specialization</p>
        <button
          onClick={handleCancel}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Back to List
        </button>
      </div>
    );
  }

  const specialization =
    specializationResponse?.data?.data ??
    specializationResponse?.data ??
    specializationResponse ??
    null;

  if (!specialization) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-gray-600 mb-4">Specialization not found</p>
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
    <AddSpecializationForm
      item={specialization}
      onCancel={handleCancel}
      onSuccess={handleSuccess}
    />
  );
}

