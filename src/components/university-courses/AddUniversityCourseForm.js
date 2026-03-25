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
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Trash, Plus, Check, Info } from "lucide-react";
import { Dropdown } from "primereact/dropdown";
import UniversityFaqInlinePanel from "@/components/university-faq/InlineFaqPanel";
import { SectionsForm } from "@/components/universities/components/SectionRenderer";
import { processSectionFiles } from "@/utils/fileProcessing";
import FormActionButtons from "@/components/common/FormActionButtons";
import SafeCKEditor from "@/components/CKEditor";
import AuthorSelect from "@/components/common/AuthorSelect";

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
  compare_page_slug: "",
  duration: "",
  emi_duration: "",
  duration_unit: "",
  duration_schema_value: "",
  eligibility: "",
  eligibility_info: "",
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
  fees_note: "",
  credit_points: "",
  why_choose: [""],
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
    setError,
    clearErrors,
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

      // Parse duration_for_schema for form fields
      let durationUnit = "";
      let durationSchemaValue = "";
      if (merged.duration_for_schema) {
        try {
          const parsed = typeof merged.duration_for_schema === 'string' 
            ? JSON.parse(merged.duration_for_schema) 
            : merged.duration_for_schema;
          if (parsed && typeof parsed === 'object') {
            if (parsed.month && parsed.month !== "") {
              durationUnit = "months";
              durationSchemaValue = String(parsed.month);
            } else if (parsed.year && parsed.year !== "") {
              durationUnit = "years";
              durationSchemaValue = String(parsed.year);
            }
          }
        } catch (e) {
          console.error("Error parsing duration_for_schema:", e);
        }
      }

      reset({
        university_id: merged.university_id ? String(merged.university_id) : "",
        name: merged.name || "",
        slug: merged.slug || "",
        h1Tag: merged.h1Tag || "",
        meta_title: merged.meta_title || "",
        meta_description: merged.meta_description || "",
        compare_page_slug: merged.compare_page_slug || "",
        duration: merged.duration ?? "",
        emi_duration: merged.emi_duration ?? "",
        duration_unit: durationUnit,
        duration_schema_value: durationSchemaValue,
        eligibility: merged.eligibility ?? "",
        eligibility_info: merged.eligibility_info ?? "",
        label: merged.label ?? "",
        author_name: merged.author_name ?? "",
        is_active: merged.is_active !== undefined ? Boolean(merged.is_active) : true,
        is_page_created: merged.is_page_created !== undefined ? Boolean(merged.is_page_created) : true,
        course_thumbnail: null,
        syllabus_file: null,
        fee_type_values: feeMap,
        fees_note: merged.fees_note ?? "",
        credit_points: merged.credit_points ?? "",
        why_choose: Array.isArray(merged.why_choose) && merged.why_choose.length > 0 
          ? merged.why_choose 
          : [""],
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

  const submitCourse = (data, saveWithDate = true) => {
    // Validate course thumbnail when adding new
    if (!isEdit) {
      const hasThumbnail = data.course_thumbnail && data.course_thumbnail.trim() !== "";
      if (!hasThumbnail) {
        setError("course_thumbnail", {
          type: "manual",
          message: "Course thumbnail is required",
        });
        return;
      } else {
        clearErrors("course_thumbnail");
      }
    }

    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (key === "fee_type_values" || key === "duration_unit" || key === "duration_schema_value" || 
          key === "fees_note" || key === "credit_points" || key === "why_choose") return;

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

    // Format duration_for_schema as JSON object
    if (data.duration_unit && data.duration_schema_value) {
      const durationForSchema = {
        month: data.duration_unit === "months" ? data.duration_schema_value : "",
        year: data.duration_unit === "years" ? data.duration_schema_value : "",
      };
      formData.append("duration_for_schema", JSON.stringify(durationForSchema));
    } else if (data.duration_unit || data.duration_schema_value) {
      const durationForSchema = {
        month: data.duration_unit === "months" ? (data.duration_schema_value || "") : "",
        year: data.duration_unit === "years" ? (data.duration_schema_value || "") : "",
      };
      formData.append("duration_for_schema", JSON.stringify(durationForSchema));
    }

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

    // Add new fields
    if (data.fees_note !== undefined && data.fees_note !== null) {
      formData.append("fees_note", data.fees_note);
    }
    if (data.credit_points !== undefined && data.credit_points !== null && data.credit_points !== "") {
      formData.append("credit_points", String(data.credit_points));
    }
    if (data.why_choose !== undefined && Array.isArray(data.why_choose) && data.why_choose.length > 0) {
      const filtered = data.why_choose.filter(item => item && String(item).trim());
      if (filtered.length > 0) {
        formData.append("why_choose", JSON.stringify(filtered));
      }
    }

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
      formData.append("saveWithDate", saveWithDate ? "true" : "false");
    }

    mutation.mutate(formData);
  };

  const handleSave = (saveWithDate = true) => {
    handleSubmit((formValues) => submitCourse(formValues, saveWithDate))();
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30">
      {/* Header Section */}
      <div className="max-w-6xl mx-auto mb-4 mt-2">
        <div className="max-w-6xl mx-auto px-6 py-2.5">
          <div className="relative flex justify-center items-center">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onCancel} 
              className="absolute left-0 hover:bg-gray-200 hover:text-black text-black"
            >
              <ArrowLeft className="mr-2 h-2 w-2" />
              Back to List
            </Button>
            <div className="flex items-center gap-2">
              <h3 className="text-2xl font-bold text-blue-700">{isEdit ? "Edit University Course" : "Add New University Course"}</h3>
            </div>
          </div>
        </div>
      </div>

      <form 
        className="space-y-6 max-w-5xl mx-auto  px-6 pb-24"
        encType="multipart/form-data"
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
      >
        {/* University Selection */}
        <div className="bg-white rounded-lg shadow-md p-3 border border-gray-200">
          <Label className="text-base font-semibold text-gray-700 mb-1 block">University</Label>
          <input
            type="hidden"
            {...register("university_id", { required: "University is required" })}
          />
          {isLoadingUniversities ? (
            <p className="text-sm text-muted-foreground">Loading universities...</p>
          ) : (
            <select
              className="w-full border border-gray-300 rounded-md px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors bg-white text-gray-900"
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
            <p className="text-sm text-red-500 mt-1">{errors.university_id.message}</p>
          )}
        </div>

        {/* Course Information */}
        <div className="bg-white rounded-lg shadow-md p-3 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-1 pb-2 border-b border-gray-200">Course Information</h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Course Name</Label>
              <Input
                {...register("name", { required: "Name is required" })}
                placeholder="e.g. MBA"
                className="focus:border-blue-500 focus:ring-2 focus:ring-blue-200 h-7 "
              />
              {errors.name && (
                <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Course Page Slug</Label>
              <Input 
                {...register("slug", { required: "Course Page slug is required" })} 
                placeholder="Enter Page course slug"
                className="focus:border-blue-500 focus:ring-2 focus:ring-blue-200 h-7 "
              />
              {errors.slug && (
                <p className="text-sm text-red-500 mt-1">{errors.slug.message}</p>
              )}
            </div>
            <div className="space-y-2 col-span-1 md:col-span-2">
              <Label className="text-sm font-medium text-gray-700">H1 Tag</Label>
              <Input
                {...register("h1Tag", { required: "H1 Tag is required" })}
                placeholder="SEO H1 tag"
                className="focus:border-blue-500 focus:ring-2 focus:ring-blue-200 h-7 "
              />
              {errors.h1Tag && (
                <p className="text-sm text-red-500 mt-1">{errors.h1Tag.message}</p>
              )}
            </div>
            <div className="space-y-2 col-span-1 md:col-span-2">
              <Label className="text-sm font-medium text-gray-700">Meta Title</Label>
              <Input
                {...register("meta_title")}
                placeholder="SEO Meta Title (max 60 character)"
                className="focus:border-blue-500 focus:ring-2 focus:ring-blue-200 h-7 "
              />
              {errors.meta_title && (
                <p className="text-sm text-red-500 mt-1">{errors.meta_title.message}</p>
              )}
            </div>
            <div className="space-y-2 col-span-1 md:col-span-2">
              <Label className="text-sm font-medium text-gray-700">Meta Description</Label>
              <textarea
                {...register("meta_description")}
                placeholder="SEO Meta Des (max 160 character)"
                className="w-full border border-gray-300 rounded-md px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors resize-none"
                rows={3}
              />
              {errors.meta_description && (
                <p className="text-sm text-red-500 mt-1">{errors.meta_description.message}</p>
              )}
            </div>
            <div className="space-y-2 col-span-1 md:col-span-2">
              <Label className="text-sm font-medium text-gray-700">Compare Page Slug</Label>
              <Input
                {...register("compare_page_slug", { required: "Compare page slug is required" })}
                placeholder="Enter compare page slug"
                className="focus:border-blue-500 focus:ring-2 focus:ring-blue-200 h-7 "
              />
              {errors.compare_page_slug && (
                <p className="text-sm text-red-500 mt-1">{errors.compare_page_slug.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Label</Label>
              <Input 
                {...register("label")} 
                placeholder="Short label"
                className="focus:border-blue-500 focus:ring-2 focus:ring-blue-200 h-7 "
              />
            </div>
            <AuthorSelect
              register={register}
              className="focus:border-blue-500 focus:ring-2 focus:ring-blue-200 h-9 w-full border rounded px-3 py-2"
              error={errors.author_name}
            />
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Course Duration (Years/Months)</Label>
              <Input 
                {...register("duration", { required: "Course duration is required" })} 
                placeholder="e.g. 2 Years"
                className="focus:border-blue-500 focus:ring-2 focus:ring-blue-200 h-7 "
              />
              {errors.duration && (
                <p className="text-sm text-red-500 mt-1">{errors.duration.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">EMI Duration (In Months)</Label>
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
                className="focus:border-blue-500 focus:ring-2 focus:ring-blue-200 h-7 "
              />
            </div>
            <div className="flex items-center gap-3 space-y-2 mt-4">
            <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">Duration (for Schema only)</Label>
            <Controller
              name="duration_unit"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <div className="inline-flex gap-6">
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
                      <Label htmlFor="duration_months" className="font-normal cursor-pointer text-sm">
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
                      <Label htmlFor="duration_years" className="font-normal cursor-pointer text-sm">
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
                        className="w-32 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 h-7 "
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
          </div>

          

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Eligibility (In Short)</Label>
              <Textarea
                placeholder="Enter eligibility criteria"
                {...register("eligibility")}
                className="w-full border rounded px-3 py-2 h-17"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium text-gray-700">Eligibility (i button)</Label>
                <Info className="h-4 w-4 text-gray-400" />
              </div>
              <Textarea
                placeholder="Enter detailed eligibility information"
                {...register("eligibility_info")}
                className="w-full border rounded px-3 py-2 h-17"
              />
            </div>
          </div>
        </div>

        {/* Media & Documents */}
        <div className="bg-white rounded-lg shadow-md p-3 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-1 pb-2 border-b border-gray-200">Media & Documents</h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700">Course Thumbnail</Label>
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
                            if (e.value && clearErrors) {
                              clearErrors("course_thumbnail");
                            }
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
                          if (value && clearErrors) {
                            clearErrors("course_thumbnail");
                          }
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
                      {errors.course_thumbnail && errors.course_thumbnail.message && (
                        <p className="text-red-500 text-sm">{errors.course_thumbnail.message}</p>
                      )}
                    </div>
                  );
                }}
              />
            </div>
            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">Upload Syllabus (Max 4MB)</Label>
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
                className="focus:border-blue-500 focus:ring-2 focus:ring-blue-200 h-8"
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
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">Upload Brochure (Max 4MB)</Label>
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
                className="focus:border-blue-500 focus:ring-2 focus:ring-blue-200 h-8"
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
          </div>
        </div>

        {/* Fee Types */}
          <div className="bg-white rounded-lg shadow-md p-3 border border-gray-200">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Fee Types</h3>
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
                      <Label htmlFor={fieldId} className="text-sm font-medium text-gray-700">{label}</Label>
                      <Input
                        id={fieldId}
                        type="number"
                        // step="0.01"
                        // min="0"
                        placeholder={`Enter ${label} amount`}
                        {...register(`fee_type_values.${sanitizedKey}`, validationRules)}
                        className="spin-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 h-7 "
                      />
                      {errors?.fee_type_values?.[sanitizedKey] && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.fee_type_values[sanitizedKey]?.message}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Fees Note */}
            <div className="mt-4 space-y-2">
              <Label className="text-sm font-medium text-gray-700">Fees Note</Label>
              <div className="min-h-[200px] rounded-md border bg-white">
                <Controller
                  name="fees_note"
                  control={control}
                  render={({ field }) => (
                    <SafeCKEditor
                      value={field.value || ""}
                      onChange={(html) => field.onChange(html)}
                    />
                  )}
                />
              </div>
            </div>
          </div>

          {/* Course Compare Information */}
          <div className="bg-white rounded-lg shadow-md p-3 border border-gray-200">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Course Compare Information</h3>
            </div>
            
            {/* Credit Points */}
            <div className="space-y-2 mb-4">
              <Label className="text-sm font-medium text-gray-700">Credit Points</Label>
              <Input
                type="text"
                placeholder="Enter credit points"
                {...register("credit_points")}
                className="focus:border-blue-500 focus:ring-2 focus:ring-blue-200 h-7"
              />
            </div>

            {/* Why Choose */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Why Choose</Label>
              {watch("why_choose")?.map((item, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <Input
                    type="text"
                    placeholder="Enter why choose point"
                    {...register(`why_choose.${index}`)}
                    className="focus:border-blue-500 focus:ring-2 focus:ring-blue-200 h-7 flex-1"
                  />
                  {watch("why_choose")?.length > 1 && (
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        const current = watch("why_choose") || [];
                        setValue(
                          "why_choose",
                          current.filter((_, i) => i !== index)
                        );
                      }}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  const current = watch("why_choose") || [""];
                  setValue("why_choose", [...current, ""]);
                }}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add More
              </Button>
            </div>
          </div>

          {/* Banner Information */}
          <div className="bg-white rounded-lg shadow-md p-3 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-1 pb-2 border-b border-gray-200">Banner Information</h3>
            {banners.map((banner, index) => (
              <div key={banner.banner_key} className="relative p-5 border-2 border-gray-200 rounded-lg bg-gradient-to-br from-gray-50 to-white shadow-sm hover:shadow-md transition-shadow mb-4">
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Course Banner (size: 650×480px)</Label>
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
                      className="focus:border-blue-500 focus:ring-2 focus:ring-blue-200 h-8"
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
                    <Label className="text-sm font-medium text-gray-700">Video ID</Label>
                    <Input
                      value={banner.video_id}
                      onChange={(e) => updateBanner(index, { video_id: e.target.value })}
                      placeholder="YouTube / Vimeo video ID"
                      className="focus:border-blue-500 focus:ring-2 focus:ring-blue-200 h-7 "
                    />
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Video Title</Label>
                      <Input
                        value={banner.video_title}
                        onChange={(e) => updateBanner(index, { video_title: e.target.value })}
                        placeholder="Video title"
                        className="focus:border-blue-500 focus:ring-2 focus:ring-blue-200 h-7 "
                      />
                    </div>
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
          <div className="bg-white rounded-lg shadow-md p-3 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-1 pb-2 border-b border-gray-200">Sections</h3>
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

          <div className="bg-white rounded-lg shadow-md p-3 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-1 pb-2 border-b border-gray-200">FAQs</h3>
            <UniversityFaqInlinePanel
              courseId={courseId}
              courseName={watch("name")}
              stagedFaqs={stagedFaqs}
              setStagedFaqs={setStagedFaqs}
              type="course"
            />
          </div>

          {/* Action Buttons */}
          <div className="h-20"></div> {/* Spacer for fixed buttons */}
        </form>
      
      <FormActionButtons
        isEdit={isEdit}
        isSubmitting={isSubmitting}
        isLoading={mutation.isLoading}
        onSave={handleSave}
        onCancel={onCancel}
        saveButtonText="Save Course"
      />
    </div>
  );
}
