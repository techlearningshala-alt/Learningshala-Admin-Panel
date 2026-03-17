"use client";

import { useRouter } from "next/router";
import AddSpecializationForm from "@/components/specialization/AddSpecializationForm";

export default function AddSpecializationPage() {
  const router = useRouter();

  const handleCancel = () => {
    router.push("/specializations");
  };

  const handleSuccess = () => {
    router.push("/specializations");
  };

  return (
    <AddSpecializationForm
      item={null}
      onCancel={handleCancel}
      onSuccess={handleSuccess}
    />
  );
}

