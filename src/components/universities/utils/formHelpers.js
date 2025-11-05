/**
 * Form Helper Utilities
 * Reusable helper functions for dynamic forms
 */

/**
 * Deep merge two objects, prioritizing new values over old ones
 * Handles nested objects and arrays properly
 */
export const deepMergeProps = (oldObj, newObj) => {
  if (!newObj || typeof newObj !== "object" || Array.isArray(newObj)) {
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
    faqData: "Add More Category",
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
    "slug", // Hide slug field (auto-generated)
    "id", // Hide id field (auto-generated from question)
    "cat_id", // Hide cat_id field (auto-generated)
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

