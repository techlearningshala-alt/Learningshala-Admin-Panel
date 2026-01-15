"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";

export default function AddBlogCategoryForm({ item, onCancel, onSuccess }) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: item || {} });

  const title = watch("title");

  // Auto-generate slug from title when title changes (only if not editing or slug is empty)
  useEffect(() => {
    if (title && !item) {
      const slug = title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
      setValue("category_slug", slug);
    }
  }, [title, item, setValue]);

  // Reset form when item changes
  useEffect(() => {
    if (item) {
      setValue("title", item.title);
      setValue("category_slug", item.category_slug);
    } else {
      reset();
    }
  }, [item, reset, setValue]);

  const onSubmit = (data) => {
    onSuccess(data, item);
  };

  return (
    <div className="p-4">
      <div className="relative flex justify-center items-center mb-6">
        <Button variant="ghost" size="sm" onClick={onCancel} className="absolute left-0">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to List
        </Button>
        <h3 className="text-xl font-bold">
          {item ? "Edit Blog Category" : "Add New Blog Category"}
        </h3>
      </div>

      <form className="space-y-4 max-w-2xl mx-auto">
        {/* Title */}
        <div className="space-y-2">
          <Label>Title <span className="text-red-500">*</span></Label>
          <Input
            {...register("title", { required: "Title is required" })}
            placeholder="Enter category title"
          />
          {errors.title && (
            <p className="text-red-500 text-sm">{errors.title.message}</p>
          )}
        </div>

        {/* Category Slug */}
        <div className="space-y-2">
          <Label>Category Slug</Label>
          <Input
            {...register("category_slug")}
            placeholder="Auto-generated from title (or enter custom slug)"
          />
          {errors.category_slug && (
            <p className="text-red-500 text-sm">{errors.category_slug.message}</p>
          )}
        </div>

        {/* Buttons */}
        {item ? (
          <div className="flex gap-2">
            <Button
              type="button"
              className="flex-1"
              disabled={isSubmitting}
              onClick={handleSubmit((data) => onSubmit({ ...data, saveWithDate: true }))}
            >
              Save with Date
            </Button>
            <Button
              type="button"
              className="flex-1"
              disabled={isSubmitting}
              onClick={handleSubmit((data) => onSubmit({ ...data, saveWithDate: false }))}
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
              disabled={isSubmitting}
              onClick={handleSubmit((data) => onSubmit({ ...data, saveWithDate: true }))}
            >
              {isSubmitting ? "Saving..." : "Save"}
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
