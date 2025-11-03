"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AddFaqDialog({
  item,
  categories = [],
  open,
  onOpenChange,
  onSubmit, // parent handles add/update
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="hidden">Open Modal</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{item ? "Edit FAQ" : "Add New FAQ"}</DialogTitle>
          <DialogDescription className="mb-4">
            Fill in the details below
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4">
          {/* Category */}
          <div className="space-y-1">
            <Label>Category</Label>
            <select
              {...register("category_id", { required: "Category is required" })}
              className="w-full border rounded px-2 py-1"
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
          <div className="space-y-1">
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
          <div className="space-y-1">
            <Label>Answer</Label>
            <textarea
              {...register("description", { required: "Answer is required" })}
              className="w-full border rounded px-2 py-1"
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
                onClick={handleSubmit((data) => onSubmit(data, true, item))}
              >
                Save with Date
              </Button>
              <Button
                type="button"
                className="flex-1"
                disabled={isSubmitting}
                onClick={handleSubmit((data) => onSubmit(data, false, item))}
              >
                Save without Date
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button
                type="button"
                className="flex-1"
                disabled={isSubmitting}
                onClick={handleSubmit((data) => onSubmit(data, true, item))}
              >
                {isSubmitting ? "Saving..." : "Save"}
              </Button>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
