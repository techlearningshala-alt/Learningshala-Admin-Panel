/**
 * Form Helper Utilities
 * Reusable helper functions for dynamic forms
 */

/**
 * Map display keys shown in the admin to underlying data keys used by the website
 */
const linkedFieldMappings = {
  "rating (1-5)": "value",
  "faculty Qualification": "faculty_qualification",
};

const isStringEmpty = (val) => typeof val === "string" && val.trim() === "";

const isEmpty = (val) => val === undefined || val === null || isStringEmpty(val);

/**
 * Deep merge two objects, prioritizing new values over old ones
 * Handles nested objects and arrays properly
 */
export const deepMergeProps = (oldObj, newObj) => {
  // If newObj is an array, use it directly
  if (Array.isArray(newObj)) {
    return newObj;
  }

  if (!newObj || typeof newObj !== "object") {
    return newObj !== undefined ? newObj : oldObj;
  }

  if (!oldObj || typeof oldObj !== "object" || Array.isArray(oldObj)) {
    return newObj;
  }

  const merged = { ...newObj };

  Object.keys(oldObj).forEach((key) => {
    if (!(key in newObj)) {
      merged[key] = oldObj[key];
    } else if (
      typeof oldObj[key] === "object" &&
      !Array.isArray(oldObj[key]) &&
      oldObj[key] !== null &&
      typeof newObj[key] === "object" &&
      !Array.isArray(newObj[key]) &&
      newObj[key] !== null
    ) {
      merged[key] = deepMergeProps(oldObj[key], newObj[key]);
    } else if (Array.isArray(newObj[key]) && Array.isArray(oldObj[key])) {
      // For arrays, use newObj
      merged[key] = newObj[key];
    }
  });

  return merged;
};

/**
 * Get appropriate button label based on field name
 * Used for "Add More" buttons in dynamic arrays
 */
export const getAddButtonLabel = (fieldKey) => {
  const labelMap = {
    items: "Add More Question",
    faculties: "Add More Faculty",
    emiPartners: "Add More EMI Partner",
    allReviews: "Add More Review",
    otherUniversityList: "Add More University",
    gridContent: "Add More Grid Item",
    placementPartners: "Add More Partner",
    banners: "Add More Banner",
  };
  
  return labelMap[fieldKey] || "Add More";
};

/**
 * Get appropriate remove button label based on field name
 * Used for "Remove" buttons in dynamic arrays
 */
export const getRemoveButtonLabel = (fieldKey) => {
  const labelMap = {
    items: "Remove Question",
    faculties: "Remove Faculty",
    emiPartners: "Remove EMI Partner",
    allReviews: "Remove Review",
    otherUniversityList: "Remove University",
    gridContent: "Remove Grid Item",
    placementPartners: "Remove Partner",
    banners: "Remove Banner",
  };
  
  return labelMap[fieldKey] || "Remove";
};

/**
 * Determine whether an array should allow removing preloaded items
 */
export const canRemoveExistingEntries = (fieldKey) => {
  const removable = new Set([
    "faculties",
    "allReviews",
    "emiPartners",
    "placementPartners",
    "banners",
  ]);

  return removable.has(fieldKey);
};

/**
 * Helper for generating empty structure from template
 * Used when adding new items to dynamic arrays
 */
export const createEmptyStructure = (obj) => {
  if (Array.isArray(obj)) return [createEmptyStructure(obj[0])];
  if (typeof obj === "object" && obj !== null)
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [k, createEmptyStructure(v)])
    );
  return "";
};

/**
 * Check if a field should be skipped from rendering
 */
export const shouldSkipField = (key) => {
  const skipFields = [
    "otherUniversityList",
    "univsersityApprovals",
    "bgColor",
    "placementPartners",
    "emiPartners",
    "faqData", // Hide faqData field (simple Yes/No toggle like Other Popular Universities)
    "slug", // Hide slug field (auto-generated)
    "id", // Hide id field (auto-generated from question)
    "cat_id", // Hide cat_id field (auto-generated)
    ...Object.values(linkedFieldMappings),
  ];
  return skipFields.includes(key);
};

/**
 * Check if a field should render as a textarea
 */
export const isTextareaField = (key) => {
  const textareaFields = ["desc", "description", "reviewContent"];
  return textareaFields.includes(key);
};

/**
 * Check if a field is an image/file field
 */
export const isImageField = (key) => {
  return (
    key.toLowerCase().includes("img") ||
    key.toLowerCase().includes("logo") ||
    key.toLowerCase().includes("image") ||
    key.toLowerCase().includes("sample")
  );
};

/**
 * Check if a field should use CKEditor
 */
export const isCKEditorField = (key) => {
  return key === "content" || key === "answer";
};

/**
 * Build preview URL for images
 * Properly handles URL joining to avoid double slashes
 */
const joinURL = (base, path) => {
  const baseClean = base?.replace(/\/+$/, "") || ""; // Remove trailing slashes
  const pathClean = path?.replace(/^\/+/, "") || ""; // Remove leading slashes
  return `${baseClean}/${pathClean}`;
};

export const buildPreviewURL = (value, sectionPreviews, fieldName) => {
  // First check if there's a preview already set (from file upload)
  if (sectionPreviews[fieldName]) {
    return sectionPreviews[fieldName];
  }
  
  // If no preview, build from value
  if (typeof value === "string" && value.trim() !== "") {
    // Already a full URL
    if (value.startsWith("http://") || value.startsWith("https://")) {
      return value;
    }
    
    // Normalize path: ensure it doesn't have leading slash for joining
    let normalizedPath = value;
    if (value.startsWith("uploads/")) {
      normalizedPath = value; // Keep as is, will add leading / during join
    } else if (!value.startsWith("/")) {
      normalizedPath = value; // No leading slash, will add during join
    } else {
      normalizedPath = value.substring(1); // Remove leading slash
    }
    
    // Join base URL with path (handles double slashes automatically)
    return joinURL(process.env.NEXT_PUBLIC_thumbnail_URL, normalizedPath);
  }
  
  return null;
};

/**
 * Get the linked target key for a display key
 */
export const getLinkedFieldTarget = (fieldKey) => linkedFieldMappings[fieldKey];

/**
 * Recursively apply linked field mappings so display keys inherit values from their targets
 */
export const applyLinkedFieldMappings = (obj) => {
  if (!obj || typeof obj !== "object") return;

  Object.entries(linkedFieldMappings).forEach(([displayKey, targetKey]) => {
    if (Object.prototype.hasOwnProperty.call(obj, targetKey)) {
      const targetVal = obj[targetKey];
      const currentDisplayVal = obj[displayKey];

      if (!Object.prototype.hasOwnProperty.call(obj, displayKey) || isEmpty(currentDisplayVal)) {
        obj[displayKey] = targetVal ?? "";
      }
    }
  });

  Object.values(obj).forEach((value) => {
    if (Array.isArray(value)) {
      value.forEach((item) => applyLinkedFieldMappings(item));
    } else if (value && typeof value === "object") {
      applyLinkedFieldMappings(value);
    }
  });
};

