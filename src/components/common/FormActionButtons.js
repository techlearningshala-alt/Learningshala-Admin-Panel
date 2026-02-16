"use client";

import { Button } from "@/components/ui/button";

/**
 * Reusable Form Action Buttons component
 * Handles Save with Date, Save without Date, and Cancel buttons for forms
 * 
 * @param {Object} props
 * @param {boolean} props.isEdit - Whether the form is in edit mode
 * @param {boolean} props.isSubmitting - Whether the form is currently submitting
 * @param {boolean} props.isLoading - Whether the mutation is loading
 * @param {Function} props.onSave - Callback for save action: (saveWithDate) => void
 * @param {Function} props.onCancel - Callback for cancel action
 * @param {string} props.saveButtonText - Text for the save button in create mode (default: "Save")
 */
export default function FormActionButtons({
  isEdit = false,
  isSubmitting = false,
  isLoading = false,
  onSave,
  onCancel,
  saveButtonText = "Save",
}) {
  if (isEdit) {
    return (
      <div className="fixed bottom-0 left-[215px] right-0 bg-white border-t border-gray-200 z-50 shadow-2xl ">
        <div className="flex gap-3 p-4 max-w-6xl mx-auto">
          <Button
            type="button"
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all"
            disabled={isSubmitting || isLoading}
            onClick={() => onSave?.(true)}
          >
            Save with Date
          </Button>
          <Button
            type="button"
            className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all"
            disabled={isSubmitting || isLoading}
            onClick={() => onSave?.(false)}
          >
            Save without Date
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="border-gray-300 hover:bg-gray-50"
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-[215px] right-0 bg-white border-t border-gray-200 z-50 shadow-2xl ">
      <div className="flex gap-3 p-4 max-w-5xl mx-auto">
        <Button
          type="button"
          className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-purple-600 hover:to-purple-600 text-white shadow-md hover:shadow-lg transition-all font-semibold"
          disabled={isSubmitting || isLoading}
          onClick={() => onSave?.(true)}
        >
          {isLoading ? "Saving..." : saveButtonText}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="border-gray-300 hover:bg-gray-50"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
