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
import FormActionButtons from "@/components/common/FormActionButtons";

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

  const handleSave = (shouldRedirect = true, saveWithoutDateFlag = undefined) => {
    handleSubmit((data) => {
      const shouldSaveWithDate = item ? !(saveWithoutDateFlag !== undefined ? saveWithoutDateFlag : saveWithoutDate) : true;
      const formData = {
        ...data,
        label: data.label || "",
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
    <div className="p-6 bg-gray-50 min-h-screen pb-24">
      <div className="relative flex justify-center items-center mb-6">
        <Button variant="ghost" size="sm" onClick={onCancel} className="absolute left-0">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to List
        </Button>
        <h3 className="text-2xl text-blue-700 font-bold">{item ? "Edit Domain" : "Add New Domain"}</h3>
      </div>

      <form className="space-y-6 max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-sm">
        {/* Name */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Name</Label>
          <Input 
            {...register("name", { required: "Name is required" })} 
            placeholder="Enter domain name"
            className="focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
        </div>

        {/* Label */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Label</Label>
          <Input
            {...register("label")}
            placeholder="Short label (optional, e.g. 'Top', 'Popular')"
            className="focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Description</Label>
          <Input 
            {...register("description", { required: "Description is required" })} 
            placeholder="Enter description"
            className="focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
        </div>

        {/* Priority */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Priority</Label>
          <Input 
            type="number" 
            {...register("priority", { required: "Priority is required" })}
            className="focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
          {errors.priority && <p className="text-red-500 text-sm mt-1">{errors.priority.message}</p>}
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

      {/* Fixed Bottom Bar with Buttons */}
      {item ? (
        <div className="fixed bottom-0 left-[215px] right-0 bg-white border-t border-gray-200 z-50 shadow-2xl">
          <div className="flex gap-3 p-4 max-w-6xl mx-auto">
            <Button
              type="button"
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all"
              disabled={isSubmitting || mutation.isLoading}
              onClick={() => handleSave(true)}
            >
              {mutation.isLoading ? "Saving..." : "Save"}
            </Button>
            <Button
              type="button"
              className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all"
              disabled={isSubmitting || mutation.isLoading}
              onClick={() => handleSave(false)}
            >
              {mutation.isLoading ? "Saving..." : "Save and Continue"}
            </Button>
            <Button
              type="button"
              className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white shadow-md hover:shadow-lg transition-all"
              disabled={isSubmitting || mutation.isLoading}
              onClick={() => handleSave(true, true)}
            >
              {mutation.isLoading ? "Saving..." : "Save without Date"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="border-gray-300 hover:bg-gray-50"
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <FormActionButtons
          isEdit={false}
          isSubmitting={isSubmitting}
          isLoading={mutation.isLoading}
          onSave={() => handleSave(true)}
          onCancel={onCancel}
          saveButtonText="Create Domain"
        />
      )}
    </div>
  );
}

