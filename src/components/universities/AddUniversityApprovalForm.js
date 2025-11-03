"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addUniversityApprovals, updateUniversityApprovals } from "@/lib/universityApi";
import { notifySuccess, notifyError } from "@/lib/notify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";

export default function AddUniversityApprovalForm({ item, onCancel, onSuccess }) {
  const [previewLogo, setPreviewLogo] = useState(null);
  const [existingLogo, setExistingLogo] = useState(null);
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm({
    defaultValues: item || {},
  });

  // Prefill form when editing
  useEffect(() => {
    console.log("🔍 Form loaded with item:", item);
    if (item) {
      Object.entries(item).forEach(([key, val]) => setValue(key, val));
      if (item.logo) {
        console.log("✅ Setting existing logo:", item.logo);
        setExistingLogo(item.logo);
        setPreviewLogo(`${process.env.NEXT_PUBLIC_thumbnail_URL}${item.logo}`);
      } else {
        console.log("⚠️ No logo found in item");
        setExistingLogo(null);
        setPreviewLogo(null);
      }
    } else {
      console.log("🆕 New item - resetting form");
      reset();
      setPreviewLogo(null);
      setExistingLogo(null);
    }
  }, [item, reset, setValue]);

  // Mutation
  const mutation = useMutation({
    mutationFn: async ({ data }) => {
      console.log("📤 Submitting form with data:", data);
      console.log("📤 existingLogo state:", existingLogo);
      
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("description", data.description);
      
      if (data.logo?.[0]) {
        console.log("📤 Uploading new logo file");
        formData.append("logo", data.logo[0]);
      } else {
        console.log("📤 Sending existingLogo:", existingLogo || "");
        formData.append("existingLogo", existingLogo || "");
      }
      
      return item?.id
        ? updateUniversityApprovals(item.id, formData)
        : addUniversityApprovals(formData);
    },
    onSuccess: () => {
      notifySuccess(item ? "Updated successfully" : "Added successfully");
      reset();
      setPreviewLogo(null);
      setExistingLogo(null);

      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["university-approvals"], exact: false });
        onSuccess?.();
      }, 200);
    },
    onError: (err) => notifyError(err.response?.data?.message || "Operation failed"),
  });

  const onSubmit = (data) => mutation.mutate({ data });

  return (
    <div className="p-4">
      <div className="relative flex justify-center items-center mb-6">
        <Button variant="ghost" size="sm" onClick={onCancel} className="absolute left-0">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to List
        </Button>
        <h1 className="text-2xl font-bold">{item ? "Edit University Approval" : "Add New University Approval"}</h1>
      </div>

      <form className="space-y-4 max-w-2xl mx-auto" onSubmit={handleSubmit(onSubmit)}>
        {/* Title */}
        <div className="space-y-2">
          <Label>Title</Label>
          <Input {...register("title", { required: "Title is required" })} placeholder="Enter title" />
          {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label>Description</Label>
          <Input {...register("description", { required: "Description is required" })} placeholder="Enter description" />
          {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
        </div>

        {/* Logo */}
        <div className="space-y-2">
          <Label>Logo</Label>
          {previewLogo && (
            <img src={previewLogo} alt="Preview" className="h-32 w-32 object-contain rounded border mb-2" />
          )}
          <Input
            type="file"
            accept="image/*"
            {...register("logo", { required: !item })}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setPreviewLogo(URL.createObjectURL(file));
            }}
          />
          {errors.logo && <p className="text-red-500 text-sm">{errors.logo.message}</p>}
        </div>

        <div className="flex gap-2">
          <Button type="submit" className="flex-1" disabled={mutation.isLoading}>
            {mutation.isLoading ? "Saving..." : "Save"}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

