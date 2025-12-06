"use client";

import DataTable from "@/components/table/DataTable";

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
    style: { minWidth: "200px" },
    cellClassName: "border px-2 py-1 align-middle font-medium",
  },
  {
    key: "email",
    label: "Email",
    style: { minWidth: "220px" },
    cellClassName: defaultCellClass,
    render: (row) => row.email || "-",
  },
  {
    key: "phone",
    label: "Phone",
    style: { minWidth: "100px" },
    cellClassName: defaultCellClass,
    render: (row) => row.phone || "-",
  },
  {
    key: "course",
    label: "Course",
    style: { minWidth: "70px" },
    cellClassName: defaultCellClass,
    render: (row) => row.course || "-",
  },
  {
    key: "specialisation",
    label: "Specialisation",
    style: defaultColumnStyle,
    cellClassName: defaultCellClass,
    render: (row) => row.specialisation || "-",
  },
  {
    key: "state",
    label: "State",
    style: { minWidth: "50px" },
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
    style: { minWidth: "100px" },
    cellClassName: defaultCellClass,
    render: (row) => row.lead_source || "-",
  },
  {
    key: "sub_source",
    label: "Sub Source",
    style: { minWidth: "100px" },
    cellClassName: defaultCellClass,
    render: (row) => row.sub_source || "-",
  },
  {
    key: "highest_qualification",
    label: "Highest Qualification",
    style: { minWidth: "200px" },
    cellClassName: defaultCellClass,
    render: (row) => row.highest_qualification || "-",
  },
  {
    key: "preferred_budget",
    label: "Preferred Budget",
    style: { minWidth: "50px" },
    cellClassName: defaultCellClass,
    render: (row) => row.preferred_budget || "-",
  },
  {
    key: "emi_required",
    label: "EMI Required",
    style: { minWidth: "50px" },
    cellClassName: defaultCellClass,
    render: (row) => row.emi_required || "-",
  },
  {
    key: "salary",
    label: "Salary",
    style: { minWidth: "50px" },
    cellClassName: defaultCellClass,
    render: (row) => row.salary || "-",
  },
  {
    key: "percentage",
    label: "Percentage",
    style: { minWidth: "50px" },
    cellClassName: defaultCellClass,
    render: (row) => row.percentage || "-",
  },
  {
    key: "experience",
    label: "Experience",
    style: { minWidth: "50px" },
    cellClassName: defaultCellClass,
    render: (row) => row.experience || "-",
  },
  {
    key: "currently_employed",
    label: "Currently Employed",
    style: { minWidth: "100px" },
    cellClassName: defaultCellClass,
    render: (row) => row.currently_employed || "-",
  },
  {
    key: "university_for_placement_salaryhike_promotions",
    label: "University for Placement/Salary Hike/Promotions",
    style: { minWidth: "250px" },
    cellClassName: defaultCellClass,
    render: (row) => row.university_for_placement_salaryhike_promotions || "-",
  },
  {
    key: "utm_source",
    label: "UTM Source",
    style: { minWidth: "100px" },
    cellClassName: defaultCellClass,
    render: (row) => row.utm_source || "-",
  },
  {
    key: "utm_campaign",
    label: "UTM Campaign",
    style: { minWidth: "200px" },
    cellClassName: defaultCellClass,
    render: (row) => row.utm_campaign || "-",
  },
  {
    key: "utm_adgroup",
    label: "UTM Ad Group",
    style: { minWidth: "120px" },
    cellClassName: defaultCellClass,
    render: (row) => row.utm_adgroup || "-",
  },
  {
    key: "utm_ads",
    label: "UTM Ads",
    style: defaultColumnStyle,
    cellClassName: defaultCellClass,
    render: (row) => row.utm_ads || "-",
  },
  {
    key: "created_on",
    label: "Created On",
    style: { minWidth: "220px" },
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
  {
    key: "website_url",
    label: "Website URL",
    style: { minWidth: "240px" },
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
];

export default function LeadTable({ data = [], isLoading }) {
  if (isLoading) {
    return <p>Loading leads...</p>;
  }

  return <DataTable columns={columns} data={data} />;
}


