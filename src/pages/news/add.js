"use client";

import { useRouter } from "next/router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import AddNewsForm from "@/components/news/AddNewsForm";
import { addNews } from "@/lib/api";
import { notifySuccess, notifyError } from "@/lib/notify";

export default function AddNewsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const addNewsMutation = useMutation({
    mutationFn: addNews,
    onSuccess: () => {
      notifySuccess("News added successfully");
      queryClient.invalidateQueries(["news"]);
      router.push("/news");
    },
    onError: (err) => notifyError(err.response?.data?.message || "Add failed"),
  });

  const handleCancel = () => {
    router.push("/news");
  };

  const handleSuccess = async (formData, item) => {
    try {
      const result = await addNewsMutation.mutateAsync(formData);
      return result;
    } catch (error) {
      throw error;
    }
  };

  return <AddNewsForm item={null} onCancel={handleCancel} onSuccess={handleSuccess} />;
}
