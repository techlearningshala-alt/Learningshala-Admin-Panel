"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addPostAdmissionTeamMember, updatePostAdmissionTeamMember } from "@/lib/api";
import { notifySuccess, notifyError } from "@/lib/notify";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { ArrowLeft } from "lucide-react";
import FormActionButtons from "@/components/common/FormActionButtons";

export default function AddPostAdmissionTeamForm({ member, onCancel, onSuccess }) {
  const [preview, setPreview] = useState(null);
  const [existingThumbnail, setExistingThumbnail] = useState(null);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: member || {},
  });

  useEffect(() => {
    if (member) {
      Object.keys(member).forEach((key) => setValue(key, member[key]));
      if (member.thumbnail) {
        setExistingThumbnail(member.thumbnail);
        setPreview(`${process.env.NEXT_PUBLIC_thumbnail_URL}${member.thumbnail}`);
      }
    } else {
      reset();
      setPreview(null);
      setExistingThumbnail(null);
    }
  }, [member, reset, setValue]);

  const mutation = useMutation({
    mutationFn: async ({ data, saveWithDate }) => {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key === "thumbnail" && value?.[0]) formData.append("thumbnail", value[0]);
        else formData.append(key, value);
      });
      formData.append("existingThumbnail", existingThumbnail || "");
      formData.append("saveWithDate", saveWithDate ? "true" : "false");
      return member?.id
        ? updatePostAdmissionTeamMember(member.id, formData)
        : addPostAdmissionTeamMember(formData);
    },
    onSuccess: (res) => {
      notifySuccess(res.data.message || "Saved successfully");
      reset();
      setPreview(null);
      setExistingThumbnail(null);

      setTimeout(() => {
        queryClient.invalidateQueries(["post-admission-team"]);
        onSuccess?.();
      }, 200);
    },
    onError: (err) => notifyError(err.response?.data?.message || "Operation failed"),
  });

  const onSubmit = (data, saveWithDate = true) => mutation.mutate({ data, saveWithDate });

  return (
    <div className="p-6 bg-gray-50 min-h-screen pb-24 ">
      <div className="relative flex justify-center items-center mb-6">
        <Button variant="ghost" size="sm" onClick={onCancel} className="absolute left-0">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to List
        </Button>
        <h3 className="text-2xl text-blue-700 font-bold">
          {member ? "Edit Post Admission Team Member" : "Add Post Admission Team Member"}
        </h3>
      </div>

      <form className="space-y-6 max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-sm">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Name</Label>
          <Input
            {...register("name", { required: "Name is required" })}
            placeholder="Enter name"
            className="focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Experience (years)</Label>
          <Input
            type="number"
            {...register("experience", { required: "Experience required", min: 1 })}
            className="focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
          {errors.experience && (
            <p className="text-red-500 text-sm mt-1">{errors.experience.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">
            No. of Assist Students (e.g - 2145)
          </Label>
          <Input
            type="number"
            {...register("assist_student", { required: "Assist students required", min: 0 })}
            className="focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
          {errors.assist_student && (
            <p className="text-red-500 text-sm mt-1">{errors.assist_student.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Label</Label>
          <Input
            {...register("label")}
            placeholder="Top rated / Popular"
            className="focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            {...register("verified")}
            className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <Label className="text-sm font-medium text-gray-700">Verified</Label>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Connection Link</Label>
          <Input
            {...register("connection_link")}
            placeholder="https://linkedin.com/..."
            className="focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Thumbnail</Label>
          {preview && (
            <div className="mb-3">
              <img
                src={preview}
                alt="Preview"
                className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200 shadow-sm"
              />
            </div>
          )}
          <Input
            type="file"
            accept="image/*"
            {...register("thumbnail")}
            onChange={(e) => e.target.files?.[0] && setPreview(URL.createObjectURL(e.target.files[0]))}
            className="focus:border-blue-500 focus:ring-2 focus:ring-blue-200 h-8"
          />
        </div>
      </form>

      <FormActionButtons
        isEdit={!!member}
        isSubmitting={isSubmitting}
        isLoading={mutation.isLoading}
        onSave={(saveWithDate) => handleSubmit((data) => onSubmit(data, saveWithDate))()}
        onCancel={onCancel}
        saveButtonText="Save"
      />
    </div>
  );
}
