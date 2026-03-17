"use client";

import { useRouter } from "next/router";
import AddUniversityCourseForm from "@/components/university-courses/AddUniversityCourseForm";

export default function AddUniversityCoursePage() {
  const router = useRouter();

  const handleCancel = () => {
    router.push("/university-courses");
  };

  const handleSuccess = () => {
    router.push("/university-courses");
  };

  return (
    <AddUniversityCourseForm
      course={null}
      onCancel={handleCancel}
      onSuccess={handleSuccess}
    />
  );
}

