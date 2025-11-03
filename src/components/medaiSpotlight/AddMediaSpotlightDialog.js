"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addMediaSpotlight, updateMediaSpotlight } from "@/lib/api";
import { notifySuccess, notifyError } from "@/lib/notify";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AddMediaSpotlightDialog({ item, open, onOpenChange }) {
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
  }, [item, open]);

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
      queryClient.invalidateQueries(["media-spotlights"]);
      reset();
      setPreviewLogo(null);
      setExistingLogo(null);
      onOpenChange(false);
    },
    onError: (err) => notifyError(err.response?.data?.message || "Operation failed"),
  });

  const onSubmit = (data, saveWithDate = true) => mutation.mutate({ data, saveWithDate });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="hidden">Open Modal</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{item ? "Edit Media Spotlight" : "Add New Media Spotlight"}</DialogTitle>
          <DialogDescription>Fill in the details below</DialogDescription>
        </DialogHeader>

        <form className="space-y-4">
          {/* Title */}
          <div className="space-y-1">
            <Label>Title</Label>
            <Input {...register("title", { required: "Title is required" })} placeholder="Enter title" />
            {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
          </div>

          {/* Logo */}
          <div className="space-y-1">
            <Label>Logo</Label>
            {previewLogo && <img src={previewLogo} alt="Logo preview" className="h-20 object-contain rounded border mb-2" />}
            <Input
              type="file"
              accept="image/*"
              {...register("logo", { required: !item })}
              onChange={(e) => e.target.files?.[0] && setPreviewLogo(URL.createObjectURL(e.target.files[0]))}
            />
            {errors.logo && <p className="text-red-500 text-sm">{errors.logo.message}</p>}
          </div>

          {/* Link */}
          <div className="space-y-1">
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
            </div>
          ) : (
            <Button type="button" className="w-full" disabled={isSubmitting || mutation.isLoading} onClick={handleSubmit((data) => onSubmit(data, true))}>
              {mutation.isLoading ? "Saving..." : "Save"}
            </Button>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
