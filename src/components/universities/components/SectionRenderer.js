/**
 * Section Renderer Component
 * Handles recursive rendering of dynamic form sections with nested objects/arrays
 */

import { Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import CkEditor from "@/components/CKEditor";
import { DynamicArrayField } from "./DynamicArrayField";
// FAQ functionality removed - now handled separately
import {
  shouldSkipField,
  isTextareaField,
  isImageField,
  isCKEditorField,
  buildPreviewURL,
  getAddButtonLabel,
  getLinkedFieldTarget,
} from "../utils/formHelpers";

/**
 * Recursive renderer for section props
 * Handles nested arrays, objects, images, textareas, and CKEditor fields
 */
export const renderPropsInputs = (
  control,
  register,
  path,
  props,
  watch,
  sectionPreviews,
  setSectionPreviews,
  setValue,
  templateProps = undefined
) => {
  // Safety check: ensure props is a valid object
  if (!props || typeof props !== "object" || Array.isArray(props)) {
    return null;
  }

  // Ensure important fields appear first (prevents "heading" showing below "content")
  const priorityOrder = ["heading", "title", "subheading"];
  const entries = Object.entries(props).sort(([a], [b]) => {
    const aIdx = priorityOrder.indexOf(a);
    const bIdx = priorityOrder.indexOf(b);
    const aRank = aIdx === -1 ? Number.POSITIVE_INFINITY : aIdx;
    const bRank = bIdx === -1 ? Number.POSITIVE_INFINITY : bIdx;
    if (aRank !== bRank) return aRank - bRank;

    // Keep "content" (usually CKEditor) after heading/title when both are present.
    if (a === "content") return 1;
    if (b === "content") return -1;
    return 0;
  });

  return entries.map(([key, value]) => {
    const fieldName = `${path}.${key}`;

    // 🚫 Skip rendering certain fields (will be auto-set)
    if (shouldSkipField(key)) {
      return null;
    }

    // Handle image/file inputs
    if (isImageField(key)) {
      const previewURL = buildPreviewURL(value, sectionPreviews, fieldName);
      const fileRegister = register(fieldName);

      return (
        <div key={fieldName} className="mb-4">
          <Label className="capitalize">{key}</Label>
          <Input
            type="file"
            accept="image/*"
            {...fileRegister}
            onChange={(e) => {
              // Preserve react-hook-form tracking for dirty state and submitted value.
              fileRegister.onChange(e);
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
            <div className="relative inline-block mt-2">
              <img
                src={previewURL}
                alt="preview"
                className="h-20 object-contain rounded border"
              />
              <Button
                type="button"
                size="sm"
                variant="destructive"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center shadow-md hover:shadow-lg z-10"
                onClick={() => {
                  // Clear the preview
                  setSectionPreviews((prev) => {
                    const newPreviews = { ...prev };
                    // Revoke blob URL if it exists (for new uploads)
                    if (prev[fieldName] && prev[fieldName].startsWith("blob:")) {
                      URL.revokeObjectURL(prev[fieldName]);
                    }
                    delete newPreviews[fieldName];
                    return newPreviews;
                  });
                  // Clear the file input
                  const fileInput = document.querySelector(`input[name="${fieldName}"]`);
                  if (fileInput) {
                    fileInput.value = "";
                  }
                  // Set the field value to empty string to indicate removal
                  // This works for both new uploads and existing images from DB
                  setValue(fieldName, "", { shouldDirty: true, shouldValidate: false });
                }}
                title="Remove image"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      );
    }

    // Handle CKEditor content fields
    if (isCKEditorField(key)) {
      return (
        <Controller
          key={fieldName}
          name={fieldName}
          control={control}
          render={({ field }) => (
            <div className="mb-4">
              <Label className="capitalize">{key}</Label>
              <CkEditor value={field.value || ""} onChange={field.onChange} />
            </div>
          )}
        />
      );
    }

    // ✅ Handle arrays with Add/Remove
    if (Array.isArray(value)) {
      // 🔒 Check if this array should have fixed size (e.g., gridContent in why-choose section)
      const isFixedSize = key === "gridContent";
      
      // 🗑️ Allow removing all items for certain arrays
      const allowRemoveAll = key === "items";

      const templateForArray = Array.isArray(templateProps) ? templateProps : templateProps?.[key];

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
          fixedSize={isFixedSize}
          addButtonLabel={getAddButtonLabel(key)}
          allowRemoveAll={allowRemoveAll}
          setValue={setValue}
          template={templateForArray}
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
            setSectionPreviews,
            setValue,
            templateProps ? templateProps[key] : undefined
          )}
        </div>
      );
    }

    // Handle textarea fields for desc/description
    if (isTextareaField(key)) {
      return (
        <div key={fieldName} className="mb-4">
          <Label className="capitalize">{key}</Label>
          <Textarea
            {...register(fieldName)}
            defaultValue={value || ""}
            rows={4}
            className="resize-none"
          />
        </div>
      );
    }

    // Handle plain input fields
    const registerOptions = {};
    const linkedTargetKey = getLinkedFieldTarget(key);
    if (linkedTargetKey && typeof setValue === "function") {
      registerOptions.onChange = (event) => {
        const newValue = event?.target?.value ?? "";
        const basePath = path;
        const targetFieldName = `${basePath}.${linkedTargetKey}`;
        setValue(targetFieldName, newValue, { shouldDirty: true, shouldValidate: true });
      };
    }
    const registerProps = register(fieldName, registerOptions);

    let inputDefaultValue = value;
    if ((inputDefaultValue === undefined || inputDefaultValue === null || inputDefaultValue === "") && linkedTargetKey) {
      const linkedValue = props?.[linkedTargetKey];
      if (linkedValue !== undefined && linkedValue !== null && linkedValue !== "") {
        inputDefaultValue = linkedValue;
      }
    }

    return (
      <div key={fieldName} className="mb-4">
        <Label className="capitalize">{key}</Label>
        <Input {...registerProps} defaultValue={inputDefaultValue ?? ""} />
      </div>
    );
  });
};

/**
 * Component to render all sections dynamically
 */
export const SectionsForm = ({
  sections,
  control,
  register,
  sectionPreviews,
  setSectionPreviews,
  watch,
  setValue,
  templates,
  renderAfterSection,
}) => {
  return (
    <div className="space-y-6">
      {sections.map((section, sIndex) => {
        const sectionPath = `sections.${sIndex}`;
        const templateSection = Array.isArray(templates) ? templates[sIndex] : undefined;
        
        // Default rendering for all sections (FAQ is now simple Yes/No like Other Popular Universities)
        return (
          <div key={section.id} className="space-y-4">
            <div className="p-4 border rounded-md">
              <h3 className="font-semibold text-lg mb-2">{section.title}</h3>
              {section.props ? (
                renderPropsInputs(
                  control,
                  register,
                  `${sectionPath}.props`,
                  section.props,
                  watch,
                  sectionPreviews,
                  setSectionPreviews,
                  setValue,
                  templateSection?.props
                )
              ) : (
                <p className="text-gray-500">No editable fields for this section</p>
              )}
            </div>
            {renderAfterSection?.(section, sIndex)}
          </div>
        );
      })}
    </div>
  );
};

