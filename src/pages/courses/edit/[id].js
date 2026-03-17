"use client";

import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import { fetchCourseById } from "@/lib/menuApi";
import AddCourseForm from "@/components/courses/AddCourseForm";
import { Loader2 } from "lucide-react";

export default function EditCoursePage() {
  const router = useRouter();
  const { id } = router.query;

  const { data: courseResponse, isLoading, error } = useQuery({
    queryKey: ["course", id],
    queryFn: () => fetchCourseById(id),
    enabled: !!id,
  });

  const handleCancel = () => {
    router.push("/courses");
  };

  const handleSuccess = () => {
    router.push("/courses");
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
        <p className="text-red-600 mb-4">Error loading course</p>
        <button
          onClick={handleCancel}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Back to List
        </button>
      </div>
    );
  }

  const course =
    courseResponse?.data?.data ?? courseResponse?.data ?? courseResponse ?? null;

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-gray-600 mb-4">Course not found</p>
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
    <AddCourseForm
      item={course}
      onCancel={handleCancel}
      onSuccess={handleSuccess}
    />
  );
}

