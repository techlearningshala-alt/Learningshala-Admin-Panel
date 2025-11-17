"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft } from "lucide-react";
import CKEditor from "@/components/CKEditor";

export default function AddUniversityCourseFaqForm({
  item,
  categories = [],
  courses = [],
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

  const [saveWithoutDate, setSaveWithoutDate] = useState(false);

  // Populate form if editing
  useEffect(() => {
    if (item) {
      const allowedKeys = ["id", "course_id", "category_id", "title", "description"];
      allowedKeys.forEach((key) => {
        if (item[key] !== undefined) setValue(key, item[key]);
      });
    } else {
      reset();
    }
    setSaveWithoutDate(false);
  }, [item, setValue, reset]);

  const onSubmit = (data) => {
    const { saveWithDate, ...formData } = data;
    onSuccess({ ...formData, saveWithDate: !saveWithoutDate }, item);
  };

  return (
    <div className="p-4">
      <div className="relative flex justify-center items-center mb-6">
        <Button variant="ghost" size="sm" onClick={onCancel} className="absolute left-0">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to List
        </Button>
        <h3 className="text-xl font-bold">
          {item ? "Edit University Course FAQ" : "Add New University Course FAQ"}
        </h3>
      </div>

      <form className="space-y-4 max-w-2xl mx-auto">
        {/* Course */}
        <div className="space-y-2">
          <Label>Course</Label>
          <select
            {...register("course_id", { required: "Course is required" })}
            className="w-full border rounded px-3 py-2"
            defaultValue={item?.course_id || ""}
          >
            <option value="" disabled>
              Select course
            </option>
            {Array.isArray(courses) && courses.length > 0 ? (
              courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))
            ) : (
              <option value="" disabled>
                No courses available
              </option>
            )}
          </select>
          {errors.course_id && (
            <p className="text-red-500 text-sm">{errors.course_id.message}</p>
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
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          {item && (
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
          <Button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : item ? "Save" : "Create FAQ"}
          </Button>
        </div>
      </form>
    </div>
  );
}

