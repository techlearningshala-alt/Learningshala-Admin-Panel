"use client";

import { useRouter } from "next/router";
import AddCourseForm from "@/components/courses/AddCourseForm";

export default function AddCoursePage() {
  const router = useRouter();

  const handleCancel = () => {
    router.push("/courses");
  };

  const handleSuccess = () => {
    router.push("/courses");
  };

  return (
    <AddCourseForm
      item={null}
      onCancel={handleCancel}
      onSuccess={handleSuccess}
    />
  );
}

