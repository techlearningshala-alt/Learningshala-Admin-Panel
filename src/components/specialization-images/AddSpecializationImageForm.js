"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addSpecializationImage, updateSpecializationImage } from "@/lib/menuApi";
import { notifySuccess, notifyError } from "@/lib/notify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import FormActionButtons from "@/components/common/FormActionButtons";

export default function AddSpecializationImageForm({ item, onCancel, onSuccess }) {
  useScrollToTop();
  const queryClient = useQueryClient();
  const [previewImage, setPreviewImage] = useState(null);
  const [existingImage, setExistingImage] = useState(null);
  const [imageRemoved, setImageRemoved] = useState(false);

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm({
    defaultValues: item || { name: "" },
  });

  useEffect(() => {
    if (item) {
      setValue("name", item.name || "");
      if (item.image) {
        setExistingImage(item.image);
        setPreviewImage(`${process.env.NEXT_PUBLIC_thumbnail_URL}${item.image}`);
      }
    } else {
      reset({ name: "" });
      setPreviewImage(null);
      setExistingImage(null);
      setImageRemoved(false);
    }
  }, [item, reset, setValue]);

  const mutation = useMutation({
    mutationFn: async ({ formData, saveWithDate }) => {
      formData.append("saveWithDate", saveWithDate ? "true" : "false");
      return item?.id ? updateSpecializationImage(item.id, formData) : addSpecializationImage(formData);
    },
    onSuccess: () => {
      notifySuccess(item ? "Specialization image updated successfully" : "Specialization image added successfully");
      reset();
      setPreviewImage(null);
      setExistingImage(null);
      setImageRemoved(false);
      
      setTimeout(() => {
        queryClient.invalidateQueries(["specialization-images"]);
        onSuccess?.();
      }, 200);
    },
    onError: (err) => notifyError(err.response?.data?.message || "Operation failed"),
  });

  const onSubmit = (data, saveWithDate = true) => {
    const formData = new FormData();
    formData.append("name", data.name);

    const imageInput = document.querySelector('input[name="image"]');
    if (imageInput?.files?.[0]) {
      formData.append("image", imageInput.files[0]);
    } else if (!item) {
      notifyError("Image is required");
      return;
    }
    // If editing and no new image selected, the backend will keep the existing image
    // We don't need to send it in the form data - backend handles it

    mutation.mutate({ formData, saveWithDate });
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewImage(URL.createObjectURL(file));
      setImageRemoved(false);
    }
  };

  const handleRemoveImage = () => {
    setPreviewImage(null);
    setExistingImage(null);
    setImageRemoved(true);
    const imageInput = document.querySelector('input[name="image"]');
    if (imageInput) imageInput.value = "";
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen pb-24">
      <div className="relative flex justify-center items-center mb-6">
        <Button variant="ghost" size="sm" onClick={onCancel} className="absolute left-0">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to List
        </Button>
        <h3 className="text-2xl text-blue-700 font-bold">{item ? "Edit Specialization Image" : "Add New Specialization Image"}</h3>
      </div>

      <form className="space-y-6 max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-sm">
        {/* Name */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Name</Label>
          <Input 
            {...register("name", { required: "Name is required" })} 
            placeholder="Enter image name"
            className="focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
        </div>

        {/* Image */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Image</Label>
          {(previewImage || existingImage) && !imageRemoved && (
            <div className="mb-3">
              <img
                src={previewImage || `${process.env.NEXT_PUBLIC_thumbnail_URL}${existingImage}`}
                alt="Preview"
                className="h-32 w-32 object-contain rounded-lg border-2 border-gray-200 shadow-sm p-2 bg-gray-50"
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleRemoveImage}
                className="mt-2"
              >
                Remove Image
              </Button>
            </div>
          )}
          <Input
            type="file"
            accept="image/*"
            {...register("image", { 
              required: !item || imageRemoved ? "Image is required" : false 
            })}
            onChange={handleImageChange}
            className="focus:border-blue-500 focus:ring-2 focus:ring-blue-200 h-8"
          />
          {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image.message}</p>}
        </div>
      </form>

      <FormActionButtons
        isEdit={!!item}
        isSubmitting={isSubmitting}
        isLoading={mutation.isLoading}
        onSave={(saveWithDate) => handleSubmit((data) => onSubmit(data, saveWithDate))()}
        onCancel={onCancel}
        saveButtonText="Save"
      />
    </div>
  );
}

