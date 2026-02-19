"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addWebsiteBanner, updateWebsiteBanner } from "@/lib/api";
import { notifySuccess, notifyError } from "@/lib/notify";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { ArrowLeft, Plus, Save, X } from "lucide-react";

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

export default function AddWebsiteBannerForm({ banners, onCancel, onSuccess }) {
  const [previewBanners, setPreviewBanners] = useState([]);
  const queryClient = useQueryClient();

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      banners: banners || [
        {
          banner_image: null,
          video_id: "",
          video_title: "",
          url: "",
          banner_type: "",
          existing_banner_image: "",
          remove_image: false,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "banners",
  });

  // Keep track of how many banners were initially loaded (existing ones)
  const [initialCount] = useState(fields.length);

  // Reset form when banners change
  useEffect(() => {
    if (banners && banners.length > 0) {
      const formattedBanners = banners.map((banner) => ({
        banner_image: null,
        video_id: banner.video_id || "",
        video_title: banner.video_title || "",
        url: banner.url || "",
        banner_type: banner.banner_type || "",
        existing_banner_image: banner.banner_image || "",
        remove_image: false,
      }));
      reset({ banners: formattedBanners });

      // Set preview images
      const previews = banners.map((banner) =>
        banner.banner_image ? buildAssetUrl(banner.banner_image) : null
      );
      setPreviewBanners(previews);
    } else {
      reset({
        banners: [
          {
            banner_image: null,
            video_id: "",
            video_title: "",
            url: "",
            banner_type: "",
            existing_banner_image: "",
            remove_image: false,
          },
        ],
      });
      setPreviewBanners([null]);
    }
  }, [banners, reset]);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      previewBanners.forEach((preview) => {
        if (preview && preview.startsWith("blob:")) {
          URL.revokeObjectURL(preview);
        }
      });
    };
  }, [previewBanners]);

  const mutation = useMutation({
    mutationFn: async ({ data, saveWithDate }) => {
      // Save each banner individually
      const results = [];
      for (let index = 0; index < data.banners.length; index++) {
        const banner = data.banners[index];
        const formData = new FormData();

        // Handle banner image
        if (banner.remove_image) {
          formData.append("banner_image", "");
        } else if (banner.banner_image instanceof FileList && banner.banner_image[0]) {
          formData.append("banner_image", banner.banner_image[0]);
        } else if (banner.existing_banner_image && banner.existing_banner_image.trim() !== "") {
          formData.append("existingImage", banner.existing_banner_image);
        }

        formData.append("video_id", banner.video_id || "");
        formData.append("video_title", banner.video_title || "");
        formData.append("url", banner.url || "");
        if (!banner.banner_type) {
          throw new Error("Please select a banner type for all banners");
        }
        formData.append("banner_type", banner.banner_type);
        formData.append("saveWithDate", saveWithDate ? "true" : "false");

        // Check if this is an existing banner (has ID)
        const existingBanner = banners && banners[index];
        if (existingBanner && existingBanner.id) {
          // Update existing banner
          const result = await updateWebsiteBanner(existingBanner.id, formData);
          results.push(result);
        } else {
          // Create new banner
          const result = await addWebsiteBanner(formData);
          results.push(result);
        }
      }
      return results;
    },
    onSuccess: (res) => {
      notifySuccess(res.data?.message || "Saved successfully");
      reset();
      setPreviewBanners([]);
      setTimeout(() => {
        queryClient.invalidateQueries(["website-banners"]);
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
        <h3 className="text-2xl text-blue-700 font-bold">Add New Banner</h3>
      </div>

      <form className="space-y-6 max-w-6xl mx-auto" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-4">
          {fields.map((banner, index) => {
            const bannerField = `banners.${index}`;
            return (
              <div
                key={banner.id}
                className="relative p-4 border rounded-lg bg-gray-50 shadow-sm"
              >
                <div className="grid grid-cols-2 gap-4">
                  {/* Banner Image */}
                  <div className="space-y-2">
                    <Label>Banner Image</Label>
                    <input type="hidden" {...register(`${bannerField}.existing_banner_image`)} />
                    <input type="hidden" {...register(`${bannerField}.remove_image`)} />
                    {previewBanners[index] && (
                      <div className="inline-block mb-2">
                        <img
                          src={previewBanners[index]}
                          alt="Banner Preview"
                          className="h-20 object-contain rounded border"
                        />
                      </div>
                    )}
                    <Input
                      type="file"
                      className="focus:border-blue-500 focus:ring-2 focus:ring-blue-200 h-8 "
                      accept="image/*"
                      {...register(`${bannerField}.banner_image`)}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setPreviewBanners((prev) => {
                            const copy = [...prev];
                            copy[index] = URL.createObjectURL(file);
                            return copy;
                          });
                          setValue(`${bannerField}.remove_image`, false, { shouldDirty: true });
                          setValue(`${bannerField}.existing_banner_image`, banner?.existing_banner_image || "", { shouldDirty: true });
                        }
                      }}
                    />
                    {/* Banner Type */}
                    <div className="space-y-2">
                      <Label>Banner Type</Label>
                      <Controller
                        name={`${bannerField}.banner_type`}
                        control={control}
                        render={({ field }) => (
                          <select
                            {...field}
                            className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <option value="">Select Banner Type</option>
                            <option value="website">Website</option>
                            <option value="mobile">Mobile</option>
                          </select>
                        )}
                      />
                    </div>
                  </div>
                  {/* Video ID */}
                  <div className="space-y-2">
                    <Label>Video ID</Label>
                    <Input {...register(`${bannerField}.video_id`)} placeholder="Enter video ID" />
                    {/* Video Title */}
                    <div className="space-y-2">
                      <Label>Video Title</Label>
                      <Input {...register(`${bannerField}.video_title`)} placeholder="Enter video title" />
                    </div>
                    {/* URL */}
                    <div className="space-y-2 col-span-2">
                      <Label>URL</Label>
                      <Input {...register(`${bannerField}.url`)} placeholder="Enter URL" />
                    </div>
                  </div>


                </div>


                {/* Show Remove button ONLY for newly added banners */}
                {index >= initialCount && (
                  <div className="flex mt-3">
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        remove(index);
                        setPreviewBanners((prev) => {
                          const copy = [...prev];
                          copy.splice(index, 1);
                          return copy;
                        });
                      }}
                    >
                      <X className="h-4 w-4 mr-1" /> Remove
                    </Button>
                  </div>
                )}
              </div>
            );
          })}

          {/* Add More button (max 5 banners) */}
          <div className="flex justify-start items-center gap-3">
            {fields.length < 5 && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  append({
                    banner_image: null,
                    video_id: "",
                    video_title: "",
                    url: "",
                    banner_type: "",
                    existing_banner_image: "",
                    remove_image: false,
                  });
                  setPreviewBanners((prev) => [...prev, null]);
                }}
              >
                <Plus className="h-4 w-4 mr-1" /> Add More Banner
              </Button>
            )}
            {fields.length >= 5 && (
              <span className="text-xs text-muted-foreground">
                Maximum 5 banners allowed. Remove one to add another.
              </span>
            )}
          </div>
        </div>

        {/* Save Buttons */}
        {banners && banners.length > 0 ? (
          <div className="flex gap-2">
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-400 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
              onClick={handleSubmit((data) => onSubmit(data, true))}
              disabled={isSubmitting || mutation.isLoading}
            >
              <Save className="h-4 w-4 mr-1" /> Save with Date
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-400 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
              onClick={handleSubmit((data) => onSubmit(data, false))}
              disabled={isSubmitting || mutation.isLoading}
            >
              <Save className="h-4 w-4 mr-1" /> Save without Date
            </Button>
            <Button type="button" variant="outline" className="bg-gradient-to-r from-blue-400 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white" onClick={onCancel}>
             Cancel
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-400 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
              onClick={handleSubmit((data) => onSubmit(data, true))}
              disabled={isSubmitting || mutation.isLoading}
            >
              <Save className="h-4 w-4 mr-1" /> {mutation.isLoading ? "Saving..." : "Save"}
            </Button>
            <Button type="button" variant="outline" className="bg-gradient-to-r from-blue-400 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white" onClick={onCancel}>
              <X className="h-4 w-4 mr-1" /> Cancel
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
