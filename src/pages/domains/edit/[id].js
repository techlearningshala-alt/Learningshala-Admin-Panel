"use client";

import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import { fetchDomainById } from "@/lib/menuApi";
import AddDomainForm from "@/components/menu/AddDomainForm";
import { Loader2 } from "lucide-react";

export default function EditDomainPage() {
  const router = useRouter();
  const { id } = router.query;

  const { data: domain, isLoading, error } = useQuery({
    queryKey: ["domain", id],
    queryFn: () => fetchDomainById(id),
    enabled: !!id,
  });

  const handleCancel = () => {
    router.push("/domains");
  };

  const handleSuccess = () => {
    router.push("/domains");
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
        <p className="text-red-600 mb-4">Error loading domain</p>
        <button
          onClick={handleCancel}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Back to List
        </button>
      </div>
    );
  }

  if (!domain) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-gray-600 mb-4">Domain not found</p>
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
    <AddDomainForm
      item={domain}
      onCancel={handleCancel}
      onSuccess={handleSuccess}
    />
  );
}
