"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { Controller, useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createUniversityCourse,
  updateUniversityCourseApi,
  fetchAllUniversities,
  fetchUniversityCourseById,
  fetchUniversityCourseBySlugs,
  fetchFeeTypes,
  addUniversityCourseFaq,
} from "@/lib/universityApi";
import { fetchAllCourseImages } from "@/lib/menuApi";
import { notifySuccess, notifyError } from "@/lib/notify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Trash, Plus, Check } from "lucide-react";
import { Dropdown } from "primereact/dropdown";
import UniversityFaqInlinePanel from "@/components/university-faq/InlineFaqPanel";
import { SectionsForm } from "@/components/universities/components/SectionRenderer";
import { processSectionFiles } from "@/utils/fileProcessing";

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
  name: "",
  slug: "",
  h1Tag: "",
  meta_title: "",
  meta_description: "",
  duration: "",
  emi_duration: "",
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

const normalizeApiList = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  return [];
};

const buildAssetUrl = (value) => {
  if (!value) return null;
  // Handle objects - extract image path if it's an object
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

const getFileName = (path) => {
  if (!path) return "";
  const segments = path.split("/");
  return segments[segments.length - 1];
};

const FILE_FIELDS = ["syllabus_file", "brochure_file"];

const createNewBanner = () => ({
  banner_key: `banner_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  banner_image: null,
  video_id: "",
  video_title: "",
  previewBanner: null,
  existingBanner: null,
  bannerRemoved: false,
});

// Filter out unwanted sections for course sections
const defaultSections = [
    {
      id: "latest-updates",
      section_key: "Latest_Updates",
      title: "Latest Updates",
      component: "UniversityLatestUpdate",
      props: {
        content: "",
      },
    },
    {
      id: "about",
      section_key: "About_University",
      title: "About University Course",
      component: "UniversityDesc",
      props: {
        content: "",
        videoID: "",
        videoTitle: "",
      },
    },
    {
      id: "why-choose",
      section_key: "Why_Choose",
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
      section_key: "Key_Highlights",
      title: "Key Highlights of Course",
      component: "UniversityKeyBenefits",
      props: {
        content: "",
      },
    },
    {
      id: "eligibility-criteria",
      section_key: "eligibility_criteria",
      title: "Eligibility Criteria / Who can Enroll",
      component: "UniversityEligibilityCriteria",
      props: {
        content: "",
      },
    },
    {
      id: "university-Emi",
      section_key: "University_Emi",
      title: "EMI & Financial Support",
      component: "UniversityEmi",
      props: {
        content: "",
        emiPartners: "Yes",
      },
    },
    {
      id: "scholarship-program",
      section_key: "Scholarships_Program",
      title: "Scholarships",
      component: "UniversityScholarship",
      props: {
        content: "",
      },
    },
    {
      id: "syllabus-curriculum",
      section_key: "syllabus_curriculum",
      title: "Syllabus / Curriculum",
      component: "UniversitySyllabus",
      props: {
        content: "",
      },
    },
    {
      id: "university-lms",
      section_key: "Learning_Management_SystemLMS",
      title: "LMS & Study Materials",
      component: "UniversityLMS",
      props: {
        content: "",
      },
    },
    {
      id: "admission-process",
      section_key: "Admission_Process",
      title: "Admission Process",
      component: "UniversityAdmissionProcess",
      props: { image: "", content: "" },
    },
    {
      id: "university-examination",
      section_key: "Examination_Pattern",
      title: "Examination",
      component: "UniversityExamination",
      props: {
        content: "",
      },
    },
    {
      id: "job-opportunities",
      section_key: "job_opportunities",
      title: "Job Opportunities",
      component: "UniversityJobOpportunities",
      props: {
        content: "",
      },
    },
    {
      id: "university-faculties",
      section_key: "University_Faculties",
      title: "Faculty",
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
      id: "university-reviews",
      section_key: "Student_Ratings",
      title: "Student Reviews",
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

    // {
    //   id: "fees-detail",
    //   section_key: "fee_details",
    //   title: "Fee Details",
    //   component: "UniversityFeeDetail",
    //   props: {
    //     content: "",
    //   },
    // },   
    // {
    //   id: "popular-courses",
    //   section_key: "popular_courses",
    //   title: "Popular Courses",
    //   component: "UniversityCourses",
    //   props: {
    //     coursesList: "Yes",
    //   },
    // }, 
    // {
    //   id: "Other-Popular-Universities",
    //   section_key: "other_popular_universities",  
    //   title: "Other Popular Universities",
    //   component: "UniversityOtherPopularColleges",
    //   props: {
    //     otherUniversityList: "Yes",
    //   },
    // },   
    // {
    //   id: "university-faq",
    //   section_key: "faqs",
    //   title: "Faqs",
    //   component: "UniversityFaq",
    //   props: {
    //     faqData: "Yes",
    //   },
    // },
].filter(
  (section) =>
    section.id !== "approval-logo" &&
    section.id !== "sample-certificate" &&
    section.id !== "placement-detail" &&
    section.id !== "popular-courses" &&
    section.id !== "Other-Popular-Universities" 
);

export default function AddUniversityCourseForm({ course, onCancel, onSuccess }) {
  useScrollToTop();
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
        section_key: section.section_key,
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
  const [brochureFile, setBrochureFile] = useState(null);
  const [feeKeyLookup, setFeeKeyLookup] = useState({});
  const [feeLabelLookup, setFeeLabelLookup] = useState({});
  const [banners, setBanners] = useState([]);
  const [saveWithoutDate, setSaveWithoutDate] = useState(false);
  const [stagedFaqs, setStagedFaqs] = useState([]);
  const [sectionPreviews, setSectionPreviews] = useState({});

  const {
    data: universitiesResponse,
    isLoading: isLoadingUniversities,
  } = useQuery({
    queryKey: ["universities", "all"],
    queryFn: fetchAllUniversities,
  });

  const {
    data: courseImagesResponse,
    isLoading: isLoadingCourseImages,
  } = useQuery({
    queryKey: ["course-images", "all"],
    queryFn: fetchAllCourseImages,
  });

  const courseImages = useMemo(() => {
    return normalizeApiList(courseImagesResponse?.data || []);
  }, [courseImagesResponse]);

  // Sync course_thumbnail value when courseImages are loaded (for editing)
  useEffect(() => {
    if (course?.course_thumbnail && courseImages.length > 0) {
      const thumbnailPath = course.course_thumbnail && !course.course_thumbnail.includes('banners')
        ? course.course_thumbnail
        : null;
      
      if (thumbnailPath) {
        // Normalize paths for matching
        const normalizePath = (path) => {
          if (!path) return "";
          return String(path).replace(/^\/+|\/+$/g, "");
        };
        const valPath = normalizePath(thumbnailPath);
        
        // Check if the thumbnail exists in courseImages
        const exists = courseImages.some((img) => {
          const imgPath = normalizePath(img.image);
          return imgPath === valPath || img.image === thumbnailPath;
        });
        
        if (exists) {
          setValue("course_thumbnail", thumbnailPath);
          setPreviewCourseThumbnail(buildAssetUrl(thumbnailPath));
          setThumbnailRemoved(false);
        }
      }
    }
  }, [courseImages, course, setValue]);

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
        h1Tag: merged.h1Tag || "",
        meta_title: merged.meta_title || "",
        meta_description: merged.meta_description || "",
        duration: merged.duration ?? "",
        emi_duration: merged.emi_duration ?? "",
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

      const bannersArray = merged.banners || [];
      
      const loadedBanners = (Array.isArray(bannersArray) ? bannersArray : []).map((banner, idx) => {
        const bannerImage = banner.banner_image || null;
        return {
          banner_key: banner.banner_key || `banner_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          banner_image: bannerImage, // Keep original banner_image field
          video_id: (banner.video_id && banner.video_id.trim()) || "",
          video_title: (banner.video_title && banner.video_title.trim()) || "",
          previewBanner: bannerImage ? buildAssetUrl(bannerImage) : null, // Only set preview if there's an existing image
          existingBanner: bannerImage, // Set existingBanner from banner_image
          bannerRemoved: false,
        };
      });

      if (loadedBanners.length === 0) {
        loadedBanners.push(createNewBanner());
      }

      setBanners(loadedBanners);

      // Filter out banner images - only use thumbnail images
      const thumbnailPath = merged.course_thumbnail && !merged.course_thumbnail.includes('banners')
        ? merged.course_thumbnail
        : null;
      
      if (thumbnailPath) {
        setPreviewCourseThumbnail(buildAssetUrl(thumbnailPath));
        setThumbnailRemoved(false);
        setValue("course_thumbnail", thumbnailPath);
      } else {
        setPreviewCourseThumbnail(null);
        setThumbnailRemoved(false);
        setValue("course_thumbnail", "");
      }

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
        loadedSections = sectionsArray.map((section) => ({
          id: section.id,
          section_key: section.section_key || generateSectionKey(section.title),
          title: section.title || "",
          component: section.component || "",
          props: section.props || {},
        }));
      } else {
        // If no sections from backend, initialize with defaultSections
        loadedSections = defaultSections.map((section) => ({
          id: section.id,
          section_key: section.section_key || generateSectionKey(section.title),
          title: section.title,
          component: section.component,
          props: { ...section.props },
        }));
      }
      
      setValue("sections", loadedSections);

      // Set section previews recursively for images (similar to university form)
      if (loadedSections.length > 0) {
        const newPreviews = {};
        loadedSections.forEach((section, sIndex) => {
          // Helper function to join URL without double slashes
          const joinURL = (base, path) => {
            const baseClean = base?.replace(/\/+$/, "") || "";
            const pathClean = path?.replace(/^\/+/, "") || "";
            return `${baseClean}/${pathClean}`;
          };

          // Recursive function to set previews for all image fields in props
          const setPreviewsRecursive = (obj, basePath) => {
            if (!obj || typeof obj !== "object") return;
            
            Object.entries(obj).forEach(([key, val]) => {
              const fieldName = `${basePath}.${key}`;
              
              // Check if this is an image field with a value
              if (
                (key.toLowerCase().includes("img") ||
                  key.toLowerCase().includes("logo") ||
                  key.toLowerCase().includes("image") ||
                  key.toLowerCase().includes("sample")) &&
                typeof val === "string" &&
                val.trim() !== ""
              ) {
                // Build preview URL
                if (val.startsWith("http://") || val.startsWith("https://")) {
                  newPreviews[fieldName] = val;
                } else {
                  newPreviews[fieldName] = joinURL(process.env.NEXT_PUBLIC_thumbnail_URL, val);
                }
              }
              
              // Recursively process arrays and nested objects
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
    if (course && course.id) {
      applyCourseData(course);
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
      
      // Initialize sections with defaultSections for new courses
      const currentSections = getValues("sections") || [];
      if (currentSections.length === 0) {
        setValue("sections", defaultSections.map((section) => ({
          id: section.id,
          section_key: section.section_key || generateSectionKey(section.title),
          title: section.title,
          component: section.component,
          props: { ...section.props },
        })));
      }
    }
  }, [course, courseId, feeTypeDefaults, feeTypeMeta, getValues, setValue, banners.length]);

  const { data: fetchedCourse, isLoading: isLoadingCourse, error: fetchError } = useQuery({
    queryKey: ["university-course", courseId, course?.slug, course?.university_slug],
    queryFn: async () => {
      if (!courseId) return null;
      const courseSlug = course?.slug;
      const universitySlug = course?.university_slug;

      if (courseSlug && universitySlug) {
        return fetchUniversityCourseBySlugs(universitySlug, courseSlug);
      }

      // Fallback to ID-based fetch if slug information is missing
      return fetchUniversityCourseById(courseId);
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

      // Handle course_thumbnail as selected image path (not a file)
      if (key === "course_thumbnail") {
        if (thumbnailRemoved) {
          formData.append(key, "");
        } else if (value && typeof value === "string") {
          formData.append(key, value);
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
          video_id: (banner.video_id && banner.video_id.trim()) || null,
          video_title: (banner.video_title && banner.video_title.trim()) || null,
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

    // Handle sections with section_key generation
    // Use getValues() to get raw form values (preserves FileList objects)
    const formSections = getValues("sections") || [];
    
    // Prepare sections with section_key generation
    const sectionsWithKeys = formSections.map((section) => ({
      id: section.id,
      section_key: section.section_key || generateSectionKey(section.title || ""),
      title: section.title || "",
      component: section.component || "",
      props: section.props || {},
    }));
    
    // Process section files using shared utility
    const processedSections = processSectionFiles(sectionsWithKeys, formData, generateSectionKey);

    formData.append("sections", JSON.stringify(processedSections));

    if (thumbnailRemoved) {
      formData.append("course_thumbnail", "");
    }

    if (syllabusRemoved) {
      formData.append("syllabus_file", "__REMOVE__");
    }

    // Handle brochure file at course level
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
  };

  const handleThumbnailChange = (selectedImagePath) => {
    if (selectedImagePath) {
      setValue("course_thumbnail", selectedImagePath);
      setPreviewCourseThumbnail(buildAssetUrl(selectedImagePath));
      setThumbnailRemoved(false);
    } else {
      setValue("course_thumbnail", null);
      setPreviewCourseThumbnail(null);
      setThumbnailRemoved(true);
    }
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
              <Input {...register("slug")} placeholder="Enter course slug" />
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

          <div className="space-y-2">
            <Label>Meta Title</Label>
            <Input
              {...register("meta_title", { 
                maxLength: { value: 60, message: "Meta title must be 60 characters or less" }
              })}
              placeholder="SEO Meta Title (max 60 character)"
            />
            {errors.meta_title && (
              <p className="text-sm text-red-500">{errors.meta_title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Meta Description</Label>
            <textarea
              {...register("meta_description", { 
              })}
              placeholder="SEO Meta Des (max 160 character)"
              className="w-full border rounded px-3 py-2 h-17"
            />
            {errors.meta_description && (
              <p className="text-sm text-red-500">{errors.meta_description.message}</p>
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
              <Label>Course Duration (Years/Months)</Label>
              <Input {...register("duration")} placeholder="e.g. 2 Years" />
            </div>
            <div className="space-y-2">
              <Label>EMI Duration (In Months)</Label>
              <Input 
                type="number" 
                {...register("emi_duration", {
                  validate: (value) => {
                    if (value === "" || value === null || value === undefined) return true;
                    const numValue = Number(value);
                    if (isNaN(numValue)) return true;
                    return Number.isInteger(numValue) || "Must be an integer";
                  }
                })} 
                placeholder="e.g. 24" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Course Thumbnail</Label>
              <Controller
                name="course_thumbnail"
                control={control}
                render={({ field }) => {
                  // Filter out banner images from the value if it exists
                  const isBannerImage = field.value && typeof field.value === 'string' && field.value.includes('banners');
                  
                  // Update field value if it was a banner image
                  if (isBannerImage) {
                    if (field.value) {
                      setTimeout(() => {
                        field.onChange(null);
                        handleThumbnailChange("");
                      }, 0);
                    }
                    return (
                      <div className="space-y-2">
                        <Dropdown
                          value={null}
                          onChange={(e) => {
                            field.onChange(e.value);
                            handleThumbnailChange(e.value);
                          }}
                          options={courseImages}
                          optionLabel="name"
                          optionValue="image"
                          placeholder="Select a course image"
                          filter
                          className="w-full"
                          panelClassName="max-h-60"
                          itemTemplate={(option) => {
                            if (!option) return null;
                            return (
                              <div className="flex items-center gap-3 p-2">
                                <img
                                  src={buildAssetUrl(option.image)}
                                  alt={option.name}
                                  className="h-10 w-10 object-contain rounded border"
                                />
                                <span>{option.name}</span>
                              </div>
                            );
                          }}
                          valueTemplate={() => <span className="text-muted-foreground">Select a course image</span>}
                          disabled={isLoadingCourseImages}
                          showClear
                        />
                        <p className="text-sm text-amber-600">Previous selection was a banner image. Please select a thumbnail image.</p>
                      </div>
                    );
                  }
                  
                  // Normalize paths for comparison (remove leading/trailing slashes)
                  const normalizePath = (path) => {
                    if (!path) return "";
                    return String(path).replace(/^\/+|\/+$/g, "");
                  };
                  
                  const currentValue = field.value;
                  const selectedImage = currentValue
                    ? courseImages.find((img) => {
                        const imgPath = normalizePath(img.image);
                        const valPath = normalizePath(currentValue);
                        return imgPath === valPath || img.image === currentValue || currentValue === img.image;
                      })
                    : null;
                  
                  return (
                    <div className="space-y-2">
                      <Dropdown
                        value={typeof field.value === 'string' ? field.value : (field.value?.image || null)}
                        onChange={(e) => {
                          const value = typeof e.value === 'string' ? e.value : (e.value?.image || null);
                          field.onChange(value);
                          handleThumbnailChange(value);
                        }}
                        options={courseImages}
                        optionLabel="name"
                        optionValue="image"
                        placeholder="Select a course image"
                        filter
                        className="w-full"
                        panelClassName="max-h-60"
                        itemTemplate={(option) => {
                          if (!option) return null;
                          const normalizePath = (path) => {
                            if (!path) return "";
                            return String(path).replace(/^\/+|\/+$/g, "");
                          };
                          const currentValue = typeof field.value === 'string' ? field.value : (field.value?.image || null);
                          const isSelected = currentValue && (
                            normalizePath(option.image) === normalizePath(currentValue) ||
                            option.image === currentValue ||
                            currentValue === option.image
                          );
                          return (
                            <div className="flex items-center gap-3 p-2">
                              <img
                                src={buildAssetUrl(option.image)}
                                alt={option.name}
                                className="h-10 w-10 object-contain rounded border"
                              />
                              <span className="flex-1">{option.name}</span>
                              {isSelected && (
                                <Check className="h-4 w-4 text-green-600" />
                              )}
                            </div>
                          );
                        }}
                        valueTemplate={(selectedValue) => {
                          if (!selectedValue) return <span className="text-muted-foreground">Select a course image</span>;
                          
                          // Handle case where selectedValue might be an object
                          const imagePath = typeof selectedValue === 'string' 
                            ? selectedValue 
                            : (selectedValue?.image || selectedValue);
                          
                          if (!imagePath || typeof imagePath !== 'string') {
                            return <span className="text-muted-foreground">Select a course image</span>;
                          }
                          
                          // Normalize paths for comparison
                          const normalizePath = (path) => {
                            if (!path) return "";
                            return String(path).replace(/^\/+|\/+$/g, "");
                          };
                          
                          const valPath = normalizePath(imagePath);
                          const img = courseImages.find((i) => {
                            const imgPath = normalizePath(i.image);
                            return imgPath === valPath || i.image === imagePath || imagePath === i.image;
                          });
                          
                          // Always show image if value exists, even if not in courseImages list
                          return (
                            <div className="flex items-center gap-2">
                              <img
                                src={buildAssetUrl(img?.image || imagePath)}
                                alt={img?.name || "Selected Image"}
                                className="h-6 w-6 object-contain rounded"
                              />
                              <span>{img?.name || "Selected Image"}</span>
                            </div>
                          );
                        }}
                        disabled={isLoadingCourseImages}
                        showClear
                      />
                      {isLoadingCourseImages && (
                        <p className="text-sm text-muted-foreground">Loading course images...</p>
                      )}
                    </div>
                  );
                }}
              />
            </div>
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
                        // step="0.01"
                        // min="0"
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
            courseId={courseId}
            courseName={watch("name")}
            stagedFaqs={stagedFaqs}
            setStagedFaqs={setStagedFaqs}
            type="course"
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
                  : "Create Course"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
