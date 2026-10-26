/** Page dropdown options for Home Title & Description / Static Pages Metadata */

export const HOME_PAGE_OPTIONS = [
  { value: "home", label: "Home" },
];

export const STATIC_PAGE_OPTIONS = [
  { value: "about", label: "About Us" },
  { value: "contact-us", label: "Contact Us" },
  { value: "term-and-conditions", label: "Terms & Conditions" },
  { value: "privacy-policy", label: "Privacy Policy" },
  { value: "compare", label: "Compare" },
  { value: "join-waitlist", label: "Join Waitlist" },
  { value: "partner-with-us", label: "Partner With Us" },
];

export function getPageOptionsByType(metadataType = "home") {
  return metadataType === "static" ? STATIC_PAGE_OPTIONS : HOME_PAGE_OPTIONS;
}

export function getPageLabel(pageValue, metadataType = "home") {
  const options = getPageOptionsByType(metadataType);
  const match = options.find((opt) => opt.value === pageValue);
  return match?.label || pageValue || "-";
}
