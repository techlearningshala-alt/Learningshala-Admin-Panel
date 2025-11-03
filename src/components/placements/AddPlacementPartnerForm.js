"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addPlacementPartner, updatePlacementPartner } from "@/lib/universityApi";
import { notifySuccess, notifyError } from "@/lib/notify";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { ArrowLeft } from "lucide-react";

export default function AddPlacementPartnerForm({ partner, onCancel, onSuccess }) {
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
        ? updatePlacementPartner(partner.id, formData) 
        : addPlacementPartner(formData);
    },
    onSuccess: (res) => {
      notifySuccess(res.data.message || "Placement partner saved successfully");
      reset();
      setPreview(null);
      setExistingLogo(null);

      setTimeout(() => {
        queryClient.invalidateQueries(["placement-partners"]);
        onSuccess?.();
      }, 200);
    },
    onError: (err) => notifyError(err.response?.data?.message || "Operation failed"),
  });

  const onSubmit = (data) => mutation.mutate(data);

  return (
    <div className="p-4">
      <div className="relative flex justify-center items-center mb-6">
        <Button variant="ghost" size="sm" onClick={onCancel} className="absolute left-0">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to List
        </Button>
        <h3 className="text-xl font-bold">
          {partner ? "Edit Placement Partner" : "Add New Placement Partner"}
        </h3>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-2xl mx-auto">
        {/* Partner Name */}
        <div className="space-y-2">
          <Label>Partner/Company Name</Label>
          <Input 
            {...register("name")} 
            placeholder="e.g., Samsung, Google, Microsoft" 
          />
        </div>

        {/* Logo Upload */}
        <div className="space-y-2">
          <Label>Logo</Label>
          {preview && (
            <div className="mb-2">
              <img 
                src={preview} 
                alt="Logo preview" 
                className="h-24 w-24 object-contain rounded border p-2 bg-gray-50" 
              />
            </div>
          )}
          <Input
            type="file"
            accept="image/*"
            {...register("logo")}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setPreview(URL.createObjectURL(file));
              }
            }}
          />
          <p className="text-sm text-gray-500">
            Upload company logo (PNG, JPG, WEBP, SVG)
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-6">
          <Button 
            type="submit" 
            className="flex-1" 
            disabled={isSubmitting || mutation.isLoading}
          >
            {mutation.isLoading ? "Saving..." : partner ? "Update Partner" : "Add Partner"}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={mutation.isLoading}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

