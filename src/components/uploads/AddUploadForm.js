"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addUpload, updateUpload } from "@/lib/menuApi";
import { notifySuccess, notifyError } from "@/lib/notify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, FileText, Video } from "lucide-react";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import FormActionButtons from "@/components/common/FormActionButtons";

const baseUrl = process.env.NEXT_PUBLIC_thumbnail_URL || "";

export default function AddUploadForm({ item, onCancel, onSuccess }) {
  useScrollToTop();
  const queryClient = useQueryClient();
  const [fileType, setFileType] = useState(item?.file_type || "image");
  const [previewUrl, setPreviewUrl] = useState(null);
  const [existingPath, setExistingPath] = useState(null);
  const [fileRemoved, setFileRemoved] = useState(false);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm({
    defaultValues: item || { name: "", file_type: "image" },
  });

  const watchFileType = watch("file_type", fileType);

  useEffect(() => {
    if (item) {
      setValue("name", item.name || "");
      setValue("file_type", item.file_type || "image");
      setFileType(item.file_type === "pdf" ? "pdf" : item.file_type === "video" ? "video" : "image");
      const path = item.file_path || item.image;
      if (path) {
        setExistingPath(path);
        const type = (item.file_type || "").toLowerCase();
        const pathLower = path.toLowerCase();
        if (type === "pdf" || pathLower.endsWith(".pdf")) {
          setPreviewUrl("pdf");
        } else if (type === "video" || pathLower.match(/\.(mp4|webm|ogg|mov)$/)) {
          setPreviewUrl("video");
        } else {
          setPreviewUrl(`${baseUrl}${path}`);
        }
      }
    } else {
      reset({ name: "", file_type: "image" });
      setFileType("image");
      setPreviewUrl(null);
      setExistingPath(null);
      setFileRemoved(false);
    }
  }, [item, reset, setValue]);

  useEffect(() => {
    setFileType(watchFileType || "image");
  }, [watchFileType]);

  const mutation = useMutation({
    mutationFn: async ({ formData }) => {
      return item?.id ? updateUpload(item.id, formData) : addUpload(formData);
    },
    onSuccess: () => {
      notifySuccess(item ? "Upload updated successfully" : "Upload added successfully");
      reset();
      setPreviewUrl(null);
      setExistingPath(null);
      setFileRemoved(false);
      setTimeout(() => {
        queryClient.invalidateQueries(["uploads"]);
        onSuccess?.();
      }, 200);
    },
    onError: (err) => notifyError(err.response?.data?.message || "Operation failed"),
  });

  const onSubmit = (data) => {
    const formData = new FormData();
    formData.append("name", data.name || "");
    formData.append("file_type", fileType);

    const fileInput = document.querySelector('input[name="file"]');
    if (fileInput?.files?.[0]) {
      formData.append("file", fileInput.files[0]);
    } else if (!item) {
      notifyError("File is required");
      return;
    }

    mutation.mutate({ formData });
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        setPreviewUrl(URL.createObjectURL(file));
      } else if (file.type.startsWith("video/")) {
        setPreviewUrl("video");
      } else {
        setPreviewUrl("pdf");
      }
      setFileRemoved(false);
    }
  };

  const handleRemoveFile = () => {
    setPreviewUrl(null);
    setExistingPath(null);
    setFileRemoved(true);
    const fileInput = document.querySelector('input[name="file"]');
    if (fileInput) fileInput.value = "";
  };

  const accept =
    fileType === "pdf"
      ? "application/pdf,.pdf"
      : fileType === "video"
        ? "video/*,.mp4,.webm,.ogg,.mov"
        : "image/*";

  return (
    <div className="p-6 bg-gray-50 min-h-screen pb-24">
      <div className="relative flex justify-center items-center mb-6">
        <Button variant="ghost" size="sm" onClick={onCancel} className="absolute left-0">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to List
        </Button>
        <h3 className="text-2xl text-blue-700 font-bold">
          {item ? "Edit Upload" : "Add New Upload"}
        </h3>
      </div>

      <form className="space-y-6 max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-sm">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">
            Name <span className="text-red-500">*</span>
          </Label>
          <Input
            {...register("name", {
              required: "Name is required",
              validate: (value) =>
                (typeof value === "string" && value.trim().length > 0) ||
                "Name is required",
            })}
            placeholder="Enter name"
            className="focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Type</Label>
          <select
            {...register("file_type", { required: "Type is required" })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            onChange={(e) => setFileType(e.target.value)}
          >
            <option value="image">Image</option>
            <option value="pdf">PDF</option>
            <option value="video">Video</option>
          </select>
          {errors.file_type && (
            <p className="text-red-500 text-sm mt-1">{errors.file_type.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">
            {fileType === "pdf" ? "PDF File" : fileType === "video" ? "Video File" : "Image"}
          </Label>
          {(previewUrl || existingPath) && !fileRemoved && (
            <div className="mb-3">
              {previewUrl === "pdf" || (existingPath && existingPath.toLowerCase().endsWith(".pdf")) ? (
                <div className="flex items-center gap-2 p-4 border rounded-lg bg-gray-50 w-fit">
                  <FileText className="h-10 w-10 text-red-500" />
                  <span className="text-sm text-gray-600">PDF file</span>
                  {existingPath && (
                    <span className="text-xs text-gray-400 truncate max-w-[200px]" title={existingPath}>
                      {existingPath}
                    </span>
                  )}
                </div>
              ) : previewUrl === "video" || (existingPath && existingPath.toLowerCase().match(/\.(mp4|webm|ogg|mov)$/)) ? (
                <div className="flex items-center gap-2 p-4 border rounded-lg bg-gray-50 w-fit">
                  <Video className="h-10 w-10 text-blue-500" />
                  <span className="text-sm text-gray-600">Video file (MP4, etc.)</span>
                  {existingPath && (
                    <span className="text-xs text-gray-400 truncate max-w-[200px]" title={existingPath}>
                      {existingPath}
                    </span>
                  )}
                </div>
              ) : (
                <img
                  src={previewUrl || `${baseUrl}${existingPath}`}
                  alt="Preview"
                  className="h-32 w-32 object-contain rounded-lg border-2 border-gray-200 shadow-sm p-2 bg-gray-50"
                />
              )}
              <Button type="button" size="sm" variant="outline" onClick={handleRemoveFile} className="mt-2">
                Remove File
              </Button>
            </div>
          )}
          <Input
            type="file"
            accept={accept}
            {...register("file", {
              required: !item || fileRemoved ? "File is required" : false,
            })}
            onChange={handleFileChange}
            className="focus:border-blue-500 focus:ring-2 focus:ring-blue-200 h-8"
          />
          {errors.file && <p className="text-red-500 text-sm mt-1">{errors.file.message}</p>}
        </div>
      </form>

      <FormActionButtons
        isEdit={!!item}
        isSubmitting={isSubmitting}
        isLoading={mutation.isLoading}
        onSave={(saveWithDate) => handleSubmit(onSubmit)()}
        onCancel={onCancel}
        saveButtonText="Save"
      />
    </div>
  );
}
