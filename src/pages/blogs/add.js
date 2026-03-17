"use client";

import { useRouter } from "next/router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import AddBlogForm from "@/components/blogs/AddBlogForm";
import { addBlog } from "@/lib/api";
import { notifySuccess, notifyError } from "@/lib/notify";

export default function AddBlogPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const addBlogMutation = useMutation({
    mutationFn: addBlog,
    onSuccess: () => {
      notifySuccess("Blog added successfully");
      queryClient.invalidateQueries(["blogs"]);
      router.push("/blogs");
    },
    onError: (err) => notifyError(err.response?.data?.message || "Add failed"),
  });

  const handleCancel = () => {
    router.push("/blogs");
  };

  const handleSuccess = async (formData, item) => {
    try {
      const result = await addBlogMutation.mutateAsync(formData);
      return result;
    } catch (error) {
      throw error;
    }
  };

  return (
    <AddBlogForm
      item={null}
      onCancel={handleCancel}
      onSuccess={handleSuccess}
    />
  );
}
