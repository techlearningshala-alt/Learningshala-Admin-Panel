"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addTestimonial, updateTestimonial } from "@/lib/api";
import { notifySuccess, notifyError } from "@/lib/notify";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { ArrowLeft } from "lucide-react";

export default function AddTestimonialForm({ item, onCancel, onSuccess }) {
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
          `${process.env.NEXT_PUBLIC_thumbnail_URL}${item.thumbnail}`
        );
      }
    } else {
      reset();
      setPreview(null);
      setExistingThumbnail(null);
    }
  }, [item, reset, setValue]);

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
      reset();
      setPreview(null);
      setExistingThumbnail(null);

      setTimeout(() => {
        queryClient.invalidateQueries(["testimonials"]);
        onSuccess?.();
      }, 200);
    },
    onError: (err) => {
      notifyError(err.response?.data?.message || "Operation failed");
    },
  });

  const onSubmit = (data, saveWithDate = true) =>
    mutation.mutate({ data, saveWithDate });

  return (
    <div className="p-4">
      <div className="relative flex justify-center items-center mb-6">
        <Button variant="ghost" size="sm" onClick={onCancel} className="absolute left-0">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to List
        </Button>
        <h3 className="text-xl font-bold">
          {item ? "Edit Testimonial" : "Add New Testimonial"}
        </h3>
      </div>

      <form className="space-y-4 max-w-2xl mx-auto">
        {/* Name */}
        <div className="space-y-2">
          <Label>Name</Label>
          <Input
            {...register("name", { required: "Name is required" })}
            placeholder="Enter student name"
          />
          {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
        </div>

        {/* Thumbnail */}
        <div className="space-y-2">
          <Label>Thumbnail</Label>
          {preview && (
            <img
              src={preview}
              alt="Preview"
              className="w-32 h-32 object-cover rounded mb-2 border"
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
        <div className="space-y-2">
          <Label>Video Title</Label>
          <Input
            {...register("video_title", {
              required: "Video title is required",
            })}
            placeholder="Enter video title"
          />
          {errors.video_title && <p className="text-red-500 text-sm">{errors.video_title.message}</p>}
        </div>

        {/* Video ID */}
        <div className="space-y-2">
          <Label>Video ID</Label>
          <Input
            {...register("video_id", { required: "Video ID is required" })}
            placeholder="YouTube Video ID"
          />
          {errors.video_id && <p className="text-red-500 text-sm">{errors.video_id.message}</p>}
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
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button
              type="button"
              className="flex-1"
              onClick={handleSubmit((data) => onSubmit(data, true))}
              disabled={isSubmitting || mutation.isLoading}
            >
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

