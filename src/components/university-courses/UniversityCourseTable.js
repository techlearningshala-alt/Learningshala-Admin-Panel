import { Button } from "@/components/ui/button";
import DataTable from "@/components/table/DataTable";
import { Pencil, Trash } from "lucide-react";
import { createTableActions } from "@/utils/tableActions";
import { usePermissions } from "@/hooks/usePermissions";

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
  onTogglePageCreated,
  onToggleCompare,
}) {
  const { canRead, canUpdate } = usePermissions();

  const columns = [
  { 
    key: "name", 
    label: "Course Name", 
    style: { minWidth: "150px", maxWidth: "300px", width: "200px"  },
    cellClassName: "px-2 py-1 align-middle",
    contentClassName: "",
    render: (row) =>
      canRead && onEdit ? (
        <div>
          <Button variant="link" onClick={() => onEdit(row)} className="text-left p-0 h-auto">
            {row.name}
          </Button>
        </div>
      ) : (
        <div>
          <span className="text-gray-700">{row.name}</span>
        </div>
      ),
  },
  {
    key: "university_name",
    label: "University Name",
    // style: { minWidth: "150px" },
  },
  {
    key: "duration",
    label: "Duration",
    // style: { },
    render: (row) => row.duration || "-",
  },
  {
    key: "full_fee",
    label: "Full Fee",
    // style: { minWidth: "115px" },
    render: (row) => formatCurrency(findFeeValue(row.fee_type_values, "full_fees")),
  },
  {
    key: "sem_fee",
    label: "Sem Fee",
    // style: { minWidth: "100px" },
    render: (row) => formatCurrency(findFeeValue(row.fee_type_values, "Semester Fee")),
  },
  {
    key: "emi",
    label: "Emi Month",
    // style: { minWidth: "100px" },
    render: (row) => {
      const emiValue = findFeeValue(row.fee_type_values, "EMI Monthly") || 
                       findFeeValue(row.fee_type_values, "Monthly EMI") ||
                       findFeeValue(row.fee_type_values, "EMI") ||
                       findFeeValue(row.fee_type_values, "emi_monthly") ||
                       findFeeValue(row.fee_type_values, "emi");
      return formatCurrency(emiValue);
    },
  },
      {
        key: "brochure",
        label: "Brochure",
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
    key: "is_active",
    label: "Act / Deact",
    // style: { width: "10%" },
    render: (row) =>
      canUpdate ? (
        <Button
          size="sm"
          variant={row.is_active ? "default" : "outline"}
          className={row.is_active ? "bg-gradient-to-r from-green-400 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 shadow-sm" 
            : "bg-red-100 text-red-700 hover:bg-red-200 border-red-300"}
          onClick={() => onToggleStatus?.(row.id, !row.is_active)}
        >
          {row.is_active ? "Active" : "Inactive"}
        </Button>
      ) : (
        <span className={row.is_active ? "text-green-600" : "text-gray-500"}>
          {row.is_active ? "Active" : "Inactive"}
        </span>
      ),
  },
  {
    key: "is_page_created",
    label: "Page Live",
    // style: { width: "10%" },
    render: (row) =>
      canUpdate ? (
        <Button
          size="sm"
          variant={row.is_page_created ? "default" : "outline"}
          className={row.is_page_created ? "bg-gradient-to-r from-blue-400 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0 shadow-sm" 
            : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300"}
          onClick={() => onTogglePageCreated?.(row.id, !row.is_page_created)}
        >
          {row.is_page_created ? "Yes" : "No"}
        </Button>
      ) : (
        <span className={row.is_page_created ? "text-green-600" : "text-gray-500"}>
          {row.is_page_created ? "Yes" : "No"}
        </span>
      ),
  },
  {
    key: "compare",
    label: "Compare",
    render: (row) =>
      canUpdate ? (
        <Button
          size="sm"
          variant={row.compare ? "default" : "outline"}
          className={row.compare
            ? "bg-gradient-to-r from-blue-400 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0 shadow-sm"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300"}
          onClick={() => onToggleCompare?.(row.id, !row.compare)}
        >
          {row.compare ? "On" : "Off"}
        </Button>
      ) : (
        <span className={row.compare ? "text-green-600" : "text-gray-500"}>
          {row.compare ? "On" : "Off"}
        </span>
      ),
  },
  ];
  const actions = createTableActions(onEdit, onDelete, {
    editUrl: (row) => `/university-courses/edit/${row.id}`,
  });

  const columnsAfterActions = [
    {
      key: "updated_at",
      label: "Updated",
      render: (row) => (
        <span className="">
          {row.updated_at ? new Date(row.updated_at).toLocaleDateString() : "-"}
        </span>
      ),
    },
  ];

  if (isLoading) {
    return <p>Loading courses...</p>;
  }

  return <DataTable columns={columns} data={data} actions={actions} columnsAfterActions={columnsAfterActions} />;
}

