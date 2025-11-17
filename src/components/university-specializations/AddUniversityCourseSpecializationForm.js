"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchAllUniversities,
  fetchUniversityCourses,
  fetchUniversityCourseById,
  createUniversityCourseSpecialization,
  updateUniversityCourseSpecialization,
} from "@/lib/universityApi";
import { notifySuccess, notifyError } from "@/lib/notify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";

const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_thumbnail_URL || "";
const DEFAULT_LIMIT = 200;

const defaultValues = {
  university_course_id: "",
  name: "",
  slug: "",
  full_fees: "",
  sem_fees: "",
  duration: "",
  label: "",
  image: null,
  icon: null,
};

const normalizeApiList = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  return [];
};

export default function AddUniversityCourseSpecializationForm({
  specialization,
  onCancel,
  onSuccess,
  universityId,
  courseId,
}) {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues });

  const specializationId = specialization?.id;
  const isEdit = Boolean(specializationId);

  const [selectedUniversity, setSelectedUniversity] = useState(
    initialUniversity ? String(initialUniversity) : ""
  );
  const [imagePreview, setImagePreview] = useState(null);
  const [iconPreview, setIconPreview] = useState(null);
  const [imageRemoved, setImageRemoved] = useState(false);
  const [iconRemoved, setIconRemoved] = useState(false);

  const {
    data: universitiesResponse,
    isLoading: isLoadingUniversities,
  } = useQuery({
    queryKey: ["universities", "all"],
    queryFn: fetchAllUniversities,
  });

  const universities = normalizeApiList(universitiesResponse?.data ?? universitiesResponse);

  const { data: coursesResponse, isLoading: isCoursesLoading } = useQuery({
    queryKey: ["university-courses", "options", selectedUniversity],
    queryFn: () =>
      fetchUniversityCourses({
        page: 1,
        limit: DEFAULT_LIMIT,
        university_id: selectedUniversity || undefined,
      }),
    enabled: Boolean(selectedUniversity),
  });

  const courseOptions = useMemo(() => {
    if (!coursesResponse) return [];
    return normalizeApiList(coursesResponse?.data ?? coursesResponse);
  }, [coursesResponse]);

  const { data: specializationCourseDetail } = useQuery({
    queryKey: ["specialization-course", specialization?.university_course_id],
    queryFn: () => fetchUniversityCourseById(specialization.university_course_id),
    enabled: Boolean(specialization?.university_course_id),
  });

  useEffect(() => {
    const detail = specializationCourseDetail;
    if (detail?.university_id) {
      setSelectedUniversity(String(detail.university_id));
      if (detail.id) {
        setValue("university_course_id", String(detail.id));
      }
    }
  }, [specializationCourseDetail, setValue]);

  useEffect(() => {
    if (universities.length && !selectedUniversity && universityId) {
      setSelectedUniversity(String(universityId));
    }
  }, [universities, universityId, selectedUniversity]);

  useEffect(() => {
    if (isEdit) {
      const merged = { ...defaultValues, ...specialization };
      reset({
        ...merged,
        university_course_id: merged.university_course_id
          ? String(merged.university_course_id)
          : "",
      });
      if (merged.university_id) {
        setSelectedUniversity(String(merged.university_id));
      }
      if (merged.image) {
        setImagePreview(
          merged.image.startsWith("http")
            ? merged.image
            : `${IMAGE_BASE_URL}${merged.image}`
        );
      } else {
        setImagePreview(null);
      }
      if (merged.icon) {
        setIconPreview(
          merged.icon.startsWith("http")
            ? merged.icon
            : `${IMAGE_BASE_URL}${merged.icon}`
        );
      } else {
        setIconPreview(null);
      }
      setImageRemoved(false);
      setIconRemoved(false);
    } else {
      reset(defaultValues);
      if (universityId) {
        setSelectedUniversity(String(universityId));
      } else {
        setSelectedUniversity("");
      }
      if (courseId) {
        setValue("university_course_id", String(courseId));
      } else {
        setValue("university_course_id", "");
      }
      setImagePreview(null);
      setIconPreview(null);
      setImageRemoved(false);
      setIconRemoved(false);
    }
  }, [isEdit, specialization, reset, universityId, courseId]);

  const mutation = useMutation({
    mutationFn: async (formData) => {
      if (isEdit) {
        return updateUniversityCourseSpecialization(specializationId, formData);
      }
      return createUniversityCourseSpecialization(formData);
    },
    onSuccess: () => {
      notifySuccess(
        `Course specialization ${isEdit ? "updated" : "created"} successfully`
      );
      queryClient.invalidateQueries(["university-course-specializations"]);
      onSuccess?.();
    },
    onError: (err) =>
      notifyError(err?.response?.data?.message || "Failed to save specialization"),
  });

  const submitSpecialization = (data, saveWithDate = true) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value === undefined) return;
      if (key === "image" || key === "icon") {
        const fileList = value;
        if (fileList instanceof FileList && fileList.length > 0) {
          formData.append(key, fileList[0]);
        }
        return;
      }
      formData.append(key, value ?? "");
    });

    if (imageRemoved && !formData.has("image")) {
      formData.append("image", "");
    }

    if (iconRemoved && !formData.has("icon")) {
      formData.append("icon", "");
    }

    if (isEdit) {
      formData.append("saveWithDate", saveWithDate ? "true" : "false");
    }

    mutation.mutate(formData);
  };

  const handleSave = (saveWithDate) => {
    handleSubmit((formValues) => submitSpecialization(formValues, saveWithDate))();
  };

  return (
    <div className="p-4">
      <div className="relative flex justify-center items-center mb-6">
        <Button variant="ghost" size="sm" onClick={onCancel} className="absolute left-0">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to List
        </Button>
        <h1 className="text-2xl font-bold">
          {isEdit ? "Edit Course Specialization" : "Add Course Specialization"}
        </h1>
      </div>

      <form
        className="space-y-4 max-w-2xl mx-auto"
        encType="multipart/form-data"
        onSubmit={(e) => {
          e.preventDefault();
          handleSave(true);
        }}
      >
        <div className="space-y-2">
          <Label>University</Label>
          {isLoadingUniversities ? (
            <p className="text-sm text-muted-foreground">Loading universities...</p>
          ) : (
            <select
              className="w-full border rounded p-2"
              value={selectedUniversity}
              onChange={(e) => {
                const value = e.target.value;
                setSelectedUniversity(value);
                setValue("university_course_id", "", { shouldDirty: true });
              }}
            >
              <option value="">Select university</option>
              {universities.map((uni) => (
                <option key={uni.id} value={uni.id}>
                  {uni.university_name || uni.name || uni.title}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="space-y-2">
          <Label>Course</Label>
          <input
            type="hidden"
            {...register("university_course_id", {
              required: "Course is required",
            })}
          />
          <select
            className="w-full border rounded p-2"
            value={watch("university_course_id") || ""}
            onChange={(e) =>
              setValue("university_course_id", e.target.value, {
                shouldValidate: true,
                shouldDirty: true,
              })
            }
            disabled={!selectedUniversity || isCoursesLoading}
          >
            <option value="">Select course</option>
            {courseOptions.map((courseOption) => (
              <option key={courseOption.id} value={String(courseOption.id)}>
                {courseOption.name}
              </option>
            ))}
          </select>
          {errors.university_course_id && (
            <p className="text-sm text-red-500">
              {errors.university_course_id.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Specialization Name</Label>
          <Input
            placeholder="e.g., Human Resource, Finance"
            {...register("name", { required: "Name is required" })}
          />
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Slug</Label>
            <Input placeholder="Auto-generated if left blank" {...register("slug")} />
          </div>
          <div className="space-y-2">
            <Label>Label</Label>
            <Input placeholder="Short label" {...register("label")} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Full Fees</Label>
            <Input type="number" step="0.01" placeholder="Total fees" {...register("full_fees")} />
          </div>
          <div className="space-y-2">
            <Label>Semester Fees</Label>
            <Input type="number" step="0.01" placeholder="Per semester" {...register("sem_fees")} />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Duration</Label>
          <Input placeholder="e.g., 6 Months" {...register("duration")} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Image</Label>
            <Input
              type="file"
              accept="image/*"
              {...register("image")}
              onChange={(e) => {
                const file = e.target.files?.[0];
                setImagePreview(file ? URL.createObjectURL(file) : null);
                if (file) setImageRemoved(false);
              }}
            />
            {imagePreview && (
              <div className="mt-2 space-y-2">
                <img
                  src={imagePreview}
                  alt="Specialization image preview"
                  className="h-24 object-contain rounded border"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setImagePreview(null);
                    setImageRemoved(true);
                    setValue("image", null);
                  }}
                >
                  Remove Image
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Icon</Label>
            <Input
              type="file"
              accept="image/*"
              {...register("icon")}
              onChange={(e) => {
                const file = e.target.files?.[0];
                setIconPreview(file ? URL.createObjectURL(file) : null);
                if (file) setIconRemoved(false);
              }}
            />
            {iconPreview && (
              <div className="mt-2 space-y-2">
                <img
                  src={iconPreview}
                  alt="Specialization icon preview"
                  className="h-20 object-contain rounded border"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setIconPreview(null);
                    setIconRemoved(true);
                    setValue("icon", null);
                  }}
                >
                  Remove Icon
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2 pt-4 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={mutation.isLoading}
          >
            Cancel
          </Button>
          {isEdit ? (
            <>
              <Button
                type="button"
                onClick={() => handleSave(true)}
                disabled={mutation.isLoading || isSubmitting}
              >
                {mutation.isLoading ? "Saving..." : "Save with Date"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => handleSave(false)}
                disabled={mutation.isLoading || isSubmitting}
              >
                {mutation.isLoading ? "Saving..." : "Save without Date"}
              </Button>
            </>
          ) : (
            <Button
              type="button"
              onClick={() => handleSave(true)}
              disabled={mutation.isLoading || isSubmitting}
            >
              {mutation.isLoading ? "Saving..." : "Create Specialization"}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
