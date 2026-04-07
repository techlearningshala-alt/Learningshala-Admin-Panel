"use client";

import { useRouter } from "next/router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AddNewsForm from "@/components/news/AddNewsForm";
import { fetchNewsById, updateNews } from "@/lib/api";
import { notifySuccess, notifyError } from "@/lib/notify";
import { Loader2 } from "lucide-react";

export default function EditNewsPage() {
  const router = useRouter();
  const { id } = router.query;
  const queryClient = useQueryClient();

  const { data: newsResponse, isLoading, error } = useQuery({
    queryKey: ["news-item", id],
    queryFn: () => fetchNewsById(id),
    enabled: !!id,
  });

  const updateNewsMutation = useMutation({
    mutationFn: ({ id: newsId, formData }) => updateNews(newsId, formData),
    onSuccess: () => {
      notifySuccess("News updated successfully");
      queryClient.invalidateQueries(["news"]);
      queryClient.invalidateQueries(["news-item", id]);
      router.push("/news");
    },
    onError: (err) => notifyError(err.response?.data?.message || "Update failed"),
  });

  const handleCancel = () => {
    router.push("/news");
  };

  const handleSuccess = async (formData, item) => {
    try {
      const result = await updateNewsMutation.mutateAsync({ id, formData });
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
          <p className="text-red-600 mb-4">Error loading news</p>
          <button
            type="button"
            onClick={() => router.push("/news")}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to News
          </button>
        </div>
      </div>
    );
  }

  const newsItem = newsResponse?.data || newsResponse;

  if (!newsItem) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">News not found</p>
          <button
            type="button"
            onClick={() => router.push("/news")}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to News
          </button>
        </div>
      </div>
    );
  }

  return (
    <AddNewsForm item={newsItem} onCancel={handleCancel} onSuccess={handleSuccess} />
  );
}
