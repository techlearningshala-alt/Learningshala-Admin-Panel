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

export default function AddAuthorForm({ author, onCancel, onSuccess }) {
  const [preview, setPreview] = useState(null);
  const [existingImage, setExistingImage] = useState(null);
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm({
    defaultValues: author || {},
  });

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
    <div className="p-4">
      <div className="relative flex justify-center items-center mb-6">
        <Button variant="ghost" size="sm" onClick={onCancel} className="absolute left-0">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to List
        </Button>
        <h3 className="text-xl font-bold">{author ? "Edit Author" : "Add New Author"}</h3>
      </div>

      <form className="space-y-4 max-w-2xl mx-auto">
        {/* Author Name */}
        <div className="space-y-2">
          <Label>Author Name</Label>
          <Input {...register("author_name", { required: "Author name is required" })} placeholder="Enter author name" />
          {errors.author_name && <p className="text-red-500 text-sm">{errors.author_name.message}</p>}
        </div>

        {/* Label */}
        <div className="space-y-2">
          <Label>Label</Label>
          <Input {...register("label")} placeholder="Enter label" />
          {errors.label && <p className="text-red-500 text-sm">{errors.label.message}</p>}
        </div>

        {/* Author Details */}
        <div className="space-y-2">
          <Label>Author Details</Label>
          <Textarea
            {...register("author_details")}
            placeholder="Enter author details"
            rows={5}
            className="resize-none"
          />
          {errors.author_details && <p className="text-red-500 text-sm">{errors.author_details.message}</p>}
        </div>

        {/* Image */}
        <div className="space-y-2">
          <Label>Image</Label>
          {preview && (
            <div className="mb-2">
              <img src={preview} alt="Preview" className="w-32 h-32 object-cover rounded border" />
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
          />
        </div>

        {/* Save Buttons */}
        {author ? (
          <div className="flex gap-2">
            <Button
              type="button"
              className="flex-1"
              onClick={handleSubmit((data) => onSubmit(data, true))}
              disabled={isSubmitting || mutation.isLoading}
            >
              Save with Date
            </Button>
            <Button
              type="button"
              className="flex-1"
              onClick={handleSubmit((data) => onSubmit(data, false))}
              disabled={isSubmitting || mutation.isLoading}
            >
              Save without Date
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button
              type="button"
              className="flex-1"
              onClick={handleSubmit((data) => onSubmit(data, true))}
              disabled={isSubmitting || mutation.isLoading}
            >
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
