"use client";

import { useEffect, useState } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { addUniversity, updateUniversity } from "@/lib/universityApi";
import { notifySuccess, notifyError } from "@/lib/notify";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import  CkEditor  from "@/components/CKEditor";


// // ✅ Safe CKEditor dynamic import
// const CKEditor = dynamic(
//   async () => {
//     const mod = await import("@ckeditor/ckeditor5-react");
//     const editor = await import("@ckeditor/ckeditor5-build-classic");

//     return ({ value, onChange }) => {
//       if (typeof window === "undefined") return null; // Prevent SSR errors

//       return (
//         <mod.CKEditor
//           editor={editor.default}
//           data={value || ""}
//           onChange={(event, editorInstance) => onChange(editorInstance.getData())}
//           onReady={(editorInstance) => {
//             // Disable watchdog to prevent "model null" errors
//             if (editorInstance?.watchdog?.destroy) {
//               editorInstance.watchdog.destroy();
//             }
//           }}
//         />
//       );
//     };
//   },
//   { ssr: false }
// );

// // Optional: Ensure editor only mounts after client-side load
// export const SafeCKEditor = ({ value, onChange }) => {
//   const [mounted, setMounted] = useState(false);
//   useEffect(() => setMounted(true), []);
//   if (!mounted) return null;

//   return <CKEditor value={value} onChange={onChange} />;
// };
// Approval Selector Component (separate component to avoid useState in render callback)
function ApprovalSelector({ field, approvals }) {
  const selected = field.value || [];
  const [selectValue, setSelectValue] = useState("");

  const addApproval = (approval) => {
    if (!approval?.id) return;
    if (!selected.some((s) => s.id === approval.id)) {
      field.onChange([...selected, approval]);
    }
    setSelectValue("");
  };

  const removeApproval = (approval) => {
    field.onChange(selected.filter((s) => s.id !== approval.id));
  };

  return (
    <>
      <Select
        value={selectValue || ""}
        onValueChange={(val) => {
          if (!val) return;
          const id = parseInt(val, 10);
          if (isNaN(id)) return;
          const approval = approvals.find((a) => a.id === id);
          if (approval) addApproval(approval);
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select approvals" />
        </SelectTrigger>
        <SelectContent>
          {approvals.map((a) => {
            if (!a?.title) return null;
            const disabled = selected.some((s) => s.id === a.id);
            return (
              <SelectItem
                key={a.id}
                value={a.id.toString()}
                disabled={disabled}
              >
                {a.title}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selected.map((a) => (
            <span
              key={a.id}
              className="flex items-center bg-gray-200 text-sm px-2 py-1 rounded-full"
            >
              {a.title}
              <button
                type="button"
                onClick={() => removeApproval(a)}
                className="ml-2 text-gray-600 hover:text-red-500"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </>
  );
}

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

const DynamicArrayField = ({
  control,
  register,
  name,
  value,
  renderPropsInputs,
  sectionPreviews,
  setSectionPreviews,
}) => {
  const { fields, append, remove } = useFieldArray({ control, name });

  // 🧠 store initial count to distinguish preloaded vs newly added items
  const [initialCount] = useState(fields.length);

  // helper for generating empty structure from template
  const createEmptyStructure = (obj) => {
    if (Array.isArray(obj)) return [createEmptyStructure(obj[0])];
    if (typeof obj === "object" && obj !== null)
      return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, createEmptyStructure(v)]));
    return "";
  };

  return (
    <div className="mb-4 p-3 border rounded-md bg-gray-50">
      {fields.map((field, index) => (
        <div key={field.id} className="relative mb-3 p-3 border rounded bg-white">
          {renderPropsInputs(
            control,
            register,
            `${name}.${index}`,
            value[0],
            null,
            sectionPreviews,
            setSectionPreviews
          )}

          {/* ✅ show Remove only for newly added items */}
          {index >= initialCount && (
            <Button
              type="button"
              size="sm"
              variant="destructive"
              className=""
              onClick={() => remove(index)}
            >
              Remove
            </Button>
          )}
        </div>
      ))}

      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={() =>
          append(
            typeof value[0] === "object" ? createEmptyStructure(value[0]) : ""
          )
        }
      >
        + Add More
      </Button>
    </div>
  );
};


// Recursive renderer for section props (handles nested arrays/objects & images)
const renderPropsInputs = (
  control,
  register,
  path,
  props,
  watch,
  sectionPreviews,
  setSectionPreviews
) => {
  return Object.entries(props).map(([key, value]) => {
    const fieldName = `${path}.${key}`;

    // Handle image/file inputs
    if (
      key.toLowerCase().includes("img") ||
      key.toLowerCase().includes("logo") ||
      key.toLowerCase().includes("image") ||
      key.toLowerCase().includes("sample")
    ) {
      const previewURL =
        sectionPreviews[fieldName] ||
        (typeof value === "string" && value
          ? value.startsWith("/uploads/")
            ? `${process.env.NEXT_PUBLIC_thumbnail_URL}${value}`
            : value // handles full URL or CDN images
          : null);


      return (
        <div key={fieldName} className="mb-4">
          <Label className="capitalize">{key}</Label>
          <Input
            type="file"
            accept="image/*"
            {...register(fieldName)}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setSectionPreviews((prev) => ({
                  ...prev,
                  [fieldName]: URL.createObjectURL(file),
                }));
              }
            }}
          />
          {previewURL && (
            <img
              src={previewURL}
              alt="preview"
              className="h-20 object-contain rounded border mt-2"
            />
          )}
        </div>
      );
    }

    // Handle CKEditor content fields
    if (key === "content" || key === "answer") {
      return (
        <Controller
          key={fieldName}
          name={fieldName}
          control={control}
          render={({ field }) => (
            <div className="mb-4">
              <Label className="capitalize">{key}</Label>
              <CkEditor  value={field.value || ""} onChange={field.onChange} />
            </div>
          )}
        />
      );
    }

    // ✅ Handle arrays with Add/Remove
    if (Array.isArray(value)) {
      return (
        <DynamicArrayField
          key={fieldName}
          control={control}
          register={register}
          name={fieldName}
          value={value}
          renderPropsInputs={renderPropsInputs}
          sectionPreviews={sectionPreviews}
          setSectionPreviews={setSectionPreviews}
        />

      );
    }

    // Handle nested objects recursively
    if (typeof value === "object" && value !== null) {
      return (
        <div key={fieldName} className="pl-3 border-l-2 mb-4">
          <h4 className="font-medium mb-2 capitalize">{key}</h4>
          {renderPropsInputs(
            control,
            register,
            fieldName,
            value,
            watch,
            sectionPreviews,
            setSectionPreviews
          )}
        </div>
      );
    }

    // Handle plain input fields
    return (
      <div key={fieldName} className="mb-4">
        <Label className="capitalize">{key}</Label>
        <Input {...register(fieldName)} defaultValue={value || ""} />
      </div>
    );
  });
};


// Component to render all sections dynamically
const SectionsForm = ({ sections, control, register, sectionPreviews, setSectionPreviews, watch }) => {
  return (
    <div className="space-y-6">
      {sections.map((section, sIndex) => (
        <div key={section.id} className="p-4 border rounded-md">
          <h3 className="font-semibold text-lg mb-2">{section.title}</h3>
          {section.props ? (
            renderPropsInputs(
              control,
              register,
              `sections.${sIndex}.props`,
              section.props,
              watch,
              sectionPreviews,
              setSectionPreviews
            )
          ) : (
            <p className="text-gray-500">No editable fields for this section</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default function AddUniversityDialog({ item, open, onOpenChange, onItemAdded, approvals = [] }) {
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
            bgColor: "",
          }
        ],
      },
    },
    {
      id: "popular-courses", title: "Popular Courses", component: "UniversityCourses",
      props: {
        coursesList: [
          {
            name: "",
            numberOfSpecialization: "",
            fees: "",
            mode: "",
            duration: "",
            link: "",
            img: "",
          }
        ]
      }
    },
    {
      id: "key-benefits", title: "Key Highlights", component: "UniversityKeyBenefits",
      props: {
        content: "",
      }
    },
    { id: "admission-process", title: "Admission Process", component: "UniversityAdmissionProcess", props: { content: "" } },
    {
      id: "fees-detail", title: "Fee Details", component: "UniversityFeeDetail",
      props: {
        content: "",
      }
    },
    // {
    //   id: "approval-logo", title: "University Approval Logo", component: "UniversityApprovalLogos",
    //   props: {
    //     universityLogo:
    //       "",
    //     universityName: "",
    //     universityApprovals: [
    //       {
    //         logo: "",
    //         name: "",
    //         content:
    //           "",
    //       }
    //     ],
    //   }
    // },
    {
      id: "placement-detail", title: "Placements Details", component: "UniversityPlacement",
      props: {
        content: "",
        placementPartners: [
          {
            logo: "",
            name: "",
          }
        ]
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
            university:
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
        emiPartners: [
          {
            name: "",
            img: ""
          }
        ],
      }
    },
    {
      id: "university-reviews", title: "What Student Say", component: "UniversityReviews",
      props: {
        allReviews: [
          {
            name: "",
            value: "",
            content: "",
          }
        ]
      }
    },
    {
      id: "university-latest-articles", title: "University Latest Articles", component: "UniversityLatestArticles",
      props: {
        allArticles: [
          {
            img: "",
            title:
              "",
            link: "",
          }
        ]
      }
    },
    {
      id: "university-Other-popular-colleges", title: "Other Popular Universities", component: "UniversityOtherPopularColleges",
      props: {
        otherUniversityList: [
          {
            name: "",
            image: "",
            courseCount: "",
            category: "",
            link: "",
          }
        ]
      }
    },
    {
      id: "university-faq", title: "Faqs", component: "UniversityFaq",
      props: {
        faqData: [
          {
            category: "",
            slug: "",
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
        university_logo: null,
        university_location: "",
        university_brochure: null,
        author_name: "",
        is_active: null,
        banners: [{ banner_image: null, video_id: "", video_title: "" }],
        sections: defaultSections,
        approval_ids: [],
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

    const formValues = {
      university_name: item.university_name || "",
      university_logo: null,
      university_location: item.university_location || "",
      university_brochure: null,
      author_name: item.author_name || "",
      is_active: Boolean(item.is_active),
      banners: Array.isArray(item.banners) && item.banners.length
        ? item.banners.map(b => ({
          banner_image: null,
          video_id: b.video_id || "",
          video_title: b.video_title || "",
          existing_banner_image: b.banner_image || null,
        }))
        : [{ banner_image: null, video_id: "", video_title: "" }],
      sections: Array.isArray(item.sections) ? item.sections.map(s => ({
        id: s.id,
        title: s.title,
        component: s.component,
        props: s.props || {},
      })) : [],
      approval_ids: selectedApprovals, // <- use the parsed array of objects
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

    // Set section previews recursively
    if (Array.isArray(item.sections)) {
      item.sections.forEach((section, sIndex) => {
        const setPreviewsRecursive = (obj, path) => {
          Object.entries(obj).forEach(([k, v]) => {
            const currentPath = `${path}.${k}`;
            if ((k.toLowerCase().includes("img") || k.toLowerCase().includes("logo") || k.toLowerCase().includes("sample")) && typeof v === "string" && v.startsWith("/uploads/")) {
              setSectionPreviews(prev => ({ ...prev, [currentPath]: `${process.env.NEXT_PUBLIC_thumbnail_URL}${v}` }));
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
    }

  }, [item, open, reset]);



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
      onOpenChange(false);
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["universities"], exact: false });
        onItemAdded?.();
      }, 200);
    },
    onError: (err) => {
      notifyError(err.response?.data?.message || "Operation failed");
    },
  });

  const onSubmit = (data, saveWithDate = true) => {
    const formData = new FormData();
    formData.append("university_name", data.university_name);
    formData.append("university_location", data.university_location || "");
    formData.append("author_name", data.author_name || "");
    const approvalIds = (data.approval_ids || []).map((a) => a.id);
    formData.append("approval_id", JSON.stringify(approvalIds));
    formData.append("is_active", data.is_active ? true : false);
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
    sectionsCopy.forEach((section) => {
      if (section.props) {
        const handleNestedFiles = (obj) => {
          Object.entries(obj).forEach(([k, v]) => {
            if (v instanceof FileList && v.length > 0) {
              formData.append("section_images", v[0]);
              obj[k] = v[0].name;
            }
            if (Array.isArray(v)) {
              v.forEach((item) => handleNestedFiles(item));
            } else if (v && typeof v === "object") {
              handleNestedFiles(v);
            }
          });
        };
        handleNestedFiles(section.props);
      }
    });
    formData.append("sections", JSON.stringify(sectionsCopy));

    mutation.mutate(formData);
  };
  // Simple fix: just disable focus guards
  useEffect(() => {
    if (!open) return;

    const timeoutId = setTimeout(() => {
      const focusGuards = document.querySelectorAll("[data-radix-focus-guard]");
      focusGuards.forEach((guard) => {
        guard.style.display = "none";
      });
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="hidden">Open Modal</Button>
      </DialogTrigger>

      <DialogContent 
        className="sm:max-w-3.5xl max-h-[90vh] overflow-y-auto"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
        onInteractOutside={(e) => {
          // Prevent closing when clicking CKEditor balloons
          if (e.target.closest('.ck-balloon-panel')) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>{item ? "Edit University" : "Add New University"}</DialogTitle>
        </DialogHeader>

        <form className="space-y-4">
          {/* University Info & Logo */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>University Name</Label>
              <Input {...register("university_name", { required: "University name is required" })} placeholder="Enter university name" />
              {errors.university_name && <p className="text-red-500 text-sm">{errors.university_name.message}</p>}
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
                defaultValue={item?.approval_ids || []}
                rules={{ required: "At least one approval is required" }}
                render={({ field }) => (
                  <ApprovalSelector field={field} approvals={approvals} />
                )}
              />


              {errors.approval_ids && (
                <p className="text-red-500 text-sm">{errors.approval_ids.message}</p>
              )}
            </div>

            <div className="flex items-center gap-2 mt-1">
              <Checkbox {...register("is_active")} />
              <Label>Active</Label>
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
          {item ? (
            <div className="flex gap-2 mt-6">
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
            </div>
          ) : (
            <Button
              type="button"
              className="w-full mt-6"
              disabled={isSubmitting || mutation.isLoading}
              onClick={handleSubmit((data) => onSubmit(data, true))}
            >
              {mutation.isLoading ? "Saving..." : "Save University"}
            </Button>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
