"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import toast from "react-hot-toast";
import { addFaqCategory, updateFaqCategory } from "@/lib/api";

export default function AddFaqCategoryDialog({ item, open, onOpenChange }) {
  const queryClient = useQueryClient();

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
    } else {
      reset();
    }
  }, [item, reset, setValue]);

  // Mutation for adding
  const addMutation = useMutation({
    mutationFn: addFaqCategory,
    onSuccess: (res) => {
      toast.success(res?.message || "Category added");
      queryClient.invalidateQueries(["faq-categories"]);
      reset();
      onOpenChange(false);
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Failed to add category"),
  });

  // Mutation for updating
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateFaqCategory(id, data),
    onSuccess: (res) => {
      toast.success(res?.message || "Category updated");
      queryClient.invalidateQueries(["faq-categories"]);
      reset();
      onOpenChange(false);
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Failed to update category"),
  });

  // Handle submit
  const onSubmit = async (data, saveWithDate = true) => {
    data.saveWithDate = saveWithDate;

    if (item?.id) {
      await updateMutation.mutateAsync({ id: item.id, data });
    } else {
      await addMutation.mutateAsync(data);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="hidden">Open Modal</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {item ? "Edit FAQ Category" : "Add New FAQ Category"}
          </DialogTitle>
          <DialogDescription className="mb-4">
            Fill in the category details
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4">
          {/* Heading */}
          <div className="space-y-1">
            <Label>Heading</Label>
            <Input
              {...register("heading", { required: "Heading is required" })}
              placeholder="Enter category heading"
            />
            {errors.heading && (
              <p className="text-red-500 text-sm">{errors.heading.message}</p>
            )}
          </div>

          {/* Buttons */}
          {item ? (
            <div className="flex gap-2">
              <Button
                type="button"
                className="flex-1"
                disabled={isSubmitting}
                onClick={handleSubmit((data) => onSubmit(data, true))}
              >
                Save with Date
              </Button>
              <Button
                type="button"
                className="flex-1"
                disabled={isSubmitting}
                onClick={handleSubmit((data) => onSubmit(data, false))}
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
                onClick={handleSubmit((data) => onSubmit(data, true))}
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
