"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addEmiPartner, updateEmiPartner } from "@/lib/universityApi";
import { notifySuccess, notifyError } from "@/lib/notify";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { ArrowLeft } from "lucide-react";
import FormActionButtons from "@/components/common/FormActionButtons";

export default function AddEmiPartnerForm({ partner, onCancel, onSuccess }) {
  const [preview, setPreview] = useState(null);
  const [existingLogo, setExistingLogo] = useState(null);
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm({
    defaultValues: partner || { name: "", logo: null },
  });

  // Prefill form when editing
  useEffect(() => {
    if (partner) {
      setValue("name", partner.name || "");
      
      if (partner.logo) {
        setExistingLogo(partner.logo);
        setPreview(`${process.env.NEXT_PUBLIC_thumbnail_URL}${partner.logo}`);
      }
    } else {
      reset();
      setPreview(null);
      setExistingLogo(null);
    }
  }, [partner, reset, setValue]);

  // Mutation for create/update
  const mutation = useMutation({
    mutationFn: async ({ data, saveWithDate }) => {
      const formData = new FormData();
      
      formData.append("name", data.name || "");
      formData.append("saveWithDate", saveWithDate ? "true" : "false");
      
      // Handle logo upload
      if (data.logo?.[0]) {
        formData.append("logo", data.logo[0]);
      } else if (existingLogo) {
        formData.append("existingLogo", existingLogo);
      }

      return partner?.id 
        ? updateEmiPartner(partner.id, formData) 
        : addEmiPartner(formData);
    },
    onSuccess: (res) => {
      notifySuccess(res.data.message || "EMI partner saved successfully");
      reset();
      setPreview(null);
      setExistingLogo(null);
      queryClient.invalidateQueries(["emi-partners"]);
      if (onSuccess) onSuccess();
    },
    onError: (err) => {
      notifyError(err.response?.data?.message || "Failed to save EMI partner");
    },
  });

  const onSubmit = (data, saveWithDate = true) => {
    mutation.mutate({ data, saveWithDate });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen pb-24">
      <div className="relative flex justify-center items-center mb-6">
        <Button variant="ghost" size="sm" onClick={onCancel} className="absolute left-0">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to List
        </Button>
        <h3 className="text-2xl text-blue-700 font-bold">
          {partner ? "Edit EMI Partner" : "Add New EMI Partner"}
        </h3>
      </div>

      <form className="space-y-6 max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-sm">
        {/* Partner Name */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Partner/Bank Name</Label>
          <Input 
            {...register("name", { required: "Partner name is required" })} 
            placeholder="e.g., HDFC Bank, Bajaj Finserv, ICICI Bank"
            className="focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
        </div>

        {/* Logo Upload */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Logo</Label>
          {(preview || existingLogo) && (
            <div className="mb-3">
              <img
                src={preview || `${process.env.NEXT_PUBLIC_thumbnail_URL}${existingLogo}`}
                alt="Preview"
                className="h-32 w-32 object-contain rounded-lg border-2 border-gray-200 shadow-sm p-2 bg-gray-50"
              />
            </div>
          )}
          <Input
            type="file"
            accept="image/*"
            {...register("logo", { required: !partner })}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setPreview(URL.createObjectURL(file));
            }}
            className="focus:border-blue-500 focus:ring-2 focus:ring-blue-200 h-8"
          />
          <p className="text-sm text-gray-500">
            Upload EMI partner logo (recommended: 200x80px)
          </p>
          {errors.logo && <p className="text-red-500 text-sm mt-1">{errors.logo.message}</p>}
        </div>
      </form>

      <FormActionButtons
        isEdit={!!partner}
        isSubmitting={isSubmitting}
        isLoading={mutation.isLoading}
        onSave={(saveWithDate) => handleSubmit((data) => onSubmit(data, saveWithDate))()}
        onCancel={onCancel}
        saveButtonText="Save"
      />
    </div>
  );
}

