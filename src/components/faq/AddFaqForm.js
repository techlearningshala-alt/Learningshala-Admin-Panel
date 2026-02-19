"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import CKEditor from "@/components/CKEditor";
import FormActionButtons from "@/components/common/FormActionButtons";

export default function AddFaqForm({
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

  // Populate form if editing
  useEffect(() => {
    if (item) {
      const allowedKeys = ["id", "category_id", "title", "description"];
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
    <div className="p-6 bg-gray-50 min-h-screen pb-24">
      <div className="relative flex justify-center items-center mb-6">
        <Button variant="ghost" size="sm" onClick={onCancel} className="absolute left-0">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to List
        </Button>
        <h3 className="text-2xl text-blue-700 font-bold">{item ? "Edit FAQ" : "Add New FAQ"}</h3>
      </div>

      <form className="space-y-6 max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-sm">
        {/* Category */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Category</Label>
          <select
            {...register("category_id", { required: "Category is required" })}
            className="w-full border rounded-md px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
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
            <p className="text-red-500 text-sm mt-1">{errors.category_id.message}</p>
          )}
        </div>

        {/* Question */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Question</Label>
          <Input
            {...register("title", { required: "Question is required" })}
            placeholder="Enter question"
            className="focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
          )}
        </div>

        {/* Answer */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Answer</Label>
          <div className="min-h-[200px] rounded-md border bg-white">
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
          </div>
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
          )}
        </div>
      </form>

      <FormActionButtons
        isEdit={!!item}
        isSubmitting={isSubmitting}
        isLoading={false}
        onSave={(saveWithDate) => handleSubmit((data) => onSubmit({ ...data, saveWithDate }))()}
        onCancel={onCancel}
        saveButtonText="Save"
      />
    </div>
  );
}

