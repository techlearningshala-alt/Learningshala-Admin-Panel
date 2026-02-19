"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addMediaSpotlight, updateMediaSpotlight } from "@/lib/api";
import { notifySuccess, notifyError } from "@/lib/notify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import FormActionButtons from "@/components/common/FormActionButtons";

export default function AddMediaSpotlightForm({ item, onCancel, onSuccess }) {
  const [previewLogo, setPreviewLogo] = useState(null);
  const [existingLogo, setExistingLogo] = useState(null);
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm({
    defaultValues: item || {},
  });

  // Prefill form on edit
  useEffect(() => {
    if (item) {
      Object.keys(item).forEach(key => setValue(key, item[key]));
      if (item.logo) {
        setExistingLogo(item.logo);
        setPreviewLogo(`${process.env.NEXT_PUBLIC_thumbnail_URL}${item.logo}`);
      }
    } else {
      reset();
      setPreviewLogo(null);
      setExistingLogo(null);
    }
  }, [item, reset, setValue]);

  // Mutation
  const mutation = useMutation({
    mutationFn: async ({ data, saveWithDate }) => {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("link", data.link);

      if (data.logo?.[0]) formData.append("logo", data.logo[0]);
      else formData.append("existingLogo", existingLogo || "");

      formData.append("saveWithDate", saveWithDate ? "true" : "false");

      return item?.id ? updateMediaSpotlight(item.id, formData) : addMediaSpotlight(formData);
    },
    onSuccess: () => {
      notifySuccess(item ? "Updated successfully" : "Added successfully");
      reset();
      setPreviewLogo(null);
      setExistingLogo(null);
      
      setTimeout(() => {
        queryClient.invalidateQueries(["media-spotlights"]);
        onSuccess?.();
      }, 200);
    },
    onError: (err) => notifyError(err.response?.data?.message || "Operation failed"),
  });

  const onSubmit = (data, saveWithDate = true) => mutation.mutate({ data, saveWithDate });

  return (
    <div className="p-6 bg-gray-50 min-h-screen pb-24">
      <div className="relative flex justify-center items-center mb-6">
        <Button variant="ghost" size="sm" onClick={onCancel} className="absolute left-0">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to List
        </Button>
        <h3 className="text-2xl text-blue-700 font-bold">{item ? "Edit Media Spotlight" : "Add New Media Spotlight"}</h3>
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

        {/* Logo */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Logo</Label>
          {previewLogo && (
            <div className="mb-3">
              <img src={previewLogo} alt="Logo preview" className="h-32 w-32 object-contain rounded-lg border-2 border-gray-200 shadow-sm" />
            </div>
          )}
          <Input
            type="file"
            accept="image/*"
            {...register("logo", { required: !item })}
            onChange={(e) => e.target.files?.[0] && setPreviewLogo(URL.createObjectURL(e.target.files[0]))}
            className="focus:border-blue-500 focus:ring-2 focus:ring-blue-200 h-8"
          />
          {errors.logo && <p className="text-red-500 text-sm mt-1">{errors.logo.message}</p>}
        </div>

        {/* Link */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Link</Label>
          <Input 
            {...register("link", { required: "Link is required" })} 
            placeholder="https://example.com"
            className="focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
          {errors.link && <p className="text-red-500 text-sm mt-1">{errors.link.message}</p>}
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

