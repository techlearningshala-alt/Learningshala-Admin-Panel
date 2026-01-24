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
            <div className="inline-block mt-2">
              <img
                src={previewURL}
                alt="preview"
                className="h-20 object-contain rounded border"
              />
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

