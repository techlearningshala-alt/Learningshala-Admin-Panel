"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  addHomeTitleDescription,
  updateHomeTitleDescription,
} from "@/lib/api";
import { notifySuccess, notifyError } from "@/lib/notify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import FormActionButtons from "@/components/common/FormActionButtons";

export default function AddHomeTitleDescriptionForm({
  item,
  onCancel,
  onSuccess,
}) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      meta_title: "",
      meta_description: "",
    },
  });

  useEffect(() => {
    if (item) {
      setValue("meta_title", item.meta_title || "");
      setValue("meta_description", item.meta_description || "");
    } else {
      reset({ meta_title: "", meta_description: "" });
    }
  }, [item, reset, setValue]);

  const mutation = useMutation({
    mutationFn: async ({ data, saveWithDate }) => {
      const payload = {
        meta_title: data.meta_title?.trim(),
        meta_description: data.meta_description?.trim(),
        saveWithDate: saveWithDate ? "true" : "false",
      };

      return item?.id
        ? updateHomeTitleDescription(item.id, payload)
        : addHomeTitleDescription(payload);
    },
    onSuccess: () => {
      notifySuccess(item ? "Updated successfully" : "Added successfully");
      reset({ meta_title: "", meta_description: "" });

      setTimeout(() => {
        queryClient.invalidateQueries(["home-title-descriptions"]);
        onSuccess?.();
      }, 200);
    },
    onError: (err) =>
      notifyError(err.response?.data?.message || "Operation failed"),
  });

  const onSubmit = (data, saveWithDate = true) =>
    mutation.mutate({ data, saveWithDate });

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
          {item ? "Edit Title & Description" : "Add Title & Description"}
        </h3>
      </div>

      <form className="space-y-6 max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-sm">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">
            Meta Title <span className="text-red-500">*</span>
          </Label>
          <Input
            {...register("meta_title", {
              required: "Meta title is required",
              maxLength: {
                value: 255,
                message: "Meta title must be 255 characters or less",
              },
            })}
            placeholder="Enter meta title"
            className="focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
          {errors.meta_title && (
            <p className="text-red-500 text-sm mt-1">
              {errors.meta_title.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">
            Meta Description <span className="text-red-500">*</span>
          </Label>
          <Textarea
            {...register("meta_description", {
              required: "Meta description is required",
            })}
            placeholder="Enter meta description"
            rows={5}
            className="focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
          {errors.meta_description && (
            <p className="text-red-500 text-sm mt-1">
              {errors.meta_description.message}
            </p>
          )}
        </div>
      </form>

      <FormActionButtons
        isEdit={!!item}
        isSubmitting={isSubmitting}
        isLoading={mutation.isLoading}
        onSave={(saveWithDate) => handleSubmit((data) => onSubmit(data, saveWithDate))()}
        onCancel={onCancel}
      />
    </div>
  );
}
