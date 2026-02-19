"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import FormActionButtons from "@/components/common/FormActionButtons";

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

  const onSubmit = (data, saveWithDate = true) => {
    onSuccess({ ...data, saveWithDate }, item);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen pb-24">
      <div className="relative flex justify-center items-center mb-6">
        <Button variant="ghost" size="sm" onClick={onCancel} className="absolute left-0">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to List
        </Button>
        <h3 className="text-2xl text-blue-700 font-bold">
          {item ? "Edit Blog Category" : "Add New Blog Category"}
        </h3>
      </div>

      <form className="space-y-6 max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-sm">
        {/* Title */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Title <span className="text-red-500">*</span></Label>
          <Input
            {...register("title", { required: "Title is required" })}
            placeholder="Enter category title"
            className="focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
          )}
        </div>

        {/* Category Slug */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Category Slug</Label>
          <Input
            {...register("category_slug")}
            placeholder="Auto-generated from title (or enter custom slug)"
            className="focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
          {errors.category_slug && (
            <p className="text-red-500 text-sm mt-1">{errors.category_slug.message}</p>
          )}
        </div>
      </form>

      <FormActionButtons
        isEdit={!!item}
        isSubmitting={isSubmitting}
        onSave={(saveWithDate) => handleSubmit((data) => onSubmit(data, saveWithDate))()}
        onCancel={onCancel}
        saveButtonText="Save"
      />
    </div>
  );
}
