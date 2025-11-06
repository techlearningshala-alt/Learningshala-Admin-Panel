const navItemsData = [
  {
    name: "Home",
    roles: ["admin", "mentor", "editor"],
    subItems: [
      { name: "Dashboard", href: "/dashboard", roles: ["admin", "mentor", "editor"] },
      // { name: "Home Banners", href: "/home-banners", roles: ["admin", "editor"] },
      { name: "Mentors", href: "/mentors", roles: ["admin", "mentor"] },
      { name: "Media Spotlight", href: "/media-spotlight", roles: ["admin", "editor"] },
      { name: "Testimonials", href: "/testimonials", roles: ["admin", "editor"] },
      {
        name: "FAQs",
        roles: ["admin", "mentor"],
        subItems: [
          { name: "Categories", href: "/faq-category", roles: ["admin"] },
          { name: "All FAQs", href: "/faqs", roles: ["admin", "mentor"] },
        ],
      },
    ],
  },
  {
    name: "Menu",
    roles: ["admin"],
    subItems: [
      { name: "Domains", href: "/domains", roles: ["admin"] },
      { name: "Courses", href: "/courses", roles: ["admin"] },
      { name: "Specializations", href: "/specializations", roles: ["admin"] },
      // { name: "Questions", href: "/questions", roles: ["admin"] }
    ],
  },
  {
    name: "Universities",
    roles: ["admin", "mentor"],
    subItems: [
      { name: "Universities", href: "/universities", roles: ["admin"] },
      // { name: "University Courses", href: "/university-courses", roles: ["admin"] },
      // { name: "University Specializations", href: "/university-specializations", roles: ["admin"] },
      { name: "Approvals", href: "/universities-approvals", roles: ["admin"] },
      // { name: "Fees Types", href: "/fees-types", roles: ["admin"] },
      { name: "Placement/Hiring Partners", href: "/placements", roles: ["admin"] },
      { name: "EMI/Financing Partners", href: "/emi-partners", roles: ["admin"] },
      {
        name: "FAQs",
        roles: ["admin", "mentor"],
        subItems: [
          { name: "Categories", href: "/university-faq-category", roles: ["admin"] },
          { name: "All FAQs", href: "/university-faqs", roles: ["admin", "mentor"] },
        ],
      },
    ],
  },
  // {
  //   name: "Universities",
  //   href: "#",
  //   roles: ["admin"],
  //   subItems: [
  //     { name: "Universities", href: "/universities", roles: ["admin"] },
  //     { name: "University Courses", href: "/university-courses", roles: ["admin"] },
  //     { name: "University Specializations", href: "/university-specializations", roles: ["admin"] },
  //     { name: "Approvals", href: "/approvals", roles: ["admin"] },
  //     { name: "Fees Types", href: "/fees-types", roles: ["admin"] },
  //     { name: "Placement/Hiring Partners", href: "/placements", roles: ["admin"] },
  //   ],
  // },
];

export default navItemsData;
