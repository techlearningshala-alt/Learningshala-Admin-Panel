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
function BannerSection({ control, register, previewBanners, setPreviewBanners }) {
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
                  <img
                    src={previewBanners[index]}
                    alt="Banner Preview"
                    className="h-20 object-contain rounded border mb-2"
                  />
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
      title: "About",
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
            desc: "",
            bgColor: "#f0f8ff",
          },
          {
            title: "",
            desc: "",
            bgColor: "#fff8dc",
          },
          {
            title: "",
            desc: "",
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
      id: "university-reviews", title: "What Student Say", component: "UniversityReviews",
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
      id: "approval-logo", title: "University Approval Logo", component: "UniversityApprovalLogos",
      props: {
        univsersityApprovals: "Yes"
      }
    }, 
    {
      id: "university-lms", title: "University LMS", component: "UniversityLMS",
      props: {
        content: ""
      }
    },  
    {
      id: "university-examination", title: "University Examination", component: "UniversityExamination",
      props: {
        content: "" 
      }
    },  
    {
      id: "university-faq", title: "Faqs", component: "UniversityFaq",
      props: {
        faqData: [
          {
            category: "",
            cat_id: "",
            items: [
              {
                id: "",
                question: "",
                answer:
                  "",
              }
            ]
          }
        ],
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
    const mergedSections = defaultSections.map(defaultSection => {
      const dbSection = item.sections?.find(s => s.component === defaultSection.component);
      if (dbSection && dbSection.props) {
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
        const setPreviewsRecursive = (obj, path) => {
          Object.entries(obj).forEach(([k, v]) => {
            const currentPath = `${path}.${k}`;
            if ((k.toLowerCase().includes("img") || k.toLowerCase().includes("logo") || k.toLowerCase().includes("sample")) && typeof v === "string" && v.startsWith("/uploads/")) {
              newPreviews[currentPath] = `${process.env.NEXT_PUBLIC_thumbnail_URL}${v}`;
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
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["universities"], exact: false });
        onSuccess?.();
      }, 200);
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

    if (data.university_logo && data.university_logo[0]) formData.append("university_logo", data.university_logo[0]);
    if (data.university_brochure && data.university_brochure[0]) formData.append("university_brochure", data.university_brochure[0]);
    // 🔹 Banners (supports multiple)
    const banners = data.banners.map((banner, index) => {
      const bannerData = { ...banner };

      if (banner.banner_image instanceof FileList && banner.banner_image[0]) {
        const file = banner.banner_image[0];
        formData.append(`banner_image_${index}`, file);
        bannerData.banner_image = file.name; // reference name to replace in backend
      }

      return bannerData;
    });

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
    
    // ✅ Auto-generate slug and id for FAQ section
    if (section.id === "university-faq" && section.props?.faqData) {
      const universitySlug = data.university_slug || data.university_name?.toLowerCase().replace(/\s+/g, "-") || "university";
      
      section.props.faqData.forEach((category, catIndex) => {
        // Generate slug from university name + category index (only if not already set)
        if (!category.slug) {
          const categorySlug = `${universitySlug}-faq-category-${catIndex + 1}`;
          category.slug = categorySlug;
        }
        
        // Generate cat_id from category name (slugified) or use index as fallback
        if (!category.cat_id && category.category) {
          category.cat_id = category.category.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
        } else if (!category.cat_id) {
          category.cat_id = `category-${catIndex + 1}`;
        }
        
        // For each item, set id = question (trimmed, unique identifier) - only if not already set
        if (category.items && Array.isArray(category.items)) {
          category.items.forEach((item) => {
            if (item.question && !item.id) {
              // Use question as unique id (trimmed)
              item.id = item.question.trim();
            } else if (item.question && item.id !== item.question.trim()) {
              // Update id if question changed
              item.id = item.question.trim();
            }
          });
        }
      });
    }
    });
    let sectionImageCounter = 0;
    sectionsCopy.forEach((section, sIndex) => {
      if (section.props) {
        const handleNestedFiles = (obj, path = "") => {
          Object.entries(obj).forEach(([k, v]) => {
            const currentPath = path ? `${path}.${k}` : k;
            if (v instanceof FileList && v.length > 0) {
              const uniqueKey = `section_image_${sectionImageCounter}`;
              formData.append(uniqueKey, v[0]);
              obj[k] = v[0].name;
              sectionImageCounter++;
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
            {previewLogo && <img src={previewLogo} alt="Preview" className="h-20 object-contain rounded border mb-2" />}
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
          />
        </div>


        {/* Sections */}
        <div className="border-t pt-4 mt-6">
          <h3 className="text-lg font-semibold">Sections</h3>
          <SectionsForm
            sections={watch("sections") || []}
            control={control}
            register={register}
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

