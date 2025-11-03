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
    <div className="p-4">
      <div className="relative flex justify-center items-center mb-6">
        <Button variant="ghost" size="sm" onClick={onCancel} className="absolute left-0">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to List
        </Button>
        <h3 className="text-xl font-bold">{item ? "Edit Media Spotlight" : "Add New Media Spotlight"}</h3>
      </div>

      <form className="space-y-4 max-w-2xl mx-auto">
        {/* Title */}
        <div className="space-y-2">
          <Label>Title</Label>
          <Input {...register("title", { required: "Title is required" })} placeholder="Enter title" />
          {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
        </div>

        {/* Logo */}
        <div className="space-y-2">
          <Label>Logo</Label>
          {previewLogo && <img src={previewLogo} alt="Logo preview" className="h-32 w-32 object-contain rounded border mb-2" />}
          <Input
            type="file"
            accept="image/*"
            {...register("logo", { required: !item })}
            onChange={(e) => e.target.files?.[0] && setPreviewLogo(URL.createObjectURL(e.target.files[0]))}
          />
          {errors.logo && <p className="text-red-500 text-sm">{errors.logo.message}</p>}
        </div>

        {/* Link */}
        <div className="space-y-2">
          <Label>Link</Label>
          <Input {...register("link", { required: "Link is required" })} placeholder="https://example.com" />
          {errors.link && <p className="text-red-500 text-sm">{errors.link.message}</p>}
        </div>

        {/* Save Buttons */}
        {item ? (
          <div className="flex gap-2">
            <Button type="button" className="flex-1" disabled={isSubmitting || mutation.isLoading} onClick={handleSubmit((data) => onSubmit(data, true))}>
              Save with Date
            </Button>
            <Button type="button" className="flex-1" disabled={isSubmitting || mutation.isLoading} onClick={handleSubmit((data) => onSubmit(data, false))}>
              Save without Date
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button type="button" className="flex-1" disabled={isSubmitting || mutation.isLoading} onClick={handleSubmit((data) => onSubmit(data, true))}>
              {mutation.isLoading ? "Saving..." : "Save"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}

