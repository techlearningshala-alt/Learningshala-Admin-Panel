"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addDomain, updateDomain } from "@/lib/menuApi";
import { notifySuccess, notifyError } from "@/lib/notify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft } from "lucide-react";

export default function AddDomainForm({ item, onCancel, onSuccess }) {
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm({
    defaultValues: item || {},
  });

  useEffect(() => {
    if (item) {
      Object.keys(item).forEach(key => setValue(key, item[key]));
    } else {
      reset();
    }
  }, [item, reset, setValue]);

  const mutation = useMutation({
    mutationFn: async (formData) => {
      return item?.id ? updateDomain(item.id, formData) : addDomain(formData);
    },
    onSuccess: () => {
      notifySuccess(item ? "Domain updated successfully" : "Domain added successfully");
      reset();
      
      setTimeout(() => {
        queryClient.invalidateQueries(["domains"]);
        onSuccess?.();
      }, 200);
    },
    onError: (err) => notifyError(err.response?.data?.message || "Operation failed"),
  });

  const onSubmit = (data, saveWithDate = true) => {
    const formData = {
      ...data,
      priority: Number(data.priority),
      is_active: Boolean(data.is_active),
      menu_visibility: Boolean(data.menu_visibility),
      saveWithDate 
    };
    mutation.mutate(formData);
  };

  return (
    <div className="p-4">
      <div className="relative flex justify-center items-center mb-6">
        <Button variant="ghost" size="sm" onClick={onCancel} className="absolute left-0">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to List
        </Button>
        <h3 className="text-2xl font-bold">{item ? "Edit Domain" : "Add New Domain"}</h3>
      </div>

      <form className="space-y-4 max-w-2xl mx-auto">
        {/* Name */}
        <div className="space-y-2">
          <Label>Name</Label>
          <Input {...register("name", { required: "Name is required" })} placeholder="Enter domain name" />
          {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label>Description</Label>
          <Input {...register("description", { required: "Description is required" })} placeholder="Enter description" />
          {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
        </div>

        {/* Priority */}
        <div className="space-y-2">
          <Label>Priority</Label>
          <Input type="number" {...register("priority", { required: "Priority is required" })} />
          {errors.priority && <p className="text-red-500 text-sm">{errors.priority.message}</p>}
        </div>

        {/* Active */}
        <div className="flex items-center gap-2">
          <Checkbox {...register("is_active")} />
          <Label>Active</Label>
        </div>

        {/* Menu Visibility */}
        <div className="flex items-center gap-2">
          <Checkbox {...register("menu_visibility")} />
          <Label>Show in Menu</Label>
        </div>

        {/* Save Buttons */}
        {item ? (
          <div className="flex gap-2">
            <Button type="button" className="flex-1" disabled={isSubmitting || mutation.isLoading} onClick={handleSubmit((data) => onSubmit(data, true))}>
              Save with Date
            </Button>
            <Button type="button" className="flex-1" disabled={isSubmitting || mutation.isLoading} onClick={handleSubmit((data) => onSubmit(data, false))}>
              Save without Date
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button type="button" className="flex-1" disabled={isSubmitting || mutation.isLoading} onClick={handleSubmit((data) => onSubmit(data, true))}>
              {mutation.isLoading ? "Saving..." : "Save"}
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

