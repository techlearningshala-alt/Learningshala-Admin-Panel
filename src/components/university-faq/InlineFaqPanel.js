import { useMemo, useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import DataTable from "@/components/table/DataTable";
import CKEditor from "@/components/CKEditor";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  fetchUniversityFaqCategories,
  fetchUniversityFaqs,
  addUniversityFaq,
  updateUniversityFaq,
  deleteUniversityFaq,
  addUniversityFaqCategory,
} from "@/lib/api";
import {
  fetchUniversityCourseFaqs,
  addUniversityCourseFaq,
  updateUniversityCourseFaq,
  deleteUniversityCourseFaq,
  fetchUniversityCourseSpecializationFaqs,
  addUniversityCourseSpecializationFaq,
  updateUniversityCourseSpecializationFaq,
  deleteUniversityCourseSpecializationFaq,
} from "@/lib/universityApi";
import { notifySuccess, notifyError } from "@/lib/notify";
import { Plus, Pencil, Trash } from "lucide-react";

const FAQ_FETCH_LIMIT = 100;

const stripHtml = (input = "") => input.replace(/<[^>]*>?/gm, "");

const HtmlContent = ({ content }) => {
  if (!content || typeof content !== "string") {
    return <span className="text-muted-foreground">-</span>;
  }

  const trimmed = content.trim();
  if (!trimmed) {
    return <span className="text-muted-foreground">-</span>;
  }

  const hasHtml = /<[^>]+>/.test(trimmed);

  if (!hasHtml) {
    return (
      <div className="text-sm whitespace-pre-wrap break-words leading-5">
        {trimmed}
      </div>
    );
  }

  return (
    <div
      className="prose prose-sm max-w-none text-sm leading-5 break-words [&_*]:text-foreground"
      dangerouslySetInnerHTML={{ __html: trimmed }}
    />
  );
};

function FaqForm({
  categories,
  defaultValues,
  onSubmit,
  onCancel,
  submitLabel = "Save FAQ",
  disableSubmit,
  isEditing,
  containerClassName = "border rounded-lg p-4 bg-white shadow-sm mt-4",
}) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      category_id: defaultValues?.category_id ? String(defaultValues.category_id) : "",
      title: defaultValues?.title ?? "",
      description: defaultValues?.description ?? "",
      saveWithDate: defaultValues?.saveWithDate ?? true,
    },
  });

  useEffect(() => {
    reset({
      category_id: defaultValues?.category_id ? String(defaultValues.category_id) : "",
      title: defaultValues?.title ?? "",
      description: defaultValues?.description ?? "",
      saveWithDate: defaultValues?.saveWithDate ?? true,
    });
  }, [defaultValues, reset]);

  const submitFaq = async (values, addAnother) => {
    const payload = {
      ...values,
      category_id: Number(values.category_id),
      saveWithDate: Boolean(values.saveWithDate),
    };
    const success = await onSubmit(payload, { addAnother });
    if (success === false) return;

    if (addAnother) {
      reset({
        category_id: "",
        title: "",
        description: "",
        saveWithDate: true,
      });
    } else {
      onCancel();
    }
  };

  const handleStandardSubmit = handleSubmit((values) => submitFaq(values, false));

  const handleSubmitAndAddAnother = handleSubmit((values) => submitFaq(values, true));

  const renderCategoryOptions = () => (
    <select
      className="w-full border rounded px-3 py-2"
      disabled={disableSubmit}
      {...register("category_id", { required: "Category is required" })}
    >
      <option value="" disabled>
        Select category
      </option>
      {categories.map((cat) => (
        <option key={cat.id} value={cat.id}>
          {cat.heading}
        </option>
      ))}
    </select>
  );

  return (
    <div className={containerClassName}>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Category</Label>
          {renderCategoryOptions()}
          {errors.category_id && (
            <p className="text-sm text-red-500">{errors.category_id.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Question</Label>
          <Input
            placeholder="Enter question"
            disabled={disableSubmit}
            {...register("title", { required: "Question is required" })}
          />
          {errors.title && (
            <p className="text-sm text-red-500">{errors.title.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Answer</Label>
          <Controller
            name="description"
            control={control}
            rules={{ required: "Answer is required" }}
            render={({ field }) => (
              <CKEditor value={field.value || ""} onChange={(html) => field.onChange(html)} />
            )}
          />
          {errors.description && (
            <p className="text-sm text-red-500">{errors.description.message}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="faq-save-with-date"
            {...register("saveWithDate")}
            className="h-4 w-4"
          />
          <Label htmlFor="faq-save-with-date" className="cursor-pointer text-sm">
            Update the last modified date
          </Label>
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            className="flex-1"
            disabled={isSubmitting || disableSubmit}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              handleStandardSubmit();
            }}
          >
            {isSubmitting ? "Saving..." : submitLabel}
          </Button>
          {!isEditing && (
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              disabled={isSubmitting || disableSubmit}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                handleSubmitAndAddAnother();
              }}
            >
              Save & Add Another
            </Button>
          )}
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function UniversityFaqInlinePanel({
  universityId,
  courseId,
  specializationId,
  universityName,
  courseName,
  specializationName,
  stagedFaqs,
  setStagedFaqs,
  type = "university", // "university", "course", or "specialization"
}) {
  const queryClient = useQueryClient();
  const [isFaqFormOpen, setIsFaqFormOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  
  // Determine entity ID and type
  const entityId = type === "course" ? courseId : type === "specialization" ? specializationId : universityId;
  const entityName = type === "course" ? courseName : type === "specialization" ? specializationName : universityName;
  const isExistingEntity = Boolean(entityId);
  
  // Select API functions based on type
  const apiFunctions = useMemo(() => {
    if (type === "course") {
      return {
        fetchFaqs: fetchUniversityCourseFaqs,
        addFaq: addUniversityCourseFaq,
        updateFaq: updateUniversityCourseFaq,
        deleteFaq: deleteUniversityCourseFaq,
        entityIdKey: "course_id",
        queryKey: "university-course-faq-inline",
      };
    }
    if (type === "specialization") {
      return {
        fetchFaqs: fetchUniversityCourseSpecializationFaqs,
        addFaq: addUniversityCourseSpecializationFaq,
        updateFaq: updateUniversityCourseSpecializationFaq,
        deleteFaq: deleteUniversityCourseSpecializationFaq,
        entityIdKey: "specialization_id",
        queryKey: "university-course-specialization-faq-inline",
      };
    }
    return {
      fetchFaqs: fetchUniversityFaqs,
      addFaq: addUniversityFaq,
      updateFaq: updateUniversityFaq,
      deleteFaq: deleteUniversityFaq,
      entityIdKey: "university_id",
      queryKey: "university-faq-inline",
    };
  }, [type]);

  const { data: categoriesData, isLoading: isLoadingCategories, refetch: refetchCategories } = useQuery({
    queryKey: ["university-faq-inline-categories"],
    queryFn: () => fetchUniversityFaqCategories({ page: 1, limit: 100 }),
  });

  const rawCategories = categoriesData?.data?.data;
  const categories = useMemo(() => rawCategories || [], [rawCategories]);
  const categoryMap = useMemo(() => {
    const map = new Map();
    categories.forEach((cat) => map.set(cat.id, cat.heading));
    return map;
  }, [categories]);

  const {
    data: faqsData,
    isLoading: isLoadingFaqs,
  } = useQuery({
    queryKey: [apiFunctions.queryKey, entityId],
    queryFn: () => {
      const params = { page: 1, limit: FAQ_FETCH_LIMIT };
      params[apiFunctions.entityIdKey] = entityId;
      return apiFunctions.fetchFaqs(params);
    },
    enabled: isExistingEntity,
  });

  const remoteFaqs = faqsData?.data?.data || [];
  const faqsToDisplay = isExistingEntity
    ? remoteFaqs.map((faq) => ({
        ...faq,
        _isRemote: true,
        category_label: faq.heading || categoryMap.get(faq.category_id) || "-",
        category_id: faq.category_id,
        description_preview: stripHtml(faq.description || ""),
      }))
    : (stagedFaqs || []).map((faq) => ({
        ...faq,
        _isRemote: false,
        id: faq.tempId,
        category_label: faq.category_label || categoryMap.get(faq.category_id) || "-",
        description_preview: stripHtml(faq.description || ""),
      }));

  const handleOpenFaqForm = (faq = null) => {
    setEditingFaq(faq);
    setIsFaqFormOpen(true);
  };

  const handleCloseFaqForm = () => {
    setEditingFaq(null);
    setIsFaqFormOpen(false);
  };

  const handleSaveFaq = async (values, { addAnother = false } = {}) => {
    const payload = {
      category_id: values.category_id,
      title: values.title.trim(),
      description: values.description,
      saveWithDate: values.saveWithDate,
    };

    const finalPayload = {
      category_id: Number(payload.category_id),
      title: payload.title,
      description: payload.description,
      saveWithDate: payload.saveWithDate,
    };

    if (!isExistingEntity) {
      if (editingFaq?._isRemote === false || editingFaq?.tempId) {
        setStagedFaqs((prev = []) =>
          prev.map((faq) =>
            faq.tempId === editingFaq.tempId
              ? {
                  ...finalPayload,
                  category_label: categoryMap.get(finalPayload.category_id) || "-",
                  tempId: editingFaq.tempId,
                }
              : faq
          )
        );
        notifySuccess("FAQ updated locally");
      } else {
        const tempId = `temp-${Date.now()}-${Math.random().toString(16).slice(2)}`;
        setStagedFaqs((prev = []) => [
          ...prev,
          {
            ...finalPayload,
            category_label: categoryMap.get(finalPayload.category_id) || "-",
            tempId,
          },
        ]);
        const entityType = type === "course" ? "course" : type === "specialization" ? "specialization" : "university";
        notifySuccess(`FAQ staged. It will be saved after the ${entityType} is created.`);
      }
      if (!addAnother) {
        handleCloseFaqForm();
      } else {
        setEditingFaq(null);
        setIsFaqFormOpen(true);
      }
      return true;
    }

    try {
      if (editingFaq?._isRemote && editingFaq.id) {
        await apiFunctions.updateFaq(editingFaq.id, {
          ...finalPayload,
          [apiFunctions.entityIdKey]: entityId,
        });
        notifySuccess("FAQ updated successfully");
      } else {
        await apiFunctions.addFaq({
          ...finalPayload,
          [apiFunctions.entityIdKey]: entityId,
        });
        notifySuccess("FAQ added successfully");
      }
      queryClient.invalidateQueries([apiFunctions.queryKey, entityId]);
      if (!addAnother) {
        handleCloseFaqForm();
      } else {
        setEditingFaq(null);
        setIsFaqFormOpen(true);
      }
      return true;
    } catch (error) {
      console.error("Failed to save FAQ", error);
      notifyError(error.response?.data?.message || "Failed to save FAQ");
      return false;
    }
  };

  const handleDeleteFaq = async (faq) => {
    if (!isExistingEntity) {
      setStagedFaqs((prev = []) => prev.filter((item) => item.tempId !== faq.id));
      notifySuccess("FAQ removed from staged list");
      return;
    }

    if (!confirm("Are you sure you want to delete this FAQ?")) return;

    try {
      await apiFunctions.deleteFaq(faq.id);
      notifySuccess("FAQ deleted successfully");
      queryClient.invalidateQueries([apiFunctions.queryKey, entityId]);
    } catch (error) {
      console.error("Failed to delete FAQ", error);
      notifyError(error.response?.data?.message || "Failed to delete FAQ");
    }
  };

  const faqColumns = [
    {
      key: "category_label",
      label: "Category",
      width: "12%",
      style: { width: "12%" },
      cellClassName: "border px-2 py-1 align-middle text-muted-foreground",
      contentClassName: "truncate",
      headerClassName: "border px-2 py-1 text-left",
    },
    {
      key: "title",
      label: "Question",
    },
    {
      key: "description",
      label: "Answer",
      render: (row) => <HtmlContent content={row.description} />,
    },
  ];

  const faqActions = [
    {
      key: (props) => (
        <Button
          size="sm"
          variant="ghost"
          type="button"
          onClick={() => handleOpenFaqForm(props.row)}
          className="h-8 w-5 p-0"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      ),
    },
    {
      key: (props) => (
        <Button
          size="sm"
          variant="ghost"
          type="button"
          onClick={() => handleDeleteFaq(props.row)}
          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
        >
          <Trash className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6 mt-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          {!isExistingEntity}
          {categories.length === 0 && (
            <p className="mt-2 text-xs text-destructive">No categories found. Please create categories first in the University FAQs page.</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button type="button" onClick={() => handleOpenFaqForm(null)} disabled={isLoadingCategories || categories.length === 0}>
            <Plus className="h-4 w-4 mr-1" /> Add FAQ
          </Button>
        </div>
      </div>

      <div className="border rounded-lg bg-white">
        {/* <div className="p-4 border-b">
          <h4 className="font-semibold text-sm uppercase tracking-wide">FAQs</h4>
        </div> */}
        <div className="p-4">
          {isExistingEntity ? (
            isLoadingFaqs ? (
              <p className="text-sm text-muted-foreground">Loading FAQs…</p>
            ) : faqsToDisplay.length ? (
              <DataTable columns={faqColumns} data={faqsToDisplay} actions={faqActions} />
            ) : (
              <p className="text-sm text-muted-foreground">No FAQs yet. Use &ldquo;Add FAQ&rdquo; to create one.</p>
            )
          ) : stagedFaqs?.length ? (
            <DataTable columns={faqColumns} data={faqsToDisplay} actions={faqActions} />
          ) : (
            <p className="text-sm text-muted-foreground">No FAQs yet. Use &ldquo;Add FAQ&rdquo; to create one.</p>
          )}
        </div>
      </div>

      <Dialog
        open={isFaqFormOpen}
        onOpenChange={(open) => {
          if (!open) {
            handleCloseFaqForm();
          } else {
            setIsFaqFormOpen(true);
          }
        }}
      >
        <DialogContent className="w-[95vw] max-w-[95vw] sm:w-[90vw] sm:max-w-[90vw] lg:w-[85vw] lg:max-w-[85vw] p-0 overflow-hidden">
          <div className="max-h-[75vh] overflow-y-auto p-6 space-y-4">
            <DialogHeader>
              <DialogTitle>{editingFaq ? "Edit FAQ" : "Add FAQ"}</DialogTitle>
              <DialogDescription>
                {editingFaq
                  ? "Update the FAQ details below."
                  : "Fill in the question and answer to add a new FAQ."}
              </DialogDescription>
            </DialogHeader>
            {isFaqFormOpen && (
              <FaqForm
                categories={categories}
                defaultValues={editingFaq?.id ? editingFaq : editingFaq?.tempId ? editingFaq : undefined}
                onSubmit={handleSaveFaq}
                onCancel={handleCloseFaqForm}
                submitLabel={editingFaq ? "Update FAQ" : "Save FAQ"}
                disableSubmit={isLoadingCategories}
                isEditing={Boolean(editingFaq)}
                containerClassName="space-y-4"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
