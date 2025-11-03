"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addCourse, updateCourse, fetchDomainsForCourse } from "@/lib/menuApi";
import { notifySuccess, notifyError } from "@/lib/notify";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export default function AddCourseDialog({ item, open, onOpenChange }) {
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
  }, [item, open]);

  // Fetch all domains
  const { data, isLoading } = useQuery({
    queryKey: ["domains"],
    queryFn: fetchDomainsForCourse,
  });
  const domains = data?.data?.data || [];
  console.log(domains, "ddd")

  // Mutation for Add/Edit Course
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

      console.log(data,"dataaaaa")
      if (item?.id) return updateCourse(item.id, formData);
      return addCourse(formData);
    },
    onSuccess: () => {
      notifySuccess(item ? "Course updated successfully" : "Course added successfully");
      queryClient.invalidateQueries(["courses"]);
      reset();
      onOpenChange(false);
    },
    onError: (err) => notifyError(err.response?.data?.message || "Operation failed"),
  });

  const onSubmit = (data, saveWithDate = true) => {
    const courseData = {
      ...data,
      domain_id: Number(data.domain_id),
      priority: Number(data.priority),
      is_active: Boolean(data.is_active),
      menu_visibility: Boolean(data.menu_visibility),
    };
    mutation.mutate({ data: courseData, saveWithDate });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="hidden">Open Modal</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{item ? "Edit Course" : "Add New Course"}</DialogTitle>
        </DialogHeader>

        <form className="space-y-4">
          {/* Domain Dropdown */}
          <div className="space-y-1">
            <Label>Domain</Label>
            <select
              {...register("domain_id", { required: "Domain is required" })}
              className="w-full border p-2 rounded"
            >
              <option value="">Select Domain</option>
              {domains?.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            {errors.domain_id && (
              <p className="text-red-500 text-sm">
                {errors.domain_id.message}
              </p>
            )}
          </div>

          {/* Name */}
          <div className="space-y-1">
            <Label>Name</Label>
            <Input
              {...register("name", { required: "Name is required" })}
              placeholder="Enter course name"
            />
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1">
            <Label>Description</Label>
            <Input
              {...register("description")}
              placeholder="Enter description"
            />
          </div>

          {/* Priority */}
          <div className="space-y-1">
            <Label>Priority</Label>
            <Input
              type="number"
              {...register("priority", {
                required: "Priority is required",
                valueAsNumber: true,
              })}
            />
          </div>

          {/* Thumbnail */}
          <div className="space-y-1">
            <Label>Thumbnail</Label>
            {previewThumbnail && (
              <img
                src={previewThumbnail}
                alt="Thumbnail preview"
                className="h-20 object-contain rounded border mb-2"
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
            </div>
          ) : (
            <Button
              type="button"
              className="w-full"
              disabled={isSubmitting || mutation.isLoading}
              onClick={handleSubmit((data) => onSubmit(data, true))}
            >
              {mutation.isLoading ? "Saving..." : "Save"}
            </Button>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
