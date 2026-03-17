"use client";

import { useRouter } from "next/router";
import AddUniversityCourseSpecializationForm from "@/components/university-course-specializations/AddUniversityCourseSpecializationForm";

export default function AddUniversityCourseSpecializationPage() {
  const router = useRouter();

  const handleCancel = () => {
    router.push("/university-course-specializations");
  };

  const handleSuccess = () => {
    router.push("/university-course-specializations");
  };

  return (
    <AddUniversityCourseSpecializationForm
      specialization={null}
      onCancel={handleCancel}
      onSuccess={handleSuccess}
    />
  );
}

