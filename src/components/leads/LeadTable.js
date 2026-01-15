"use client";

import DataTable from "@/components/table/DataTable";
// import { maskEmail, maskPhone } from "@/lib/utils"; // Commented out masking for now

const defaultCellClass =
  "border px-2 py-1 align-middle whitespace-nowrap text-sm text-muted-foreground";
const defaultColumnStyle = { minWidth: "160px" };

const columns = [
  {
    key: "index",
    label: "Sr. No.",
    style: { width: "80px" },
    cellClassName: `${defaultCellClass} text-center`,
    render: (_row, index) => index + 1,
  },
  {
    key: "name",
    label: "Name",
    style: { minWidth: "90px" },
    cellClassName: "border px-2 py-1 align-middle font-medium",
  },
  {
    key: "email",
    label: "Email",
    style: { minWidth: "170px" },
    cellClassName: defaultCellClass,
    // render: (row) => maskEmail(row.email), // Commented out masking for now
  },
  {
    key: "phone",
    label: "Phone",
    style: { minWidth: "100px" },
    cellClassName: defaultCellClass,
    // render: (row) => maskPhone(row.phone), // Commented out masking for now
  },
  {
    key: "course",
    label: "Course",
    style: { minWidth: "110px" },
    cellClassName: defaultCellClass,
    render: (row) => row.course || "-",
  },
  {
    key: "university",
    label: "University",
    style: { minWidth: "140px" },
    cellClassName: defaultCellClass,
    render: (row) => row.university || "-",
  },
  {
    key: "specialisation",
    label: "Specialisation",
    style:  { minWidth: "110px" },
    cellClassName: defaultCellClass,
    render: (row) => row.specialisation || "-",
  },
  {
    key: "state",
    label: "State",
    style: { minWidth: "80px" },
    cellClassName: defaultCellClass,
    render: (row) => row.state || "-",
  },
  {
    key: "city",
    label: "City",
    style: { minWidth: "80px" },
    cellClassName: defaultCellClass,
    render: (row) => row.city || "-",
  },
  {
    key: "lead_source",
    label: "Lead Source",
    style: { minWidth: "80px" },
    cellClassName: defaultCellClass,
    render: (row) => row.lead_source || "-",
  },
  {
    key: "sub_source",
    label: "Sub Source",
    style: { minWidth: "80px" },
    cellClassName: defaultCellClass,
    render: (row) => row.sub_source || "-",
  },
  {
    key: "highest_qualification",
    label: "Highest Qualification",
    style: { minWidth: "100px" },
    cellClassName: defaultCellClass,
    render: (row) => row.highest_qualification || "-",
  },
  {
    key: "preferred_budget",
    label: "Preferred Budget",
    style: { minWidth: "100px" },
    cellClassName: defaultCellClass,
    render: (row) => row.what_is_your_preferred_budget_for_the_total_course_fee || "-",
  },
  {
    key: "emi_required",
    label: "EMI Required",
    style: { minWidth: "50px" },
    cellClassName: defaultCellClass,
    render: (row) => row.would_you_prefer_to_convert_the_course_fee_into_easy_emis || "-",
  },
  {
    key: "salary",
    label: "Salary",
    style: { minWidth: "100px" },
    cellClassName: defaultCellClass,
    render: (row) => row.what_is_your_current_annual_salary_package || "-",
  },
  {
    key: "percentage",
    label: "Percentage",
    style: { minWidth: "50px" },
    cellClassName: defaultCellClass,
    render: (row) => row.what_was_your_percentage_in_graduation || "-",
  },
  {
    key: "experience",
    label: "Experience",
    style: { minWidth: "50px" },
    cellClassName: defaultCellClass,
    render: (row) => row.how_many_years_of_experience_do_you_have || "-",
  },
  {
    key: "currently_employed",
    label: "Currently Employed",
    style: { minWidth: "80px" },
    cellClassName: defaultCellClass,
    render: (row) => row.are_you_currently_employed || "-",
  },
  {
    key: "university_for_placement_salaryhike_promotions",
    label: "University for Placement/Salary Hike/Promotions",
    style: { minWidth: "160px" },
    cellClassName: defaultCellClass,
    render: (row) => row.are_you_looking_for_a_university_that_can_help_you_with_placement_salary_hike_or_promotions || "-",
  },
  {
    key: "utm_source",
    label: "UTM Source",
    style: { minWidth: "90px" },
    cellClassName: defaultCellClass,
    render: (row) => row.utm_source || "-",
  },
  {
    key: "utm_campaign",
    label: "UTM Campaign",
    style: { minWidth: "90px" },
    cellClassName: defaultCellClass,
    render: (row) => row.utm_campaign || "-",
  },
  {
    key: "utm_adgroup",
    label: "UTM Ad Group",
    style: { minWidth: "90px" },
    cellClassName: defaultCellClass,
    render: (row) => row.utm_adgroup || "-",
  },
  {
    key: "utm_ads",
    label: "UTM Ads",
    style: { minWidth: "90px" },
    cellClassName: defaultCellClass,
    render: (row) => row.utm_ads || "-",
  },
  {
    key: "website_url",
    label: "Website URL",
    style: { minWidth: "200px" },
    cellClassName: defaultCellClass,
    render: (row) =>
      row.website_url ? (
        <a
          href={row.website_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          {row.website_url}
        </a>
      ) : (
        "-"
      ),
  },
  {
    key: "created_on",
    label: "Created On",
    style: { minWidth: "160px" },
    cellClassName: defaultCellClass,
    render: (row) => {
      if (!row.created_on) return "-";
      const date = new Date(row.created_on);
      return Number.isNaN(date.getTime())
        ? "-"
        : `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}`;
    },
  },
];

export default function LeadTable({ data = [], isLoading }) {
  if (isLoading) {
    return <p>Loading leads...</p>;
  }

  return <DataTable columns={columns} data={data} />;
}


