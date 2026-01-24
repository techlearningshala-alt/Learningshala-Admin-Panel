import { BookText, Menu } from "lucide-react";

const navItemsData = [
  // Dashboard as top-level item for lead role
  { name: "Dashboard", href: "/dashboard", roles: ["lead"] },
  {
    name: "Home",
    roles: ["admin", "mentor"],
    subItems: [
      { name: "Dashboard", href: "/dashboard", roles: ["admin", "mentor"] },
      // { name: "Home Banners", href: "/home-banners", roles: ["admin", "editor"] },
      { name: "Mentors", href: "/mentors", roles: ["admin", "mentor"] },
      { name: "Media Spotlight", href: "/media-spotlight", roles: ["admin", "editor","mentor"] },
      { name: "Testimonials", href: "/testimonials", roles: ["admin", "editor","mentor"] },
      {
        name: "FAQs",
        roles: ["admin", "mentor"],
        subItems: [
          { name: "Categories", href: "/faq-category", roles: ["admin","mentor"] },
          { name: "All FAQs", href: "/faqs", roles: ["admin", "mentor"] },
        ],
      },
    ],
  },
  {
    name: "Menu",
    roles: ["admin","mentor"],
    subItems: [
      { name: "Domains", href: "/domains", roles: ["admin","mentor"] },
      { name: "Courses", href: "/courses", roles: ["admin","mentor"] },
      { name: "Specializations", href: "/specializations", roles: ["admin","mentor"] },
      { name: "FAQs", href: "/course-faqs", roles: ["admin","mentor"] },
      // { name: "Questions", href: "/questions", roles: ["admin"] }
    ],
  },
  {
    name: "Universities",
    roles: ["admin", "mentor"],
    subItems: [
      { name: "Universities", href: "/universities", roles: ["admin","mentor"] },
      { name: "University Courses", href: "/university-courses", roles: ["admin","mentor"] },
      { name: "Course Specializations", href: "/university-course-specializations", roles: ["admin","mentor"] },
      { name: "Approvals", href: "/universities-approvals", roles: ["admin","mentor"] },
      { name: "Fee Types", href: "/fee-types", roles: ["admin","mentor"] },
      { name: "University Types", href: "/university-types", roles: ["admin", "mentor"] },
      { name: "Placement/Hiring Partners", href: "/placements", roles: ["admin","mentor"] },
      { name: "EMI/Financing Partners", href: "/emi-partners", roles: ["admin","mentor"] },
      { name: "FAQs", href: "/university-faqs", roles: ["admin", "mentor"] },

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
    subItems: [
      { name: "Course Images", href: "/course-images", roles: ["admin","mentor"] },
      { name: "Specialization Images", href: "/specialization-images", roles: ["admin","mentor"] },
      { name: "Authors", href: "/authors", roles: ["admin","mentor"] },
    ],
  },
  {
    name: "Blogs",
    roles: ["admin", "mentor"],
    subItems: [
      { name: "All Blogs", href: "/blogs", roles: ["admin", "mentor"] },
      { name: "Categories", href: "/blog-categories", roles: ["admin", "mentor"] },
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
  { name: "Landing Page Leads", href: "/leads", roles: ["lead"] },
  { name: "Website Leads", href: "/website-leads", roles: ["lead"] },
  { name: "Contact Us", href: "/contact-us", roles: ["lead"] },
  { name: "Create User", href: "/create-user", roles: ["admin"] }
];

export default navItemsData;