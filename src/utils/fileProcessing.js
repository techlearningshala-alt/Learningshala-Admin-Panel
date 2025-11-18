/**
 * Extracts FileList objects from nested section props and adds them to FormData
 * Replaces FileList with filename in the processed object
 * 
 * @param {Array} sections - Array of sections with props (can be from form state or already processed)
 * @param {FormData} formData - FormData instance to append files to
 * @param {Function} generateSectionKey - Optional function to generate section_key
 * @returns {Array} Processed sections with FileList replaced by filenames
 */
export function processSectionFiles(sections, formData, generateSectionKey = null) {
  if (!sections || !Array.isArray(sections)) {
    return [];
  }

  // Deep copy sections to avoid mutating form state
  // If sections already have section_key, preserve it; otherwise generate it
  const sectionsCopy = sections.map((section) => ({
    id: section.id,
    section_key: section.section_key || (generateSectionKey
      ? generateSectionKey(section.title || "")
      : section.title?.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_]/g, "")),
    title: section.title || "",
    component: section.component || "",
    props: section.props ? JSON.parse(JSON.stringify(section.props, (key, value) => {
      // Skip FileList during deep copy - we'll handle them separately
      if (value instanceof FileList) {
        return null; // Placeholder, will be replaced
      }
      return value;
    })) : {},
  }));

  // Extract and handle nested file inputs in sections
  let sectionImageCounter = 0;

  const processProps = (obj, originalObj) => {
    if (!obj || typeof obj !== "object") {
      return;
    }

    Object.entries(originalObj).forEach(([k, v]) => {
      // Handle FileList - extract file and store filename
      if (v instanceof FileList && v.length > 0) {
        const uniqueKey = `section_image_${sectionImageCounter}`;
        formData.append(uniqueKey, v[0]);
        obj[k] = v[0].name; // Store filename instead of FileList
        sectionImageCounter++;
      } else if (Array.isArray(v)) {
        // Ensure array exists in obj
        if (!obj[k]) obj[k] = [];
        v.forEach((item, index) => {
          if (item && typeof item === "object") {
            if (!obj[k][index]) obj[k][index] = {};
            processProps(obj[k][index], item);
          }
        });
      } else if (v && typeof v === "object" && !(v instanceof FileList) && !(v instanceof File)) {
        // Ensure nested object exists in obj
        if (!obj[k]) obj[k] = {};
        processProps(obj[k], v);
      } else if (obj[k] === null || obj[k] === undefined) {
        // Copy primitive values that weren't handled
        obj[k] = v;
      }
    });
  };

  sectionsCopy.forEach((section, sIndex) => {
    if (section.props && sections[sIndex]?.props) {
      processProps(section.props, sections[sIndex].props);
    }
  });

  return sectionsCopy;
}

