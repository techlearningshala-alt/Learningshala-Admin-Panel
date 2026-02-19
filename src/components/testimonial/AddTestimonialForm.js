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
import FormActionButtons from "@/components/common/FormActionButtons";

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
    <div className="p-6 bg-gray-50 min-h-screen pb-24">
      <div className="relative flex justify-center items-center mb-6">
        <Button variant="ghost" size="sm" onClick={onCancel} className="absolute left-0">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to List
        </Button>
        <h3 className="text-2xl text-blue-700 font-bold">
          {item ? "Edit Testimonial" : "Add New Testimonial"}
        </h3>
      </div>

      <form className="space-y-6 max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-sm">
        {/* Name */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Name</Label>
          <Input
            {...register("name", { required: "Name is required" })}
            placeholder="Enter student name"
            className="focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
        </div>

        {/* Thumbnail */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Thumbnail</Label>
          {preview && (
            <div className="mb-3">
              <img
                src={preview}
                alt="Preview"
                className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200 shadow-sm"
              />
            </div>
          )}
          <Input
            type="file"
            accept="image/*"
            {...register("thumbnail")}
            onChange={(e) =>
              e.target.files?.[0] &&
              setPreview(URL.createObjectURL(e.target.files[0]))
            }
            className="focus:border-blue-500 focus:ring-2 focus:ring-blue-200 h-8"
          />
          {errors.thumbnail && <p className="text-red-500 text-sm mt-1">{errors.thumbnail.message}</p>}
        </div>

        {/* Video Title */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Video Title</Label>
          <Input
            {...register("video_title", {
              required: "Video title is required",
            })}
            placeholder="Enter video title"
            className="focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
          {errors.video_title && <p className="text-red-500 text-sm mt-1">{errors.video_title.message}</p>}
        </div>

        {/* Video ID */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Video ID</Label>
          <Input
            {...register("video_id", { required: "Video ID is required" })}
            placeholder="YouTube Video ID"
            className="focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
          {errors.video_id && <p className="text-red-500 text-sm mt-1">{errors.video_id.message}</p>}
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

