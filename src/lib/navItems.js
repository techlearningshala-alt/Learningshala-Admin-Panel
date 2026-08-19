import { BookText, Menu } from "lucide-react";

const navItemsData = [
  // Dashboard as top-level item for lead role
  { name: "Dashboard", href: "/dashboard", roles: ["lead"] },
  {
    name: "Home",
    roles: ["admin", "mentor"],
    section: "home",
    subItems: [
      { name: "Dashboard", href: "/dashboard", roles: ["admin", "mentor"], section: "home" },
      { name: "Banners", href: "/website-banners", roles: ["admin", "editor"], section: "home" },
      { name: "Mentors", href: "/mentors", roles: ["admin", "mentor"], section: "home" },
      { name: "Post Admission Team", href: "/post-admission-team", roles: ["admin", "mentor"], section: "home" },
      { name: "Media Spotlight", href: "/media-spotlight", roles: ["admin", "editor","mentor"], section: "home" },
      { name: "Testimonials", href: "/testimonials", roles: ["admin", "editor","mentor"], section: "home" },
      { name: "Compare", href: "/compare", roles: ["admin", "mentor"], section: "home" },
      {
        name: "FAQs",
        roles: ["admin", "mentor"],
        section: "home",
        subItems: [
          { name: "Categories", href: "/faq-category", roles: ["admin","mentor"], section: "home" },
          { name: "All FAQs", href: "/faqs", roles: ["admin", "mentor"], section: "home" },
        ],
      },
    ],
  },
  {
    name: "Menu",
    roles: ["admin","mentor"],
    section: "menu",
    subItems: [
      { name: "Domains", href: "/domains", roles: ["admin","mentor"], section: "menu" },
      { name: "Courses", href: "/courses", roles: ["admin","mentor"], section: "menu" },
      { name: "Specializations", href: "/specializations", roles: ["admin","mentor"], section: "menu" },
      { name: "FAQs", href: "/course-faqs", roles: ["admin","mentor"], section: "menu" },
      // { name: "Questions", href: "/questions", roles: ["admin"] }
    ],
  },
  {
    name: "Universities",
    roles: ["admin", "mentor"],
    section: "university",
    subItems: [
      { name: "Universities", href: "/universities", roles: ["admin","mentor"], section: "university" },
      { name: "University Courses", href: "/university-courses", roles: ["admin","mentor"], section: "university" },
      { name: "Course Specializations", href: "/university-course-specializations", roles: ["admin","mentor"], section: "university" },
      { name: "Approvals", href: "/universities-approvals", roles: ["admin","mentor"], section: "university" },
      { name: "Fee Types", href: "/fee-types", roles: ["admin","mentor"], section: "university" },
      { name: "University Types", href: "/university-types", roles: ["admin", "mentor"], section: "university" },
      { name: "Placement/Hiring Partners", href: "/placements", roles: ["admin","mentor"], section: "university" },
      { name: "EMI/Financing Partners", href: "/emi-partners", roles: ["admin","mentor"], section: "university" },
      { name: "FAQs", href: "/university-faqs", roles: ["admin", "mentor"], section: "university" },

      // {
      //   name: "FAQs",
      //   roles: ["admin", "mentor"],
      //   subItems: [
      //     { name: "Course FAQs", href: "/university-course-faqs", roles: ["admin", "mentor"] },
      //   ],
      // },
    ],
  },
  {
    name: "Miscellaneous",
    roles: ["admin","mentor"],
    section: "miscellaneous",
    subItems: [
      { name: "Editor Activity", href: "/editor-activity", roles: ["admin"], section: "miscellaneous" },
      { name: "Course Images", href: "/course-images", roles: ["admin","mentor"], section: "miscellaneous" },
      { name: "Specialization Images", href: "/specialization-images", roles: ["admin","mentor"], section: "miscellaneous" },
      { name: "Authors", href: "/authors", roles: ["admin","mentor"], section: "miscellaneous" },
      { name: "Redirection", href: "/redirections", roles: ["admin","mentor"], section: "miscellaneous" },
      { name: "Uploads", href: "/uploads", roles: ["admin","mentor"], section: "miscellaneous" },
    ],
  },
  {
    name: "Blogs",
    roles: ["admin", "mentor"],
    section: "blog",
    subItems: [
      { name: "All Blogs", href: "/blogs", roles: ["admin", "mentor"], section: "blog" },
      { name: "Categories", href: "/blog-categories", roles: ["admin", "mentor"], section: "blog" },
      // Blog FAQ categories removed - FAQs no longer use categories
      // {
      //   name: "FAQs",
      //   roles: ["admin", "mentor"],
      //   subItems: [
      //     { name: "FAQs Categories", href: "/blog-faq-categories", roles: ["admin", "mentor"] },
      //   ],
      // },
    ],
  },
  {
    name: "News",
    roles: ["admin", "mentor"],
    section: "news",
    subItems: [
      { name: "All News", href: "/news", roles: ["admin", "mentor"], section: "news" },
      { name: "Categories", href: "/news-categories", roles: ["admin", "mentor"], section: "news" },
    ],
  },
  { name: "Landing Page Leads", href: "/leads", roles: ["lead"] },
  { name: "Website Leads", href: "/website-leads", roles: ["lead"] },
  { name: "B2B Leads", href: "/b2b-leads", roles: ["lead"] },
  { name: "Contact Us", href: "/contact-us", roles: ["lead"] },
  { name: "Create User", href: "/create-user", roles: ["admin"] }
];

export default navItemsData;
