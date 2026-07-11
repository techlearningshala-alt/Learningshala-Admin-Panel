"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { Controller, useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addSpecialization,
  updateSpecializations,
  findAllCourseName,
  fetchSpecializationById,
  addSpecializationFaq,
} from "@/lib/menuApi";
import {
  fetchAllPlacementPartners,
} from "@/lib/universityApi";
import SpecializationFaqInlinePanel from "@/components/specialization-faq/InlineFaqPanel";
import { notifySuccess, notifyError } from "@/lib/notify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import SafeCKEditor from "@/components/CKEditor";
import { ArrowLeft, Plus, Trash, Info } from "lucide-react";
import { MultiSelect } from "primereact/multiselect";
import FormActionButtons from "@/components/common/FormActionButtons";
import AuthorSelect from "@/components/common/AuthorSelect";

const SECTION_TEMPLATES = [
  { id: "course-overview", section_key: "course_overview", title: "Course Overview" },
  { id: "why-choose", section_key: "why_choose", title: "Why Choose?" },
  { id: "who-can-pursue", section_key: "who_can_pursue_1", title: "Who Can Pursue? (Box-1)" },
  { id: "who-can-pursue", section_key: "who_can_pursue_2", title: "Who Can Pursue? (Box-2)" },
  { id: "who-can-pursue", section_key: "who_can_pursue_3", title: "Who Can Pursue? (Box-3)" },
  { id: "who-can-pursue", section_key: "who_can_pursue_4", title: "Who Can Pursue? (Box-4)" },
  { id: "key-highlights", section_key: "key_highlights", title: "Key Highlights" },
  { id: "eligibility-criteria", section_key: "eligibility_criteria", title: "Eligibility Criteria" },
  { id: "course-duration", section_key: "course_duration", title: "Course Duration" },
  { id: "syllabus-subjects", section_key: "syllabus_subjects", title: "Syllabus / Subjects" },
  { id: "exam-pattern", section_key: "exam_pattern", title: "Exam Pattern" },
  { id: "course-fee-details", section_key: "course_fee_details", title: "Course Fee Details" },
  { id: "emi-financial-support", section_key: "emi_financial_support", title: "EMI & Financial Support" },
  {
    id: "admission-process",
    section_key: "admission_process",
    title: "Admission Process",
    supportsImage: true,
  },
  { id: "worth-it", section_key: "worth_it", title: "Worth It?" },
  { id: "career-opportunities", section_key: "career_opportunities", title: "Career Opportunities" },
  { id: "top-recruiters", section_key: "top_recruiters", title: "Top Recruiters " },
];

const generateLocalId = () =>
  `local_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

const sanitizeSectionKey = (value) => {
  if (!value) return "";
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
};

const buildDefaultSections = () =>
  SECTION_TEMPLATES.map((template) => ({
    ...template,
    description: "",
    existingImage: null,
    imageFile: null,
    imagePreview: null,
    imageRemoved: false,
  }));

const createNewBanner = () => ({
  id: null,
  localId: generateLocalId(),
  video_id: "",
  video_title: "",
  previewBanner: null,
  existingBanner: null,
  bannerRemoved: false,
  file: null,
});

const buildAssetUrl = (value) => {
  if (!value) return null;
  if (String(value).startsWith("http")) return value;
  const base = process.env.NEXT_PUBLIC_thumbnail_URL || "";
  return `${base}${value}`;
};

const defaultFormValues = {
  course_id: "",
  name: "",
  slug: "",
  h1Tag: "",
  meta_title: "",
  meta_description: "",
  duration: "",
  duration_unit: "",
  duration_schema_value: "",
  eligibility: "",
  eligibility_info: "",
  label: "",
  priority: "",
  author_name: "",
  verifier_name: "",
  learning_mode: "",
  podcast_embed: "",
  specialization_intro: "",
  emi_facility: false,
};

export default function AddSpecializationForm({ item, onCancel, onSuccess }) {
  const queryClient = useQueryClient();
  const [previewThumbnail, setPreviewThumbnail] = useState(null);
  const [existingThumbnail, setExistingThumbnail] = useState(null);
  const [thumbnailRemoved, setThumbnailRemoved] = useState(false);
  const [ebookFile, setEbookFile] = useState(null);
  const [ebookFileName, setEbookFileName] = useState("");
  const [existingEbook, setExistingEbook] = useState(null);
  const [ebookRemoved, setEbookRemoved] = useState(false);
  const [sections, setSections] = useState(buildDefaultSections());
  const [banners, setBanners] = useState([createNewBanner()]);
  const [stagedFaqs, setStagedFaqs] = useState([]);
  const [selectedPlacementPartners, setSelectedPlacementPartners] = useState([]);
  const ebookInputRef = useRef(null);
  const specializationId = item?.id;
  const isEdit = Boolean(specializationId);

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: defaultFormValues,
  });

  const { data: courseResponse, isLoading: isLoadingCourses } = useQuery({
    queryKey: ["courses", "all"],
    queryFn: findAllCourseName,
  });

  const courses = useMemo(
    () => courseResponse?.data?.data || courseResponse?.data || [],
    [courseResponse]
  );

  const { data: placementPartnerResponse } = useQuery({
    queryKey: ["placement-partners", "all"],
    queryFn: () => fetchAllPlacementPartners(),
  });

  const placementPartners = useMemo(
    () =>
      placementPartnerResponse?.data?.data ||
      placementPartnerResponse?.data ||
      placementPartnerResponse ||
      [],
    [placementPartnerResponse]
  );

  const selectedPlacementPartnersDisplay = useMemo(
    () =>
      placementPartners.filter((p) =>
        selectedPlacementPartners.includes(p.id)
      ),
    [placementPartners, selectedPlacementPartners]
  );

  const hydrateSections = useCallback((specialization) => {
    const base = buildDefaultSections();
    const remoteSections = Array.isArray(specialization?.sections)
      ? specialization.sections
      : [];

    if (!remoteSections.length) return base;

    const mapKey = new Map();
    const mapTitle = new Map();

    remoteSections.forEach((section) => {
      const key = sanitizeSectionKey(section.section_key || section.title);
      const titleKey = sanitizeSectionKey(section.title);
      if (key && !mapKey.has(key)) {
        mapKey.set(key, section);
      }
      if (titleKey && !mapTitle.has(titleKey)) {
        mapTitle.set(titleKey, section);
      }
    });

    const extractDescription = (section) => {
      if (section?.description) return section.description;
      if (section?.props) {
        if (section.props.content) return section.props.content;
        const firstProp = Object.keys(section.props)[0];
        if (firstProp && section.props[firstProp]) {
          return section.props[firstProp];
        }
      }
      return "";
    };

    const usedKeys = new Set();
    const claimSection = (section) => {
      if (!section) return null;
      const identifier =
        section.id ?? sanitizeSectionKey(section.section_key || section.title);
      if (identifier && usedKeys.has(identifier)) {
        return null;
      }
      if (identifier) {
        usedKeys.add(identifier);
      }
      return section;
    };

    const hydrated = base.map((section) => {
      const normalizedKey = sanitizeSectionKey(section.section_key);
      let remote = claimSection(mapKey.get(normalizedKey));
      if (!remote) {
        remote = claimSection(mapTitle.get(normalizedKey));
      }

    if (!remote) {
      return {
        ...section,
        section_key: normalizedKey,
        existingImage: section.existingImage || null,
        imagePreview: section.imagePreview || null,
        imageRemoved: !!section.imageRemoved,
      };
    }

    return {
      ...section,
      section_key: normalizedKey,
      title: remote.title || section.title,
      description: extractDescription(remote) || section.description || "",
      existingImage: remote.image || section.existingImage || null,
      imagePreview:
        remote.image || section.existingImage
          ? buildAssetUrl(remote.image || section.existingImage)
          : null,
      imageRemoved: false,
    };
    });

    const extras = remoteSections
      .filter((section) => {
        const identifier =
          section.id ?? sanitizeSectionKey(section.section_key || section.title);
        return identifier ? !usedKeys.has(identifier) : true;
      })
      .map((section) => ({
        id: section.id ?? generateLocalId(),
        section_key: sanitizeSectionKey(section.section_key || section.title),
        title: section.title || "Custom Section",
        description: extractDescription(section),
        supportsImage: Boolean(
          base.find(
            (template) =>
              sanitizeSectionKey(template.section_key) ===
                sanitizeSectionKey(section.section_key || section.title) &&
              template.supportsImage
          )
        ),
        existingImage: section.image || null,
        imagePreview: section.image ? buildAssetUrl(section.image) : null,
        imageRemoved: false,
      }));

    return [...hydrated, ...extras];
  }, []);

  const hydrateBanners = useCallback((specialization) => {
    const list = Array.isArray(specialization?.banners) ? specialization.banners : [];
    if (!list.length) return [createNewBanner()];
    return list.map((banner) => ({
      id: banner.id ?? null,
      localId: generateLocalId(),
      video_id: banner.video_id || "",
      video_title: banner.video_title || "",
      previewBanner: banner.banner_image ? buildAssetUrl(banner.banner_image) : null,
      existingBanner: banner.banner_image || null,
      bannerRemoved: false,
      file: null,
    }));
  }, []);

  const applySpecializationData = useCallback(
    (source) => {
      if (!source) {
        reset(defaultFormValues);
        setSections(buildDefaultSections());
        setBanners([createNewBanner()]);
        setExistingThumbnail(null);
        setPreviewThumbnail(null);
        setThumbnailRemoved(false);
        setExistingEbook(null);
        setEbookFile(null);
        setEbookFileName("");
        setEbookRemoved(false);
        return;
      }

      const hydratedValues = {
        ...defaultFormValues,
        course_id: source.course_id ? String(source.course_id) : "",
        name: source.name || "",
        slug: source.slug || "",
        h1Tag: source.h1Tag || "",
        meta_title: source.meta_title || "",
        meta_description: source.meta_description || "",
        duration: source.course_duration ?? source.duration ?? "",
        duration_unit: source.duration_for_schema 
        ? (() => {
            try {
              const parsed = typeof source.duration_for_schema === 'string' 
                ? JSON.parse(source.duration_for_schema) 
                : source.duration_for_schema;
              return parsed.month ? "months" : (parsed.year ? "years" : "");
            } catch {
              return "";
            }
          })()
        : "",
      duration_schema_value: source.duration_for_schema 
        ? (() => {
            try {
              const parsed = typeof source.duration_for_schema === 'string' 
                ? JSON.parse(source.duration_for_schema) 
                : source.duration_for_schema;
              return parsed.month || parsed.year || "";
            } catch {
              return "";
            }
          })()
        : "",
      eligibility: source.eligibility || "",
      eligibility_info: source.eligibility_info || "",
      label: source.label || "",
      priority: source.priority ?? "",
      author_name: source.author_name ?? "",
      verifier_name: source.verifier_name ?? "",
      learning_mode: source.learning_mode ?? "",
      podcast_embed: source.podcast_embed ?? "",
      specialization_intro: source.specialization_intro ?? source.description ?? "",
      emi_facility: source.emi_facility === undefined || source.emi_facility === null ? false : Boolean(source.emi_facility),
    };

      reset(hydratedValues);
      setSections(hydrateSections(source));
      setBanners(hydrateBanners(source));

      const thumb = source.thumbnail || null;
      if (thumb) {
        setExistingThumbnail(thumb);
        setPreviewThumbnail(buildAssetUrl(thumb));
      } else {
        setExistingThumbnail(null);
        setPreviewThumbnail(null);
      }
      setThumbnailRemoved(false);

      const brochurePath = source.upload_brochure || null;
      setExistingEbook(brochurePath);
      setEbookFile(null);
      setEbookFileName("");
      setEbookRemoved(false);

      // Partners (arrays)
      setSelectedPlacementPartners(
        Array.isArray(source?.placement_partner_ids)
          ? source.placement_partner_ids.map((n) => Number(n)).filter((n) => !Number.isNaN(n))
          : []
      );
    },
    [reset, hydrateSections, hydrateBanners]
  );

  const {
    data: specializationResponse,
    isLoading: isLoadingSpecialization,
  } = useQuery({
    queryKey: ["specialization", specializationId],
    queryFn: () => fetchSpecializationById(specializationId),
    enabled: Boolean(specializationId),
  });

  const fetchedSpecialization = useMemo(() => {
    if (!specializationResponse) return null;
    return specializationResponse.data?.data ?? specializationResponse.data ?? specializationResponse;
  }, [specializationResponse]);

  useEffect(() => {
    if (isEdit) {
      if (fetchedSpecialization) {
        applySpecializationData(fetchedSpecialization);
      } else if (item) {
        applySpecializationData(item);
      }
    } else {
      applySpecializationData(null);
    }
  }, [isEdit, item, fetchedSpecialization, applySpecializationData]);

  const persistStagedFaqs = async (newSpecializationId) => {
    if (!stagedFaqs.length || !newSpecializationId) return;

    for (const faq of stagedFaqs) {
      try {
        await addSpecializationFaq({
          specialization_id: newSpecializationId,
          category_id: faq.category_id,
          title: faq.title,
          description: faq.description,
          saveWithDate: faq.saveWithDate ?? true,
        });
      } catch (error) {
        console.error("Failed to persist staged FAQ", error);
        notifyError("Failed to save staged FAQs. Please try again after saving the specialization.");
        throw error;
      }
    }

    setStagedFaqs([]);
    queryClient.invalidateQueries(["specialization-faq-inline", newSpecializationId]);
    notifySuccess("Staged FAQs saved successfully.");
  };

  const mutation = useMutation({
    mutationFn: async (formData) => {
      if (specializationId) {
        return updateSpecializations(specializationId, formData);
      }
      return addSpecialization(formData);
    },
    onSuccess: async (response) => {
      notifySuccess(item ? "Specialization updated successfully" : "Specialization created successfully");
      queryClient.invalidateQueries(["specialization"]);
      
      if (!specializationId && stagedFaqs.length) {
        const createdSpecializationId =
          response?.data?.id ??
          response?.data?.data?.id ??
          response?.data?.data?.insertId ??
          response?.data?.insertId ??
          response?.id;

        if (createdSpecializationId) {
          try {
            await persistStagedFaqs(createdSpecializationId);
          } catch (error) {
            console.error("Error while persisting staged FAQs", error);
          }
        } else {
          notifyError("Could not detect the new specialization ID to save staged FAQs. Please add FAQs after saving.");
        }
      }
      
      onSuccess?.();
    },
    onError: (error) => {
      notifyError(error?.response?.data?.message || "Failed to save specialization");
    },
  });

  const handleSectionDescriptionChange = (index, value) => {
    setSections((prev) =>
      prev.map((section, idx) =>
        idx === index ? { ...section, description: value } : section
      )
    );
  };

  const handleSectionImageChange = (index, file) => {
    setSections((prev) =>
      prev.map((section, idx) => {
        if (idx !== index) return section;
        return {
          ...section,
          imageFile: file || null,
          imagePreview: file ? URL.createObjectURL(file) : section.imagePreview,
          imageRemoved: !file && !section.existingImage,
        };
      })
    );
  };

  const removeSectionImage = (index) => {
    setSections((prev) =>
      prev.map((section, idx) =>
        idx === index
          ? {
              ...section,
              imageFile: null,
              imagePreview: null,
              existingImage: null,
              imageRemoved: true,
            }
          : section
      )
    );
  };

  const updateBanner = (index, updates) => {
    setBanners((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...updates };
      return next;
    });
    // Clear banner error if a file is being added
    if (updates.file) {
      clearErrors("banners");
    }
  };

  const removeBanner = (index) => {
    setBanners((prev) => {
      const updated = prev.filter((_, idx) => idx !== index);
      // Check if removal leaves no banners - if so, show error
      const hasAnyBanner = updated.some((banner) => {
        const hasNewImage = banner.file;
        const hasExisting = banner.existingBanner && !banner.bannerRemoved;
        return hasNewImage || hasExisting;
      });
      if (updated.length === 0 || !hasAnyBanner) {
        setError("banners", {
          type: "manual",
          message: "At least one banner image is required",
        });
      }
      return updated;
    });
  };

  const addBanner = () => {
    setBanners((prev) => [...prev, createNewBanner()]);
  };

  const handleThumbnailRemoval = () => {
    setPreviewThumbnail(null);
    setThumbnailRemoved(true);
    setExistingThumbnail(null);
    setValue("thumbnail", null);
    const fileInput = document.querySelector('input[name="thumbnail"]');
    if (fileInput) fileInput.value = "";
  };

  const submitSpecialization = (values, saveWithDate = true) => {
    // Validate banner (at least one banner image required - applies to both add and edit)
    const hasBannerImage = banners.some((banner) => {
      const hasNewImage = banner.file;
      const hasExisting = banner.existingBanner && !banner.bannerRemoved;
      return hasNewImage || hasExisting;
    });
    if (!hasBannerImage) {
      setError("banners", {
        type: "manual",
        message: "At least one banner image is required",
      });
      notifyError("At least one banner image is required");
      return;
    }
    clearErrors("banners");

    // Validate course overview (course_overview section description required)
    const courseOverviewSection = sections.find((s) => s.section_key === "course_overview");
    if (!courseOverviewSection || !courseOverviewSection.description || !courseOverviewSection.description.trim()) {
      setError("course_overview", {
        type: "manual",
        message: "Course overview is required",
      });
      notifyError("Course overview is required");
      return;
    } else {
      clearErrors("course_overview");
    }

    const formData = new FormData();
    const appendIfPresent = (key, value) => {
      if (value === undefined || value === null) return;
      formData.append(key, value);
    };

    appendIfPresent("course_id", values.course_id);
    appendIfPresent("name", values.name);
    appendIfPresent("slug", values.slug);
    appendIfPresent("h1Tag", values.h1Tag);
    appendIfPresent("meta_title", values.meta_title);
    appendIfPresent("meta_description", values.meta_description);
    appendIfPresent("course_duration", values.duration || "");
    
    // Format duration_for_schema as JSON object
    if (values.duration_unit && values.duration_schema_value) {
      const durationForSchema = {
        month: values.duration_unit === "months" ? values.duration_schema_value : "",
        year: values.duration_unit === "years" ? values.duration_schema_value : "",
      };
      formData.append("duration_for_schema", JSON.stringify(durationForSchema));
    } else if (values.duration_unit || values.duration_schema_value) {
      // If only one is set, still create the object
      const durationForSchema = {
        month: values.duration_unit === "months" ? (values.duration_schema_value || "") : "",
        year: values.duration_unit === "years" ? (values.duration_schema_value || "") : "",
      };
      formData.append("duration_for_schema", JSON.stringify(durationForSchema));
    }
    
    appendIfPresent("eligibility", values.eligibility);
    appendIfPresent("eligibility_info", values.eligibility_info);
    appendIfPresent("label", values.label);
    appendIfPresent("priority", values.priority);
    appendIfPresent("author_name", values.author_name);
    appendIfPresent("verifier_name", values.verifier_name);
    appendIfPresent("emi_facility", values.emi_facility ? "true" : "false");
    appendIfPresent("learning_mode", values.learning_mode);
    appendIfPresent("podcast_embed", values.podcast_embed);
    appendIfPresent("specialization_intro", values.specialization_intro);
    appendIfPresent("description", values.specialization_intro);

    if (values.thumbnail?.[0]) {
      formData.append("thumbnail", values.thumbnail[0]);
    } else if (thumbnailRemoved) {
      formData.append("thumbnail", "__REMOVE__");
    } else if (existingThumbnail) {
      formData.append("existingThumbnail", existingThumbnail);
    }

    if (ebookRemoved) {
      formData.append("ebook_file", "__REMOVE__");
    } else if (ebookFile) {
      formData.append("ebook_file", ebookFile);
    } else if (existingEbook) {
      formData.append("ebook_file", existingEbook);
    }

  const sectionPayload = sections.map((section) => ({
    section_key: section.section_key,
    title: section.title,
    description: section.description || "",
  }));
    formData.append("sections", JSON.stringify(sectionPayload));

    sections.forEach((section) => {
      if (!section.supportsImage) return;
      const key = `${section.section_key}_image`;
      if (section.imageFile) {
        formData.append(key, section.imageFile);
      } else if (section.imageRemoved) {
        formData.append(key, "__REMOVE__");
      } else if (section.existingImage) {
        formData.append(key, section.existingImage);
      }
    });

    const bannersPayload = [];
    banners.forEach((banner, index) => {
      if (
        !(
          banner.existingBanner ||
          banner.file ||
          banner.video_id ||
          banner.video_title ||
          banner.bannerRemoved
        )
      ) {
        return;
      }

      const payload = {
        id: banner.id ?? null,
        video_id: banner.video_id || null,
        video_title: banner.video_title || null,
      };

      if (banner.bannerRemoved && (banner.existingBanner || banner.id)) {
        payload.banner_image = "__REMOVE__";
      } else if (banner.file) {
        payload.banner_image = null;
        formData.append(`banner_${index}_banner_image`, banner.file);
      } else if (banner.existingBanner) {
        payload.banner_image = banner.existingBanner;
      }

      bannersPayload.push(payload);
    });

    formData.append("banners", JSON.stringify(bannersPayload));
    if (item) {
      formData.append("saveWithDate", saveWithDate ? "true" : "false");
    }

    formData.append("placement_partner_ids", JSON.stringify(selectedPlacementPartners));

    mutation.mutate(formData);
  };

  const handleSave = (saveWithDate = true) => {
    handleSubmit((formValues) => submitSpecialization(formValues, saveWithDate))();
  };

  return (
    <div className="p-4">
      <div className="relative flex justify-center items-center mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="absolute left-0 hover:bg-gray-200 hover:text-black text-black"
        >
          <ArrowLeft className="mr-2 h-2 w-2" />
          Back to List
        </Button>
        <h3 className="text-2xl font-bold text-blue-700">
          {item ? "Edit Specialization" : "Add Specialization"}
        </h3>
      </div>

      <form className="space-y-6 max-w-5xl mx-auto bg-white p-6 rounded-lg shadow-sm">
        <section className="border rounded-lg p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Course</Label>
              {isLoadingCourses ? (
                <p className="text-sm text-muted-foreground">Loading courses...</p>
              ) : (
                <select
                  className="w-full border rounded px-3 py-2"
                  {...register("course_id", { required: "Course is required" })}
                >
                  <option value="">Select Course</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.name}
                    </option>
                  ))}
                </select>
              )}
              {errors.course_id && (
                <p className="text-xs text-red-500">{errors.course_id.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Specialization Name</Label>
              <Input
                className="h-7"
                placeholder="e.g. Data Science"
                {...register("name", { required: "Specialization name is required" })}
              />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Specialization Slug</Label>
              <Input className="h-7" placeholder="Enter specialization slug" {...register("slug", { required: "Specialization slug is required" })} />
              {errors.slug && (
                <p className="text-xs text-red-500">{errors.slug.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Specialization Heading (H1 Tag)</Label>
              <Input
                className="h-7"
                placeholder="Primary headline"
                {...register("h1Tag", { required: "H1 Tag is required" })}
              />
              {errors.h1Tag && (
                <p className="text-xs text-red-500">{errors.h1Tag.message}</p>
              )}
            </div>

            <div className="space-y-2 col-span-1 md:col-span-2">
              <Label>Meta Title</Label>
              <Input
                className="w-full h-7"
                placeholder="SEO Meta Title (max 60 character)"
                {...register("meta_title")}
              />
            </div>

            <div className="space-y-2 col-span-1 md:col-span-2">
              <Label>Meta Description</Label>
              <textarea
                placeholder="SEO Meta Des (max 160 character)"
                {...register("meta_description")}
                className="w-full border rounded px-3 py-2 h-17"
              />
            </div>

            <div className="space-y-2">
              <Label>Duration</Label>
              <Input
                className="h-7"
                placeholder="Enter duration"
                {...register("duration", {
                  required: "Duration is required",
                })}
              />
              {errors.duration && (
                <p className="text-xs text-red-500">{errors.duration.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Label (Menu Text)</Label>
              <Input
                className="h-7"
                placeholder="Short label for menu"
                {...register("label")}
              />
              {errors.label && (
                <p className="text-xs text-red-500">{errors.label.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <Input
                className="h-7"
                type="number"
                inputMode="numeric"
                placeholder="Lower number → higher priority"
                {...register("priority", { required: "Priority is required" })}
              />
              {errors.priority && (
                <p className="text-xs text-red-500">{errors.priority.message}</p>
              )}
            </div>

            <AuthorSelect
              register={register}
              requiredMessage="Author name is required"
              error={errors.author_name}
            />
            <AuthorSelect
              label="Verifier Name"
              name="verifier_name"
              register={register}
              tag="verifier"
              placeholder="Select Verifier"
              loadingText="Loading verifiers..."
              error={errors.verifier_name}
            />

            <div className="space-y-2">
              <Label>Learning Mode</Label>
              <Input
                className="h-7"
                placeholder="Ex. Online, Distance, Hybrid"
                {...register("learning_mode")}
              />
            </div>

            <div className="flex items-center gap-6 space-y-2">
              <Label>Duration (For Schema Only)</Label>
              <Controller
                name="duration_unit"
                control={control}
                render={({ field }) => (
                  <div className="space-y-3">
                    <div className="flex gap-6">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="duration_months"
                          value="months"
                          checked={field.value === "months"}
                          onChange={() => {
                            field.onChange("months");
                            setValue("duration_schema_value", ""); // Clear value when switching
                          }}
                          className="h-4 w-4 text-blue-600"
                        />
                        <Label htmlFor="duration_months" className="font-normal cursor-pointer">
                          In Months
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="duration_years"
                          value="years"
                          checked={field.value === "years"}
                          onChange={() => {
                            field.onChange("years");
                            setValue("duration_schema_value", ""); // Clear value when switching
                          }}
                          className="h-4 w-4 text-blue-600"
                        />
                        <Label htmlFor="duration_years" className="font-normal cursor-pointer">
                          In Years
                        </Label>
                      </div>
                    </div>
                    {field.value && (
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="0"
                          placeholder={`Enter duration in ${field.value}`}
                          {...register("duration_schema_value", {
                            required: field.value ? `Duration value is required` : false,
                          })}
                          className="w-32"
                        />
                        <span className="text-sm text-gray-600">{field.value}</span>
                        {errors.duration_schema_value && (
                          <p className="text-xs text-red-500">{errors.duration_schema_value.message}</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              />
            </div>

            <div className="space-y-2 ">
              <Label>Eligibility</Label>
              <Textarea
                placeholder="Enter eligibility criteria"
                {...register("eligibility")}
                className="w-full border rounded px-3 py-2 h-17"
              />
            </div>

            <div className="space-y-2 ">
              <div className="flex items-center gap-2">
                <Label>Eligibility (i button)</Label>
                <Info className="h-4 w-4 text-gray-400" />
              </div>
              <Textarea
                placeholder="Enter eligibility information"
                {...register("eligibility_info")}
                className="w-full border rounded px-3 py-2 h-17"
              />
            </div>

            <div className="space-y-2">
              <Label>EMI Facility</Label>
              <Controller
                name="emi_facility"
                control={control}
                render={({ field }) => (
                  <div className="flex gap-6">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="emi_yes"
                        value="true"
                        checked={field.value === true}
                        onChange={() => field.onChange(true)}
                        className="h-4 w-4 text-blue-600"
                      />
                      <Label htmlFor="emi_yes" className="font-normal cursor-pointer">
                        Yes
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="emi_no"
                        value="false"
                        checked={field.value === false}
                        onChange={() => field.onChange(false)}
                        className="h-4 w-4 text-blue-600"
                      />
                      <Label htmlFor="emi_no" className="font-normal cursor-pointer">
                        No
                      </Label>
                    </div>
                    
                  </div>
                )}
              />
            </div>
            
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Upload Specialization Icon (Max 20kb)</Label>
              {previewThumbnail && (
                <div className="space-y-2">
                  <img
                    src={previewThumbnail}
                    alt="Specialization icon"
                    className="h-24 w-24 object-contain rounded border"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={handleThumbnailRemoval}
                  >
                    <Trash className="h-4 w-4 mr-1" />
                    Remove
                  </Button>
                </div>
              )}
              <Input
                type="file"
                className="h-8"
                accept="image/*"
                {...register("thumbnail", {
                  validate: (value) => {
                    const hasFile = value && value.length > 0;
                    if (hasFile) {
                      const file = value[0];
                      const maxSize = 20 * 1024; // 20kb in bytes
                      if (file.size > maxSize) {
                        return "File size must be less than 20kb";
                      }
                    }
                    return true;
                  },
                })}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const maxSize = 20 * 1024; // 20kb in bytes
                    if (file.size > maxSize) {
                      setValue("thumbnail", null);
                      const fileInput = document.querySelector('input[name="thumbnail"]');
                      if (fileInput) fileInput.value = "";
                      return;
                    }
                    setPreviewThumbnail(URL.createObjectURL(file));
                    setThumbnailRemoved(false);
                    clearErrors("thumbnail");
                  }
                }}
              />
              {errors.thumbnail && (
                <p className="text-xs text-red-500">{errors.thumbnail.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Upload Ebook (Max 5MB)</Label>
              <Input
                className="h-8"
                ref={ebookInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setEbookFile(file);
                    setEbookFileName(file.name);
                    setEbookRemoved(false);
                  } else {
                    setEbookFile(null);
                    setEbookFileName("");
                  }
                }}
              />
              {(ebookFileName || existingEbook) && !ebookRemoved && (
                <div className="flex items-center justify-between rounded border px-3 py-2 text-sm">
                  <span>{ebookFileName || existingEbook}</span>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      if (existingEbook) {
                        setEbookRemoved(true);
                      }
                      setEbookFile(null);
                      setEbookFileName("");
                      if (ebookInputRef.current) {
                        ebookInputRef.current.value = "";
                      }
                    }}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              )}
              {ebookRemoved && (
                <p className="text-xs text-muted-foreground">
                  Ebook will be removed when you save.
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Upload Podcast (Embedded Code)</Label>
            <Textarea
              rows={4}
              placeholder="Paste iframe/embed snippet"
              {...register("podcast_embed")}
            />
          </div>
        </section>

        <section className="border rounded-lg p-4 space-y-4">
          <div>
            <h4 className="text-lg font-semibold">Banner Information *</h4>
            {errors.banners && (
              <p className="text-xs text-red-500 mt-1">{errors.banners.message}</p>
            )}
          </div>

          {banners.map((banner, index) => (
            <div
              key={banner.id ?? banner.localId ?? index}
              className="border rounded-md p-4 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Banner {index + 1}</h4>
                {banners.length > 1 && (
                  <Button
                    type="button"
                    size="icon"
                    variant="destructive"
                    onClick={() => removeBanner(index)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Banner Image (650×480px)</Label>
                  {banner.previewBanner && !banner.bannerRemoved && (
                    <img
                      src={banner.previewBanner}
                      alt="Banner preview"
                      className="h-28 object-contain rounded border"
                    />
                  )}
                  {banner.existingBanner && !banner.bannerRemoved && !banner.previewBanner && (
                    <img
                      src={buildAssetUrl(banner.existingBanner)}
                      alt="Banner preview"
                      className="h-28 object-contain rounded border"
                    />
                  )}
                  <Input
                    type="file"
                    className="h-8"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        updateBanner(index, {
                          file: file,
                          previewBanner: URL.createObjectURL(file),
                          bannerRemoved: false,
                        });
                        clearErrors("banners");
                      }
                    }}
                  />
                  {(banner.previewBanner || banner.existingBanner) && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        // Check if this is the only banner with an image (before removal)
                        const bannersWithImages = banners.filter((b, idx) => {
                          if (idx === index) return false; // Exclude the one being removed
                          const hasNewImage = b.file;
                          const hasExisting = b.existingBanner && !b.bannerRemoved;
                          return hasNewImage || hasExisting;
                        });
                        
                        // Check if current banner has an image
                        const currentBannerHasImage = banner.file || (banner.existingBanner && !banner.bannerRemoved);
                        
                        updateBanner(index, {
                          file: null,
                          previewBanner: null,
                          existingBanner: null,
                          bannerRemoved: true,
                        });
                        
                        // If this banner had an image and no other banners have images, show error
                        if (currentBannerHasImage && bannersWithImages.length === 0) {
                          setError("banners", {
                            type: "manual",
                            message: "At least one banner image is required",
                          });
                        }
                      }}
                    >
                      <Trash className="h-4 w-4 mr-1" />
                      Remove Image
                    </Button>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Video ID</Label>
                  <Input
                    value={banner.video_id}
                    onChange={(e) =>
                      updateBanner(index, { video_id: e.target.value || "" })
                    }
                    placeholder="YouTube / Vimeo ID"
                  />
                  <Label>Video Title</Label>
                  <Input
                    value={banner.video_title}
                    onChange={(e) =>
                      updateBanner(index, { video_title: e.target.value || "" })
                    }
                    placeholder="Enter video title"
                  />
                </div>
              </div>
            </div>
          ))}

          <Button type="button" size="sm" onClick={addBanner}>
            <Plus className="h-4 w-4 mr-1" />
            Add Banner
          </Button>
        </section>

        <section className="border rounded-lg p-4 space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Specialization Intro *</h3>
          </div>
          <Controller
            name="specialization_intro"
            control={control}
            rules={{ required: "Specialization intro is required" }}
            render={({ field }) => (
              <div>
                <SafeCKEditor value={field.value || ""} onChange={(value) => {
                  field.onChange(value);
                  if (value && value.trim()) {
                    clearErrors("specialization_intro");
                  }
                }} />
                {errors.specialization_intro && (
                  <p className="text-xs text-red-500 mt-2">{errors.specialization_intro.message}</p>
                )}
              </div>
            )}
          />
        </section>

        <section className="border rounded-lg p-4 space-y-6">
          {sections.map((section, index) => (
            <div
              key={section.section_key}
              className="rounded-lg border p-4 space-y-4 bg-muted/30"
            >
              <div className="flex flex-col gap-1">
                <h3 className="font-semibold">{section.title}{section.section_key === "course_overview" && " *"}</h3>
              </div>
              <SafeCKEditor
                value={section.description}
                onChange={(value) => {
                  handleSectionDescriptionChange(index, value);
                  if (section.section_key === "course_overview" && value && value.trim()) {
                    clearErrors("course_overview");
                  }
                }}
              />
              {section.section_key === "course_overview" && errors.course_overview && (
                <p className="text-xs text-red-500 mt-2">{errors.course_overview.message}</p>
              )}

              {section.section_key === "top_recruiters" && (
                <div className="space-y-2">
                  <Label className="block mb-1 text-sm font-medium">
                    Placement / Hiring Partners
                  </Label>
                  <MultiSelect
                    value={selectedPlacementPartners}
                    onChange={(e) => setSelectedPlacementPartners(e.value || [])}
                    options={placementPartners}
                    optionLabel="name"
                    optionValue="id"
                    placeholder="Select placement partners"
                    filter
                    display="chip"
                    maxSelectedLabels={-1}
                    className="w-full"
                    panelClassName="max-h-60"
                  />
                  {selectedPlacementPartnersDisplay.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {selectedPlacementPartnersDisplay.map((partner) => (
                        <div
                          key={partner.id}
                          className="group flex items-center gap-2 rounded-md border bg-card px-3 py-2 text-sm shadow-sm"
                        >
                          <span className="font-medium">{partner.name}</span>
                          <button
                            type="button"
                            className="ml-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground transition hover:bg-destructive hover:text-destructive-foreground"
                            onClick={() => {
                              setSelectedPlacementPartners((prev) =>
                                prev.filter((id) => Number(id) !== Number(partner.id))
                              );
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {section.supportsImage && (
                <div className="space-y-2">
                  <Label>Section Image</Label>
                  {(section.imagePreview || section.existingImage) && !section.imageRemoved && (
                    <img
                      src={section.imagePreview || buildAssetUrl(section.existingImage)}
                      alt={`${section.title} visual`}
                      className="h-28 object-contain rounded border"
                    />
                  )}
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      handleSectionImageChange(index, file || null);
                    }}
                  />
                  {(section.imagePreview || section.existingImage) && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => removeSectionImage(index)}
                    >
                      <Trash className="h-4 w-4 mr-1" />
                      Remove Image
                    </Button>
                  )}
                  {section.imageRemoved && (
                    <p className="text-xs text-muted-foreground">
                      Image will be removed on save.
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </section>

        <div className="border rounded-lg p-4 space-y-4">
          <div>
            <h3 className="text-lg font-semibold">FAQs</h3>
          </div>
          <SpecializationFaqInlinePanel
            specializationId={specializationId}
            specializationName={watch("name")}
            stagedFaqs={stagedFaqs}
            setStagedFaqs={setStagedFaqs}
          />
        </div>

        {/* Action Buttons Spacer */}
        <div className="h-20"></div>
      </form>
      
      <FormActionButtons
        isEdit={isEdit}
        isSubmitting={isSubmitting}
        isLoading={mutation.isLoading}
        onSave={handleSave}
        onCancel={onCancel}
        saveButtonText="Save Specialization"
      />
    </div>
  );
}
