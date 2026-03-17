"use client";

import { useRouter } from "next/router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AddBlogForm from "@/components/blogs/AddBlogForm";
import { fetchBlogById, updateBlog } from "@/lib/api";
import { notifySuccess, notifyError } from "@/lib/notify";
import { Loader2 } from "lucide-react";

export default function EditBlogPage() {
  const router = useRouter();
  const { id } = router.query;
  const queryClient = useQueryClient();

  const { data: blogResponse, isLoading, error } = useQuery({
    queryKey: ["blog", id],
    queryFn: () => fetchBlogById(id),
    enabled: !!id,
  });

  const updateBlogMutation = useMutation({
    mutationFn: ({ id, formData }) => updateBlog(id, formData),
    onSuccess: () => {
      notifySuccess("Blog updated successfully");
      queryClient.invalidateQueries(["blogs"]);
      queryClient.invalidateQueries(["blog", id]);
      router.push("/blogs");
    },
    onError: (err) => notifyError(err.response?.data?.message || "Update failed"),
  });

  const handleCancel = () => {
    router.push("/blogs");
  };

  const handleSuccess = async (formData, item) => {
    try {
      const result = await updateBlogMutation.mutateAsync({ id, formData });
      return result;
    } catch (error) {
      throw error;
    }
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading blog</p>
          <button
            onClick={() => router.push("/blogs")}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Blogs
          </button>
        </div>
      </div>
    );
  }

  const blog = blogResponse?.data || blogResponse;

  if (!blog) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Blog not found</p>
          <button
            onClick={() => router.push("/blogs")}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Blogs
          </button>
        </div>
      </div>
    );
  }

  return (
    <AddBlogForm
      item={blog}
      onCancel={handleCancel}
      onSuccess={handleSuccess}
    />
  );
}
