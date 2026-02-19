"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import FormActionButtons from "@/components/common/FormActionButtons";

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

  const onSubmit = async (data, saveWithDate = true) => {
    try {
      if (onSuccess) {
        await onSuccess({ ...data, saveWithDate });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen pb-24">
      <div className="relative flex justify-center items-center mb-6">
        <Button variant="ghost" size="sm" onClick={onCancel} className="absolute left-0">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to List
        </Button>
        <h3 className="text-2xl text-blue-700 font-bold">
          {item ? "Edit Redirection" : "Add New Redirection"}
        </h3>
      </div>

      <form className="space-y-6 max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-sm">
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
            <p className="text-red-500 text-sm mt-1">{errors.old_url.message}</p>
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
            <p className="text-red-500 text-sm mt-1">{errors.new_url.message}</p>
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
