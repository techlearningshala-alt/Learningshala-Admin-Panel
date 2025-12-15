"use client";

import { useEffect, useState } from "react";
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
  const [saveWithoutDate, setSaveWithoutDate] = useState(false);

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm({
    defaultValues: item || {},
  });

  useEffect(() => {
    if (item) {
      Object.keys(item).forEach(key => setValue(key, item[key]));
      setSaveWithoutDate(false);
    } else {
      reset();
      setSaveWithoutDate(false);
    }
  }, [item, reset, setValue]);

  const mutation = useMutation({
    mutationFn: async ({ formData, shouldRedirect }) => {
      // Only send formData to API, not shouldRedirect
      return item?.id ? updateDomain(item.id, formData) : addDomain(formData);
    },
    onSuccess: (data, variables) => {
      const { shouldRedirect = true } = variables;
      notifySuccess(item ? "Domain updated successfully" : "Domain added successfully");
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries(["domains"]);
      
      // Only redirect if shouldRedirect is true (regular Save)
      if (shouldRedirect) {
        reset();
        setTimeout(() => {
          onSuccess?.();
        }, 200);
      } else {
        // For "Save and Continue", update the form with latest data
        if (item?.id && data?.data) {
          // Update form with the response data if available
          Object.keys(data.data).forEach(key => {
            if (data.data[key] !== undefined) {
              setValue(key, data.data[key]);
            }
          });
        }
      }
    },
    onError: (err) => notifyError(err.response?.data?.message || "Operation failed"),
  });

  const handleSave = (shouldRedirect = true) => {
    handleSubmit((data) => {
      const shouldSaveWithDate = item ? !saveWithoutDate : true;
      const formData = {
        ...data,
        priority: Number(data.priority),
        is_active: Boolean(data.is_active),
        menu_visibility: Boolean(data.menu_visibility),
        saveWithDate: shouldSaveWithDate
      };
      // Pass formData and shouldRedirect separately
      mutation.mutate({ formData, shouldRedirect });
    })();
  };

  return (
    <div className="p-4 pb-24">
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
      </form>

      {/* Fixed Bottom Bar with Buttons - Same as Course Form */}
      <div className="fixed bottom-0 left-0 md:left-[200px] right-0 bg-background border-t shadow-lg z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center justify-end gap-3">
            {item && (
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  id="save-without-date"
                  checked={saveWithoutDate}
                  onChange={(event) => setSaveWithoutDate(event.target.checked)}
                />
                Save without Date
              </label>
            )}
            <Button
              type="button"
              // variant="outline"
              disabled={isSubmitting || mutation.isLoading}
              onClick={onCancel}
            >
              Cancel
            </Button>
            {item ? (
              <>
                <Button
                  type="button"
                  onClick={() => handleSave(true)}
                  disabled={isSubmitting || mutation.isLoading}
                >
                  {mutation.isLoading ? "Saving..." : "Save"}
                </Button>
                <Button
                  type="button"
                  // variant="secondary"
                  onClick={() => handleSave(false)}
                  disabled={isSubmitting || mutation.isLoading}
                >
                  {mutation.isLoading ? "Saving..." : "Save and Continue"}
                </Button>
              </>
            ) : (
              <Button
                type="button"
                onClick={() => handleSave(true)}
                disabled={isSubmitting || mutation.isLoading}
              >
                {mutation.isLoading ? "Saving..." : "Create Domain"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

