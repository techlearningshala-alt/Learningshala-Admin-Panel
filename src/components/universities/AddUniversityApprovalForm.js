"use client";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addUniversityApprovals, updateUniversityApprovals } from "@/lib/universityApi";
import { notifySuccess, notifyError } from "@/lib/notify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import CKEditor from "@/components/CKEditor";
import FormActionButtons from "@/components/common/FormActionButtons";

export default function AddUniversityApprovalForm({ item, onCancel, onSuccess }) {
  const [previewLogo, setPreviewLogo] = useState(null);
  const [existingLogo, setExistingLogo] = useState(null);
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, setValue,control, formState: { errors, isSubmitting } } = useForm({
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
    mutationFn: async ({ data, saveWithDate }) => {
      console.log("📤 Submitting form with data:", data);
      console.log("📤 existingLogo state:", existingLogo);
      
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("saveWithDate", saveWithDate ? "true" : "false");
      
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

  const onSubmit = (data, saveWithDate = true) => {
    mutation.mutate({ data, saveWithDate });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen pb-24">
      <div className="relative flex justify-center items-center mb-6">
        <Button variant="ghost" size="sm" onClick={onCancel} className="absolute left-0 hover:bg-gray-200 hover:text-black text-black">
          <ArrowLeft className="mr-2 h-2 w-2" />
          Back to List
        </Button>
        <div className="flex items-center gap-2">
          <h3 className="text-3xl font-bold text-blue-700">{item ? "Edit University Approval" : "Add New University Approval"}</h3>
        </div>
      </div>

      <form className="space-y-6 max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-sm">
        {/* Title */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Title</Label>
          <Input 
            {...register("title", { required: "Title is required" })} 
            placeholder="Enter title"
            className="focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
          {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Description</Label>
          <Controller
            name="description"
            control={control}
            rules={{ required: "Description is required" }}
            render={({ field }) => (
              <CKEditor
                value={field.value || ""}
                onChange={(html) => field.onChange(html)}
              />
            )}
          />
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
        </div>

        {/* Logo */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Logo</Label>
          {previewLogo && (
            <div className="mb-3">
              <img src={previewLogo} alt="Preview" className="h-32 w-32 object-contain rounded-lg border-2 border-gray-200 shadow-sm" />
            </div>
          )}
          <Input
            type="file"
            accept="image/*"
            {...register("logo", { required: !item })}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setPreviewLogo(URL.createObjectURL(file));
            }}
            className="focus:border-blue-500 focus:ring-2 focus:ring-blue-200 h-8"
          />
          {errors.logo && <p className="text-red-500 text-sm mt-1">{errors.logo.message}</p>}
        </div>
      </form>

      <FormActionButtons
        isEdit={!!item}
        isSubmitting={isSubmitting}
        isLoading={mutation.isLoading}
        onSave={(saveWithDate) => handleSubmit((data) => onSubmit(data, saveWithDate))()}
        onCancel={onCancel}
        saveButtonText="Save"
      />
    </div>
  );
}

