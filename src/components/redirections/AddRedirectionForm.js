"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";

export default function AddRedirectionForm({ item, onCancel, onSuccess }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      old_url: "",
      new_url: "",
    },
  });

  useEffect(() => {
    if (item) {
      reset({
        old_url: item.old_url || "",
        new_url: item.new_url || "",
      });
    }
  }, [item, reset]);

  const onSubmit = async (data) => {
    try {
      if (onSuccess) {
        await onSuccess(data);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex items-center gap-4 mb-6">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onCancel}
          className="hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-2xl font-semibold text-gray-800">
          {item ? "Edit Redirection" : "Add New Redirection"}
        </h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="old_url" className="text-sm font-medium text-gray-700">
            Old URL (Source) <span className="text-red-500">*</span>
          </Label>
          <Input
            id="old_url"
            type="url"
            placeholder="https://example.com/old-page"
            {...register("old_url", {
              required: "Old URL is required",
              pattern: {
                value: /^https?:\/\/.+/,
                message: "Please enter a valid URL (must start with http:// or https://)",
              },
            })}
            className="focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
          {errors.old_url && (
            <p className="text-xs text-red-500">{errors.old_url.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="new_url" className="text-sm font-medium text-gray-700">
            New URL (Destination) <span className="text-red-500">*</span>
          </Label>
          <Input
            id="new_url"
            type="url"
            placeholder="https://example.com/new-page"
            {...register("new_url", {
              required: "New URL is required",
              pattern: {
                value: /^https?:\/\/.+/,
                message: "Please enter a valid URL (must start with http:// or https://)",
              },
            })}
            className="focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
          {errors.new_url && (
            <p className="text-xs text-red-500">{errors.new_url.message}</p>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="px-6"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
          >
            {isSubmitting ? "Saving..." : item ? "Update" : "Save"}
          </Button>
        </div>
      </form>
    </div>
  );
}
