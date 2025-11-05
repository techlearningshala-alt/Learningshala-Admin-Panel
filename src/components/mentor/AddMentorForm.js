"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addMentor, updateMentor } from "@/lib/api";
import { notifySuccess, notifyError } from "@/lib/notify";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { ArrowLeft } from "lucide-react";

export default function AddMentorForm({ mentor, onCancel, onSuccess }) {
  const [preview, setPreview] = useState(null);
  const [existingThumbnail, setExistingThumbnail] = useState(null);
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm({
    defaultValues: mentor || {},
  });

  // Prefill
  useEffect(() => {
    if (mentor) {
      Object.keys(mentor).forEach((key) => setValue(key, mentor[key]));
      if (mentor.thumbnail) {
        setExistingThumbnail(mentor.thumbnail);
        setPreview(`${process.env.NEXT_PUBLIC_thumbnail_URL}${mentor.thumbnail}`);
      }
    } else {
      reset();
      setPreview(null);
      setExistingThumbnail(null);
    }
  }, [mentor, reset, setValue]);

  // Mutation
  const mutation = useMutation({
    mutationFn: async ({ data, saveWithDate }) => {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key === "thumbnail" && value?.[0]) formData.append("thumbnail", value[0]);
        else formData.append(key, value);
      });
      formData.append("existingThumbnail", existingThumbnail || "");
      formData.append("saveWithDate", saveWithDate ? "true" : "false");
      return mentor?.id ? updateMentor(mentor.id, formData) : addMentor(formData);
    },
    onSuccess: (res) => {
      notifySuccess(res.data.message || "Saved successfully");
      reset();
      setPreview(null);
      setExistingThumbnail(null);

      // ✅ Refresh mentors list automatically
      setTimeout(() => {
        queryClient.invalidateQueries(["mentors"]);
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
        <h3 className="text-xl font-bold">{mentor ? "Edit Mentor" : "Add New Mentor"}</h3>
      </div>

      <form className="space-y-4 max-w-2xl mx-auto">
        {/* Name */}
        <div className="space-y-2">
          <Label>Name</Label>
          <Input {...register("name", { required: "Name is required" })} placeholder="Enter name" />
          {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
        </div>

        {/* Experience */}
        <div className="space-y-2">
          <Label>Experience (years)</Label>
          <Input type="number" {...register("experience", { required: "Experience required", min: 1 })} />
          {errors.experience && <p className="text-red-500 text-sm">{errors.experience.message}</p>}
        </div>

        {/* Assist Students */}
        <div className="space-y-2">
          <Label>No. of Assist Students (e.g - 2145)</Label>
          <Input type="number" {...register("assist_student", { required: "Assist students required", min: 0 })} />
          {errors.assist_student && <p className="text-red-500 text-sm">{errors.assist_student.message}</p>}
        </div>

        {/* Label */}
        <div className="space-y-2">
          <Label>Label</Label>
          <Input {...register("label")} placeholder="Top rated / Popular" />
          {errors.label && <p className="text-red-500 text-sm">{errors.label.message}</p>}
        </div>

        {/* Verified */}
        <div className="flex items-center gap-2">
          <input type="checkbox" {...register("verified")} className="w-4 h-4" />
          <Label>Verified</Label>
        </div>

        {/* Connection Link */}
        <div className="space-y-2">
          <Label>Connection Link</Label>
          <Input {...register("connection_link")} placeholder="https://linkedin.com/..." />
          {errors.connection_link && <p className="text-red-500 text-sm">{errors.connection_link.message}</p>}
        </div>

        {/* Thumbnail */}
        <div className="space-y-2">
          <Label>Thumbnail</Label>
          {preview && <img src={preview} alt="Preview" className="w-32 h-32 object-cover rounded mb-2 border" />}
          <Input type="file" accept="image/*" {...register("thumbnail")} onChange={(e) => e.target.files?.[0] && setPreview(URL.createObjectURL(e.target.files[0]))} />
        </div>

        {/* Save Buttons */}
        {mentor ? (
          <div className="flex gap-2">
            <Button type="button" className="flex-1" onClick={handleSubmit((data) => onSubmit(data, true))} disabled={isSubmitting || mutation.isLoading}>
              Save with Date
            </Button>
            <Button type="button" className="flex-1" onClick={handleSubmit((data) => onSubmit(data, false))} disabled={isSubmitting || mutation.isLoading}>
              Save without Date
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button type="button" className="flex-1" onClick={handleSubmit((data) => onSubmit(data, true))} disabled={isSubmitting || mutation.isLoading}>
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

