"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";

export default function AddFaqForm({
  item,
  categories = [],
  onCancel,
  onSuccess,
}) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: item || {} });

  // Populate form if editing
  useEffect(() => {
    if (item) {
      const allowedKeys = ["id", "category_id", "title", "description"];
      allowedKeys.forEach((key) => {
        if (item[key] !== undefined) setValue(key, item[key]);
      });
    } else {
      reset();
    }
  }, [item, setValue, reset]);

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
        <h3 className="text-xl font-bold">{item ? "Edit FAQ" : "Add New FAQ"}</h3>
      </div>

      <form className="space-y-4 max-w-2xl mx-auto">
        {/* Category */}
        <div className="space-y-2">
          <Label>Category</Label>
          <select
            {...register("category_id", { required: "Category is required" })}
            className="w-full border rounded px-3 py-2"
            defaultValue={item?.category_id || ""}
          >
            <option value="" disabled>
              Select category
            </option>
            {Array.isArray(categories) &&
              categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.heading}
                </option>
              ))}
          </select>
          {errors.category_id && (
            <p className="text-red-500 text-sm">{errors.category_id.message}</p>
          )}
        </div>

        {/* Question */}
        <div className="space-y-2">
          <Label>Question</Label>
          <Input
            {...register("title", { required: "Question is required" })}
            placeholder="Enter question"
          />
          {errors.title && (
            <p className="text-red-500 text-sm">{errors.title.message}</p>
          )}
        </div>

        {/* Answer */}
        <div className="space-y-2">
          <Label>Answer</Label>
          <textarea
            {...register("description", { required: "Answer is required" })}
            className="w-full border rounded px-3 py-2 min-h-[120px]"
            placeholder="Enter answer"
          />
          {errors.description && (
            <p className="text-red-500 text-sm">{errors.description.message}</p>
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

