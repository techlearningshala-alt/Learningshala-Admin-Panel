"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createUniversityCourseSpecialization,
  updateUniversityCourseSpecialization,
  fetchAllUniversities,
  fetchUniversityCourses,
  fetchUniversityCourseSpecializationById,
  fetchFeeTypes,
} from "@/lib/universityApi";
import { notifySuccess, notifyError } from "@/lib/notify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Trash, Plus } from "lucide-react";
import { SectionsForm } from "@/components/universities/components/SectionRenderer";
import { processSectionFiles } from "@/utils/fileProcessing";
import UniversityFaqInlinePanel from "@/components/university-faq/InlineFaqPanel";
import {
  addUniversityCourseSpecializationFaq,
} from "@/lib/universityApi";

// Helper function to convert title to section_key format with underscores
const generateSectionKey = (title) => {
  return String(title || "")
    .trim()
    .replace(/\s+/g, "_") // Replace spaces with underscores
    .replace(/[^a-zA-Z0-9_]/g, ""); // Remove special characters except underscores
};

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
  university_course_id: "",
  name: "",
  slug: "",
  h1Tag: "",
  duration: "",
  label: "",
  author_name: "",
  is_active: true,
  is_page_created: true,
  course_banner: null,
  brochure_file: null,
  course_thumbnail: null,
  syllabus_file: null,
  video_id: "",
  video_title: "",
  fee_type_values: {},
  sections: [], // Will be initialized with defaultSections in useEffect
};

// Filter out unwanted sections for specialization sections
const defaultSections = [
  {
    id: "latest-updates",
    title: "Latest Updates",
    component: "UniversityLatestUpdate",
    props: {
      content: "",
    },
  },
  {
    id: "about",
    title: "About University",
    component: "UniversityDesc",
    props: {
      content: "",
      videoID: "",
      videoTitle: "",
    },
  },
  {
    id: "why-choose",
    title: "Why Choose",
    component: "UniversityWhyChoose",
    props: {
      content: "",
      gridContent: [
        {
          title: "",
          content: "",
          bgColor: "#f0f8ff",
        },
        {
          title: "",
          content: "",
          bgColor: "#fff8dc",
        },
        {
          title: "",
          content: "",
          bgColor: "#f0fff0",
        },
      ],
    },
  },
  {
    id: "key-benefits",
    title: "Key Highlights",
    component: "UniversityKeyBenefits",
    props: {
      content: "",
    },
  },
  {
    id: "admission-process",
    title: "Admission Process",
    component: "UniversityAdmissionProcess",
    props: { image: "", content: "" },
  },
  {
    id: "fees-detail",
    title: "Fee Details",
    component: "UniversityFeeDetail",
    props: {
      content: "",
    },
  },
  {
    id: "scholarship-program",
    title: "Scholarships Program",
    component: "UniversityScholarship",
    props: {
      content: "",
    },
  },
  {
    id: "university-faculties",
    title: "University Faculties",
    component: "UniversityFaculties",
    props: {
      faculties: [
        {
          name: "",
          img: "",
          designation: "",
          desc: "",
          "faculty Qualification": "",
        },
      ],
    },
  },
  {
    id: "university-Emi",
    title: "University Emi",
    component: "UniversityEmi",
    props: {
      content: "",
      emiPartners: "Yes",
    },
  },
  {
    id: "popular-courses",
    title: "Popular Courses",
    component: "UniversityCourses",
    props: {
      coursesList: "Yes",
    },
  },
  {
    id: "university-reviews",
    title: "Student Ratings",
    component: "UniversityReviews",
    props: {
      allReviews: [
        {
          name: "",
          "rating (1-5)": "",
          value: "",
          reviewContent: "",
        },
      ],
    },
  },
  {
    id: "Other-Popular-Universities",
    title: "Other Popular Universities",
    component: "UniversityOtherPopularColleges",
    props: {
      otherUniversityList: "Yes",
    },
  },
  {
    id: "university-lms",
    title: "Learning Management System(LMS)",
    component: "UniversityLMS",
    props: {
      content: "",
    },
  },
  {
    id: "university-examination",
    title: "Examination Pattern",
    component: "UniversityExamination",
    props: {
      content: "",
    },
  },
  {
    id: "university-faq",
    title: "Faqs",
    component: "UniversityFaq",
    props: {
      faqData: "Yes",
    },
  },
].filter(
  (section) =>
    section.id !== "approval-logo" &&
    section.id !== "sample-certificate" &&
    section.id !== "placement-detail" &&
    section.id !== "popular-courses" &&
    section.id !== "Other-Popular-Universities"
);

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

export default function AddUniversityCourseSpecializationForm({ specialization, onCancel, onSuccess }) {
  const queryClient = useQueryClient();
  
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
    defaultValues: {
      ...defaultValues,
      sections: defaultSections.map((section) => ({
        id: section.id,
        section_key: generateSectionKey(section.title),
        title: section.title,
        component: section.component,
        props: { ...section.props },
      })),
    },
  });

  useEffect(() => {
    register("is_active");
    register("is_page_created");
  }, [register]);

  const specializationId = specialization?.id;
  const isEdit = Boolean(specializationId);

  const [previewCourseThumbnail, setPreviewCourseThumbnail] = useState(null);
  const [thumbnailRemoved, setThumbnailRemoved] = useState(false);
  const [syllabusRemoved, setSyllabusRemoved] = useState(false);
  const [existingSyllabus, setExistingSyllabus] = useState(null);
  const [syllabusFileName, setSyllabusFileName] = useState("");
  const [brochureRemoved, setBrochureRemoved] = useState(false);
  const [existingBrochure, setExistingBrochure] = useState(null);
  const [brochureFileName, setBrochureFileName] = useState("");
  const [brochureFile, setBrochureFile] = useState(null);
  const [feeKeyLookup, setFeeKeyLookup] = useState({});
  const [feeLabelLookup, setFeeLabelLookup] = useState({});
  const [banners, setBanners] = useState([]);
  const [saveWithoutDate, setSaveWithoutDate] = useState(false);
  const [stagedFaqs, setStagedFaqs] = useState([]);
  const [sectionPreviews, setSectionPreviews] = useState({});
  const [selectedUniversity, setSelectedUniversity] = useState("");

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

  const watchedUniversityId = watch("university_id");
  
  const universityIdForQuery = useMemo(() => {
    return selectedUniversity || watchedUniversityId || "";
  }, [selectedUniversity, watchedUniversityId]);

  const {
    data: coursesResponse,
    isLoading: isLoadingCourses,
  } = useQuery({
    queryKey: ["university-courses", "options", universityIdForQuery],
    queryFn: () =>
      fetchUniversityCourses({
        page: 1,
        limit: 200,
        university_id: universityIdForQuery || undefined,
      }),
    enabled: Boolean(universityIdForQuery),
    refetchOnMount: true,
  });

  const courses = useMemo(() => {
    return normalizeApiList(coursesResponse?.data?.data ?? coursesResponse?.data ?? coursesResponse);
  }, [coursesResponse]);

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

  const applySpecializationData = useCallback(
    (source) => {
      if (!source) {
        return;
      }

      console.log("🔍 [SPECIALIZATION FORM] Applying data:", source);
      console.log("🔍 [SPECIALIZATION FORM] Banners:", source.banners);
      console.log("🔍 [SPECIALIZATION FORM] Sections:", source.sections);

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
        university_course_id: merged.university_course_id ? String(merged.university_course_id) : "",
        name: merged.name || "",
        slug: merged.slug || "",
        h1Tag: merged.h1Tag || "",
        duration: merged.duration ?? "",
        label: merged.label ?? "",
        author_name: merged.author_name ?? "",
        is_active: merged.is_active !== undefined ? Boolean(merged.is_active) : true,
        is_page_created: merged.is_page_created !== undefined ? Boolean(merged.is_page_created) : true,
        course_thumbnail: null,
        syllabus_file: null,
        fee_type_values: feeMap,
      });

      setFeeKeyLookup(keyMap);
      setFeeLabelLookup(labelMap);

      if (merged.university_id) {
        setSelectedUniversity(String(merged.university_id));
      }

      const bannersArray = merged.banners || [];

      const loadedBanners = (Array.isArray(bannersArray) ? bannersArray : []).map((banner, idx) => {
        const bannerImage = banner.banner_image || null;
        return {
          banner_key: banner.banner_key || `banner_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          banner_image: bannerImage,
          video_id: (banner.video_id && typeof banner.video_id === "string" && banner.video_id.trim()) || "",
          video_title: (banner.video_title && typeof banner.video_title === "string" && banner.video_title.trim()) || "",
          previewBanner: bannerImage ? buildAssetUrl(bannerImage) : null,
          existingBanner: bannerImage,
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
      setBrochureFile(null);
      setBrochureRemoved(false);

      // Load sections if available, otherwise use defaultSections
      const sectionsArray = Array.isArray(merged.sections) ? merged.sections : [];
      let loadedSections = [];

      if (sectionsArray.length > 0) {
        loadedSections = sectionsArray.map((section) => {
          // Parse props if it's a JSON string
          let parsedProps = section.props || {};
          if (typeof section.props === "string") {
            try {
              parsedProps = JSON.parse(section.props);
            } catch (e) {
              console.error("Error parsing section props:", e);
              parsedProps = {};
            }
          }
          
          return {
            id: section.id,
            section_key: section.section_key || generateSectionKey(section.title),
            title: section.title || "",
            component: section.component || "",
            props: parsedProps,
          };
        });
      } else {
        loadedSections = defaultSections.map((section) => ({
          id: section.id,
          section_key: generateSectionKey(section.title),
          title: section.title,
          component: section.component,
          props: { ...section.props },
        }));
      }

      setValue("sections", loadedSections);

      // Set section previews recursively for images
      if (loadedSections.length > 0) {
        const newPreviews = {};
        loadedSections.forEach((section, sIndex) => {
          const joinURL = (base, path) => {
            const baseClean = base?.replace(/\/+$/, "") || "";
            const pathClean = path?.replace(/^\/+/, "") || "";
            return `${baseClean}/${pathClean}`;
          };

          const setPreviewsRecursive = (obj, basePath) => {
            if (!obj || typeof obj !== "object") return;

            Object.entries(obj).forEach(([key, val]) => {
              const fieldName = `${basePath}.${key}`;

              if (
                (key.toLowerCase().includes("img") ||
                  key.toLowerCase().includes("logo") ||
                  key.toLowerCase().includes("image") ||
                  key.toLowerCase().includes("sample")) &&
                typeof val === "string" &&
                val.trim() !== ""
              ) {
                if (val.startsWith("http://") || val.startsWith("https://")) {
                  newPreviews[fieldName] = val;
                } else {
                  newPreviews[fieldName] = joinURL(process.env.NEXT_PUBLIC_thumbnail_URL, val);
                }
              }

              if (Array.isArray(val)) {
                val.forEach((item, idx) => {
                  if (item && typeof item === "object") {
                    setPreviewsRecursive(item, `${fieldName}.${idx}`);
                  }
                });
              } else if (val && typeof val === "object") {
                setPreviewsRecursive(val, fieldName);
              }
            });
          };

          if (section.props) {
            setPreviewsRecursive(section.props, `sections.${sIndex}.props`);
          }
        });

        setSectionPreviews(newPreviews);
      }
    },
    [reset, feeTypeDefaults, feeTypeMeta, setValue, setSectionPreviews]
  );

  useEffect(() => {
    if (specialization && specialization.id) {
      applySpecializationData(specialization);
    }
    if (specializationId) {
      setStagedFaqs([]);
    }
  }, [specialization, specializationId, applySpecializationData]);

  useEffect(() => {
    setSaveWithoutDate(false);
  }, [isEdit]);

  useEffect(() => {
    if (!specialization && !specializationId) {
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
      setBrochureFile(null);
      setBrochureRemoved(false);

      const currentSections = getValues("sections") || [];
      if (currentSections.length === 0) {
        setValue("sections", defaultSections.map((section) => ({
          id: section.id,
          section_key: generateSectionKey(section.title),
          title: section.title,
          component: section.component,
          props: { ...section.props },
        })));
      }
    }
  }, [specialization, specializationId, feeTypeDefaults, feeTypeMeta, getValues, setValue, banners.length]);

  const { data: fetchedSpecialization, isLoading: isLoadingSpecialization, error: fetchError } = useQuery({
    queryKey: ["university-course-specialization", specializationId],
    queryFn: () => {
      const slug = specialization?.slug || specialization?.id?.toString() || specializationId?.toString();
      return fetchUniversityCourseSpecializationById(slug);
    },
    enabled: Boolean(specializationId),
  });

  useEffect(() => {
    if (fetchedSpecialization && fetchedSpecialization.id) {
      applySpecializationData(fetchedSpecialization);
    }
  }, [fetchedSpecialization, isLoadingSpecialization, fetchError, specializationId, applySpecializationData]);

  const persistStagedFaqs = async (newSpecializationId) => {
    if (!stagedFaqs.length || !newSpecializationId) return;

    for (const faq of stagedFaqs) {
      try {
        await addUniversityCourseSpecializationFaq({
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
    queryClient.invalidateQueries(["university-course-specialization-faq-inline", newSpecializationId]);
    notifySuccess("Staged FAQs saved successfully.");
  };

  const mutation = useMutation({
    mutationFn: async (formData) => {
      if (specializationId) {
        return updateUniversityCourseSpecialization(specializationId, formData);
      }
      return createUniversityCourseSpecialization(formData);
    },
    onSuccess: async (response) => {
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

      notifySuccess(`University course specialization ${isEdit ? "updated" : "created"} successfully`);
      onSuccess?.();
    },
    onError: (err) => {
      notifyError(err?.response?.data?.message || "Failed to save specialization");
    },
  });

  const submitSpecialization = (data) => {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      // Skip these keys - they're handled separately
      if (key === "fee_type_values" || key === "sections" || key === "banners") return;

      if (FILE_FIELDS.includes(key)) {
        if (value instanceof FileList && value.length > 0) {
          formData.append(key, value[0]);
        }
        return;
      }

      if (key === "is_active" || key === "is_page_created") {
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

    // Process banners
    const bannersData = banners
      .filter((b) => {
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
          video_id: (banner.video_id && banner.video_id.trim()) || null,
          video_title: (banner.video_title && banner.video_title.trim()) || null,
        };

        if (banner.bannerRemoved && (banner.existingBanner || banner.banner_image)) {
          bannerData.banner_image = "__REMOVE__";
        } else if (banner.previewBanner && !banner.existingBanner && !banner.banner_image) {
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

    // Handle sections with section_key generation
    const formSections = getValues("sections") || [];

    const sectionsWithKeys = formSections.map((section) => ({
      id: section.id,
      section_key: section.section_key || generateSectionKey(section.title || ""),
      title: section.title || "",
      component: section.component || "",
      props: section.props || {},
    }));

    const processedSections = processSectionFiles(sectionsWithKeys, formData, generateSectionKey);

    formData.append("sections", JSON.stringify(processedSections));

    if (thumbnailRemoved) {
      formData.append("course_thumbnail", "");
    }

    if (syllabusRemoved) {
      formData.append("syllabus_file", "__REMOVE__");
    }

    // Handle brochure file at specialization level
    if (brochureRemoved && existingBrochure) {
      formData.append("brochure_file", "__REMOVE__");
    } else if (brochureFile) {
      // New file selected - append it
      formData.append("brochure_file", brochureFile);
    } else if (existingBrochure && !brochureRemoved) {
      // Keep existing file
      formData.append("brochure_file", existingBrochure);
    }

    if (isEdit) {
      const saveWithDate = !saveWithoutDate;
      formData.append("saveWithDate", saveWithDate ? "true" : "false");
    }

    mutation.mutate(formData);
  };

  const handleSave = () => {
    handleSubmit((formValues) => submitSpecialization(formValues))();
  };

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
          {isEdit ? "Edit University Course Specialization" : "Add University Course Specialization"}
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
                value={selectedUniversity || watch("university_id") || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  setSelectedUniversity(value);
                  setValue("university_id", value, {
                    shouldValidate: true,
                    shouldDirty: true,
                  });
                  setValue("university_course_id", "", {
                    shouldValidate: true,
                    shouldDirty: true,
                  });
                }}
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

          <div>
            <Label>Course</Label>
            <input
              type="hidden"
              {...register("university_course_id", { required: "Course is required" })}
            />
            {!universityIdForQuery ? (
              <p className="text-sm text-muted-foreground">Please select a university first</p>
            ) : isLoadingCourses ? (
              <p className="text-sm text-muted-foreground">Loading courses...</p>
            ) : (
              <select
                className="w-full border rounded px-3 py-2"
                value={watch("university_course_id") || ""}
                onChange={(e) =>
                  setValue("university_course_id", e.target.value, {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
                disabled={!universityIdForQuery || isLoadingCourses}
              >
                <option value="">Select course</option>
                {courses.length === 0 && !isLoadingCourses ? (
                  <option value="" disabled>No courses found for this university</option>
                ) : (
                  courses.map((c) => (
                    <option key={c.id} value={String(c.id)}>
                      {c.name}
                    </option>
                  ))
                )}
              </select>
            )}
            {errors.university_course_id && (
              <p className="text-xs text-red-500">{errors.university_course_id.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Specialization Name</Label>
              <Input
                {...register("name", { required: "Name is required" })}
                placeholder="e.g. Human Resource, Finance"
              />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Specialization Slug</Label>
              <Input {...register("slug")} placeholder="Auto-generated if left blank" />
            </div>
          </div>

        <div className="space-y-2">
          <Label>H1 Tag</Label>
          <Input
            {...register("h1Tag", { required: "H1 Tag is required" })}
            placeholder="SEO H1 tag"
          />
          {errors.h1Tag && (
            <p className="text-sm text-red-500">{errors.h1Tag.message}</p>
          )}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Course Thumbnail (size: 128x99px )</Label>
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
          </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Upload Syllabus (Max 4MB)
              </Label>
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
              <Label>Upload Brochure (Max 4MB)
              </Label>
              <Input
                type="file"
                accept=".pdf,.doc,.docx"
                name="brochure_file"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setBrochureFileName(file.name);
                    setBrochureFile(file);
                    setBrochureRemoved(false);
                  } else {
                    setBrochureFileName("");
                    setBrochureFile(null);
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
                        setBrochureFile(null);
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
                  const isFullFeeField =
                    sanitizedKey === "full_fees" || sanitizedKey === "full_fee";
                  const validationRules = {
                    valueAsNumber: true,
                  };
                  if (isFullFeeField) {
                    validationRules.validate = (value) =>
                      !Number.isNaN(value) || "Full fee is required";
                  }
                  return (
                    <div key={sanitizedKey} className="space-y-2">
                      <Label htmlFor={fieldId}>{label}</Label>
                      <Input
                        id={fieldId}
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder={`Enter ${label} amount`}
                        {...register(`fee_type_values.${sanitizedKey}`, validationRules)}
                        className="spin-none"
                      />
                      {errors?.fee_type_values?.[sanitizedKey] && (
                        <p className="text-xs text-red-500">
                          {errors.fee_type_values[sanitizedKey]?.message}
                        </p>
                      )}
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
                    <Label>Course Banner  (size: 650×480px)
                    </Label>
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

          {/* Sections */}
          <div className="border-t pt-4 mt-6">
            <h3 className="text-lg font-semibold">Sections</h3>
            <SectionsForm
              sections={watch("sections") || []}
              control={control}
              register={register}
              setValue={setValue}
              sectionPreviews={sectionPreviews}
              setSectionPreviews={setSectionPreviews}
              watch={watch}
              templates={defaultSections}
            />
          </div>
        </form>

        <div className="border-t pt-4 mt-6 pb-24">
          <UniversityFaqInlinePanel
            specializationId={specializationId}
            specializationName={watch("name")}
            stagedFaqs={stagedFaqs}
            setStagedFaqs={setStagedFaqs}
            type="specialization"
          />
        </div>

        <div className="fixed bottom-0 left-0 md:left-[200px] right-0 bg-background border-t shadow-lg z-50">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex justify-end gap-2">
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
                  : "Create Specialization"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

