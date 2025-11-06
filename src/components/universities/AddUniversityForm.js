"use client";

import { useEffect, useState } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addUniversity, updateUniversity } from "@/lib/universityApi";
import { notifySuccess, notifyError } from "@/lib/notify";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { MultiSelect } from "primereact/multiselect";

// ✅ Import reusable components and utilities
import { SectionsForm } from "./components/SectionRenderer";
import { deepMergeProps } from "./utils/formHelpers";

// Banner Section Component (separate component to avoid hooks in IIFE)
function BannerSection({ control, register, previewBanners, setPreviewBanners, setValue, watch }) {
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
            className="relative p-4 border rounded-lg bg-gray-30 shadow-sm"
          >
            <div className="grid grid-cols-2 gap-4">
              {/* Banner Image */}
              <div className="space-y-2">
                <Label>Banner Image</Label>
                {previewBanners[index] && (
                  <div className="relative inline-block mb-2">
                    <img
                      src={previewBanners[index]}
                      alt="Banner Preview"
                      className="h-20 object-contain rounded border"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        console.log(`🗑️ [FRONTEND] Removing banner image at index ${index}`);
                        console.log(`🗑️ [FRONTEND] Before removal - previewBanners[${index}]:`, previewBanners[index]);
                        const bannerData = watch(`banners.${index}`);
                        console.log(`🗑️ [FRONTEND] Before removal - banner data:`, bannerData);
                        // Don't clear existing_banner_image - we need it to detect removal on submit
                        // Only clear the preview and form value
                        setPreviewBanners((prev) => {
                          const copy = [...prev];
                          copy[index] = null;
                          return copy;
                        });
                        // Clear the form value explicitly to null
                        setValue(`banners.${index}.banner_image`, null);
                        console.log(`🗑️ [FRONTEND] After setValue - banner_image set to null`);
                        console.log(`🗑️ [FRONTEND] existing_banner_image preserved:`, bannerData?.existing_banner_image);
                        // Clear the file input
                        const fileInput = document.querySelector(`input[name="banners.${index}.banner_image"]`);
                        if (fileInput) fileInput.value = '';
                        console.log(`🗑️ [FRONTEND] File input cleared for banner ${index}`);
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors text-lg leading-none"
                      title="Remove image"
                    >
                      ×
                    </button>
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
                    }
                  }}
                />
              </div>

              {/* Video ID */}
              <div className="space-y-2">
                <Label>Video ID</Label>
                <Input {...register(`${bannerField}.video_id`)} />
              </div>

              {/* Video Title */}
              <div className="space-y-2 col-span-2">
                <Label>Video Title</Label>
                <Input {...register(`${bannerField}.video_title`)} />
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
            append({ banner_image: null, video_id: "", video_title: "" })
          }
        >
          + Add More Banner
        </Button>
      </div>
    </div>
  );
}

export default function AddUniversityForm({ item, onCancel, onSuccess, approvals = [], placementPartners = [], emiPartners = [] }) {
  const queryClient = useQueryClient();

  // preview states
  const [previewLogo, setPreviewLogo] = useState(null);
  const [previewBanners, setPreviewBanners] = useState([]);
  const [existingLogo, setExistingLogo] = useState(null);
  const [existingBrochure, setExistingBrochure] = useState(null);
  const [sectionPreviews, setSectionPreviews] = useState({});

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
        content:
          "",
        videoID: "",
        videoTitle: "",
      },

    },
    {
      id: "why-choose",
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
      id: "key-benefits", title: "Key Highlights", component: "UniversityKeyBenefits",
      props: {
        content: "",
      }
    },
    { id: "admission-process", title: "Admission Process", component: "UniversityAdmissionProcess", props: {image:"", content: "" } },
    {
      id: "fees-detail", title: "Fee Details", component: "UniversityFeeDetail",
      props: {
        content: "",
      }
    },
    {
      id: "placement-detail", title: "Placements Details", component: "UniversityPlacement",
      props: {
        content: "",
        placementPartners: "Yes"
      },
    },
    {
      id: "scholarship-program", title: "Scholarships Program", component: "UniversityScholarship",
      props: {
        content: "",
      }
    },
    {
      id: "sample-certificate", title: "Sample Certificate", component: "UniversitySampleCertificate",
      props: {
        content: "",
        sampleImg: "",
      }
    },
    {
      id: "university-faculties", title: "University Faculties", component: "UniversityFaculties",
      props: {
        faculties: [
          {
            name: "",
            img: "",
            designation:
              "",
            desc: "",
            place: "",
          }
        ]
      }
    },
    {
      id: "university-Emi", title: "University Emi", component: "UniversityEmi",
      props: {
        content: "",
        emiPartners: "Yes"
      }
    },
    {
      id: "university-reviews", title: "Student Ratings", component: "UniversityReviews",
      props: {
        allReviews: [
          {
            name: "",
            value: "",
            reviewContent: "",
          }
        ]
      }
    },
    {
      id: "Other-Popular-Universities", title: "Other Popular Universities", component: "UniversityOtherPopularColleges",
      props: {
        otherUniversityList: "Yes"
      }
    }, 
    {
      id: "approval-logo", title: "Approval Logo", component: "UniversityApprovalLogos",
      props: {
        univsersityApprovals: "Yes"
      }
    }, 
    {
      id: "university-lms", title: "Learning Management System(LMS)", component: "UniversityLMS",
      props: {
        content: ""
      }
    },  
    {
      id: "university-examination", title: "Examination Pattern", component: "UniversityExamination",
      props: {
        content: "" 
      }
    },  
    {
      id: "university-faq", title: "Faqs", component: "UniversityFaq",
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
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      university_name: "",
      university_slug: "",
      university_logo: null,
      university_location: "",
      university_brochure: null,
      author_name: "",
      is_active: null,
      banners: [{ banner_image: null, video_id: "", video_title: "" }],
      sections: defaultSections,
    },
  });

  useEffect(() => {
    if (!item) {
      // 🧹 Reset everything when adding new
      reset({
        university_name: "",
        university_slug: "",
        university_logo: null,
        university_location: "",
        university_brochure: null,
        author_name: "",
        banners: [{ banner_image: null, video_id: "", video_title: "" }],
        sections: defaultSections,
        approval_ids: [],
        placement_partner_ids: [],
        emi_partner_ids: [],
      });
      setPreviewLogo(null);
      setPreviewBanners([]);
      setExistingLogo(null);
      setExistingBrochure(null);
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
    console.log("🔍 item.placement_partners:", item.placement_partners);
    console.log("🔍 item.placement_partner_ids:", item.placement_partner_ids);
    let selectedPlacementPartners = [];
    if (item.placement_partners && Array.isArray(item.placement_partners)) {
      // Use pre-fetched partner objects from backend
      selectedPlacementPartners = item.placement_partners;
      console.log("✅ Using pre-fetched placement partners:", selectedPlacementPartners);
    } else {
      // Fallback: parse IDs and filter from available partners
      try {
        const ids = JSON.parse(item.placement_partner_ids || "[]");
        selectedPlacementPartners = placementPartners.filter((p) => ids.includes(p.id));
        console.log("⚠️ Fallback: filtered placement partners:", selectedPlacementPartners);
      } catch (err) {
        selectedPlacementPartners = [];
        console.error("Error parsing placement_partner_ids:", err);
      }
    }

    // Parse emi_partner_ids - use fetched objects if available, otherwise parse JSON
    console.log("🔍 item.emi_partners:", item.emi_partners);
    console.log("🔍 item.emi_partner_ids:", item.emi_partner_ids);
    let selectedEmiPartners = [];
    if (item.emi_partners && Array.isArray(item.emi_partners)) {
      // Use pre-fetched partner objects from backend
      selectedEmiPartners = item.emi_partners;
      console.log("✅ Using pre-fetched EMI partners:", selectedEmiPartners);
    } else {
      // Fallback: parse IDs and filter from available partners
      try {
        const ids = JSON.parse(item.emi_partner_ids || "[]");
        selectedEmiPartners = emiPartners.filter((p) => ids.includes(p.id));
        console.log("⚠️ Fallback: filtered EMI partners:", selectedEmiPartners);
      } catch (err) {
        selectedEmiPartners = [];
        console.error("Error parsing emi_partner_ids:", err);
      }
    }


    // Merge database sections with defaultSections template
    // Match by component name since DB uses numeric IDs
    const mergedSections = defaultSections.map((defaultSection, sectionIndex) => {
      const dbSection = item.sections?.find(s => s.component === defaultSection.component);
      if (dbSection && dbSection.props) {
        // FAQ is now simple Yes/No toggle - no special handling needed
        const merged = {
          id: dbSection.id, // Use database ID
          title: defaultSection.title,
          component: defaultSection.component,
          props: deepMergeProps(defaultSection.props, dbSection.props),
        };
        return merged;
      }
      return defaultSection;
    });

    const formValues = {
      university_name: item.university_name || "",
      university_slug: item.university_slug || "",
      university_logo: null,
      university_location: item.university_location || "",
      university_brochure: null,
      author_name: item.author_name || "",
      banners: Array.isArray(item.banners) && item.banners.length
        ? item.banners.map(b => ({
          banner_image: null,
          video_id: b.video_id || "",
          video_title: b.video_title || "",
          existing_banner_image: b.banner_image || null,
        }))
        : [{ banner_image: null, video_id: "", video_title: "" }],
      sections: mergedSections,
      approval_ids: selectedApprovals.map((a) => a.id), // <- extract IDs only
      placement_partner_ids: selectedPlacementPartners.map((p) => p.id), // <- extract IDs only
      emi_partner_ids: selectedEmiPartners.map((p) => p.id), // <- extract IDs only
    };

    reset(formValues);

    if (item.university_logo) {
      setExistingLogo(item.university_logo);
      setPreviewLogo(`${process.env.NEXT_PUBLIC_thumbnail_URL}${item.university_logo}`);
    }

    if (item.university_brochure) {
      setExistingBrochure(item.university_brochure);
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

  }, [item, reset]);

  const mutation = useMutation({
    mutationFn: async (formData) =>
      item?.id ? updateUniversity(item.id, formData) : addUniversity(formData),
    onSuccess: () => {
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
    const formData = new FormData();
    formData.append("university_name", data.university_name);
    formData.append("university_slug", data.university_slug);
    formData.append("university_location", data.university_location || "");
    formData.append("author_name", data.author_name || "");
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
      console.log("📤 [FRONTEND] New logo file uploaded");
      formData.append("university_logo", data.university_logo[0]);
    } else if (item && item.university_logo && !previewLogo && (data.university_logo === null || !data.university_logo)) {
      // In edit mode: if there was a logo before, but now previewLogo is null and form value is null, it was removed
      console.log("📤 [FRONTEND] Logo was removed - sending empty string");
      console.log("📤 [FRONTEND] Original logo from item:", item.university_logo);
      formData.append("university_logo", "");
    } else if (existingLogo && !previewLogo) {
      // Fallback: if existingLogo exists but no preview, it was removed
      console.log("📤 [FRONTEND] Logo was removed (fallback) - sending empty string");
      formData.append("university_logo", "");
    } else {
      console.log("📤 [FRONTEND] No logo change - not appending to formData");
    }
    if (data.university_brochure && data.university_brochure[0]) formData.append("university_brochure", data.university_brochure[0]);
    // 🔹 Banners (supports multiple)
    console.log("📤 [FRONTEND] Preparing banners for submission");
    console.log("📤 [FRONTEND] data.banners:", data.banners);
    console.log("📤 [FRONTEND] previewBanners:", previewBanners);
    const banners = data.banners.map((banner, index) => {
      const bannerData = { ...banner };
      console.log(`📤 [FRONTEND] Processing banner ${index}:`, banner);
      console.log(`📤 [FRONTEND] banner.banner_image:`, banner.banner_image);
      console.log(`📤 [FRONTEND] banner.existing_banner_image:`, banner.existing_banner_image);
      console.log(`📤 [FRONTEND] previewBanners[${index}]:`, previewBanners[index]);

      if (banner.banner_image instanceof FileList && banner.banner_image[0]) {
        const file = banner.banner_image[0];
        console.log(`📤 [FRONTEND] New banner file uploaded for index ${index}`);
        formData.append(`banner_image_${index}`, file);
        bannerData.banner_image = file.name; // reference name to replace in backend
      } else if (banner.existing_banner_image && banner.banner_image === null && previewBanners[index] === null) {
        // Banner image was explicitly removed:
        // - existing_banner_image exists (had an image before)
        // - banner_image is explicitly null (was set to null via setValue)
        // - previewBanners[index] is null (preview was cleared)
        console.log(`📤 [FRONTEND] Banner ${index} image was removed - setting to empty string`);
        console.log(`📤 [FRONTEND] Evidence: existing_banner_image="${banner.existing_banner_image}", banner_image=${banner.banner_image}, preview=${previewBanners[index]}`);
        bannerData.banner_image = "";
      } else if (banner.existing_banner_image && banner.existing_banner_image.trim() !== "") {
        // Keep existing banner image - don't modify it
        console.log(`📤 [FRONTEND] Banner ${index} - keeping existing image:`, banner.existing_banner_image);
        bannerData.banner_image = banner.existing_banner_image;
      } else {
        console.log(`📤 [FRONTEND] Banner ${index} - no change or no existing image`);
      }

      console.log(`📤 [FRONTEND] Final bannerData for ${index}:`, bannerData);
      return bannerData;
    });
    console.log("📤 [FRONTEND] Final banners array:", banners);

    formData.append("banners", JSON.stringify(banners));


    // Sections
    const sectionsCopy = structuredClone(data.sections || []);
    
    // ✅ Automatically set hidden fields to "Yes"
    sectionsCopy.forEach((section) => {
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
  
    });
    let sectionImageCounter = 0;
    sectionsCopy.forEach((section, sIndex) => {
      if (section.props) {
        const handleNestedFiles = (obj, path = "") => {
          Object.entries(obj).forEach(([k, v]) => {
            const currentPath = path ? `${path}.${k}` : k;
            const fieldName = `sections.${sIndex}.props.${currentPath}`;
            
            if (v instanceof FileList && v.length > 0) {
              const uniqueKey = `section_image_${sectionImageCounter}`;
              console.log(`📤 [FRONTEND] New section image file: ${fieldName} -> ${uniqueKey}`);
              formData.append(uniqueKey, v[0]);
              obj[k] = v[0].name;
              sectionImageCounter++;
            } else if (
              // Check if this is an image field that was removed
              (k.toLowerCase().includes("img") || k.toLowerCase().includes("logo") || k.toLowerCase().includes("image") || k.toLowerCase().includes("sample")) &&
              typeof v === "string" &&
              v.trim() !== "" &&
              !sectionPreviews[fieldName]
            ) {
              // Image was removed - set to empty string to delete it
              console.log(`📤 [FRONTEND] Section image removed: ${fieldName} (was: "${v}")`);
              console.log(`📤 [FRONTEND] sectionPreviews[${fieldName}]:`, sectionPreviews[fieldName]);
              obj[k] = "";
            }
            
            if (Array.isArray(v)) {
              v.forEach((item, index) => handleNestedFiles(item, `${currentPath}[${index}]`));
            } else if (v && typeof v === "object") {
              handleNestedFiles(v, currentPath);
            }
          });
        };
        handleNestedFiles(section.props);
      }
    });
    
    formData.append("sections", JSON.stringify(sectionsCopy));

    mutation.mutate(formData);
  };

  return (
    <div className="p-4">
      <div className="relative flex justify-center items-center mb-6">
        <Button variant="ghost" size="sm" onClick={onCancel} className="absolute left-0">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to List
        </Button>
        <h1 className="text-2xl font-bold">{item ? "Edit University" : "Add New University"}</h1>
      </div>

      <form className="space-y-4 max-w-4xl mx-auto">
        {/* University Info & Logo */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>University Name</Label>
            <Input {...register("university_name", { required: "University name is required" })} placeholder="Enter university name" />
            {errors.university_name && <p className="text-red-500 text-sm">{errors.university_name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>University Slug</Label>
            <Input {...register("university_slug", { required: "University slug is required" })} placeholder="Enter university slug" />
            {errors.university_slug && <p className="text-red-500 text-sm">{errors.university_slug.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Location</Label>
            <Input {...register("university_location")} placeholder="Enter university location" />
          </div>
          <div className="space-y-2" >
            <Label>Author Name</Label>
            <Input {...register("author_name")} placeholder="Enter author name" />
          </div>
          <div className="space-y-2">
            <Label>Approvals</Label>

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
              <p className="text-red-500 text-sm">{errors.approval_ids.message}</p>
            )}
          </div>

          {/* Placement Partners Multiselect */}
          <div className="space-y-2">
            <Label>Placement/Hiring Partners</Label>

            <Controller
              name="placement_partner_ids"
              control={control}
              defaultValue={[]}
              render={({ field }) => {
                return (
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
                );
              }}
            />
          </div>

          {/* EMI Partners Multiselect */}
          <div className="space-y-2">
            <Label>EMI/Financing Partners</Label>

            <Controller
              name="emi_partner_ids"
              control={control}
              defaultValue={[]}
              render={({ field }) => {
                return (
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
                );
              }}
            />
          </div>

          <div className="space-y-2">
            <Label>University Logo</Label>
            {previewLogo && (
              <div className="relative inline-block mb-2">
                <img src={previewLogo} alt="Preview" className="h-20 object-contain rounded border" />
                <button
                  type="button"
                  onClick={() => {
                    console.log("🗑️ [FRONTEND] Removing university logo");
                    console.log("🗑️ [FRONTEND] Before removal - existingLogo:", existingLogo);
                    console.log("🗑️ [FRONTEND] Before removal - previewLogo:", previewLogo);
                    // Don't clear existingLogo - we need it to detect removal on submit
                    // Only clear the preview and form value
                    setPreviewLogo(null);
                    setValue("university_logo", null);
                    console.log("🗑️ [FRONTEND] After setValue - form value should be null");
                    console.log("🗑️ [FRONTEND] existingLogo preserved for removal detection:", existingLogo);
                    // Clear the file input
                    const fileInput = document.querySelector('input[name="university_logo"]');
                    if (fileInput) fileInput.value = '';
                    console.log("🗑️ [FRONTEND] File input cleared");
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                  title="Remove image"
                >
                  ×
                </button>
              </div>
            )}
            <Input type="file" accept="image/*" {...register("university_logo")} onChange={(e) => { const file = e.target.files?.[0]; if (file) setPreviewLogo(URL.createObjectURL(file)); }} />
          </div>
          <div className="space-y-2">
            <Label>Brochure</Label>
            {existingBrochure && <p className="text-sm text-gray-600 mb-2">Current: {existingBrochure}</p>}
            <Input type="file" {...register("university_brochure")} />
          </div>
        </div>

        {/* Banner Info */}
        <div className="border-t pt-4 mt-6">
          <h3 className="text-lg font-semibold">Banner Information</h3>
          <BannerSection
            control={control}
            register={register}
            previewBanners={previewBanners}
            setPreviewBanners={setPreviewBanners}
            setValue={setValue}
            watch={watch}
          />
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
          />
        </div>

        {/* Action Buttons */}
        <div className="h-20"></div> {/* Spacer for fixed buttons */}
      </form>
      
      {/* Fixed Action Buttons */}
      {item ? (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t z-50 shadow-lg md:left-[200px]">
          <div className="flex gap-2 p-4 max-w-4xl mx-auto">
            <Button
              type="button"
              className="flex-1"
              disabled={isSubmitting || mutation.isLoading}
              onClick={handleSubmit((data) => onSubmit(data, true))}
            >
              Save with Date
            </Button>
            <Button
              type="button"
              className="flex-1"
              disabled={isSubmitting || mutation.isLoading}
              onClick={handleSubmit((data) => onSubmit(data, false))}
            >
              Save without Date
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t z-50 shadow-lg md:left-[200px]">
          <div className="flex gap-2 p-4 max-w-4xl mx-auto">
            <Button
              type="button"
              className="flex-1 bg-green-700"
              disabled={isSubmitting || mutation.isLoading}
              onClick={handleSubmit((data) => onSubmit(data, true))}
            >
              {mutation.isLoading ? "Saving..." : "Save University"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

