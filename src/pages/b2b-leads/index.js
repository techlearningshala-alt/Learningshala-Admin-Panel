"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchWebsiteLeads, exportWebsiteLeadsToExcel } from "@/lib/api";
import WebsiteLeadTable from "@/components/website-leads/WebsiteLeadTable";
import ExportOtpModal from "@/components/leads/ExportOtpModal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Pagination from "@/components/common/Pagination";
import { Download } from "lucide-react";
import toast from "react-hot-toast";
import { downloadFile } from "@/lib/fileDownload";

const B2B_FILTER_LEAD = "b2b_free_counselling";

function B2BLeadsPageContent() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [isExporting, setIsExporting] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["b2b-leads", page, rowsPerPage, search, fromDate, toDate],
    queryFn: () =>
      fetchWebsiteLeads({
        page,
        limit: rowsPerPage,
        search: search || undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
        filterLead: B2B_FILTER_LEAD,
      }),
    keepPreviousData: true,
  });

  const result = data?.data || data;
  const leads = result?.data || [];
  const total = result?.total || 0;

  const handleExportClick = () => {
    setShowOtpModal(true);
  };

  const handleOtpVerified = async () => {
    setIsExporting(true);
    try {
      const blob = await exportWebsiteLeadsToExcel({
        search: search || undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
        filterLead: B2B_FILTER_LEAD,
      });
      const filename = `B2B_Leads_${new Date().toISOString().split("T")[0]}.xlsx`;
      downloadFile(blob, filename);
      toast.success("Excel file downloaded successfully!");
    } catch (error) {
      console.error("Export error:", error);
      toast.error(error.response?.data?.message || "Failed to export B2B leads");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold text-blue-900">Filters</h3>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleExportClick}
            disabled={isExporting || total === 0}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            {isExporting ? "Exporting..." : "Export to Excel"}
          </Button>
          <div className="text-sm text-blue-900 bg-white px-4 py-2 font-bold rounded-md">
            Total B2B Leads: <span className="text-blue-900 font-bold">{total}</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label htmlFor="b2b-lead-search" className="text-sm font-medium text-muted-foreground">
              Search
            </label>
            <Input
              className="bg-white rounded-md"
              id="b2b-lead-search"
              placeholder="Search by name, email, phone, or course"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="b2b-from-date" className="text-sm font-medium text-muted-foreground">
              From Date
            </label>
            <Input
              className="bg-white"
              id="b2b-from-date"
              type="date"
              value={fromDate}
              onChange={(event) => {
                setFromDate(event.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="b2b-to-date" className="text-sm font-medium text-muted-foreground">
              To Date
            </label>
            <Input
              className="bg-white"
              id="b2b-to-date"
              type="date"
              value={toDate}
              onChange={(event) => {
                setToDate(event.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>
        {(fromDate || toDate) && (
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setFromDate("");
                setToDate("");
                setPage(1);
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>

      <h3 className="text-xl font-semibold text-blue-900">B2B Leads Details</h3>
      <div className="rounded-md border bg-white">
        <WebsiteLeadTable data={leads} isLoading={isLoading} />
      </div>

      <Pagination
        total={total}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={setPage}
        onRowsPerPageChange={setRowsPerPage}
      />

      <ExportOtpModal
        open={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        onVerified={handleOtpVerified}
      />
    </div>
  );
}

export default function B2BLeadsPage() {
  return (
    <ProtectedRoute roles={["admin", "lead"]}>
      <B2BLeadsPageContent />
    </ProtectedRoute>
  );
}
