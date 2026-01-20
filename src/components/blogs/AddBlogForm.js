"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import SafeCKEditor from "@/components/CKEditor";
import { fetchBlogCategories, addBlogFaq } from "@/lib/api";
import BlogFaqInlinePanel from "@/components/blog-faq/InlineFaqPanel";
import { notifySuccess, notifyError } from "@/lib/notify";

const buildAssetUrl = (value) => {
  if (!value) return null;
  if (typeof value === 'object' && value !== null) {
    value = value.image || value.path || value.url || null;
  }
  if (!value || typeof value !== "string") return null;
  if (value.startsWith("http")) return value;
  const cleanPath = value.startsWith("/") ? value.slice(1) : value;
  const baseUrl = process.env.NEXT_PUBLIC_thumbnail_URL || "";
  const normalizedBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  return `${normalizedBaseUrl}/${cleanPath}`;
};

const normalizeApiList = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  return [];
};

export default function AddBlogForm({ item, onCancel, onSuccess }) {
  const [previewAuthorImage, setPreviewAuthorImage] = useState(null);
  const [authorImageFile, setAuthorImageFile] = useState(null);
  const [previewThumbnail, setPreviewThumbnail] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [stagedFaqs, setStagedFaqs] = useState([]);
  const blogId = item?.id;

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: item || {
      category_id: "",
      title: "",
      short_description: "",
      author_name: "",
      author_details: "",
      author_image: null,
      thumbnail: null,
      content: "",
    },
  });

  // Fetch blog categories for dropdown
  const { data: categoriesData } = useQuery({
    queryKey: ["blogCategories"],
    queryFn: () => fetchBlogCategories({ page: 1, limit: 1000 }),
  });
  const categories = normalizeApiList(categoriesData?.data?.data || []);

  // Reset form when item changes
  useEffect(() => {
    if (item) {
      setValue("category_id", item.category_id);
      setValue("title", item.title || "");
      setValue("short_description", item.short_description || "");
      setValue("author_name", item.author_name || "");
      setValue("author_details", item.author_details || "");
      setValue("content", item.content || "");
      
      // Set author image preview if exists
      if (item.author_image) {
        const imageUrl = buildAssetUrl(item.author_image);
        setPreviewAuthorImage(imageUrl);
      }
      
      // Set thumbnail preview if exists
      if (item.thumbnail) {
        const imageUrl = buildAssetUrl(item.thumbnail);
        setPreviewThumbnail(imageUrl);
      }
    } else {
      reset();
      setPreviewAuthorImage(null);
      setAuthorImageFile(null);
      setPreviewThumbnail(null);
      setThumbnailFile(null);
    }
  }, [item, reset, setValue]);

  const persistStagedFaqs = async (newBlogId) => {
    if (!stagedFaqs.length || !newBlogId) return;

    for (const faq of stagedFaqs) {
      try {
        await addBlogFaq({
          blog_id: newBlogId,
          category_id: faq.category_id,
          title: faq.title,
          description: faq.description,
          saveWithDate: faq.saveWithDate ?? true,
        });
      } catch (error) {
        console.error("Failed to persist staged FAQ", error);
        notifyError("Failed to save staged FAQs. Please try again after saving the blog.");
        throw error;
      }
    }

    setStagedFaqs([]);
    notifySuccess("Staged FAQs saved successfully.");
  };

  const onSubmit = async (data, saveWithDate = true) => {
    const formData = new FormData();
    
    formData.append("category_id", data.category_id);
    formData.append("title", data.title);
    formData.append("short_description", data.short_description || "");
    formData.append("author_name", data.author_name || "");
    formData.append("author_details", data.author_details || "");
    formData.append("content", data.content || "");

    // Add author image file if new file is selected
    if (authorImageFile) {
      formData.append("author_image", authorImageFile);
    } else if (item && !previewAuthorImage && item.author_image) {
      // If image was removed in edit mode, send empty string
      formData.append("author_image", "");
    }

    // Add thumbnail file if new file is selected
    if (thumbnailFile) {
      formData.append("thumbnail", thumbnailFile);
    } else if (item && !previewThumbnail && item.thumbnail) {
      // If thumbnail was removed in edit mode, send empty string
      formData.append("thumbnail", "");
    }

    // Add saveWithDate flag for edit mode
    if (item) {
      formData.append("saveWithDate", saveWithDate ? "true" : "false");
    }

    // Call onSuccess and handle staged FAQs if blog was created
    try {
      const result = await onSuccess(formData, item);
      
      // If blog was created (not edited) and there are staged FAQs, save them
      if (!blogId && stagedFaqs.length && result) {
        const createdBlogId =
          result?.data?.id ??
          result?.data?.data?.id ??
          result?.data?.data?.insertId ??
          result?.data?.insertId ??
          result?.id;

        if (createdBlogId) {
          try {
            await persistStagedFaqs(createdBlogId);
          } catch (error) {
            console.error("Error persisting staged FAQs:", error);
          }
        }
      }
    } catch (error) {
      console.error("Error saving blog:", error);
    }
  };

  const handleAuthorImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAuthorImageFile(file);
      setPreviewAuthorImage(URL.createObjectURL(file));
    }
  };

  const handleRemoveAuthorImage = () => {
    setAuthorImageFile(null);
    setPreviewAuthorImage(null);
    setValue("author_image", null);
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      setPreviewThumbnail(URL.createObjectURL(file));
    }
  };

  const handleRemoveThumbnail = () => {
    setThumbnailFile(null);
    setPreviewThumbnail(null);
    setValue("thumbnail", null);
  };

  return (
    <div className="p-4">
      <div className="relative flex justify-center items-center mb-6">
        <Button variant="ghost" size="sm" onClick={onCancel} className="absolute left-0">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to List
        </Button>
        <h3 className="text-xl font-bold">
          {item ? "Edit Blog" : "Add New Blog"}
        </h3>
      </div>

      <form className="space-y-6 max-w-4xl mx-auto">
        {/* Category */}
        <div className="space-y-2">
          <Label>Category <span className="text-red-500">*</span></Label>
          <Controller
            name="category_id"
            control={control}
            rules={{ required: "Category is required" }}
            render={({ field }) => (
              <select
                {...field}
                className="w-full border rounded px-3 py-2"
                value={field.value || ""}
                onChange={(e) => field.onChange(Number(e.target.value))}
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.title}
                  </option>
                ))}
              </select>
            )}
          />
          {errors.category_id && (
            <p className="text-red-500 text-sm">{errors.category_id.message}</p>
          )}
        </div>

        {/* Title */}
        <div className="space-y-2">
          <Label>Title <span className="text-red-500">*</span></Label>
          <Input
            {...register("title", { required: "Title is required" })}
            placeholder="Enter blog title"
          />
          {errors.title && (
            <p className="text-red-500 text-sm">{errors.title.message}</p>
          )}
        </div>

        {/* Short Description */}
        <div className="space-y-2">
          <Label>Short Description</Label>
          <Textarea
            {...register("short_description")}
            placeholder="Enter short description"
            rows={4}
            className="w-full"
          />
        </div>

        {/* Author Name */}
        <div className="space-y-2">
          <Label>Author Name</Label>
          <Input
            {...register("author_name")}
            placeholder="Enter author name"
          />
        </div>

        {/* Author Details */}
        <div className="space-y-2">
          <Label>Author Details</Label>
          <Textarea
            {...register("author_details")}
            placeholder="Enter author details/bio"
            rows={4}
            className="w-full"
          />
        </div>

        {/* Author Image */}
        <div className="space-y-2">
          <Label>Author Image</Label>
          {previewAuthorImage && (
            <div className="mb-2 relative inline-block">
              <img
                src={previewAuthorImage}
                alt="Author preview"
                className="h-24 w-24 object-cover rounded border"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleRemoveAuthorImage}
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
              >
                ×
              </Button>
            </div>
          )}
          <Input
            type="file"
            accept="image/*"
            onChange={handleAuthorImageChange}
          />
        </div>

        {/* Thumbnail */}
        <div className="space-y-2">
          <Label>Thumbnail</Label>
          {previewThumbnail && (
            <div className="mb-2 relative inline-block">
              <img
                src={previewThumbnail}
                alt="Thumbnail preview"
                className="h-24 w-24 object-cover rounded border"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleRemoveThumbnail}
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
              >
                ×
              </Button>
            </div>
          )}
          <Input
            type="file"
            accept="image/*"
            onChange={handleThumbnailChange}
          />
        </div>

        {/* Content */}
        <div className="space-y-2">
          <Label>Content</Label>
          <Controller
            name="content"
            control={control}
            render={({ field }) => (
              <div>
                <SafeCKEditor
                  value={field.value || ""}
                  onChange={(value) => field.onChange(value)}
                />
              </div>
            )}
          />
        </div>

        {/* FAQ Section */}
        <div className="border-t pt-4 mt-6">
          <BlogFaqInlinePanel
            blogId={blogId}
            blogName={watch("title")}
            stagedFaqs={stagedFaqs}
            setStagedFaqs={setStagedFaqs}
          />
        </div>

        {/* Buttons */}
        {item ? (
          <div className="flex gap-2">
            <Button
              type="button"
              className="flex-1"
              disabled={isSubmitting}
              onClick={handleSubmit((data) => onSubmit(data, true))}
            >
              Save with Date
            </Button>
            <Button
              type="button"
              className="flex-1"
              disabled={isSubmitting}
              onClick={handleSubmit((data) => onSubmit(data, false))}
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
              disabled={isSubmitting}
              onClick={handleSubmit(onSubmit)}
            >
              {isSubmitting ? "Saving..." : "Save"}
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
