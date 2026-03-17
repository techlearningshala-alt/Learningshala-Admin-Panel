"use client";

import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import AddUniversityCourseSpecializationForm from "@/components/university-course-specializations/AddUniversityCourseSpecializationForm";
import { fetchUniversityCourseSpecializationById } from "@/lib/universityApi";
import { Loader2 } from "lucide-react";

export default function EditUniversityCourseSpecializationPage() {
  const router = useRouter();
  const { id } = router.query;

  const { data: specializationResponse, isLoading, error } = useQuery({
    queryKey: ["university-course-specialization", id],
    queryFn: () => fetchUniversityCourseSpecializationById(id),
    enabled: !!id,
  });

  const handleCancel = () => {
    router.push("/university-course-specializations");
  };

  const handleSuccess = () => {
    router.push("/university-course-specializations");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !specializationResponse) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-600 mb-4">
          {error ? "Error loading specialization" : "Specialization not found"}
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
    <AddUniversityCourseSpecializationForm
      specialization={specializationResponse}
      onCancel={handleCancel}
      onSuccess={handleSuccess}
    />
  );
}

