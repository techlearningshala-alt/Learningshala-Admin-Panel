"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addTestimonial, updateTestimonial } from "@/lib/api";
import { notifySuccess, notifyError } from "@/lib/notify";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

export default function AddTestimonialDialog({ item, open, onOpenChange }) {
  const [preview, setPreview] = useState(null);
  const [existingThumbnail, setExistingThumbnail] = useState(null);

  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: item || {},
  });

  useEffect(() => {
    if (item) {
      Object.keys(item).forEach((key) => setValue(key, item[key]));
      if (item.thumbnail) {
        setExistingThumbnail(item.thumbnail);
        setPreview(
          `${process.env.NEXT_PUBLIC_API_URL.replace("/api/cms", "")}${
            item.thumbnail
          }`
        );
      }
    } else {
      reset();
      setPreview(null);
      setExistingThumbnail(null);
    }
  }, [item, open]);

  const mutation = useMutation({
    mutationFn: async ({ data, saveWithDate }) => {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key === "thumbnail" && value?.[0]) {
          formData.append("thumbnail", value[0]);
        } else {
          formData.append(key, value);
        }
      });

      formData.append("existingThumbnail", existingThumbnail || "");
      formData.append("saveWithDate", saveWithDate ? "true" : "false");

      return item?.id
        ? updateTestimonial(item.id, formData)
        : addTestimonial(formData);
    },
    onSuccess: (res) => {
      notifySuccess(res.message || "Saved successfully");

      // ✅ invalidate cache so UI refreshes
      queryClient.invalidateQueries(["testimonials"]);

      reset();
      setPreview(null);
      setExistingThumbnail(null);
      onOpenChange(false);
    },
    onError: (err) => {
      notifyError(err.response?.data?.message || "Operation failed");
    },
  });

  const onSubmit = (data, saveWithDate = true) =>
    mutation.mutate({ data, saveWithDate });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="hidden">Open Modal</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {item ? "Edit Testimonial" : "Add Testimonial"}
          </DialogTitle>
          <DialogDescription>
            Fill testimonial details below
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4">
          {/* Name */}
          <div className="space-y-1">
            <Label>Name</Label>
            <Input
              {...register("name", { required: "Name is required" })}
              placeholder="Enter student name"
            />
            {errors.name && <p className="text-red-500">{errors.name.message}</p>}
          </div>

          {/* Thumbnail */}
          <div className="space-y-1">
            <Label>Thumbnail</Label>
            {preview && (
              <img
                src={preview}
                alt="Preview"
                className="w-24 h-24 object-cover rounded mb-2 border"
              />
            )}
            <Input
              type="file"
              accept="image/*"
              {...register("thumbnail")}
              onChange={(e) =>
                e.target.files?.[0] &&
                setPreview(URL.createObjectURL(e.target.files[0]))
              }
            />
          </div>

          {/* Video Title */}
          <div className="space-y-1">
            <Label>Video Title</Label>
            <Input
              {...register("video_title", {
                required: "Video title is required",
              })}
              placeholder="Enter video title"
            />
          </div>

          {/* Video ID */}
          <div className="space-y-1">
            <Label>Video ID</Label>
            <Input
              {...register("video_id", { required: "Video ID is required" })}
              placeholder="YouTube Video ID"
            />
          </div>

          {/* Buttons */}
          {item ? (
            <div className="flex gap-2">
              <Button
                type="button"
                className="flex-1"
                onClick={handleSubmit((data) => onSubmit(data, true))}
                disabled={isSubmitting || mutation.isLoading}
              >
                Save with Date
              </Button>
              <Button
                type="button"
                className="flex-1"
                onClick={handleSubmit((data) => onSubmit(data, false))}
                disabled={isSubmitting || mutation.isLoading}
              >
                Save without Date
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              className="w-full"
              onClick={handleSubmit((data) => onSubmit(data, true))}
              disabled={isSubmitting || mutation.isLoading}
            >
              {mutation.isLoading ? "Saving..." : "Save"}
            </Button>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
