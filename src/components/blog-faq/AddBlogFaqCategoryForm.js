"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";

export default function AddBlogFaqCategoryForm({ item, onCancel, onSuccess }) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: item || {} });

  // Reset form when item changes
  useEffect(() => {
    if (item) {
      setValue("heading", item.heading);
      setValue("priority", item.priority ?? 999);
    } else {
      reset({ priority: 999 });
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
          {item ? "Edit Blog FAQ Category" : "Add New Blog FAQ Category"}
        </h3>
      </div>

      <form className="space-y-4 max-w-2xl mx-auto">
        {/* Heading */}
        <div className="space-y-2">
          <Label>Heading</Label>
          <Input
            {...register("heading", { required: "Heading is required" })}
            placeholder="Enter category heading"
          />
          {errors.heading && (
            <p className="text-red-500 text-sm">{errors.heading.message}</p>
          )}
        </div>

        {/* Priority */}
        <div className="space-y-2">
          <Label>Priority</Label>
          <Input
            type="number"
            {...register("priority", { required: "Priority is required", valueAsNumber: true })}
            placeholder="Enter priority (lower number = higher priority)"
          />
          {errors.priority && (
            <p className="text-red-500 text-sm">{errors.priority.message}</p>
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
