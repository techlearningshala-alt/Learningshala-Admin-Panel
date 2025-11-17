"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createUniversityCourse,
  updateUniversityCourseApi,
  fetchAllUniversities,
  fetchUniversityCourseById,
  fetchFeeTypes,
  addUniversityCourseFaq,
} from "@/lib/universityApi";
import { notifySuccess, notifyError } from "@/lib/notify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Trash, Plus } from "lucide-react";
import UniversityFaqInlinePanel from "@/components/university-faq/InlineFaqPanel";

const sanitizeFeeKey = (key) =>
  key
    ? String(key)
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "")
    : "";

const defaultValues = {
  university_id: "",
  name: "",
  slug: "",
  duration: "",
  label: "",
  author_name: "",
  is_active: true,
  course_banner: null,
  brochure_file: null,
  course_thumbnail: null,
  syllabus_file: null,
  video_id: "",
  video_title: "",
  fee_type_values: {},
};

const normalizeApiList = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  return [];
};

const buildAssetUrl = (value) => {
  if (!value) return null;
  if (typeof value === "string" && value.startsWith("http")) return value;
  return `${process.env.NEXT_PUBLIC_thumbnail_URL}${value}`;
};

const getFileName = (path) => {
  if (!path) return "";
  const segments = path.split("/");
  return segments[segments.length - 1];
};

const FILE_FIELDS = ["course_thumbnail", "syllabus_file", "brochure_file"];

const createNewBanner = () => ({
  banner_key: `banner_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  banner_image: null,
  video_id: "",
  video_title: "",
  previewBanner: null,
  existingBanner: null,
  bannerRemoved: false,
});

export default function AddUniversityCourseForm({ course, onCancel, onSuccess }) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    getValues,
    watch,
    formState: { isSubmitting, errors },
  } = useForm({
    defaultValues,
  });

  const courseId = course?.id;
  const isEdit = Boolean(courseId);

  const [previewCourseThumbnail, setPreviewCourseThumbnail] = useState(null);
  const [thumbnailRemoved, setThumbnailRemoved] = useState(false);
  const [syllabusRemoved, setSyllabusRemoved] = useState(false);
  const [existingSyllabus, setExistingSyllabus] = useState(null);
  const [syllabusFileName, setSyllabusFileName] = useState("");
  const [brochureRemoved, setBrochureRemoved] = useState(false);
  const [existingBrochure, setExistingBrochure] = useState(null);
  const [brochureFileName, setBrochureFileName] = useState("");
  const [feeKeyLookup, setFeeKeyLookup] = useState({});
  const [feeLabelLookup, setFeeLabelLookup] = useState({});
  const [banners, setBanners] = useState([]);
  const [saveWithoutDate, setSaveWithoutDate] = useState(false);
  const [stagedFaqs, setStagedFaqs] = useState([]);

  const {
    data: universitiesResponse,
    isLoading: isLoadingUniversities,
  } = useQuery({
    queryKey: ["universities", "all"],
    queryFn: fetchAllUniversities,
  });

  const universities = useMemo(
    () => normalizeApiList(universitiesResponse?.data ?? universitiesResponse),
    [universitiesResponse]
  );

  const {
    data: feeTypesResponse,
    isLoading: isLoadingFeeTypes,
  } = useQuery({
    queryKey: ["fee-types", "all"],
    queryFn: () =>
      fetchFeeTypes({
        page: 1,
        limit: 100,
      }),
  });

  const feeTypes = useMemo(
    () => normalizeApiList(feeTypesResponse?.data ?? feeTypesResponse),
    [feeTypesResponse]
  );

  const feeTypeMeta = useMemo(() => {
    if (!feeTypes?.length) return [];
    return feeTypes.map((fee) => {
      const originalKey = fee?.fee_key || fee?.title || "";
      return {
        ...fee,
        originalKey,
        sanitizedKey: sanitizeFeeKey(originalKey),
      };
    });
  }, [feeTypes]);

  const feeFieldEntries = useMemo(() => {
    const seen = new Set();
    const entries = [];
    feeTypeMeta.forEach((meta) => {
      if (!meta.sanitizedKey || seen.has(meta.sanitizedKey)) return;
      entries.push({
        sanitizedKey: meta.sanitizedKey,
        label: meta.title,
        originalKey: meta.originalKey,
      });
      seen.add(meta.sanitizedKey);
    });

    Object.entries(feeKeyLookup).forEach(([sanitizedKey, feeKey]) => {
      if (!sanitizedKey || seen.has(sanitizedKey)) return;
      entries.push({
        sanitizedKey,
        label: feeLabelLookup[sanitizedKey] || feeKey,
        originalKey: feeKey,
      });
      seen.add(sanitizedKey);
    });

    return entries;
  }, [feeTypeMeta, feeKeyLookup, feeLabelLookup]);

  const feeTypeDefaults = useMemo(() => {
    const defaults = {};
    feeTypeMeta.forEach((meta) => {
      if (meta.sanitizedKey) {
        defaults[meta.sanitizedKey] = "";
      }
    });
    return defaults;
  }, [feeTypeMeta]);

  const applyCourseData = useCallback(
    (source) => {
      if (!source) {
        return;
      }

      const merged = {
        ...defaultValues,
        ...source,
      };

      const keyMap = {};
      const labelMap = {};
      feeTypeMeta.forEach((meta) => {
        if (meta.sanitizedKey) {
          keyMap[meta.sanitizedKey] = meta.fee_key || meta.originalKey;
          labelMap[meta.sanitizedKey] = meta.title || meta.originalKey;
        }
      });

      const feeMap = {
        ...feeTypeDefaults,
      };

      Object.entries(merged.fee_type_values || {}).forEach(([feeKey, rawValue]) => {
        const amount = typeof rawValue === "number" ? rawValue : Number(rawValue) || "";
        const sanitizedKey = sanitizeFeeKey(feeKey);
        if (!sanitizedKey) return;

        feeMap[sanitizedKey] = amount;
        keyMap[sanitizedKey] = feeKey;
        
        const matchingMeta = feeTypeMeta.find(
          (meta) => sanitizeFeeKey(meta.fee_key) === sanitizedKey || sanitizeFeeKey(meta.originalKey) === sanitizedKey
        );
        labelMap[sanitizedKey] = matchingMeta?.title || feeKey;
      });

      reset({
        university_id: merged.university_id ? String(merged.university_id) : "",
        name: merged.name || "",
        slug: merged.slug || "",
        duration: merged.duration ?? "",
        label: merged.label ?? "",
        author_name: merged.author_name ?? "",
        is_active: merged.is_active !== undefined ? Boolean(merged.is_active) : true,
        course_thumbnail: null,
        syllabus_file: null,
        fee_type_values: feeMap,
      });

      setFeeKeyLookup(keyMap);
      setFeeLabelLookup(labelMap);

      const bannersArray = merged.banners || [];
      
      const loadedBanners = (Array.isArray(bannersArray) ? bannersArray : []).map((banner, idx) => {
        const bannerImage = banner.banner_image || null;
        return {
          banner_key: banner.banner_key || `banner_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          banner_image: bannerImage, // Keep original banner_image field
          video_id: banner.video_id || "",
          video_title: banner.video_title || "",
          previewBanner: bannerImage ? buildAssetUrl(bannerImage) : null, // Only set preview if there's an existing image
          existingBanner: bannerImage, // Set existingBanner from banner_image
          bannerRemoved: false,
        };
      });

      if (loadedBanners.length === 0) {
        loadedBanners.push(createNewBanner());
      }

      setBanners(loadedBanners);

      setPreviewCourseThumbnail(buildAssetUrl(merged.course_thumbnail));
      setThumbnailRemoved(false);

      setExistingSyllabus(merged.syllabus_file || null);
      setSyllabusFileName("");
      setSyllabusRemoved(false);

      setExistingBrochure(merged.brochure_file || null);
      setBrochureFileName("");
      setBrochureRemoved(false);
    },
    [reset, feeTypeDefaults, feeTypeMeta]
  );

  useEffect(() => {
    if (course && course.id) {
      if (course.banners && Array.isArray(course.banners) && course.banners.length > 0) {
        applyCourseData(course);
      }
    }
    if (courseId) {
      setStagedFaqs([]);
    }
  }, [course, applyCourseData, courseId]);

  useEffect(() => {
    // Reset saveWithoutDate checkbox when switching between add/edit modes
    setSaveWithoutDate(false);
  }, [isEdit]);

  useEffect(() => {
    if (!course && !courseId) {
      if (Object.keys(feeTypeDefaults).length) {
        const current = getValues("fee_type_values") || {};
        const mergedFees = { ...feeTypeDefaults, ...current };
        Object.entries(mergedFees).forEach(([key, value]) => {
          setValue(`fee_type_values.${key}`, value ?? "");
        });
      }
      const keyMap = {};
      const labelMap = {};
      feeTypeMeta.forEach((meta) => {
        if (meta.sanitizedKey) {
          keyMap[meta.sanitizedKey] = meta.fee_key || meta.originalKey;
          labelMap[meta.sanitizedKey] = meta.title || meta.originalKey;
        }
      });
      setFeeKeyLookup(keyMap);
      setFeeLabelLookup(labelMap);
      if (banners.length === 0) {
        setBanners([createNewBanner()]);
      }
      setPreviewCourseThumbnail(null);
      setThumbnailRemoved(false);
      setExistingSyllabus(null);
      setSyllabusFileName("");
      setSyllabusRemoved(false);
      setExistingBrochure(null);
      setBrochureFileName("");
      setBrochureRemoved(false);
    }
  }, [course, courseId, feeTypeDefaults, feeTypeMeta, getValues, setValue, banners.length]);

  const { data: fetchedCourse, isLoading: isLoadingCourse, error: fetchError } = useQuery({
    queryKey: ["university-course", courseId],
    queryFn: () => {
      const slug = course?.slug || course?.id?.toString() || courseId?.toString();
      return fetchUniversityCourseById(slug);
    },
    enabled: Boolean(courseId),
  });

  useEffect(() => {
    if (fetchedCourse && fetchedCourse.id) {
      applyCourseData(fetchedCourse);
    }
  }, [fetchedCourse, isLoadingCourse, fetchError, courseId, applyCourseData]);

  const persistStagedFaqs = async (newCourseId) => {
    if (!stagedFaqs.length || !newCourseId) return;

    for (const faq of stagedFaqs) {
      try {
        await addUniversityCourseFaq({
          course_id: newCourseId,
          category_id: faq.category_id,
          title: faq.title,
          description: faq.description,
          saveWithDate: faq.saveWithDate ?? true,
        });
      } catch (error) {
        console.error("Failed to persist staged FAQ", error);
        notifyError("Failed to save staged FAQs. Please try again after saving the course.");
        throw error;
      }
    }

    setStagedFaqs([]);
    queryClient.invalidateQueries(["university-course-faq-inline", newCourseId]);
    notifySuccess("Staged FAQs saved successfully.");
  };

  const mutation = useMutation({
    mutationFn: async (formData) => {
      if (courseId) {
        return updateUniversityCourseApi(courseId, formData);
      }
      return createUniversityCourse(formData);
    },
    onSuccess: async (response) => {
      if (!courseId && stagedFaqs.length) {
        const createdCourseId =
          response?.data?.id ??
          response?.data?.data?.id ??
          response?.data?.data?.insertId ??
          response?.data?.insertId ??
          response?.id;

        if (createdCourseId) {
          try {
            await persistStagedFaqs(createdCourseId);
          } catch (error) {
            console.error("Error while persisting staged FAQs", error);
          }
        } else {
          notifyError("Could not detect the new course ID to save staged FAQs. Please add FAQs after saving.");
        }
      }

      notifySuccess(`University course ${isEdit ? "updated" : "created"} successfully`);
      onSuccess?.();
    },
    onError: (err) => {
      notifyError(err?.response?.data?.message || "Failed to save course");
    },
  });

  const submitCourse = (data) => {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (key === "fee_type_values") return;

      if (FILE_FIELDS.includes(key)) {
        if (value instanceof FileList && value.length > 0) {
          formData.append(key, value[0]);
        }
        return;
      }

      if (key === "is_active") {
        formData.append(key, value ? "true" : "false");
        return;
      }

      formData.append(key, value ?? "");
    });

    const feeEntries = Object.entries(data.fee_type_values || {}).reduce(
      (acc, [sanitizedKey, value]) => {
        if (value === undefined || value === null || value === "") {
          return acc;
        }
        const numeric = Number(value);
        if (Number.isNaN(numeric)) {
          return acc;
        }
        const feeKey = feeKeyLookup[sanitizedKey];
        const normalizedKey = sanitizeFeeKey(feeKey || sanitizedKey);
        if (!normalizedKey) {
          return acc;
        }
        acc[normalizedKey] = numeric;
        return acc;
      },
      {}
    );
    formData.append("fee_type_values", JSON.stringify(feeEntries));

    // Process banners - include all banners that have content or are being removed
    const bannersData = banners
      .filter((b) => {
        // Include if:
        // 1. Has existing files (even if marked for removal)
        // 2. Has new file upload (previewBanner)
        // 3. Has video_id or video_title
        // 4. Is marked for removal (to delete existing)
        return (
          b.existingBanner ||
          b.previewBanner ||
          b.video_id ||
          b.video_title ||
          b.bannerRemoved
        );
      })
      .map((banner, index) => {
        const bannerData = {
          banner_key: banner.banner_key || `banner_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          video_id: banner.video_id || "",
          video_title: banner.video_title || "",
        };

        // Handle banner image
        if (banner.bannerRemoved && (banner.existingBanner || banner.banner_image)) {
          // Mark for removal
          bannerData.banner_image = "__REMOVE__";
        } else if (banner.previewBanner && !banner.existingBanner && !banner.banner_image) {
          // New file upload - file will be uploaded via FormData
          const fileInput = document.querySelector(
            `input[name="banner_${index}_banner_image"]`
          );
          if (fileInput?.files?.[0]) {
            formData.append(`banner_${index}_banner_image`, fileInput.files[0]);
            bannerData.banner_image = null;
          }
        } else if ((banner.existingBanner || banner.banner_image) && !banner.bannerRemoved) {
          bannerData.banner_image = banner.existingBanner || banner.banner_image;
        }

        return bannerData;
      });

    if (bannersData.length > 0) {
      formData.append("banners", JSON.stringify(bannersData));
    } else {
      formData.append("banners", JSON.stringify([]));
    }

    if (thumbnailRemoved) {
      formData.append("course_thumbnail", "");
    }

    if (syllabusRemoved) {
      formData.append("syllabus_file", "__REMOVE__");
    }

    // Handle brochure file at course level
    if (brochureRemoved && existingBrochure) {
      formData.append("brochure_file", "__REMOVE__");
    } else if (brochureFileName && !existingBrochure) {
      const fileInput = document.querySelector('input[name="brochure_file"]');
      if (fileInput?.files?.[0]) {
        formData.append("brochure_file", fileInput.files[0]);
      }
    } else if (existingBrochure && !brochureRemoved) {
      formData.append("brochure_file", existingBrochure);
    }

    if (isEdit) {
      // Convert saveWithoutDate to saveWithDate (inverted logic)
      // If checkbox is checked (saveWithoutDate = true), then saveWithDate = false
      // If checkbox is unchecked (saveWithoutDate = false), then saveWithDate = true
      const saveWithDate = !saveWithoutDate;
      formData.append("saveWithDate", saveWithDate ? "true" : "false");
    }

    mutation.mutate(formData);
  };

  const handleSave = () => {
    handleSubmit((formValues) => submitCourse(formValues))();
  };

  const isActive = watch("is_active");

  const addBanner = () => {
    setBanners([...banners, createNewBanner()]);
  };

  const removeBanner = (index) => {
    setBanners(banners.filter((_, i) => i !== index));
  };

  const updateBanner = (index, updates) => {
    const updated = [...banners];
    updated[index] = { ...updated[index], ...updates };
    setBanners(updated);
  };

  const handleThumbnailRemoval = () => {
    setPreviewCourseThumbnail(null);
    setThumbnailRemoved(true);
    setValue("course_thumbnail", null);
    const input = document.querySelector('input[name="course_thumbnail"]');
    if (input) input.value = "";
  };

  const handleSyllabusRemoval = () => {
    setExistingSyllabus(null);
    setSyllabusFileName("");
    setSyllabusRemoved(true);
    setValue("syllabus_file", null);
    const input = document.querySelector('input[name="syllabus_file"]');
    if (input) input.value = "";
  };

  return (
    <div className="p-4">
      <div className="relative flex justify-center items-center mb-6">
        <Button variant="ghost" size="sm" onClick={onCancel} className="absolute left-0">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to List
        </Button>
        <h1 className="text-2xl font-bold">
          {isEdit ? "Edit University Course" : "Add University Course"}
        </h1>
      </div>
      <div className="space-y-4 max-w-3xl mx-auto">
        <form
          className="space-y-4"
          encType="multipart/form-data"
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
        >
          <div>
            <Label>University</Label>
            <input
              type="hidden"
              {...register("university_id", { required: "University is required" })}
            />
            {isLoadingUniversities ? (
              <p className="text-sm text-muted-foreground">Loading universities...</p>
            ) : (
              <select
                className="w-full border rounded px-3 py-2"
                value={watch("university_id") || ""}
                onChange={(e) =>
                  setValue("university_id", e.target.value, {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
              >
                <option value="">Select university</option>
                {universities.map((u) => (
                  <option key={u.id} value={String(u.id)}>
                    {u.university_name || u.name || u.title}
                  </option>
                ))}
              </select>
            )}
            {errors.university_id && (
              <p className="text-xs text-red-500">{errors.university_id.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Course Name</Label>
              <Input
                {...register("name", { required: "Name is required" })}
                placeholder="e.g. MBA"
              />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Course Slug</Label>
              <Input {...register("slug")} placeholder="Auto-generated if left blank" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Label</Label>
              <Input {...register("label")} placeholder="Short label" />
            </div>
            <div className="space-y-2">
              <Label>Author Name</Label>
              <Input {...register("author_name")} placeholder="Instructor / author" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Duration</Label>
              <Input {...register("duration")} placeholder="e.g. 2 Years" />
            </div>
            <div />
          </div>

          <div className="flex items-center gap-3">
            <Controller
              name="is_active"
              control={control}
              render={({ field }) => (
                <Checkbox
                  label="Active"
                  checked={Boolean(field.value)}
                  onChange={(event) => field.onChange(event.target.checked)}
                  ref={field.ref}
                  onBlur={field.onBlur}
                />
              )}
            />
            {!isActive && (
              <span className="text-xs text-muted-foreground">Course will be hidden on the site</span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Course Thumbnail</Label>
              <Input
                type="file"
                accept="image/*"
                {...register("course_thumbnail")}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setPreviewCourseThumbnail(URL.createObjectURL(file));
                    setThumbnailRemoved(false);
                  }
                }}
              />
              {previewCourseThumbnail && (
                <div className="mt-2 space-y-2">
                  <img
                    src={previewCourseThumbnail}
                    alt="Course thumbnail preview"
                    className="h-20 object-contain rounded border"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    className="bg-red-500 text-white hover:bg-red-500/90"
                    onClick={handleThumbnailRemoval}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>Upload Syllabus</Label>
              <Input
                type="file"
                accept=".pdf,.doc,.docx"
                {...register("syllabus_file")}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setSyllabusFileName(file.name);
                    setExistingSyllabus(null);
                    setSyllabusRemoved(false);
                  } else {
                    setSyllabusFileName("");
                  }
                }}
              />
              {(syllabusFileName || existingSyllabus) && (
                <div className="mt-2 flex items-center gap-2">
                  {syllabusFileName ? (
                    <span className="text-sm text-muted-foreground">{syllabusFileName}</span>
                  ) : (
                    <a
                      href={buildAssetUrl(existingSyllabus)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 underline"
                    >
                      {getFileName(existingSyllabus)}
                    </a>
                  )}
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    className="bg-red-500 text-white hover:bg-red-500/90"
                    onClick={handleSyllabusRemoval}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>Upload Brochure</Label>
              <Input
                type="file"
                accept=".pdf,.doc,.docx"
                name="brochure_file"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setBrochureFileName(file.name);
                    setExistingBrochure(null);
                    setBrochureRemoved(false);
                  } else {
                    setBrochureFileName("");
                  }
                }}
              />
              {(brochureFileName || existingBrochure) && !brochureRemoved && (
                <div className="mt-2 flex items-center gap-2">
                  {brochureFileName ? (
                    <span className="text-sm text-muted-foreground">{brochureFileName}</span>
                  ) : (
                    <a
                      href={buildAssetUrl(existingBrochure)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 underline"
                    >
                      {getFileName(existingBrochure)}
                    </a>
                  )}
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    className="bg-red-500 text-white hover:bg-red-500/90"
                    onClick={() => {
                      if (existingBrochure) {
                        setBrochureRemoved(true);
                        setBrochureFileName("");
                      } else {
                        setBrochureFileName("");
                        const input = document.querySelector('input[name="brochure_file"]');
                        if (input) input.value = "";
                      }
                    }}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="border rounded-md p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Fee Types</h3>
              {isLoadingFeeTypes && (
                <span className="text-sm text-muted-foreground">Loading...</span>
              )}
            </div>
            {feeFieldEntries.length === 0 && !isLoadingFeeTypes ? (
              <p className="text-sm text-muted-foreground">
                No fee types available. Add some fee types first.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {feeFieldEntries.map((entry) => {
                  const { sanitizedKey, label } = entry;
                  const fieldId = `fee-type-${sanitizedKey}`;
                  return (
                    <div key={sanitizedKey} className="space-y-2">
                      <Label htmlFor={fieldId}>{label}</Label>
                      <Input
                        id={fieldId}
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder={`Enter ${label} amount`}
                        {...register(`fee_type_values.${sanitizedKey}`, {
                          valueAsNumber: true,
                        })}
                        className="spin-none"
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="border rounded-md p-4 space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Banner Information</h3>
            </div>
            {banners.map((banner, index) => (
              <div key={banner.banner_key} className="border rounded-md p-4 space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Banner {index + 1}</h4>
                  {banners.length > 1 && (
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={() => removeBanner(index)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Course Banner</Label>
                    <Input
                      type="file"
                      accept="image/*"
                      name={`banner_${index}_banner_image`}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          updateBanner(index, {
                            previewBanner: URL.createObjectURL(file),
                            bannerRemoved: false,
                          });
                        }
                      }}
                    />
                    {(banner.previewBanner || banner.existingBanner) && !banner.bannerRemoved && (
                      <div className="mt-2 space-y-2">
                        <img
                          src={banner.previewBanner || buildAssetUrl(banner.existingBanner)}
                          alt="Course banner preview"
                          className="h-24 object-contain rounded border"
                        />
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          className="bg-red-500 text-white hover:bg-red-500/90"
                          onClick={() => {
                            if (banner.existingBanner) {
                              updateBanner(index, { bannerRemoved: true, previewBanner: null });
                            } else {
                              updateBanner(index, { previewBanner: null });
                              const input = document.querySelector(
                                `input[name="banner_${index}_banner_image"]`
                              );
                              if (input) input.value = "";
                            }
                          }}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Video ID</Label>
                    <Input
                      value={banner.video_id}
                      onChange={(e) => updateBanner(index, { video_id: e.target.value })}
                      placeholder="YouTube / Vimeo video ID"
                    />
                    <Label className="mt-2 block">Video Title</Label>
                    <Input
                      value={banner.video_title}
                      onChange={(e) => updateBanner(index, { video_title: e.target.value })}
                      placeholder="Video title"
                    />
                  </div>
                </div>
              </div>
            ))}
            <div className="pt-2">
              <Button type="button" size="sm" onClick={addBanner}>
                <Plus className="h-4 w-4 mr-2" />
                Add More
              </Button>
            </div>
          </div>
        </form>

        <div className="border-t pt-4 mt-6">
          <UniversityFaqInlinePanel
            courseId={courseId}
            courseName={watch("name")}
            stagedFaqs={stagedFaqs}
            setStagedFaqs={setStagedFaqs}
            type="course"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          {isEdit && (
            <div className="flex items-center gap-2 mr-2">
              <Checkbox
                id="save-without-date"
                checked={saveWithoutDate}
                onChange={(event) => setSaveWithoutDate(event.target.checked)}
              />
              <Label htmlFor="save-without-date" className="cursor-pointer">
                Save without Date
              </Label>
            </div>
          )}
          <Button type="button" variant="outline" onClick={onCancel} disabled={mutation.isLoading}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={mutation.isLoading || isSubmitting}
          >
            {mutation.isLoading
              ? "Saving..."
              : isEdit
              ? "Save"
              : "Create Course"}
          </Button>
        </div>
      </div>
    </div>
  );
}
