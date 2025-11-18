import { Button } from "@/components/ui/button";
import DataTable from "@/components/table/DataTable";
import { Pencil, Trash } from "lucide-react";

function formatCurrency(value) {
  if (value === undefined || value === null || value === "") {
    return "-";
  }
  const numeric = Number(value);
  if (Number.isNaN(numeric)) {
    return "-";
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(numeric);
}

function sanitizeFeeKey(key) {
  return key
    ? String(key)
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "")
    : "";
}

function collapseKey(key) {
  return key
    ? String(key)
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")
    : "";
}

function findFeeValue(values, targetSlug) {
  if (!values) return undefined;

  const normalizedTarget = sanitizeFeeKey(targetSlug);
  const collapsedTarget = collapseKey(targetSlug);

  const candidates = new Set([
    normalizedTarget,
    normalizedTarget.endsWith("s") ? normalizedTarget.slice(0, -1) : `${normalizedTarget}s`,
    normalizedTarget.replace(/fees$/, "fee"),
    normalizedTarget.replace(/fee$/, "fees"),
  ]);

  const collapsedCandidates = new Set([
    collapsedTarget,
    collapsedTarget.endsWith("s") ? collapsedTarget.slice(0, -1) : `${collapsedTarget}s`,
  ]);

  for (const [feeKey, value] of Object.entries(values)) {
    const normalizedFeeKey = sanitizeFeeKey(feeKey);
    const collapsedFeeKey = collapseKey(feeKey);

    if (
      candidates.has(normalizedFeeKey) ||
      collapsedCandidates.has(collapsedFeeKey)
    ) {
      return typeof value === "number" ? value : Number(value);
    }
  }

  return undefined;
}

export default function UniversityCourseTable({
  data = [],
  isLoading,
  onEdit,
  onDelete,
  onToggleStatus,
}) {
  const columns = [
  { key: "name", label: "Course Name", style: { width: "20%" } },
  {
    key: "university_name",
    label: "University Name",
    style: { width: "20%" },
  },
  {
    key: "duration",
    label: "Duration",
    style: { width: "12%" },
    render: (row) => row.duration || "-",
  },
  {
    key: "full_fee",
    label: "Full Fee",
    style: { width: "12%" },
    render: (row) => formatCurrency(findFeeValue(row.fee_type_values, "full_fees")),
  },
  {
    key: "sem_fee",
    label: "Sem Fee",
    style: { width: "12%" },
    render: (row) => formatCurrency(findFeeValue(row.fee_type_values, "Semester Fee")),
  },
      {
        key: "brochure",
        label: "Brochure",
        style: { width: "12%" },
        render: (row) =>
          row.brochure_file ? (
            <a
              href={`${process.env.NEXT_PUBLIC_thumbnail_URL}${row.brochure_file}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              Download
            </a>
          ) : (
            <span className="text-muted-foreground">-</span>
          ),
      },
  {
    key: "updated_at",
    label: "Updated Date",
    style: { width: "12%" },
    cellClassName: "border px-2 py-1 align-middle whitespace-nowrap",
    render: (row) =>
      row.updated_at ? new Date(row.updated_at).toLocaleDateString() : "-",
  },
  {
    key: "is_active",
    label: "Active / Deactivate",
    style: { width: "12%" },
    render: (row) => (
      <Button
        size="sm"
        variant={row.is_active ? "default" : "outline"}
        className={row.is_active ? "" : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300"}
        onClick={() => onToggleStatus?.(row.id, !row.is_active)}
      >
        {row.is_active ? "Active" : "Inactive"}
      </Button>
    ),
  },
  ];
  const actions = [
    {
      key: ({ row }) => (
        <Button
          size="sm"
          variant="ghost"
          type="button"
          className="h-8 w-8 p-0"
          onClick={() => onEdit(row)}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      ),
    },
    {
      key: ({ row }) => (
        <Button
          size="sm"
          variant="ghost"
          type="button"
          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
          onClick={() => onDelete(row)}
        >
          <Trash className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  if (isLoading) {
    return <p>Loading courses...</p>;
  }

  return <DataTable columns={columns} data={data} actions={actions} />;
}

