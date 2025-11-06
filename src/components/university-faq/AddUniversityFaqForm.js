"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { fetchAllUniversities } from "@/lib/api";
import CKEditor from "@/components/CKEditor";

export default function AddUniversityFaqForm({
  item,
  categories = [],
  onCancel,
  onSuccess,
}) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: item || {} });

  // Fetch universities for dropdown
  const { data: universitiesData, isLoading: isLoadingUniversities } = useQuery({
    queryKey: ["all-universities"],
    queryFn: fetchAllUniversities,
  });
  
  // Backend returns: { success: true, message: "...", data: { data: universities[] } }
  // So we need: universitiesData?.data?.data
  const universities = universitiesData?.data?.data || [];

  // Populate form if editing
  useEffect(() => {
    if (item) {
      const allowedKeys = ["id", "university_id", "category_id", "title", "description"];
      allowedKeys.forEach((key) => {
        if (item[key] !== undefined) setValue(key, item[key]);
      });
    } else {
      reset();
    }
  }, [item, setValue, reset]);

  const onSubmit = (data) => {
    onSuccess(data, item);
  };

  return (
    <div className="p-4">
      <div className="relative flex justify-center items-center mb-6">
        <Button variant="ghost" size="sm" onClick={onCancel} className="absolute left-0">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to List
        </Button>
        <h3 className="text-xl font-bold">{item ? "Edit University FAQ" : "Add New University FAQ"}</h3>
      </div>

      <form className="space-y-4 max-w-2xl mx-auto">
        {/* University */}
        <div className="space-y-2">
          <Label>University</Label>
          {isLoadingUniversities ? (
            <p className="text-sm text-gray-500">Loading universities...</p>
          ) : (
            <select
              {...register("university_id", { required: "University is required" })}
              className="w-full border rounded px-3 py-2"
              defaultValue={item?.university_id || ""}
            >
              <option value="" disabled>
                Select university
              </option>
              {Array.isArray(universities) && universities.length > 0 ? (
                universities.map((univ) => (
                  <option key={univ.id} value={univ.id}>
                    {univ.university_name}
                  </option>
                ))
              ) : (
                <option value="" disabled>No universities available</option>
              )}
            </select>
          )}
          {errors.university_id && (
            <p className="text-red-500 text-sm">{errors.university_id.message}</p>
          )}
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label>Category</Label>
          <select
            {...register("category_id", { required: "Category is required" })}
            className="w-full border rounded px-3 py-2"
            defaultValue={item?.category_id || ""}
          >
            <option value="" disabled>
              Select category
            </option>
            {Array.isArray(categories) &&
              categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.heading}
                </option>
              ))}
          </select>
          {errors.category_id && (
            <p className="text-red-500 text-sm">{errors.category_id.message}</p>
          )}
        </div>

        {/* Question */}
        <div className="space-y-2">
          <Label>Question</Label>
          <Input
            {...register("title", { required: "Question is required" })}
            placeholder="Enter question"
          />
          {errors.title && (
            <p className="text-red-500 text-sm">{errors.title.message}</p>
          )}
        </div>

        {/* Answer */}
        <div className="space-y-2">
          <Label>Answer</Label>
          <Controller
            name="description"
            control={control}
            rules={{ required: "Answer is required" }}
            render={({ field }) => (
              <CKEditor
                value={field.value || ""}
                onChange={(html) => field.onChange(html)}
              />
            )}
          />
          {errors.description && (
            <p className="text-red-500 text-sm">{errors.description.message}</p>
          )}
        </div>

        {/* Buttons */}
        {item ? (
          <div className="flex gap-2">
            <Button
              type="button"
              className="flex-1"
              disabled={isSubmitting}
              onClick={handleSubmit((data) => onSubmit({ ...data, saveWithDate: true }))}
            >
              Save with Date
            </Button>
            <Button
              type="button"
              className="flex-1"
              disabled={isSubmitting}
              onClick={handleSubmit((data) => onSubmit({ ...data, saveWithDate: false }))}
            >
              Save without Date
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button
              type="button"
              className="flex-1"
              disabled={isSubmitting}
              onClick={handleSubmit((data) => onSubmit({ ...data, saveWithDate: true }))}
            >
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}

