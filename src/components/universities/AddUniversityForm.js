"use client";

import { useEffect, useMemo, useState } from "react";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addUniversity, updateUniversity } from "@/lib/universityApi";
import { notifySuccess, notifyError } from "@/lib/notify";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, X, Plus, Trash } from "lucide-react";
import { MultiSelect } from "primereact/multiselect";

// ✅ Import reusable components and utilities
import { SectionsForm } from "./components/SectionRenderer";
import { deepMergeProps, applyLinkedFieldMappings, convertDisplayKeysToTargetKeys } from "./utils/formHelpers";
import UniversityFaqInlinePanel from "@/components/university-faq/InlineFaqPanel";
import { addUniversityFaq } from "@/lib/api";
import { processSectionFiles } from "@/utils/fileProcessing";
import FormActionButtons from "@/components/common/FormActionButtons";

// Banner Section Component (separate component to avoid hooks in IIFE)
function BannerSection({ control, register, previewBanners, setPreviewBanners, setValue, watch, clearErrors }) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "banners",
  });

  // Keep track of how many banners were initially loaded (existing ones)
  const [initialCount] = useState(fields.length);

  return (
    <div className="space-y-4 mt-2">
      {fields.map((banner, index) => {
        const bannerField = `banners.${index}`;
        return (
          <div
            key={banner.id}
            className="relative p-5 border-2 border-gray-200 rounded-lg bg-gradient-to-br from-gray-50 to-white shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="grid grid-cols-2 gap-4">
              {/* Banner Image */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Banner Image</Label>
                <input type="hidden" {...register(`${bannerField}.existing_banner_image`)} />
                <input type="hidden" {...register(`${bannerField}.remove_image`)} />
                {previewBanners[index] && (
                  <div className="inline-block mb-2 p-2 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <img
                      src={previewBanners[index]}
                      alt="Banner Preview"
                      className="h-24 object-contain rounded"
                    />
                  </div>
                )}
                <Input
                  type="file"
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
                      setValue(`banners.${index}.remove_image`, false, { shouldDirty: true });
                      setValue(`banners.${index}.existing_banner_image`, banner?.existing_banner_image || "", { shouldDirty: true });
                      if (clearErrors) {
                        clearErrors("banners");
                      }
                      console.log(`🧪 [BANNERS] New file selected`, { index, name: file.name });
                    }
                  }}
                  className="focus:border-blue-500 focus:ring-2 focus:ring-blue-200 h-8 "
                />
              </div>

              {/* Video ID */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Video ID</Label>
                <Input 
                  {...register(`${bannerField}.video_id`)} 
                  placeholder="Enter video ID"
                  className="focus:border-blue-500 focus:ring-2 focus:ring-blue-200 h-8 "
                />
              </div>

              {/* Video Title */}
              <div className="space-y-2 col-span-2">
                <Label className="text-sm font-medium text-gray-700">Video Title</Label>
                <Input 
                  {...register(`${bannerField}.video_title`)} 
                  placeholder="Enter video title"
                  className="focus:border-blue-500 focus:ring-2 focus:ring-blue-200 h-8 "
                />
              </div>
            </div>

            {/* Show Remove button ONLY for newly added banners */}
            {index >= initialCount && (
              <div className="flex mt-3">
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={() => remove(index)}
                >
                  Remove
                </Button>
              </div>
            )}
          </div>
        );
      })}

      {/* Add More button */}
      <div className="flex justify-start">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() =>
            append({ banner_image: null, video_id: "", video_title: "", existing_banner_image: "", remove_image: false })
          }
        >
          + Add More Banner
        </Button>
      </div>
    </div>
  );
}

export default function AddUniversityForm({ item, onCancel, onSuccess, approvals = [], placementPartners = [], emiPartners = [], universityTypes = [] }) {
  const queryClient = useQueryClient();

  // Scroll to top when form component mounts
  useScrollToTop();

  // preview states
  const [previewLogo, setPreviewLogo] = useState(null);
  const [previewBanners, setPreviewBanners] = useState([]);
  const [existingLogo, setExistingLogo] = useState(null);
  const [existingBrochure, setExistingBrochure] = useState(null);
  const [brochureRemoved, setBrochureRemoved] = useState(false);
  const [sectionPreviews, setSectionPreviews] = useState({});
  const [stagedFaqs, setStagedFaqs] = useState([]);

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
      title: "About University",
      component: "UniversityDesc",
      props: {
        content:
          "",
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
        content:
          "",
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
      id: "key-benefits", section_key: "Key_Highlights", title: "Key Highlights", component: "UniversityKeyBenefits",
      props: {
        content: "",
      }
    },
    { id: "admission-process", section_key: "Admission_Process", title: "Admission Process", component: "UniversityAdmissionProcess", props: {image:"", content: "" } },
    {
      id: "university-Emi", section_key: "University_Emi", title: "EMI & Financial Support", component: "UniversityEmi",
      props: {
        content: "",
        emiPartners: "Yes"
      },
    },
    {
      id: "scholarship-program", section_key: "Scholarships_Program", title: "Scholarship", component: "UniversityScholarship",
      props: {
        content: "",
      }
    },
    {
      id: "university-lms", section_key: "Learning_Management_SystemLMS", title: "LMS & Study Materials", component: "UniversityLMS",
      props: {
        content: ""
      }
    },  
    {
      id: "university-examination", section_key: "Examination_Pattern", title: "Examination", component: "UniversityExamination",
      props: {
        content: "" 
      }
    },
    {
      id: "sample-certificate", section_key: "Sample_Certificate", title: "Sample Certificate", component: "UniversitySampleCertificate",
      props: {
        content: "",  
        sampleImg: "",
      }
    },
    {
      id: "placement-detail", section_key: "Placements_Details", title: "Career & Placement Details", component: "UniversityPlacement",
      props: {
        content: "",
        placementPartners: "Yes"
      },
    },
    {
      id: "university-faculties", section_key: "University_Faculties", title: "Faculties", component: "UniversityFaculties",
      props: {
        faculties: [
          {
            name: "",
            img: "",
            designation:
              "",
            desc: "",
            "faculty Qualification": "",
          }
        ]
      }
    },
    {
      id: "university-reviews", section_key: "Student_Ratings", title: "Student Reviews", component: "UniversityReviews",
      props: {
        allReviews: [
          {
            name: "",
            "rating (1-5)" : "",
            value: "",
            reviewContent: "",
          }
        ]
      }
    },
    {
      id: "fees-detail", section_key: "Fee_Details", title: "Fee Details", component: "UniversityFeeDetail",
      props: {
        content: "",
      }
    },
    {
      id: "popular-courses", section_key: "Popular_Courses", title: "Popular Courses", component: "UniversityCourses",
      props: {
        coursesList: "Yes"
      }
    },
    {
      id: "Other-Popular-Universities", section_key: "Other_Popular_Universities", title: "Other Popular Universities", component: "UniversityOtherPopularColleges",
      props: {
        otherUniversityList: "Yes"
      }
    }, 
    {
      id: "approval-logo", section_key: "Approval_Logo", title: "Approval Logo", component: "UniversityApprovalLogos",
      props: {
        univsersityApprovals: "Yes"
      }
    },
    {
      id: "university-faq", section_key: "Faqs", title: "Faqs", component: "UniversityFaq",
      props: {
        faqData: "Yes"
      }
    }, 
  ]
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    setError,
    clearErrors,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      university_type_id: null,
      university_name: "",
      university_slug: "",
      meta_title: "",
      meta_description: "",
      university_logo: null,
      university_location: "",
      university_brochure: null,
      author_name: "",
      is_active: null,
      banners: [{ banner_image: null, video_id: "", video_title: "", existing_banner_image: "", remove_image: false }],
      sections: defaultSections,
      // Compare Information fields
      university_tag_line: "",
      establishment_year: "",
      emi_provides: false,
      university_features: [""],
      education_mode: "",
      examination_mode: "",
      alumni_status: "",
      online_classes: false,
      placement_assistance: false,
      why_choose: [""],
    },
  });

  const watchApprovalIds = watch("approval_ids") || [];
  const watchPlacementIds = watch("placement_partner_ids") || [];
  const watchEmiIds = watch("emi_partner_ids") || [];

  const normalizeIds = (ids) => {
    if (!Array.isArray(ids)) return [];
    return ids.map((id) => Number(id));
  };

  const selectedApprovalsDisplay = useMemo(() => {
    const normalized = normalizeIds(watchApprovalIds);
    if (!normalized.length) return [];
    return approvals
      .filter((approval) => normalized.includes(Number(approval.id)))
      .map((approval) => ({
        id: approval.id,
        title: approval.title,
      }));
  }, [approvals, watchApprovalIds]);

  const selectedPlacementPartnersDisplay = useMemo(() => {
    const normalized = normalizeIds(watchPlacementIds);
    if (!normalized.length) return [];
    return placementPartners
      .filter((partner) => normalized.includes(Number(partner.id)))
      .map((partner) => ({
        id: partner.id,
        name: partner.name,
      }));
  }, [placementPartners, watchPlacementIds]);

  const selectedEmiPartnersDisplay = useMemo(() => {
    const normalized = normalizeIds(watchEmiIds);
    if (!normalized.length) return [];
    return emiPartners
      .filter((partner) => normalized.includes(Number(partner.id)))
      .map((partner) => ({
        id: partner.id,
        name: partner.name,
      }));
  }, [emiPartners, watchEmiIds]);

  useEffect(() => {
    if (item?.id) {
      setStagedFaqs([]);
    }

    if (!item) {
      // 🧹 Reset everything when adding new
      reset({
        university_type_id: null,
        university_name: "",
        university_slug: "",
        meta_title: "",
        meta_description: "",
        university_logo: null,
        university_location: "",
        university_brochure: null,
        brochureRemoved: false,
        author_name: "",
        banners: [{ banner_image: null, video_id: "", video_title: "", existing_banner_image: "", remove_image: false }],
        sections: defaultSections,
        approval_ids: [],
        placement_partner_ids: [],
        emi_partner_ids: [],
      });
      setPreviewLogo(null);
      setPreviewBanners([]);
      setExistingLogo(null);
      setExistingBrochure(null);
      setBrochureRemoved(false);
      setSectionPreviews({});
      return;
    }
    // Parse approval_id string to array of numbers
    let selectedApprovals = [];
    try {
      const ids = JSON.parse(item.approval_id || "[]");
      selectedApprovals = approvals.filter((a) => ids.includes(a.id));
    } catch (err) {
      selectedApprovals = [];
      console.error("Error parsing approval_id:", err);
    }

    // Parse placement_partner_ids - use fetched objects if available, otherwise parse JSON
    let selectedPlacementPartners = [];
    if (item.placement_partners && Array.isArray(item.placement_partners)) {
      // Use pre-fetched partner objects from backend
      selectedPlacementPartners = item.placement_partners;
    } else {
      // Fallback: parse IDs and filter from available partners
      try {
        const ids = JSON.parse(item.placement_partner_ids || "[]");
        selectedPlacementPartners = placementPartners.filter((p) => ids.includes(p.id));
      } catch (err) {
        selectedPlacementPartners = [];
        console.error("Error parsing placement_partner_ids:", err);
      }
    }

    // Parse emi_partner_ids - use fetched objects if available, otherwise parse JSON
    let selectedEmiPartners = [];
    if (item.emi_partners && Array.isArray(item.emi_partners)) {
      // Use pre-fetched partner objects from backend
      selectedEmiPartners = item.emi_partners;
    } else {
      // Fallback: parse IDs and filter from available partners
      try {
        const ids = JSON.parse(item.emi_partner_ids || "[]");
        selectedEmiPartners = emiPartners.filter((p) => ids.includes(p.id));
      } catch (err) {
        selectedEmiPartners = [];
        console.error("Error parsing emi_partner_ids:", err);
      }
    }


    // Merge database sections with defaultSections template
    // Match by component name since DB uses numeric IDs
    // ✅ ALWAYS preserve section_key from defaultSections (never change it)
    const mergedSections = defaultSections.map((defaultSection, sectionIndex) => {
      const dbSection = item.sections?.find(s => s.component === defaultSection.component);
      if (dbSection && dbSection.props) {
        // FAQ is now simple Yes/No toggle - no special handling needed
        const merged = {
          id: dbSection.id, // Use database ID
          section_key: defaultSection.section_key, // ✅ ALWAYS use section_key from defaultSections
          title: defaultSection.title,
          component: defaultSection.component,
          props: deepMergeProps(defaultSection.props, dbSection.props),
        };
        if (merged.props) {
          applyLinkedFieldMappings(merged.props);
        }
        return merged;
      }
      const clonedDefault = structuredClone(defaultSection);
      // ✅ Ensure section_key is preserved from defaultSection
      if (clonedDefault?.props) {
        applyLinkedFieldMappings(clonedDefault.props);
      }
      return clonedDefault;
    });

    const formValues = {
      university_type_id: item.university_type_id ? Number(item.university_type_id) : null,
      university_name: item.university_name || "",
      university_slug: item.university_slug || "",
      meta_title: item.meta_title ?? "",
      meta_description: item.meta_description ?? "",
      university_logo: null,
      university_location: item.university_location || "",
      university_brochure: null,
      author_name: item.author_name || "",
      // Compare Information fields
      university_tag_line: item.university_tag_line ?? "",
      establishment_year: item.establishment_year ?? "",
      emi_provides: item.emi_provides === true || item.emi_provides === "true" || item.emi_provides === 1,
      university_features: Array.isArray(item.university_features) && item.university_features.length > 0 
        ? item.university_features 
        : [""],
      education_mode: item.education_mode ?? "",
      examination_mode: item.examination_mode ?? "",
      alumni_status: item.alumni_status ?? "",
      online_classes: item.online_classes === true || item.online_classes === "true" || item.online_classes === 1,
      placement_assistance: item.placement_assistance === true || item.placement_assistance === "true" || item.placement_assistance === 1,
      why_choose: Array.isArray(item.why_choose) && item.why_choose.length > 0 
        ? item.why_choose 
        : [""],
      banners: Array.isArray(item.banners) && item.banners.length
        ? item.banners.map(b => ({
            banner_image: null,
            video_id: b.video_id || "",
            video_title: b.video_title || "",
            existing_banner_image: b.banner_image || "",
            remove_image: false,
          }))
        : [{ banner_image: null, video_id: "", video_title: "", existing_banner_image: "", remove_image: false }],
      sections: mergedSections,
      approval_ids: selectedApprovals.map((a) => a.id), // <- extract IDs only
      placement_partner_ids: selectedPlacementPartners.map((p) => p.id), // <- extract IDs only
      emi_partner_ids: selectedEmiPartners.map((p) => p.id), // <- extract IDs only
    };

    reset(formValues);

    // Handle logo state - clear if no logo, set if logo exists
    if (item.university_logo) {
      setExistingLogo(item.university_logo);
      setPreviewLogo(`${process.env.NEXT_PUBLIC_thumbnail_URL}${item.university_logo}`);
    } else {
      // Explicitly clear logo states if item has no logo
      setExistingLogo(null);
      setPreviewLogo(null);
    }

    // Handle brochure state
    if (item.university_brochure) {
      setExistingBrochure(item.university_brochure);
      setBrochureRemoved(false);
    } else {
      setExistingBrochure(null);
      setBrochureRemoved(false);
    }

    const bannerPreviews = (item.banners || []).map(b => b.banner_image ? `${process.env.NEXT_PUBLIC_thumbnail_URL}${b.banner_image}` : null);
    setPreviewBanners(bannerPreviews);

    // Clear section previews first to avoid old data
    setSectionPreviews({});

    // Set section previews recursively using mergedSections (not item.sections)
    if (Array.isArray(mergedSections)) {
      const newPreviews = {};
      mergedSections.forEach((section, sIndex) => {
        // Helper function to join URL without double slashes
        const joinURL = (base, path) => {
          const baseClean = base?.replace(/\/+$/, "") || ""; // Remove trailing slashes
          const pathClean = path?.replace(/^\/+/, "") || ""; // Remove leading slashes
          return `${baseClean}/${pathClean}`;
        };

        const setPreviewsRecursive = (obj, path) => {
          Object.entries(obj).forEach(([k, v]) => {
            const currentPath = `${path}.${k}`;
            if ((k.toLowerCase().includes("img") || k.toLowerCase().includes("logo") || k.toLowerCase().includes("sample") || k.toLowerCase().includes("image")) && typeof v === "string" && v.trim() !== "") {
              // Check if it's already a full URL (starts with http)
              if (v.startsWith("http://") || v.startsWith("https://")) {
                newPreviews[currentPath] = v;
              } 
              // For relative paths, normalize and join properly
              else {
                // Normalize path: remove leading slash for proper joining
                let normalizedPath = v.startsWith("/") ? v.substring(1) : v;
                newPreviews[currentPath] = joinURL(process.env.NEXT_PUBLIC_thumbnail_URL, normalizedPath);
              }
            }
            if (Array.isArray(v)) {
              v.forEach((item, i) => setPreviewsRecursive(item, `${currentPath}.${i}`));
            } else if (v && typeof v === "object") {
              setPreviewsRecursive(v, currentPath);
            }
          });
        };
        if (section.props) setPreviewsRecursive(section.props, `sections.${sIndex}.props`);
      });
      setSectionPreviews(newPreviews);
    }

  }, [item, reset, setValue]);

  // Cleanup blob URLs on unmount or when previewLogo changes
  useEffect(() => {
    return () => {
      // Revoke blob URL when component unmounts or previewLogo changes
      if (previewLogo && previewLogo.startsWith("blob:")) {
        URL.revokeObjectURL(previewLogo);
      }
    };
  }, [previewLogo]);

  const persistStagedFaqs = async (newUniversityId) => {
    if (!stagedFaqs.length || !newUniversityId) return;

    for (const faq of stagedFaqs) {
      try {
        await addUniversityFaq({
          university_id: newUniversityId,
          category_id: faq.category_id,
          title: faq.title,
          description: faq.description,
          saveWithDate: faq.saveWithDate ?? true,
        });
      } catch (error) {
        console.error("Failed to persist staged FAQ", error);
        notifyError("Failed to save staged FAQs. Please try again after saving the university.");
        throw error;
      }
    }

    setStagedFaqs([]);
    queryClient.invalidateQueries(["university-faq-inline", newUniversityId]);
    notifySuccess("Staged FAQs saved successfully.");
  };

  const mutation = useMutation({
    mutationFn: async (formData) =>
      item?.id ? updateUniversity(item.id, formData) : addUniversity(formData),
    onSuccess: async (response) => {
      if (!item && stagedFaqs.length) {
        const createdUniversityId =
          response?.data?.id ??
          response?.data?.data?.id ??
          response?.data?.data?.insertId ??
          response?.data?.insertId ??
          response?.id;

        if (createdUniversityId) {
          try {
            await persistStagedFaqs(createdUniversityId);
          } catch (error) {
            console.error("Error while persisting staged FAQs", error);
          }
        } else {
          notifyError("Could not detect the new university ID to save staged FAQs. Please add FAQs after saving.");
        }
      }

      notifySuccess(item ? "University updated successfully" : "University added successfully");
      reset();
      setPreviewLogo(null);
      setExistingLogo(null);
      setPreviewBanners([]);
      setSectionPreviews({});
      // Invalidate all university queries immediately
      queryClient.invalidateQueries(["universities"]);
      // Call parent callback after a short delay to allow invalidation to process
      setTimeout(() => {
        onSuccess?.();
      }, 100);
    },
    onError: (err) => {
      notifyError(err.response?.data?.message || "Operation failed");
    },
  });

  const onSubmit = (data, saveWithDate = true) => {
    let hasError = false;

    // Validate university logo when adding new
    if (!item) {
      const hasLogo = (data.university_logo && data.university_logo[0]) || previewLogo;
      if (!hasLogo) {
        setError("university_logo", {
          type: "manual",
          message: "University logo is required",
        });
        hasError = true;
      } else {
        clearErrors("university_logo");
      }
    }

    // Validate at least one banner when adding new
    if (!item) {
      const hasBannerImage = data.banners.some((banner, index) => {
        const hasNewImage = banner.banner_image instanceof FileList && banner.banner_image[0];
        const hasPreview = previewBanners[index] && previewBanners[index].includes("blob:");
        return hasNewImage || hasPreview;
      });
      if (!hasBannerImage) {
        setError("banners", {
          type: "manual",
          message: "At least one banner image is required",
        });
        hasError = true;
      } else {
        clearErrors("banners");
      }
    }

    if (hasError) {
      return;
    }

    const formData = new FormData();
    if (data.university_type_id) {
      formData.append("university_type_id", data.university_type_id.toString());
    }
    formData.append("university_name", data.university_name);
    formData.append("university_slug", data.university_slug);
    formData.append("meta_title", data.meta_title || "");
    formData.append("meta_description", data.meta_description || "");
    formData.append("university_location", data.university_location || "");
    formData.append("author_name", data.author_name || "");
    
    // Compare Information fields
    if (data.university_tag_line !== undefined && data.university_tag_line !== null && data.university_tag_line !== "") {
      formData.append("university_tag_line", String(data.university_tag_line));
    }
    if (data.establishment_year !== undefined && data.establishment_year !== null && data.establishment_year !== "") {
      formData.append("establishment_year", String(data.establishment_year));
    }
    if (data.emi_provides !== undefined) {
      formData.append("emi_provides", data.emi_provides ? "true" : "false");
    }
    if (data.university_features !== undefined && Array.isArray(data.university_features) && data.university_features.length > 0) {
      const filtered = data.university_features.filter(item => item && String(item).trim());
      if (filtered.length > 0) {
        formData.append("university_features", JSON.stringify(filtered));
      }
    }
    if (data.education_mode !== undefined && data.education_mode !== null && data.education_mode !== "") {
      formData.append("education_mode", String(data.education_mode));
    }
    if (data.examination_mode !== undefined && data.examination_mode !== null && data.examination_mode !== "") {
      formData.append("examination_mode", String(data.examination_mode));
    }
    if (data.alumni_status !== undefined && data.alumni_status !== null && data.alumni_status !== "") {
      formData.append("alumni_status", String(data.alumni_status));
    }
    if (data.online_classes !== undefined) {
      formData.append("online_classes", data.online_classes ? "true" : "false");
    }
    if (data.placement_assistance !== undefined) {
      formData.append("placement_assistance", data.placement_assistance ? "true" : "false");
    }
    if (data.why_choose !== undefined && Array.isArray(data.why_choose) && data.why_choose.length > 0) {
      const filtered = data.why_choose.filter(item => item && String(item).trim());
      if (filtered.length > 0) {
        formData.append("why_choose", JSON.stringify(filtered));
      }
    }
    
    // MultiSelect returns arrays of IDs directly, no need to map
    const approvalIds = Array.isArray(data.approval_ids) ? data.approval_ids : [];
    formData.append("approval_id", JSON.stringify(approvalIds));
    
    const placementPartnerIds = Array.isArray(data.placement_partner_ids) ? data.placement_partner_ids : [];
    formData.append("placement_partner_ids", JSON.stringify(placementPartnerIds));
    
    const emiPartnerIds = Array.isArray(data.emi_partner_ids) ? data.emi_partner_ids : [];
    formData.append("emi_partner_ids", JSON.stringify(emiPartnerIds));
    
    formData.append("saveWithDate", saveWithDate);

    // Handle university logo - append if new file, or empty string if removed
    console.log("📤 [FRONTEND] Preparing university_logo for submission");
    console.log("📤 [FRONTEND] data.university_logo:", data.university_logo);
    console.log("📤 [FRONTEND] existingLogo:", existingLogo);
    console.log("📤 [FRONTEND] previewLogo:", previewLogo);
    console.log("📤 [FRONTEND] item (edit mode):", item);
    
    if (data.university_logo && data.university_logo[0]) {
      // New file uploaded
      console.log("📤 [FRONTEND] New logo file uploaded");
      formData.append("university_logo", data.university_logo[0]);
    } else if (item && existingLogo && !previewLogo) {
      // In edit mode: if there was an existing logo (existingLogo is set) but no preview, it was removed
      // existingLogo is only set when editing and there was an original logo from the database
      console.log("📤 [FRONTEND] Logo was removed - sending empty string");
      console.log("📤 [FRONTEND] Original logo from database:", existingLogo);
      formData.append("university_logo", "");
    } else {
      // No change: either new item with no logo, or edit mode with logo unchanged
      console.log("📤 [FRONTEND] No logo change - not appending to formData");
    }
    // Handle brochure file
    if (brochureRemoved && existingBrochure) {
      formData.append("university_brochure", "__REMOVE__");
    } else if (data.university_brochure && data.university_brochure[0]) {
      formData.append("university_brochure", data.university_brochure[0]);
    } else if (existingBrochure && !brochureRemoved) {
      // Keep existing file
      formData.append("university_brochure", existingBrochure);
    }
    // 🔹 Banners (supports multiple)
    const banners = data.banners.map((banner, index) => {
      const bannerData = { ...banner };
 
      if (banner.remove_image) {
        bannerData.banner_image = "";
        bannerData.existing_banner_image = "";
      } else if (banner.banner_image instanceof FileList && banner.banner_image[0]) {
        const file = banner.banner_image[0];
        formData.append(`banner_image_${index}`, file);
        bannerData.banner_image = file.name; // reference name to replace in backend
        bannerData.existing_banner_image = banner.existing_banner_image || "";
      } else if (
        banner.existing_banner_image &&
        banner.banner_image === null &&
        previewBanners[index] === null
      ) {
        // Banner image was explicitly removed:
        // - existing_banner_image exists (had an image before)
        // - banner_image is explicitly null (was set to null via setValue)
        // - previewBanners[index] is null (preview was cleared)
        bannerData.banner_image = "";
        bannerData.existing_banner_image = "";
      } else if (banner.existing_banner_image && banner.existing_banner_image.trim() !== "") {
        // Keep existing banner image - don't modify it
        bannerData.banner_image = banner.existing_banner_image;
        bannerData.existing_banner_image = banner.existing_banner_image;
      } else {
        bannerData.banner_image = banner.banner_image || "";
        bannerData.existing_banner_image = banner.existing_banner_image || "";
      }

      delete bannerData.remove_image;

      return bannerData;
    });
    console.log("🧪 [BANNERS] Submitting payload", banners);

    formData.append("banners", JSON.stringify(banners));


    // Sections
    const sectionsCopy = structuredClone(data.sections || []);
    
    // ✅ Automatically set hidden fields to "Yes"
    // ✅ ALWAYS ensure section_key comes from defaultSections (never generate from title)
    sectionsCopy.forEach((section, index) => {
      // Match section with defaultSections by component to get the correct section_key
      const defaultSection = defaultSections.find(ds => ds.component === section.component) || defaultSections[index];
      
      // ✅ ALWAYS use section_key from defaultSections (preserve it, never change)
      if (defaultSection && defaultSection.section_key) {
        section.section_key = defaultSection.section_key;
      }
      
      if (section.id === "Other-Popular-Universities" && section.props) {
        section.props.otherUniversityList = "Yes";
      }
      if (section.id === "approval-logo" && section.props) {
        section.props.univsersityApprovals = "Yes";
      }
      if (section.id === "placement-detail" && section.props) {
        section.props.placementPartners = "Yes";
      }
      if (section.id === "university-Emi" && section.props) {
        section.props.emiPartners = "Yes";
      }
      if (section.id === "university-faq" && section.props) {
        section.props.faqData = "Yes";
      }

      if (section.props) {
        // Convert display keys to target keys before saving (e.g., "faculty Qualification" → faculty_qualification)
        convertDisplayKeysToTargetKeys(section.props);
      }
 
    });
    // Process section files using shared utility
    const processedSections = processSectionFiles(sectionsCopy, formData);
    
    formData.append("sections", JSON.stringify(processedSections));

    mutation.mutate(formData);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen pb-24">
      {/* Header Section */}
      {/* <div className="rounded-lg shadow-lg mb-4 mt-2"> */}
      <div className="relative flex justify-center items-center mb-6">
        <Button variant="ghost" size="sm" onClick={onCancel} className="absolute left-0 hover:bg-gray-200 hover:text-black">
          <ArrowLeft className="mr-2 h-2 w-2" />
          Back to List
        </Button>
        <div className="flex items-center gap-2">
            <h3 className="text-3xl font-bold text-blue-700">{item ? "Edit University" : "Add New University"}</h3>
        </div>
      </div>


      <form className="space-y-3 max-w-5xl mx-auto px-6 pb-24">
        {/* University Type Dropdown - At the top */}
        <div className="bg-white rounded-lg shadow-md p-3 border border-gray-200">
          <Label className="text-base font-semibold text-gray-700 mb-1 block">University Type</Label>
          <Controller
            name="university_type_id"
            control={control}
            render={({ field }) => (
              <select
                {...field}
                value={field.value ? String(field.value) : ""}
                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                className="w-full border border-gray-300 rounded-md px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors bg-white text-gray-900"
              >
                <option value="">Select University Type</option>
                {universityTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            )}
          />
        </div>

        {/* University Info & Logo */}
        <div className="bg-white rounded-lg shadow-md p-3 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">University Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">University Name (H1 Tag Also)
              </Label>
              <Input 
                {...register("university_name", { required: "University name is required" })} 
                placeholder="Enter university name (H1 Tag)"
                className="focus:border-blue-500 focus:ring-2 focus:ring-blue-200 h-8"
              />
              {errors.university_name && <p className="text-red-500 text-sm mt-1">{errors.university_name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">University Slug</Label>
              <Input 
                {...register("university_slug", { required: "University slug is required" })} 
                placeholder="Enter university slug"
                className="focus:border-blue-500 focus:ring-2 focus:ring-blue-200 h-8"
              />
              {errors.university_slug && <p className="text-red-500 text-sm mt-1">{errors.university_slug.message}</p>}
            </div>
            <div className="space-y-2 col-span-1 md:col-span-2">
              <Label className="text-sm font-medium text-gray-700">Meta Title</Label>
              <Input
                {...register("meta_title")}
                placeholder="SEO Meta Title (max 60 character)"
                className="focus:border-blue-500 focus:ring-2 focus:ring-blue-200 h-8"
              />
            </div>

            <div className="space-y-2 col-span-1 md:col-span-2">
              <Label className="text-sm font-medium text-gray-700">Meta Description</Label>
              <textarea
                {...register("meta_description")}
                placeholder="SEO Meta Des (max 160 character)"
                className="w-full border border-gray-300 rounded-md px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors resize-none"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Location</Label>
              <Input 
                {...register("university_location")} 
                placeholder="Enter university location"
                className="focus:border-blue-500 focus:ring-2 focus:ring-blue-200 h-8"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Author Name</Label>
              <Input 
                {...register("author_name")} 
                placeholder="Enter author name"
                className="focus:border-blue-500 focus:ring-2 focus:ring-blue-200 h-8"
              />
            </div>
            <div className="space-y-2 col-span-1 md:col-span-2">
              <Label className="text-sm font-medium text-gray-700">Approvals</Label>
              <Controller
                name="approval_ids"
                control={control}
                defaultValue={[]}
                rules={{ required: "At least one approval is required" }}
                render={({ field }) => {
                  return (
                    <MultiSelect
                      value={field.value || []}
                      onChange={(e) => field.onChange(e.value)}
                      options={approvals}
                      optionLabel="title"
                      optionValue="id"
                      placeholder="Select approvals"
                      filter
                      display="chip"
                      maxSelectedLabels={-1}
                      className="w-full"
                      panelClassName="max-h-60"
                    />
                  );
                }}
              />
              {errors.approval_ids && (
                <p className="text-red-500 text-sm mt-1">{errors.approval_ids.message}</p>
              )}
              {selectedApprovalsDisplay.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedApprovalsDisplay.map((approval) => (
                    <div
                      key={approval.id}
                      className="group flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm shadow-sm"
                    >
                      <span className="font-medium text-blue-700">{approval.title}</span>
                      <button
                        type="button"
                        className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-200 text-blue-700 transition hover:bg-red-500 hover:text-white"
                        onClick={() => {
                          const next = (watchApprovalIds || []).filter((id) => Number(id) !== Number(approval.id));
                          setValue("approval_ids", next, { shouldValidate: true, shouldDirty: true });
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Compare Information */}
        <div className="bg-white rounded-lg shadow-md p-3 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Compare Information</h3>
          <div className="grid grid-cols-2 gap-4">
            {/* University Tag Line */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">University Tag Line</Label>
              <Input
                type="text"
                placeholder="Enter university tag line"
                {...register("university_tag_line")}
                className="focus:border-blue-500 focus:ring-2 focus:ring-blue-200 h-8"
              />
            </div>

            {/* Establishment Year */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Establishment Year</Label>
              <Input
                type="text"
                placeholder="Enter establishment year"
                {...register("establishment_year")}
                className="focus:border-blue-500 focus:ring-2 focus:ring-blue-200 h-8"
              />
            </div>

            {/* EMI Provides */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">EMI Provides</Label>
              <Controller
                name="emi_provides"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    value={field.value ? "true" : "false"}
                    onChange={(e) => field.onChange(e.target.value === "true")}
                    className="w-full border border-gray-300 rounded-md px-3 py-1.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 h-8"
                  >
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                  </select>
                )}
              />
            </div>

            {/* Education Mode */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Education Mode</Label>
              <Controller
                name="education_mode"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    className="w-full border border-gray-300 rounded-md px-3 py-1.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 h-8"
                  >
                    <option value="">Select Education Mode</option>
                    <option value="Online">Online</option>
                    <option value="Offline">Offline</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Blended">Blended</option>
                  </select>
                )}
              />
            </div>

            {/* Examination Mode */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Examination Mode</Label>
              <Controller
                name="examination_mode"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    className="w-full border border-gray-300 rounded-md px-3 py-1.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 h-8"
                  >
                    <option value="">Select Examination Mode</option>
                    <option value="Online">Online</option>
                    <option value="Offline">Offline</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                )}
              />
            </div>

            {/* Alumni Status */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Alumni Status</Label>
              <Input
                type="text"
                placeholder="Enter alumni status"
                {...register("alumni_status")}
                className="focus:border-blue-500 focus:ring-2 focus:ring-blue-200 h-8"
              />
            </div>

            {/* Online Classes */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Online Classes</Label>
              <Controller
                name="online_classes"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    value={field.value ? "true" : "false"}
                    onChange={(e) => field.onChange(e.target.value === "true")}
                    className="w-full border border-gray-300 rounded-md px-3 py-1.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 h-8"
                  >
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                  </select>
                )}
              />
            </div>

            {/* Placement Assistance */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Placement Assistance</Label>
              <Controller
                name="placement_assistance"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    value={field.value ? "true" : "false"}
                    onChange={(e) => field.onChange(e.target.value === "true")}
                    className="w-full border border-gray-300 rounded-md px-3 py-1.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 h-8"
                  >
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                  </select>
                )}
              />
            </div>

            {/* University Features */}
            <div className="space-y-2 col-span-2">
              <Label className="text-sm font-medium text-gray-700">University Features</Label>
              {watch("university_features")?.map((item, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <Input
                    type="text"
                    placeholder="Enter feature"
                    {...register(`university_features.${index}`)}
                    className="focus:border-blue-500 focus:ring-2 focus:ring-blue-200 h-8 flex-1"
                  />
                  {watch("university_features")?.length > 1 && (
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        const current = watch("university_features") || [];
                        setValue(
                          "university_features",
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
                  const current = watch("university_features") || [""];
                  setValue("university_features", [...current, ""]);
                }}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add More
              </Button>
            </div>

            {/* Why Choose */}
            <div className="space-y-2 col-span-2">
              <Label className="text-sm font-medium text-gray-700">Why Choose</Label>
              {watch("why_choose")?.map((item, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <Input
                    type="text"
                    placeholder="Enter why choose point"
                    {...register(`why_choose.${index}`)}
                    className="focus:border-blue-500 focus:ring-2 focus:ring-blue-200 h-8 flex-1"
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
        </div>

        {/* University Logo & Brochure */}
        <div className="bg-white rounded-lg shadow-md p-3 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-1 pb-2 border-b border-gray-200">Media & Documents</h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700">University Logo</Label>
              {previewLogo && (
                <div className="inline-block p-2 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <img
                    src={previewLogo}
                    alt="University logo preview"
                    className="h-24 object-contain rounded"
                  />
                </div>
              )}
              <Input
                type="file"
                accept="image/*"
                {...register("university_logo")}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    // Clear existingLogo when a new file is selected (we're replacing, not removing)
                    setExistingLogo(null);
                    // Revoke previous blob URL if it exists (to prevent memory leaks)
                    if (previewLogo && previewLogo.startsWith("blob:")) {
                      URL.revokeObjectURL(previewLogo);
                    }
                    setPreviewLogo(URL.createObjectURL(file));
                    clearErrors("university_logo");
                  }
                }}
                className="focus:border-blue-500 focus:ring-2 focus:ring-blue-200 h-8"
              />
              {errors.university_logo && errors.university_logo.message && (
                <p className="text-red-500 text-sm mt-1">{errors.university_logo.message}</p>
              )}
            </div>
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700">Brochure</Label>
              {existingBrochure && !brochureRemoved && (
                <div className="relative p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-700 break-all font-medium pr-8">
                    Current: {existingBrochure.split('/').pop()}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setBrochureRemoved(true);
                      setValue("university_brochure", null);
                      const input = document.querySelector('input[name="university_brochure"]');
                      if (input) input.value = "";
                    }}
                    className="absolute top-2 right-2 p-1 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
                    title="Remove brochure"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
              {brochureRemoved && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-700 font-medium">
                    Brochure will be removed on save
                  </p>
                </div>
              )}
              <Input 
                type="file" 
                accept="application/pdf" 
                name="university_brochure"
                {...register("university_brochure")}
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    setBrochureRemoved(false);
                  }
                  register("university_brochure").onChange(e);
                }}
                className="focus:border-blue-500 focus:ring-2 focus:ring-blue-200 h-8 "
              />
            </div>
          </div>
        </div>

        {/* Banner Info */}
        <div className="bg-white rounded-lg shadow-md p-3 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Banner Information</h3>
          <BannerSection
            control={control}
            register={register}
            previewBanners={previewBanners}
            setPreviewBanners={setPreviewBanners}
            setValue={setValue}
            watch={watch}
            clearErrors={clearErrors}
          />
          {errors.banners && errors.banners.message && (
            <p className="text-red-500 text-sm mt-2">{errors.banners.message}</p>
          )}
        </div>


        {/* Sections */}
        <div className="bg-white rounded-lg shadow-md p-3 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Sections</h3>
          <SectionsForm
            sections={watch("sections") || []}
            control={control}
            register={register}
            setValue={setValue}
            sectionPreviews={sectionPreviews}
            setSectionPreviews={setSectionPreviews}
            watch={watch}
            templates={defaultSections}
            renderAfterSection={(section) => {
              const isPlacementSection =
                section?.id === "placement-detail" ||
                section?.component === "UniversityPlacement";

              const isEmiSection =
                section?.id === "university-Emi" ||
                section?.component === "UniversityEmi";

              if (isPlacementSection) {
                return (
                  <div className="border-2 border-blue-100 rounded-lg p-5 bg-gradient-to-br from-blue-50/50 to-white shadow-sm">
                    <Label className="block mb-3 text-base font-semibold text-gray-800">Placement/Hiring Partners</Label>
                    <div className="space-y-2">
                      <Controller
                        name="placement_partner_ids"
                        control={control}
                        defaultValue={[]}
                        render={({ field }) => (
                          <MultiSelect
                            value={field.value || []}
                            onChange={(e) => field.onChange(e.value)}
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
                        )}
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
                                  const next = (watchPlacementIds || []).filter((id) => Number(id) !== Number(partner.id));
                                  setValue("placement_partner_ids", next, { shouldValidate: true, shouldDirty: true });
                                }}
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              }

              if (isEmiSection) {
                return (
                  <div className="border-2 border-purple-100 rounded-lg p-5 bg-gradient-to-br from-purple-50/50 to-white shadow-sm">
                    <Label className="block mb-3 text-base font-semibold text-gray-800">EMI/Financing Partners</Label>
                    <div className="space-y-2">
                      <Controller
                        name="emi_partner_ids"
                        control={control}
                        defaultValue={[]}
                        render={({ field }) => (
                          <MultiSelect
                            value={field.value || []}
                            onChange={(e) => field.onChange(e.value)}
                            options={emiPartners}
                            optionLabel="name"
                            optionValue="id"
                            placeholder="Select EMI partners"
                            filter
                            display="chip"
                            maxSelectedLabels={-1}
                            className="w-full"
                            panelClassName="max-h-60"
                          />
                        )}
                      />
                      {selectedEmiPartnersDisplay.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {selectedEmiPartnersDisplay.map((partner) => (
                            <div
                              key={partner.id}
                              className="group flex items-center gap-2 rounded-md border bg-card px-3 py-2 text-sm shadow-sm"
                            >
                              <span className="font-medium">{partner.name}</span>
                              <button
                                type="button"
                                className="ml-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground transition hover:bg-destructive hover:text-destructive-foreground"
                                onClick={() => {
                                  const next = (watchEmiIds || []).filter((id) => Number(id) !== Number(partner.id));
                                  setValue("emi_partner_ids", next, { shouldValidate: true, shouldDirty: true });
                                }}
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              }

              return null;
            }}
          />
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">FAQs</h3>
          <div className="flex items-center justify-between">
            {!item?.id}
          </div>
          <UniversityFaqInlinePanel
            universityId={item?.id}
            universityName={watch("university_name")}
            stagedFaqs={stagedFaqs}
            setStagedFaqs={setStagedFaqs}
          />
        </div>

        {/* Action Buttons */}
        <div className="h-20"></div> {/* Spacer for fixed buttons */}
      </form>
      
      <FormActionButtons
        isEdit={!!item}
        isSubmitting={isSubmitting}
        isLoading={mutation.isLoading}
        onSave={(saveWithDate) => handleSubmit((data) => onSubmit(data, saveWithDate))()}
        onCancel={onCancel}
        saveButtonText="Save University"
      />
    </div>
  );
}

