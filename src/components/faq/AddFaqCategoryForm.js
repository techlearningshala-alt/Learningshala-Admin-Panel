"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import FormActionButtons from "@/components/common/FormActionButtons";

export default function AddFaqCategoryForm({ item, onCancel, onSuccess }) {
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
    <div className="p-6 bg-gray-50 min-h-screen pb-24">
      <div className="relative flex justify-center items-center mb-6">
        <Button variant="ghost" size="sm" onClick={onCancel} className="absolute left-0">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to List
        </Button>
        <h3 className="text-2xl text-blue-700 font-bold">
          {item ? "Edit FAQ Category" : "Add New FAQ Category"}
        </h3>
      </div>

      <form className="space-y-6 max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-sm">
        {/* Heading */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Heading</Label>
          <Input
            {...register("heading", { required: "Heading is required" })}
            placeholder="Enter category heading"
            className="focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
          {errors.heading && (
            <p className="text-red-500 text-sm mt-1">{errors.heading.message}</p>
          )}
        </div>

        {/* Priority */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Priority</Label>
          <Input
            type="number"
            {...register("priority", { required: "Priority is required", valueAsNumber: true })}
            placeholder="Enter priority (lower number = higher priority)"
            className="focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
          {errors.priority && (
            <p className="text-red-500 text-sm mt-1">{errors.priority.message}</p>
          )}
        </div>
      </form>

      <FormActionButtons
        isEdit={!!item}
        isSubmitting={isSubmitting}
        isLoading={false}
        onSave={(saveWithDate) => handleSubmit((data) => onSubmit({ ...data, saveWithDate }))()}
        onCancel={onCancel}
        saveButtonText="Save"
      />
    </div>
  );
}

