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
    mutationFn: async (data) => {
      const formData = new FormData();
      
      formData.append("name", data.name || "");
      
      // Handle logo upload
      if (data.logo?.[0]) {
        formData.append("logo", data.logo[0]);
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

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-xl font-bold">
          {partner ? "Edit EMI Partner" : "Add New EMI Partner"}
        </h3>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-2xl mx-auto">
        {/* Partner Name */}
        <div className="space-y-2">
          <Label>Partner/Bank Name</Label>
          <Input 
            {...register("name")} 
            placeholder="e.g., HDFC Bank, Bajaj Finserv, ICICI Bank" 
          />
        </div>

        {/* Logo Upload */}
        <div className="space-y-2">
          <Label>Logo</Label>
          {(preview || existingLogo) && (
            <img
              src={preview || `${process.env.NEXT_PUBLIC_thumbnail_URL}${existingLogo}`}
              alt="Preview"
              className="h-20 object-contain rounded border mb-2"
            />
          )}
          <Input
            type="file"
            accept="image/*"
            {...register("logo")}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setPreview(URL.createObjectURL(file));
            }}
          />
          <p className="text-sm text-gray-500">
            Upload EMI partner logo (recommended: 200x80px)
          </p>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-2 pt-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : partner ? "Update" : "Create"}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

