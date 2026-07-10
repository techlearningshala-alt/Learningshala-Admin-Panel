"use client";

import { useEffect, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import SafeCKEditor from "@/components/CKEditor";
import { fetchBlogCategories, addBlogFaq, fetchAuthors } from "@/lib/api";
import AuthorSelect from "@/components/common/AuthorSelect";
import BlogFaqInlinePanel from "@/components/blog-faq/InlineFaqPanel";
import { notifySuccess, notifyError } from "@/lib/notify";
import FormActionButtons from "@/components/common/FormActionButtons";

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
  const [previewThumbnail, setPreviewThumbnail] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [stagedFaqs, setStagedFaqs] = useState([]);
  const hydratedBlogIdRef = useRef(null);
  const blogId = item?.id;
  const [hasToken] = useState(() => {
    try {
      if (typeof window === "undefined") return false;
      const envToken = process.env.NEXT_PUBLIC_JWT_TOKEN;
      return Boolean(
        localStorage.getItem("token") ||
          sessionStorage.getItem("token") ||
          envToken
      );
    } catch {
      return false;
    }
  });

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
    defaultValues: item || {
      category_id: "",
      h1_tag: "",
      slug: "",
      meta_title: "",
      meta_description: "",
      author_id: "",
      verifier_name: "",
      short_description: "",
      thumbnail: null,
      content: "",
      content_1: "",
      content_2: "",
    },
  });

  // Fetch blog categories for dropdown
  const { data: categoriesData } = useQuery({
    queryKey: ["blogCategories"],
    queryFn: () => fetchBlogCategories({ page: 1, limit: 20 }),
    enabled: true,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
  const categories = normalizeApiList(categoriesData?.data?.data || []);

  // Fetch authors for dropdown
  const { data: authorsData } = useQuery({
    queryKey: ["authors"],
    queryFn: () => fetchAuthors({ page: 1, limit: 1000 }),
  });
  const authors = normalizeApiList(authorsData?.data?.data || []);

  // Reset form when item changes
  useEffect(() => {
    if (item) {
      const incomingBlogId = item.id ?? null;
      const isSameBlog = hydratedBlogIdRef.current === incomingBlogId;

      // Prevent server refetches (e.g. while editing FAQs) from overriding unsaved form edits.
      if (isDirty && isSameBlog) {
        return;
      }

      setValue("category_id", item.category_id);
      setValue("h1_tag", item.h1_tag || "");
      setValue("slug", item.slug || "");
      setValue("meta_title", item.meta_title || "");
      setValue("meta_description", item.meta_description || "");
      setValue("author_id", item.author_id || "");
      setValue("verifier_name", item.verifier_name || "");
      setValue("title", item.title || "");
      setValue("short_description", item.short_description || "");
      setValue("content", item.content || "");
      setValue("content_1", item.content_1 || "");
      setValue("content_2", item.content_2 || "");
      
      // Set thumbnail preview if exists
      if (item.thumbnail) {
        const imageUrl = buildAssetUrl(item.thumbnail);
        setPreviewThumbnail(imageUrl);
      }
      hydratedBlogIdRef.current = incomingBlogId;
    } else {
      // In add mode, avoid resetting on every keystroke (effect re-runs when isDirty changes).
      if (hydratedBlogIdRef.current !== null) {
        reset();
        setPreviewThumbnail(null);
        setThumbnailFile(null);
        hydratedBlogIdRef.current = null;
      }
    }
  }, [item, reset, setValue, isDirty]);

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
    formData.append("h1_tag", data.h1_tag || "");
    formData.append("slug", data.slug || "");
    formData.append("meta_title", data.meta_title || "");
    formData.append("meta_description", data.meta_description || "");
    formData.append("author_id", data.author_id || "");
    formData.append("verifier_name", data.verifier_name || "");
    formData.append("title", data.title);
    formData.append("short_description", data.short_description || "");
    formData.append("content", data.content || "");
    formData.append("content_1", data.content_1 || "");
    formData.append("content_2", data.content_2 || "");

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
    <div className="p-6 bg-gray-50 min-h-screen pb-24">
      <div className="relative flex justify-center items-center mb-6">
        <Button variant="ghost" size="sm" onClick={onCancel} className="absolute left-0">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to List
        </Button>
        <h3 className="text-2xl text-blue-700 font-bold">
          {item ? "Edit Blog" : "Add New Blog"}
        </h3>
      </div>

      <form className="space-y-6 max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-sm">
        {/* Category */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Category <span className="text-red-500">*</span></Label>
          <Controller
            name="category_id"
            control={control}
            rules={{ required: "Category is required" }}
            render={({ field }) => (
              <select
                {...field}
                className="w-full border rounded px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
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
            <p className="text-red-500 text-sm mt-1">{errors.category_id.message}</p>
          )}
        </div>

        {/* H1 Tag */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">H1 Tag</Label>
          <Input
            {...register("h1_tag")}
            placeholder="Enter H1 tag"
          />
          {errors.h1_tag && (
            <p className="text-red-500 text-sm mt-1">{errors.h1_tag.message}</p>
          )}
        </div>

        {/* Slug */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">URL/Slug</Label>
          <Input
            {...register("slug")}
            placeholder="Enter URL-friendly slug"
          />
          {errors.slug && (
            <p className="text-red-500 text-sm mt-1">{errors.slug.message}</p>
          )}
        </div>

        {/* Banner/Thumbnail */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Banner/Thumbnail</Label>
          {previewThumbnail && (
            <div className="mb-3 relative inline-block">
              <img
                src={previewThumbnail}
                alt="Thumbnail preview"
                className="h-32 w-32 object-cover rounded-lg border-2 border-gray-200 shadow-sm"
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
            className="focus:border-blue-500 focus:ring-2 focus:ring-blue-200 h-8"
          />
        </div>

        {/* Meta Title */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Meta Title</Label>
          <Input
            {...register("meta_title")}
            placeholder="Enter meta title"
            className="focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
          {errors.meta_title && (
            <p className="text-red-500 text-sm mt-1">{errors.meta_title.message}</p>
          )}
        </div>

        {/* Meta Description */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Meta Description</Label>
          <Textarea
            {...register("meta_description")}
            placeholder="Enter meta description"
            rows={4}
            className="w-full focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
          {errors.meta_description && (
            <p className="text-red-500 text-sm mt-1">{errors.meta_description.message}</p>
          )}
        </div>

        {/* Author Name (Dropdown) */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Author Name</Label>
          <Controller
            name="author_id"
            control={control}
            render={({ field }) => (
              <select
                {...field}
                className="w-full border rounded px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                value={field.value || ""}
                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : "")}
              >
                <option value="">Select Author</option>
                {authors.map((author) => (
                  <option key={author.id} value={author.id}>
                    {author.author_name}
                  </option>
                ))}
              </select>
            )}
          />
          {errors.author_id && (
            <p className="text-red-500 text-sm mt-1">{errors.author_id.message}</p>
          )}
        </div>

        <AuthorSelect
          label="Verifier Name"
          name="verifier_name"
          register={register}
          tag="verifier"
          placeholder="Select Verifier"
          loadingText="Loading verifiers..."
          error={errors.verifier_name}
          className="w-full border rounded px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
        />

        {/* Short Intro */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Short Intro</Label>
          <Textarea
            {...register("short_description")}
            placeholder="Enter short description"
            rows={4}
            className="w-full focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
        </div>

        {/* Long Content 1 */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Long Content 1</Label>
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

        {/* Long Content 2 */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Long Content 2</Label>
          <Controller
            name="content_1"
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

        {/* Long Content 3 */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Long Content 3</Label>
          <Controller
            name="content_2"
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

      </form>

      <FormActionButtons
        isEdit={!!item}
        isSubmitting={isSubmitting}
        onSave={(saveWithDate) => handleSubmit((data) => onSubmit(data, saveWithDate))()}
        onCancel={onCancel}
        saveButtonText="Save"
      />
    </div>
  );
}
