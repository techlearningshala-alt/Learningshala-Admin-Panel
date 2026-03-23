"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addAuthor, updateAuthor } from "@/lib/api";
import { notifySuccess, notifyError } from "@/lib/notify";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { ArrowLeft } from "lucide-react";
import FormActionButtons from "@/components/common/FormActionButtons";

export default function AddAuthorForm({ author, onCancel, onSuccess }) {
  const [preview, setPreview] = useState(null);
  const [existingImage, setExistingImage] = useState(null);
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm({
    defaultValues: author || {},
  });
  const authorName = watch("author_name");
  const authorSlug = watch("author_slug");

  // Prefill
  useEffect(() => {
    if (author) {
      Object.keys(author).forEach((key) => setValue(key, author[key]));
      if (author.image) {
        setExistingImage(author.image);
        setPreview(`${process.env.NEXT_PUBLIC_thumbnail_URL}${author.image}`);
      }
    } else {
      reset();
      setPreview(null);
      setExistingImage(null);
    }
  }, [author, reset, setValue]);

  // Auto-generate author_slug on create only.
  useEffect(() => {
    if (author) return;
    if (!authorName || authorSlug) return;

    const slug = authorName
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

    setValue("author_slug", slug);
  }, [author, authorName, authorSlug, setValue]);

  // Mutation
  const mutation = useMutation({
    mutationFn: async ({ data, saveWithDate }) => {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key === "image" && value?.[0]) {
          formData.append("image", value[0]);
        } else {
          formData.append(key, value || "");
        }
      });
      formData.append("existingImage", existingImage || "");
      formData.append("saveWithDate", saveWithDate ? "true" : "false");
      return author?.id ? updateAuthor(author.id, formData) : addAuthor(formData);
    },
    onSuccess: (res) => {
      notifySuccess(res.data.message || "Saved successfully");
      reset();
      setPreview(null);
      setExistingImage(null);

      setTimeout(() => {
        queryClient.invalidateQueries(["authors"]);
        onSuccess?.();
      }, 200);
    },
    onError: (err) => notifyError(err.response?.data?.message || "Operation failed"),
  });

  const onSubmit = (data, saveWithDate = true) => mutation.mutate({ data, saveWithDate });

  return (
    <div className="p-6 bg-gray-50 min-h-screen pb-24">
      <div className="relative flex justify-center items-center mb-6">
        <Button variant="ghost" size="sm" onClick={onCancel} className="absolute left-0">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to List
        </Button>
        <h3 className="text-2xl text-blue-700 font-bold">{author ? "Edit Author" : "Add New Author"}</h3>
      </div>

      <form className="space-y-6 max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-sm">
        {/* Author Name */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Author Name</Label>
          <Input 
            {...register("author_name", { required: "Author name is required" })} 
            placeholder="Enter author name"
            className="focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
          {errors.author_name && <p className="text-red-500 text-sm mt-1">{errors.author_name.message}</p>}
        </div>

        {/* Author Slug */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Author Slug</Label>
          <Input
            {...register("author_slug")}
            placeholder="Enter author slug (optional)"
            className="focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
        </div>

        {/* Label */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Label</Label>
          <Input 
            {...register("label")} 
            placeholder="Enter label"
            className="focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
          {errors.label && <p className="text-red-500 text-sm mt-1">{errors.label.message}</p>}
        </div>

        {/* Author Details */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Author Details</Label>
          <Textarea
            {...register("author_details")}
            placeholder="Enter author details"
            rows={5}
            className="resize-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
          {errors.author_details && <p className="text-red-500 text-sm mt-1">{errors.author_details.message}</p>}
        </div>

        {/* Image */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Image</Label>
          {preview && (
            <div className="mb-3">
              <img 
                src={preview} 
                alt="Preview" 
                className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200 shadow-sm" 
              />
            </div>
          )}
          <Input
            type="file"
            accept="image/*"
            {...register("image")}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                // Revoke previous blob URL if it exists
                if (preview && preview.startsWith("blob:")) {
                  URL.revokeObjectURL(preview);
                }
                setPreview(URL.createObjectURL(file));
              }
            }}
            className="focus:border-blue-500 focus:ring-2 focus:ring-blue-200 h-8"
          />
        </div>
      </form>

      <FormActionButtons
        isEdit={!!author}
        isSubmitting={isSubmitting}
        isLoading={mutation.isLoading}
        onSave={(saveWithDate) => handleSubmit((data) => onSubmit(data, saveWithDate))()}
        onCancel={onCancel}
        saveButtonText="Save"
      />
    </div>
  );
}
