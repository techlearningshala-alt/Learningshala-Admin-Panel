"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addDomain, updateDomain } from "@/lib/menuApi";
import { notifySuccess, notifyError } from "@/lib/notify";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export default function AddDomainDialog({ item, open, onOpenChange }) {
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
  }, [item, open]);

  const mutation = useMutation({
    mutationFn: async (formData) => {
  return item?.id ? updateDomain(item.id, formData) : addDomain(formData);
}
,
    onSuccess: () => {
      notifySuccess(item ? "Domain updated successfully" : "Domain added successfully");
      queryClient.invalidateQueries(["domains"]);
      reset();
      onOpenChange(false);
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
  mutation.mutate(formData); // now backend will see it
};

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="hidden">Open Modal</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{item ? "Edit Domain" : "Add New Domain"}</DialogTitle>
        </DialogHeader>

        <form className="space-y-4">
          {/* Name */}
          <div className="space-y-1">
            <Label>Name</Label>
            <Input {...register("name", { required: "Name is required" })} placeholder="Enter domain name" />
            {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
          </div>

          {/* Description */}
          <div className="space-y-1">
            <Label>Description</Label>
            <Input {...register("description", { required: "description is required" })} placeholder="Enter description" />
          </div>

          {/* Priority */}
          <div className="space-y-1">
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
            </div>
          ) : (
            <Button type="button" className="w-full" disabled={isSubmitting || mutation.isLoading} onClick={handleSubmit((data) => onSubmit(data, true))}>
              {mutation.isLoading ? "Saving..." : "Save"}
            </Button>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
