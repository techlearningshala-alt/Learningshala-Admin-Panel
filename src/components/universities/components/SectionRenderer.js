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
import { FAQRenderer } from "./FAQRenderer";
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
            <img
              src={previewURL}
              alt="preview"
              className="h-20 object-contain rounded border mt-2"
            />
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
      
      // 🗑️ Allow removing all items for FAQ items (both categories and questions)
      const allowRemoveAll = key === "items" || key === "faqData";

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
            setSectionPreviews
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
}) => {
  return (
    <div className="space-y-6">
      {sections.map((section, sIndex) => {
        const sectionPath = `sections.${sIndex}`;
        
        // ✅ Special handling for FAQ section
        if (section.id === "university-faq" && section.props?.faqData) {
          return (
            <div key={section.id} className="p-4 border rounded-md">
              <h3 className="font-semibold text-lg mb-2">{section.title}</h3>
              <FAQRenderer
                control={control}
                register={register}
                name={sectionPath}
                value={section.props}
                watch={watch}
              />
            </div>
          );
        }
        
        // Default rendering for other sections
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
                setSectionPreviews
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

