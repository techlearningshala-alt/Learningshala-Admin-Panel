"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
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
import { ArrowLeft, Plus, X } from "lucide-react";
import FormActionButtons from "@/components/common/FormActionButtons";

const emptyRow = () => ({
  page: "",
  meta_title: "",
  meta_description: "",
});

export default function AddHomeTitleDescriptionForm({
  item,
  onCancel,
  onSuccess,
}) {
  const queryClient = useQueryClient();
  const isEdit = !!item?.id;

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      items: [emptyRow()],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const [initialCount] = useState(1);

  useEffect(() => {
    if (item) {
      reset({
        items: [
          {
            page: item.page || "",
            meta_title: item.meta_title || "",
            meta_description: item.meta_description || "",
          },
        ],
      });
    } else {
      reset({ items: [emptyRow()] });
    }
  }, [item, reset]);

  const mutation = useMutation({
    mutationFn: async ({ data, saveWithDate }) => {
      const rows = data.items || [];

      if (isEdit) {
        const row = rows[0];
        return updateHomeTitleDescription(item.id, {
          page: row.page?.trim(),
          meta_title: row.meta_title?.trim(),
          meta_description: row.meta_description?.trim(),
          saveWithDate: saveWithDate ? "true" : "false",
        });
      }

      const results = [];
      for (const row of rows) {
        const result = await addHomeTitleDescription({
          page: row.page?.trim(),
          meta_title: row.meta_title?.trim(),
          meta_description: row.meta_description?.trim(),
        });
        results.push(result);
      }
      return results;
    },
    onSuccess: () => {
      notifySuccess(isEdit ? "Updated successfully" : "Added successfully");
      reset({ items: [emptyRow()] });

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
          {isEdit ? "Edit Title & Description" : "Add Title & Description"}
        </h3>
      </div>

      <form className="space-y-4 max-w-6xl mx-auto">
        {fields.map((field, index) => {
          const rowErrors = errors.items?.[index];

          return (
            <div
              key={field.id}
              className="relative p-4 border rounded-lg bg-white shadow-sm space-y-4"
            >
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Page <span className="text-red-500">*</span>
                </Label>
                <Input
                  {...register(`items.${index}.page`, {
                    required: "Page is required",
                    maxLength: {
                      value: 255,
                      message: "Page must be 255 characters or less",
                    },
                  })}
                  placeholder="e.g. home, about, contact"
                  className="focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
                {rowErrors?.page && (
                  <p className="text-red-500 text-sm mt-1">
                    {rowErrors.page.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Meta Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  {...register(`items.${index}.meta_title`, {
                    required: "Meta title is required",
                    maxLength: {
                      value: 255,
                      message: "Meta title must be 255 characters or less",
                    },
                  })}
                  placeholder="Enter meta title"
                  className="focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
                {rowErrors?.meta_title && (
                  <p className="text-red-500 text-sm mt-1">
                    {rowErrors.meta_title.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Meta Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  {...register(`items.${index}.meta_description`, {
                    required: "Meta description is required",
                  })}
                  placeholder="Enter meta description"
                  rows={4}
                  className="focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
                {rowErrors?.meta_description && (
                  <p className="text-red-500 text-sm mt-1">
                    {rowErrors.meta_description.message}
                  </p>
                )}
              </div>

              {!isEdit && index >= initialCount && (
                <div className="flex mt-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={() => remove(index)}
                  >
                    <X className="h-4 w-4 mr-1" /> Remove
                  </Button>
                </div>
              )}
            </div>
          );
        })}

        {!isEdit && (
          <div className="flex justify-start">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => append(emptyRow())}
            >
              <Plus className="h-4 w-4 mr-1" /> Add More
            </Button>
          </div>
        )}
      </form>

      <FormActionButtons
        isEdit={isEdit}
        isSubmitting={isSubmitting}
        isLoading={mutation.isLoading}
        onSave={(saveWithDate) =>
          handleSubmit((data) => onSubmit(data, saveWithDate))()
        }
        onCancel={onCancel}
      />
    </div>
  );
}
