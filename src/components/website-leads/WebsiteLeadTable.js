"use client";

import DataTable from "@/components/table/DataTable";
import { maskEmail, maskPhone } from "@/lib/utils";

const defaultCellClass =
  "border px-2 py-1 align-middle whitespace-nowrap text-sm text-muted-foreground";
const defaultColumnStyle = { minWidth: "160px" };

const columns = [
  {
    key: "name",
    label: "Name",
    style: { minWidth: "140px" },
    cellClassName: "border px-2 py-1 align-middle font-medium",
  },
  {
    key: "email",
    label: "Email",
    style: { minWidth: "130px" },
    cellClassName: defaultCellClass,
    render: (row) => maskEmail(row.email),
  },
  {
    key: "phone",
    label: "Phone",
    style: { minWidth: "80px" },
    cellClassName: defaultCellClass,
    render: (row) => maskPhone(row.phone),
  },
  {
    key: "course",
    label: "Course",
    style: { minWidth: "110px" },
    cellClassName: defaultCellClass,
    render: (row) => row.course || "-",
  },
  {
    key: "specialization",
    label: "Specialization",
    style: { minWidth: "110px" },
    cellClassName: defaultCellClass,
    render: (row) => row.specialization || "-",
  },
  {
    key: "state",
    label: "State",
    style: { minWidth: "90px" },
    cellClassName: defaultCellClass,
    render: (row) => row.state || "-",
  },
  {
    key: "city",
    label: "City",
    style: { minWidth: "90px" },
    cellClassName: defaultCellClass,
    render: (row) => row.city || "-",
  },
  {
    key: "lead_source",
    label: "Lead Source",
    style: { minWidth: "90px" },
    cellClassName: defaultCellClass,
    render: (row) => row.lead_source || "-",
  },
  {
    key: "sub_source",
    label: "Sub Source",
    style: { minWidth: "90px" },
    cellClassName: defaultCellClass,
    render: (row) => row.sub_source || "-",
  },
  {
    key: "lead_url",
    label: "Lead URL",
    style: { minWidth: "220px" },
    cellClassName:
      "border px-2 py-1 align-middle text-sm text-muted-foreground max-w-[280px] overflow-hidden",
    render: (row) =>
      row.lead_url ? (
        <a
          href={row.lead_url}
          target="_blank"
          rel="noopener noreferrer"
          title={row.lead_url}
          className="text-primary hover:underline block max-w-[260px] truncate"
        >
          {row.lead_url}
        </a>
      ) : (
        "-"
      ),
  },
  {
    key: "click_source",
    label: "Click Source",
    style: { minWidth: "90px" },
    cellClassName: defaultCellClass,
    render: (row) => row.click_source || "-",
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
    style: { minWidth: "180px" },
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
    key: "created_at",
    label: "Created On",
    style: { minWidth: "160px" },
    cellClassName: defaultCellClass,
    render: (row) => {
      if (!row.created_at) return "-";
      const date = new Date(row.created_at);
      return Number.isNaN(date.getTime())
        ? "-"
        : `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}`;
    },
  },
];

export default function WebsiteLeadTable({ data = [], isLoading }) {
  if (isLoading) {
    return <p>Loading website leads...</p>;
  }

  return <DataTable columns={columns} data={data} />;
}

