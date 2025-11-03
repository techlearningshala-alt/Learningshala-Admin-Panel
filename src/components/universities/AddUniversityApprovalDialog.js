"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addUniversityApprovals, updateUniversityApprovals } from "@/lib/universityApi";
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

export default function AddMediaSpotlightDialog({ item, open, onOpenChange, onItemAdded }) {
  const [previewLogo, setPreviewLogo] = useState(null);
  const [existingLogo, setExistingLogo] = useState(null);
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm({
    defaultValues: item || {},
  });

  // Prefill form when editing
  useEffect(() => {
    if (item) {
      Object.entries(item).forEach(([key, val]) => setValue(key, val));
      if (item.logo) {
        setExistingLogo(item.logo);
        setPreviewLogo(`${process.env.NEXT_PUBLIC_thumbnail_URL}${item.logo}`);
      }
    } else {
      reset(item);
      setPreviewLogo(null);
      setExistingLogo(null);
    }
  }, [item, open]);

  // Mutation
  const mutation = useMutation({
    mutationFn: async ({ data }) => {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("description", data.description);
      if (data.logo?.[0]) formData.append("logo", data.logo[0]);
      else formData.append("existingLogo", existingLogo || "");
      return item?.id
        ? updateUniversityApprovals(item.id, formData)
        : addUniversityApprovals(formData);
    },
    onSuccess: () => {
      notifySuccess(item ? "Updated successfully" : "Added successfully");

      // Reset + close
      reset();
      setPreviewLogo(null);
      setExistingLogo(null);
      onOpenChange(false);

      // Delay invalidation to ensure dialog closes cleanly
      // setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["university-approvals"], exact: false });
        onItemAdded?.(); // optional external refresh handler
      // }, 200);
    },
    onError: (err) => notifyError(err.response?.data?.message || "Operation failed"),
  });

  const onSubmit = (data) => mutation.mutate({ data });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="hidden">Open Modal</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{item ? "Edit University Approval" : "Add University Approval"}</DialogTitle>
          <DialogDescription>Fill in the details below</DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          {/* Title */}
          <div className="space-y-1">
            <Label>Title</Label>
            <Input {...register("title", { required: "Title is required" })} placeholder="Enter title" />
            {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
          </div>

          {/* Description */}
          <div className="space-y-1">
            <Label>Description</Label>
            <Input {...register("description", { required: "Description is required" })} placeholder="Enter description" />
            {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
          </div>

          {/* Logo */}
          <div className="space-y-1">
            <Label>Logo</Label>
            {previewLogo && (
              <img src={previewLogo} alt="Preview" className="h-20 object-contain rounded border mb-2" />
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

          <Button type="submit" className="w-full" disabled={mutation.isLoading}>
            {mutation.isLoading ? "Saving..." : "Save"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
