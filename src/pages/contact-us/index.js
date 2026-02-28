"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchContactUs, deleteContactUs, exportContactUsToExcel } from "@/lib/api";
import ContactUsTable from "@/components/contact-us/ContactUsTable";
import ExportOtpModal from "@/components/leads/ExportOtpModal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { notifySuccess, notifyError } from "@/lib/notify";
import Pagination from "@/components/common/Pagination";
import { Download } from "lucide-react";
import toast from "react-hot-toast";
import { downloadFile } from "@/lib/fileDownload";

function ContactUsPageContent() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(20);

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["contact-us", page, rowsPerPage, search, fromDate, toDate],
    queryFn: () =>
      fetchContactUs({
        page,
        limit: rowsPerPage,
        search: search || undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
      }),
    keepPreviousData: true,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteContactUs,
    onSuccess: () => {
      notifySuccess("Contact message deleted successfully");
      queryClient.invalidateQueries(["contact-us"]);
    },
    onError: (err) => {
      notifyError(err.response?.data?.message || "Delete failed");
    },
  });

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this contact message?")) {
      deleteMutation.mutate(id);
    }
  };

  const result = data?.data || data;
  const contacts = result?.data || [];
  const total = result?.total || 0;
  const [isExporting, setIsExporting] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);

  const handleExportClick = () => {
    setShowOtpModal(true);
  };

  const handleOtpVerified = async () => {
    setIsExporting(true);
    try {
      const blob = await exportContactUsToExcel({
        search: search || undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
      });
      const filename = `Contact_Us_${new Date().toISOString().split("T")[0]}.xlsx`;
      downloadFile(blob, filename);
      toast.success("Excel file downloaded successfully!");
    } catch (error) {
      console.error("Export error:", error);
      toast.error(error.response?.data?.message || "Failed to export contact messages");
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
            Total Messages: <span className="text-blue-900 font-bold">{total}</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label htmlFor="contact-search" className="text-sm font-medium text-muted-foreground">
              Search
            </label>
            <Input
              className="bg-white rounded-md"
              id="contact-search"
              placeholder="Search by name, email, phone, or message"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="from-date" className="text-sm font-medium text-muted-foreground">
              From Date
            </label>
            <Input
              className="bg-white"
              id="from-date"
              type="date"
              value={fromDate}
              onChange={(event) => {
                setFromDate(event.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="to-date" className="text-sm font-medium text-muted-foreground">
              To Date
            </label>
            <Input
              className="bg-white"
              id="to-date"
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
              Clear Date Filters
            </Button>
          </div>
        )}
      </div>
      <h3 className="text-xl font-semibold text-blue-900">Contact Messages</h3>
      <div className="rounded-md border bg-white">
        <ContactUsTable data={contacts} isLoading={isLoading} />
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

export default function ContactUsPage() {
  return (
    <ProtectedRoute roles={["admin", "lead"]}>
      <ContactUsPageContent />
    </ProtectedRoute>
  );
}

