/**
 * Dynamic Array Field Component
 * Reusable component for handling dynamic arrays with add/remove functionality
 */

import { useState } from "react";
import { useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { createEmptyStructure } from "../utils/formHelpers";

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

  // Check if this is FAQ items array (nested items within category)
  const isFAQItems = name.includes('.items') && !name.includes('.faqData');
  // Check if this is FAQ categories array - only at root level, not inside a category
  const isFAQCategories = name.includes('faqData') && !name.includes('.faqData.');
  
  return (
    <div className="mb-4 p-3 border rounded-md bg-gray-50">
      {fields.map((field, index) => (
        <div key={field.id} className={`mb-3 p-3 border rounded bg-white ${isFAQItems ? '' : 'relative'}`}>
          {renderPropsInputs(
            control,
            register,
            `${name}.${index}`,
            value[0],
            null,
            sectionPreviews,
            setSectionPreviews
          )}

          {/* ✅ Remove button for FAQ questions: Show at bottom after answer field */}
          {!fixedSize && (allowRemoveAll || index >= initialCount) && isFAQItems && (
            <div className="mt-2 pt-2 border-t flex justify-start">
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={() => remove(index)}
              >
                Remove Question
              </Button>
            </div>
          )}

          {/* ✅ Remove button for FAQ categories: Show after items array (will be moved by parent) */}
          {!fixedSize && (allowRemoveAll || index >= initialCount) && isFAQCategories && (
            <div className="mt-3 pt-3 border-t">
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={() => remove(index)}
              >
                Remove Category
              </Button>
            </div>
          )}

          {/* ✅ Remove button for other arrays: Show at bottom left */}
          {!fixedSize && (allowRemoveAll || index >= initialCount) && !isFAQItems && !isFAQCategories && (
            <div className="mt-2 pt-2 border-t flex justify-start">
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={() => remove(index)}
              >
                Remove Question
              </Button>
            </div>
          )}
        </div>
      ))}

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

