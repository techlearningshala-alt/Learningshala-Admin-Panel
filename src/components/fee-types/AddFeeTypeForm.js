import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFeeType, updateFeeType } from "@/lib/universityApi";
import { notifyError, notifySuccess } from "@/lib/notify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";

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
    mutationFn: async (payload) => {
      if (isEdit) {
        return updateFeeType(feeType.id, payload);
      }
      return createFeeType(payload);
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

  const onSubmit = (formData) => {
    const payload = {
      title: formData.title.trim(),
    };
    mutation.mutate(payload);
  };

  return (
    <div className="p-4">
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
        <h1 className="text-2xl font-bold">
          {isEdit ? "Edit Fee Type" : "Add Fee Type"}
        </h1>
      </div>

      <form className="space-y-6 max-w-lg mx-auto" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-2">
          <Label htmlFor="fee-title">Title</Label>
          <Input
            id="fee-title"
            placeholder="Enter fee title"
            {...register("title", { required: "Title is required" })}
          />
          {errors.title && (
            <p className="text-xs text-destructive">{errors.title.message}</p>
          )}
        </div>



        <div className="flex gap-2">
          <Button type="submit" disabled={isSubmitting || mutation.isLoading}>
            {mutation.isLoading ? "Saving..." : "Save"}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}


