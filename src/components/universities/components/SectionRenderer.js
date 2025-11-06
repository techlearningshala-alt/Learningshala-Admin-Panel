/**
 * Section Renderer Component
 * Handles recursive rendering of dynamic form sections with nested objects/arrays
 */

import { Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  setSectionPreviews
) => {
  // Safety check: ensure props is a valid object
  if (!props || typeof props !== "object" || Array.isArray(props)) {
    return null;
  }
  
  return Object.entries(props).map(([key, value]) => {
    const fieldName = `${path}.${key}`;

    // 🚫 Skip rendering certain fields (will be auto-set)
    if (shouldSkipField(key)) {
      return null;
    }

    // Handle image/file inputs
    if (isImageField(key)) {
      const previewURL = buildPreviewURL(value, sectionPreviews, fieldName);

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
            <div className="relative inline-block mt-2">
              <img
                src={previewURL}
                alt="preview"
                className="h-20 object-contain rounded border"
              />
              <button
                type="button"
                onClick={() => {
                  console.log(`🗑️ [FRONTEND] Removing section image: ${fieldName}`);
                  console.log(`🗑️ [FRONTEND] Current preview:`, sectionPreviews[fieldName]);
                  console.log(`🗑️ [FRONTEND] Current value:`, value);
                  setSectionPreviews((prev) => {
                    const newPreviews = { ...prev };
                    delete newPreviews[fieldName];
                    console.log(`🗑️ [FRONTEND] Updated previews:`, newPreviews);
                    return newPreviews;
                  });
                  // Clear the form value
                  if (setValue) {
                    setValue(fieldName, null);
                    console.log(`🗑️ [FRONTEND] Form value cleared for ${fieldName}`);
                  }
                  // Clear the file input
                  const fileInput = document.querySelector(`input[name="${fieldName}"]`);
                  if (fileInput) fileInput.value = '';
                  console.log(`🗑️ [FRONTEND] File input cleared for ${fieldName}`);
                }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors text-lg leading-none"
                title="Remove image"
              >
                ×
              </button>
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
            setValue
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
    return (
      <div key={fieldName} className="mb-4">
        <Label className="capitalize">{key}</Label>
        <Input {...register(fieldName)} defaultValue={value || ""} />
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
}) => {
  return (
    <div className="space-y-6">
      {sections.map((section, sIndex) => {
        const sectionPath = `sections.${sIndex}`;
        
        // Default rendering for all sections (FAQ is now simple Yes/No like Other Popular Universities)
        return (
          <div key={section.id} className="p-4 border rounded-md">
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
                setValue
              )
            ) : (
              <p className="text-gray-500">No editable fields for this section</p>
            )}
          </div>
        );
      })}
    </div>
  );
};

