"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addCourseImage, updateCourseImage } from "@/lib/menuApi";
import { notifySuccess, notifyError } from "@/lib/notify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { useScrollToTop } from "@/hooks/useScrollToTop";

export default function AddCourseImageForm({ item, onCancel, onSuccess }) {
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
    mutationFn: async (formData) => {
      return item?.id ? updateCourseImage(item.id, formData) : addCourseImage(formData);
    },
    onSuccess: () => {
      notifySuccess(item ? "Course image updated successfully" : "Course image added successfully");
      reset();
      setPreviewImage(null);
      setExistingImage(null);
      setImageRemoved(false);
      
      setTimeout(() => {
        queryClient.invalidateQueries(["course-images"]);
        onSuccess?.();
      }, 200);
    },
    onError: (err) => notifyError(err.response?.data?.message || "Operation failed"),
  });

  const onSubmit = (data) => {
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

    mutation.mutate(formData);
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
    <div className="p-4">
      <div className="relative flex justify-center items-center mb-6">
        <Button variant="ghost" size="sm" onClick={onCancel} className="absolute left-0">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to List
        </Button>
        <h3 className="text-2xl font-bold">{item ? "Edit Course Image" : "Add New Course Image"}</h3>
      </div>

      <form className="space-y-4 max-w-2xl mx-auto" onSubmit={handleSubmit(onSubmit)}>
        {/* Name */}
        <div className="space-y-2">
          <Label>Name</Label>
          <Input {...register("name", { required: "Name is required" })} placeholder="Enter image name" />
          {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
        </div>

        {/* Image */}
        <div className="space-y-2">
          <Label>Image</Label>
          {(previewImage || existingImage) && !imageRemoved && (
            <div className="mb-2">
              <img
                src={previewImage || `${process.env.NEXT_PUBLIC_thumbnail_URL}${existingImage}`}
                alt="Preview"
                className="h-32 w-32 object-contain rounded border"
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
          />
          {errors.image && <p className="text-red-500 text-sm">{errors.image.message}</p>}
        </div>

        {/* Save Buttons */}
        <div className="flex gap-2">
          <Button type="submit" className="flex-1" disabled={isSubmitting || mutation.isLoading}>
            {mutation.isLoading ? "Saving..." : item ? "Update" : "Save"}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

