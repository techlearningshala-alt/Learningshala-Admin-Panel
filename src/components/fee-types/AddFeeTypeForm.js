"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFeeType, updateFeeType } from "@/lib/universityApi";
import { notifyError, notifySuccess } from "@/lib/notify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import FormActionButtons from "@/components/common/FormActionButtons";

const defaultValues = {
  title: "",
};

export default function AddFeeTypeForm({ feeType, onCancel, onSuccess }) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    defaultValues,
  });

  const isEdit = Boolean(feeType?.id);

  useEffect(() => {
    if (feeType) {
      reset({
        title: feeType.title ?? "",
      });
    } else {
      reset(defaultValues);
    }
  }, [feeType, reset]);

  const mutation = useMutation({
    mutationFn: async ({ payload, saveWithDate }) => {
      const finalPayload = {
        ...payload,
        saveWithDate: saveWithDate ? "true" : "false",
      };
      if (isEdit) {
        return updateFeeType(feeType.id, finalPayload);
      }
      return createFeeType(finalPayload);
    },
    onSuccess: () => {
      notifySuccess(
        isEdit ? "Fee type updated successfully" : "Fee type created successfully"
      );
      queryClient.invalidateQueries(["fee-types"]);
      onSuccess?.();
    },
    onError: (error) => {
      const message = error?.response?.data?.message || "Operation failed";
      notifyError(message);
    },
  });

  const onSubmit = (formData, saveWithDate = true) => {
    const payload = {
      title: formData.title.trim(),
    };
    mutation.mutate({ payload, saveWithDate });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen pb-24">
      <div className="relative flex justify-center items-center mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="absolute left-0"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to List
        </Button>
        <h3 className="text-2xl text-blue-700 font-bold">
          {isEdit ? "Edit Fee Type" : "Add New Fee Type"}
        </h3>
      </div>

      <form className="space-y-6 max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-sm">
        <div className="space-y-2">
          <Label htmlFor="fee-title" className="text-sm font-medium text-gray-700">Title</Label>
          <Input
            id="fee-title"
            placeholder="Enter fee title"
            {...register("title", { required: "Title is required" })}
            className="focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
          )}
        </div>
      </form>

      <FormActionButtons
        isEdit={isEdit}
        isSubmitting={isSubmitting}
        isLoading={mutation.isLoading}
        onSave={(saveWithDate) => handleSubmit((data) => onSubmit(data, saveWithDate))()}
        onCancel={onCancel}
        saveButtonText="Save"
      />
    </div>
  );
}


