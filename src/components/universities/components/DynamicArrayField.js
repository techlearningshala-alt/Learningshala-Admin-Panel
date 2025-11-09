/**
 * Dynamic Array Field Component
 * Reusable component for handling dynamic arrays with add/remove functionality
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { createEmptyStructure, getRemoveButtonLabel, canRemoveExistingEntries } from "../utils/formHelpers";

export const DynamicArrayField = ({
  control,
  register,
  name,
  value,
  renderPropsInputs,
  sectionPreviews,
  setSectionPreviews,
  fixedSize = false, // 🔒 New prop to make array size fixed
  addButtonLabel = "Add More", // 🎯 Custom label for Add More button
  allowRemoveAll = false, // 🗑️ Allow removing ALL items (including pre-filled) - for FAQ
  setValue,
  template,
}) => {
  const { fields, append, remove } = useFieldArray({ control, name });

  // 🧠 store initial count to distinguish preloaded vs newly added items
  const [initialCount] = useState(fields.length);

  // Get the field key from the name (e.g., "sections.0.props.faculties" -> "faculties")
  const fieldKey = name.split('.').pop() || '';
  const removeButtonLabel = getRemoveButtonLabel(fieldKey);
  const allowRemovingExisting = canRemoveExistingEntries(fieldKey);

  const resolveTemplate = useCallback((input) => {
    if (Array.isArray(input) && input.length > 0) {
      return input[0];
    }
    if (input && typeof input === "object" && !Array.isArray(input)) {
      return input;
    }
    return null;
  }, []);

  const templateRef = useRef(null);

  if (templateRef.current === null) {
    const fallbackSource = () => {
      if (template) {
        return resolveTemplate(template);
      }
      return resolveTemplate(value);
    };
    const initialSource = fallbackSource();
    templateRef.current = initialSource ? createEmptyStructure(initialSource) : {};
  }

  useEffect(() => {
    if (template) {
      const templatedSource = resolveTemplate(template);
      if (templatedSource) {
        templateRef.current = createEmptyStructure(templatedSource);
        return;
      }
    }
    const source = resolveTemplate(value);
    if (source) {
      templateRef.current = createEmptyStructure(source);
    }
  }, [value, template, resolveTemplate]);

  const buildNewItem = () => {
    const template = templateRef.current;
    if (!template || typeof template !== "object") {
      return {};
    }

    return createEmptyStructure(template);
  };
  
  return (
    <div className="mb-4 p-3 border rounded-md bg-gray-50">
      {fields.map((field, index) => {
        // Get the current item value - use value[index] if available, otherwise fallback to value[0] or empty object
        const itemValue = (Array.isArray(value) && value[index])
          ? value[index]
          : field ?? {};
        
        // Only render if we have a valid object
        if (!itemValue || typeof itemValue !== "object" || Array.isArray(itemValue)) {
          return null;
        }
        
        return (
          <div key={field.id} className="mb-3 p-3 border rounded bg-white relative">
            {renderPropsInputs(
              control,
              register,
              `${name}.${index}`,
              itemValue,
              null,
              sectionPreviews,
              setSectionPreviews,
              setValue,
              Array.isArray(template) ? template[0] : template
            )}

          {/* ✅ Remove button for all arrays */}
          {!fixedSize && (allowRemoveAll || allowRemovingExisting || index >= initialCount) && (
            <div className="mt-2 pt-2 border-t flex justify-start">
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={() => remove(index)}
              >
                {removeButtonLabel}
              </Button>
            </div>
          )}
          </div>
        );
      })}

      {/* ✅ show Add More button only if not fixed size */}
      {!fixedSize && (
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() =>
            append(buildNewItem())
          }
        >
          + {addButtonLabel}
        </Button>
      )}
    </div>
  );
};

