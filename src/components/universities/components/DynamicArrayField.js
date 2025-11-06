/**
 * Dynamic Array Field Component
 * Reusable component for handling dynamic arrays with add/remove functionality
 */

import { useState } from "react";
import { useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { createEmptyStructure, getRemoveButtonLabel } from "../utils/formHelpers";

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
}) => {
  const { fields, append, remove } = useFieldArray({ control, name });

  // 🧠 store initial count to distinguish preloaded vs newly added items
  const [initialCount] = useState(fields.length);

  // Get the field key from the name (e.g., "sections.0.props.faculties" -> "faculties")
  const fieldKey = name.split('.').pop() || '';
  const removeButtonLabel = getRemoveButtonLabel(fieldKey);
  
  return (
    <div className="mb-4 p-3 border rounded-md bg-gray-50">
      {fields.map((field, index) => {
        // Get the current item value - use value[index] if available, otherwise fallback to value[0] or empty object
        const itemValue = (Array.isArray(value) && value[index]) 
          ? value[index] 
          : (Array.isArray(value) && value[0]) 
            ? value[0] 
            : (typeof value === "object" && value !== null)
              ? value
              : {};
        
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
              setSectionPreviews
            )}

          {/* ✅ Remove button for all arrays */}
          {!fixedSize && (allowRemoveAll || index >= initialCount) && (
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
            append(
              typeof value[0] === "object" ? createEmptyStructure(value[0]) : ""
            )
          }
        >
          + {addButtonLabel}
        </Button>
      )}
    </div>
  );
};

