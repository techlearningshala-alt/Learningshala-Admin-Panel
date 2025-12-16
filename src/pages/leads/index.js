"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchLeads } from "@/lib/api";
import LeadTable from "@/components/leads/LeadTable";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const PAGE_SIZE = 10;

function LeadsPageContent() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["leads", page, search, fromDate, toDate],
    queryFn: () =>
      fetchLeads({
        page,
        limit: PAGE_SIZE,
        search: search || undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
      }),
    keepPreviousData: true,
  });

  const result = data?.data || data;
  const leads = result?.data || [];
  const total = result?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="p-4 space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold text-blue-900">Filters</h3>
        </div>
        <div className="text-sm text-blue-900 bg-white px-4 py-2 font-bold rounded-md">
          Total Leads: <span className="text-blue-900 font-bold">{total}</span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label htmlFor="lead-search" className="text-sm font-medium text-muted-foreground">
              Search
            </label>
              <Input
              className="bg-white rounded-md"
              id="lead-search"
              placeholder="Search by name, email, phone, or course"
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
      <h3 className="text-xl font-semibold text-blue-900 ">Leads Details</h3>
      <div className="rounded-md border bg-white">
        <LeadTable data={leads} isLoading={isLoading} />
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button
            size="sm"
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          >
            Prev
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={page >= totalPages}
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

export default function LeadsPage() {
  return (
    <ProtectedRoute roles={["admin", "lead"]}>
      <LeadsPageContent />
    </ProtectedRoute>
  );
}


