/**
 * Admin panel section access helpers.
 * Values: "home" | "menu" | "miscellaneous" | "blog" | "news" | "university"
 */

export const ALLOWED_SECTIONS = [
  "home",
  "menu",
  "miscellaneous",
  "blog",
  "news",
  "university",
];

export const SECTION_OPTIONS = [
  { value: "home", label: "Home" },
  { value: "menu", label: "Menu" },
  { value: "miscellaneous", label: "Miscellaneous" },
  { value: "blog", label: "Blog" },
  { value: "news", label: "News" },
  { value: "university", label: "University" },
];

export const SECTION_ROUTE_PREFIXES = [
  {
    section: "home",
    prefixes: [
      "/dashboard",
      "/website-banners",
      "/mentors",
      "/post-admission-team",
      "/media-spotlight",
      "/testimonials",
      "/faq-category",
      "/faqs",
    ],
  },
  {
    section: "menu",
    prefixes: ["/domains", "/courses", "/specializations", "/course-faqs"],
  },
  {
    section: "miscellaneous",
    prefixes: [
      "/editor-activity",
      "/course-images",
      "/specialization-images",
      "/authors",
      "/redirections",
      "/uploads",
    ],
  },
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
  home: "/dashboard",
  menu: "/courses",
  miscellaneous: "/authors",
  blog: "/blogs",
  news: "/news",
  university: "/universities",
};

export function parseSectionAccess(value) {
  if (Array.isArray(value)) {
    return value
      .map((v) => String(v || "").trim().toLowerCase())
      .filter((v) => ALLOWED_SECTIONS.includes(v));
  }
  if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      return parseSectionAccess(parsed);
    } catch {
      return value
        .split(",")
        .map((v) => v.trim().toLowerCase())
        .filter((v) => ALLOWED_SECTIONS.includes(v));
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
