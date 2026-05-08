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
import { fetchNewsCategories, addNewsFaq, fetchAuthors } from "@/lib/api";
import NewsFaqInlinePanel from "@/components/news-faq/InlineNewsFaqPanel";
import { notifySuccess, notifyError } from "@/lib/notify";
import FormActionButtons from "@/components/common/FormActionButtons";

const buildAssetUrl = (value) => {
  if (!value) return null;
  if (typeof value === "object" && value !== null) {
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

export default function AddNewsForm({ item, onCancel, onSuccess }) {
  const [previewThumbnail, setPreviewThumbnail] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [stagedFaqs, setStagedFaqs] = useState([]);
  const hydratedNewsIdRef = useRef(null);
  const newsId = item?.id;

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
      short_description: "",
      thumbnail: null,
      content: "",
    },
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["newsCategories"],
    queryFn: () => fetchNewsCategories({ page: 1, limit: 200 }),
    enabled: true,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
  const categories = normalizeApiList(categoriesData?.data?.data || []);

  const { data: authorsData } = useQuery({
    queryKey: ["authors"],
    queryFn: () => fetchAuthors({ page: 1, limit: 1000 }),
  });
  const authors = normalizeApiList(authorsData?.data?.data || []);

  useEffect(() => {
    if (item) {
      const incomingNewsId = item.id ?? null;
      const isSameNews = hydratedNewsIdRef.current === incomingNewsId;

      // Prevent refetches (e.g. FAQ updates) from overriding unsaved form edits.
      if (isDirty && isSameNews) {
        return;
      }

      setValue("category_id", item.category_id);
      setValue("h1_tag", item.h1_tag || "");
      setValue("slug", item.slug || "");
      setValue("meta_title", item.meta_title || "");
      setValue("meta_description", item.meta_description || "");
      setValue("author_id", item.author_id || "");
      setValue("short_description", item.short_description || "");
      setValue("content", item.content || "");

      if (item.thumbnail) {
        const imageUrl = buildAssetUrl(item.thumbnail);
        setPreviewThumbnail(imageUrl);
      }
      hydratedNewsIdRef.current = incomingNewsId;
    } else {
      // In add mode, avoid resetting on every keystroke (effect re-runs when isDirty changes).
      if (hydratedNewsIdRef.current !== null) {
        reset();
        setPreviewThumbnail(null);
        setThumbnailFile(null);
        hydratedNewsIdRef.current = null;
      }
    }
  }, [item, reset, setValue, isDirty]);

  const persistStagedFaqs = async (newNewsId) => {
    if (!stagedFaqs.length || !newNewsId) return;

    for (const faq of stagedFaqs) {
      try {
        await addNewsFaq({
          news_id: newNewsId,
          title: faq.title,
          description: faq.description,
          saveWithDate: faq.saveWithDate ?? true,
        });
      } catch (error) {
        console.error("Failed to persist staged FAQ", error);
        notifyError("Failed to save staged FAQs. Please try again after saving the news item.");
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
    // Blogs UI doesn't show a separate Title input; keep parity by deriving it from H1 Tag.
    formData.append("title", data.h1_tag || "");
    formData.append("short_description", data.short_description || "");
    formData.append("content", data.content || "");

    if (thumbnailFile) {
      formData.append("thumbnail", thumbnailFile);
    } else if (item && !previewThumbnail && item.thumbnail) {
      formData.append("thumbnail", "");
    }

    if (item) {
      formData.append("saveWithDate", saveWithDate ? "true" : "false");
    }

    try {
      const result = await onSuccess(formData, item);

      if (!newsId && stagedFaqs.length && result) {
        const createdNewsId =
          result?.data?.id ??
          result?.data?.data?.id ??
          result?.data?.data?.insertId ??
          result?.data?.insertId ??
          result?.id;

        if (createdNewsId) {
          try {
            await persistStagedFaqs(createdNewsId);
          } catch (error) {
            console.error("Error persisting staged FAQs:", error);
          }
        }
      }
    } catch (error) {
      console.error("Error saving news:", error);
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
          {item ? "Edit News" : "Add New News"}
        </h3>
      </div>

      <form className="space-y-6 max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-sm">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">
            Category <span className="text-red-500">*</span>
          </Label>
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

        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">H1 Tag</Label>
          <Input {...register("h1_tag")} placeholder="Enter H1 tag" />
          {errors.h1_tag && (
            <p className="text-red-500 text-sm mt-1">{errors.h1_tag.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">URL/Slug</Label>
          <Input {...register("slug")} placeholder="Enter URL-friendly slug" />
          {errors.slug && (
            <p className="text-red-500 text-sm mt-1">{errors.slug.message}</p>
          )}
        </div>

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

        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Short Intro</Label>
          <Textarea
            {...register("short_description")}
            placeholder="Enter short description"
            rows={4}
            className="w-full focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Long Content</Label>
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

        <div className="border-t pt-4 mt-6">
          <NewsFaqInlinePanel
            newsId={newsId}
            newsName={watch("h1_tag")}
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
