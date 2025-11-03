"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addSpecialization, updateSpecializations, findAllCourseName } from "@/lib/menuApi";
import { notifySuccess, notifyError } from "@/lib/notify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft } from "lucide-react";

export default function AddSpecializationForm({ item, onCancel, onSuccess }) {
  const [previewThumbnail, setPreviewThumbnail] = useState(null);
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

  // Prefill when editing
  useEffect(() => {
    if (item) {
      Object.keys(item).forEach((key) => setValue(key, item[key]));
      if (item.thumbnail) {
        setExistingThumbnail(item.thumbnail);
        setPreviewThumbnail(
          `${process.env.NEXT_PUBLIC_thumbnail_URL}${item.thumbnail}`
        );
      }
    } else {
      reset();
      setPreviewThumbnail(null);
      setExistingThumbnail(null);
    }
  }, [item, reset, setValue]);

  // Fetch all courses
  const { data, isLoading } = useQuery({
    queryKey: ["specialization"],
    queryFn: findAllCourseName,
  });
  const courses = data?.data || [];

  // Mutation for Add/Edit Specialization
  const mutation = useMutation({
    mutationFn: async ({ data, saveWithDate }) => {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === "thumbnail" && value?.[0]) {
            formData.append("thumbnail", value[0]);
          } else {
            formData.append(key, value);
          }
        }
      });

      if (!data.thumbnail?.[0] && existingThumbnail)
        formData.append("existingThumbnail", existingThumbnail);

      formData.append("saveWithDate", saveWithDate ? "true" : "false");

      if (item?.id) return updateSpecializations(item.id, formData);
      return addSpecialization(formData);
    },
    onSuccess: () => {
      notifySuccess(item ? "Specialization updated successfully" : "Specialization added successfully");
      reset();
      
      setTimeout(() => {
        queryClient.invalidateQueries(["specialization"]);
        onSuccess?.();
      }, 200);
    },
    onError: (err) => notifyError(err.response?.data?.message || "Operation failed"),
  });

  const onSubmit = (data, saveWithDate = true) => {
    const specializationData = {
      ...data,
      course_id: Number(data.course_id),
      priority: Number(data.priority),
      is_active: Boolean(data.is_active),
      menu_visibility: Boolean(data.menu_visibility),
    };
    mutation.mutate({ data: specializationData, saveWithDate });
  };

  return (
    <div className="p-4">
      <div className="relative flex justify-center items-center mb-6">
        <Button variant="ghost" size="sm" onClick={onCancel} className="absolute left-0">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to List
        </Button>
        <h1 className="text-2xl font-bold">{item ? "Edit Specialization" : "Add New Specialization"}</h1>
      </div>

      <form className="space-y-4 max-w-2xl mx-auto">
        {/* Course Dropdown */}
        <div className="space-y-2">
          <Label>Course</Label>
          <select
            {...register("course_id", { required: "Course is required" })}
            className="w-full border p-2 rounded"
          >
            <option value="">Select Course</option>
            {courses?.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
          {errors.course_id && (
            <p className="text-red-500 text-sm">
              {errors.course_id.message}
            </p>
          )}
        </div>

        {/* Name */}
        <div className="space-y-2">
          <Label>Name</Label>
          <Input
            {...register("name", { required: "Name is required" })}
            placeholder="Enter specialization name"
          />
          {errors.name && (
            <p className="text-red-500 text-sm">{errors.name.message}</p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label>Description</Label>
          <Input
            {...register("description")}
            placeholder="Enter description"
          />
        </div>

        {/* Priority */}
        <div className="space-y-2">
          <Label>Priority</Label>
          <Input
            type="number"
            {...register("priority", {
              required: "Priority is required",
              valueAsNumber: true,
            })}
          />
          {errors.priority && (
            <p className="text-red-500 text-sm">{errors.priority.message}</p>
          )}
        </div>

        {/* Thumbnail */}
        <div className="space-y-2">
          <Label>Thumbnail</Label>
          {previewThumbnail && (
            <img
              src={previewThumbnail}
              alt="Thumbnail preview"
              className="h-32 w-32 object-contain rounded border mb-2"
            />
          )}
          <Input
            type="file"
            accept="image/*"
            {...register("thumbnail", { required: !item })}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setPreviewThumbnail(URL.createObjectURL(file));
            }}
          />
          {errors.thumbnail && (
            <p className="text-red-500 text-sm">
              {errors.thumbnail.message}
            </p>
          )}
        </div>

        {/* Checkboxes */}
        <div className="flex items-center gap-2">
          <Checkbox {...register("is_active")} />
          <Label>Active</Label>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox {...register("menu_visibility")} />
          <Label>Show in Menu</Label>
        </div>

        {/* Save Buttons */}
        {item ? (
          <div className="flex gap-2">
            <Button
              type="button"
              className="flex-1"
              disabled={isSubmitting || mutation.isLoading}
              onClick={handleSubmit((data) => onSubmit(data, true))}
            >
              Save with Date
            </Button>
            <Button
              type="button"
              className="flex-1"
              disabled={isSubmitting || mutation.isLoading}
              onClick={handleSubmit((data) => onSubmit(data, false))}
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
              disabled={isSubmitting || mutation.isLoading}
              onClick={handleSubmit((data) => onSubmit(data, true))}
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

