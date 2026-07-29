/**
 * Admin panel section access helpers.
 * Values: "blog" | "news" | "university"
 */

export const SECTION_OPTIONS = [
  { value: "blog", label: "Blog" },
  { value: "news", label: "News" },
  { value: "university", label: "University" },
];

export const SECTION_ROUTE_PREFIXES = [
  {
    section: "blog",
    prefixes: ["/blogs", "/blog-categories"],
  },
  {
    section: "news",
    prefixes: ["/news", "/news-categories"],
  },
  {
    section: "university",
    prefixes: [
      "/universities",
      "/university-courses",
      "/university-course-specializations",
      "/universities-approvals",
      "/fee-types",
      "/university-types",
      "/placements",
      "/emi-partners",
      "/university-faqs",
      "/university-course-faqs",
    ],
  },
];

const SECTION_HOME_PATH = {
  blog: "/blogs",
  news: "/news",
  university: "/universities",
};

export function parseSectionAccess(value) {
  if (Array.isArray(value)) {
    return value
      .map((v) => String(v || "").trim().toLowerCase())
      .filter((v) => ["blog", "news", "university"].includes(v));
  }
  if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      return parseSectionAccess(parsed);
    } catch {
      return value
        .split(",")
        .map((v) => v.trim().toLowerCase())
        .filter((v) => ["blog", "news", "university"].includes(v));
    }
  }
  return [];
}

/** Non-admin/non-lead users are limited to only their section_access tabs. */
export function isSectionRestrictedUser(user) {
  if (!user) return false;
  const role = String(user.role || "").trim().toLowerCase();
  return role !== "admin" && role !== "lead";
}

export function userHasSectionAccess(user, section) {
  if (!section) return true;
  if (!user) return false;
  const role = String(user.role || "").trim().toLowerCase();
  if (role === "admin") return true;
  const access = parseSectionAccess(user.section_access);
  return access.includes(String(section).trim().toLowerCase());
}

export function getRequiredSectionForPath(pathname = "") {
  const path = String(pathname || "").split("?")[0];
  for (const entry of SECTION_ROUTE_PREFIXES) {
    if (entry.prefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))) {
      return entry.section;
    }
  }
  return null;
}

export function getDefaultSectionHome(user) {
  const access = parseSectionAccess(user?.section_access);
  for (const section of access) {
    if (SECTION_HOME_PATH[section]) return SECTION_HOME_PATH[section];
  }
  return "/unauthorized";
}

/**
 * Section-restricted users may only open routes under their allowed sections.
 * Admins/leads are unrestricted by this helper.
 */
export function canAccessPathBySection(user, pathname = "") {
  if (!user) return false;
  if (!isSectionRestrictedUser(user)) return true;

  const path = String(pathname || "").split("?")[0];
  if (path === "/unauthorized" || path === "/login") return true;

  const requiredSection = getRequiredSectionForPath(path);
  if (!requiredSection) return false;
  return userHasSectionAccess(user, requiredSection);
}
