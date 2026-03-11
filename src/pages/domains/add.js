"use client";

import { useRouter } from "next/router";
import AddDomainForm from "@/components/menu/AddDomainForm";

export default function AddDomainPage() {
  const router = useRouter();

  const handleCancel = () => {
    router.push("/domains");
  };

  const handleSuccess = () => {
    router.push("/domains");
  };

  return (
    <AddDomainForm
      item={null}
      onCancel={handleCancel}
      onSuccess={handleSuccess}
    />
  );
}
