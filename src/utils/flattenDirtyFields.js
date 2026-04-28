/**
 * Flattens react-hook-form `dirtyFields` into dot-notation paths.
 * @param {Record<string, unknown>} dirtyFields
 * @param {string} [prefix]
 * @returns {string[]}
 */
export function flattenDirtyFields(dirtyFields, prefix = "") {
  if (!dirtyFields || typeof dirtyFields !== "object") return [];
  const paths = [];
  for (const key of Object.keys(dirtyFields)) {
    const val = dirtyFields[key];
    const path = prefix === "" ? key : `${prefix}.${key}`;
    if (val === true) {
      paths.push(path);
    } else if (val && typeof val === "object") {
      paths.push(...flattenDirtyFields(val, path));
    }
  }
  return paths;
}

/**
 * Replaces numeric section indexes with readable section identifiers.
 * Example:
 * - mode "path": sections.0.props.content -> sections.latest_updates.props.content
 * - mode "title": sections.0.props.content -> Latest Updates
 * @param {string[]} paths
 * @param {Array<{ section_key?: string; id?: string; title?: string }>} sections
 * @param {"path"|"title"} [mode]
 * @returns {string[]}
 */
export function normalizeSectionDirtyPaths(paths, sections = [], mode = "path") {
  if (!Array.isArray(paths) || !paths.length) return [];

  return paths.map((path) => {
    const match = /^sections\.(\d+)(\.|$)/.exec(path);
    if (!match) return path;

    const index = Number(match[1]);
    const section = Array.isArray(sections) ? sections[index] : null;
    const rawSectionTitle = String(section?.title || "").trim();
    if (mode === "title") {
      if (rawSectionTitle) return rawSectionTitle;
      const fallbackTitle = String(section?.section_key || section?.id || `Section ${index + 1}`)
        .replace(/[_-]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      return fallbackTitle || `Section ${index + 1}`;
    }

    const sectionKey = String(
      section?.section_key || section?.id || section?.title || `index_${index}`
    )
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_+|_+$/g, "");

    return path.replace(`sections.${index}`, `sections.${sectionKey || `index_${index}`}`);
  });
}

/**
 * Converts technical RHF field paths to human-readable labels.
 * @param {string[]} paths
 * @returns {string[]}
 */
export function normalizeCommonDirtyLabels(paths) {
  if (!Array.isArray(paths) || !paths.length) return [];

  return paths.map((path) => {
    if (/^banners\.\d+\.video_id$/.test(path)) return "Video ID";
    if (/^banners\.\d+\.video_title$/.test(path)) return "Video Title";
    return path;
  });
}
