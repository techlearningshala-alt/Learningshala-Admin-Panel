"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchDomains, deleteDomain } from "@/lib/menuApi";
import { notifySuccess, notifyError } from "@/lib/notify";
import AddDomainForm from "@/components/menu/AddDomainForm";
import DomainTable from "@/components/menu/DomainTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import PermissionGuard from "@/components/common/PermissionGuard";

export default function DomainsPage() {
  const limit = 10;
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["domains", page],
    queryFn: () => fetchDomains({ page, limit }),
    keepPreviousData: true,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDomain,
    onSuccess: () => {
      notifySuccess("Domain deleted successfully");
      queryClient.invalidateQueries(["domains"]);
    },
    onError: (err) => notifyError(err.response?.data?.message || "Delete failed"),
  });

  const handleAdd = () => {
    setEditItem(null);
    setShowForm(true);
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this domain?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditItem(null);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditItem(null);
    queryClient.invalidateQueries(["domains"]);
  };

  // Show form view
  if (showForm) {
    return (
      <AddDomainForm
        item={editItem}
        onCancel={handleFormClose}
        onSuccess={handleFormSuccess}
      />
    );
  }

  // Show table view
  const items = data?.data?.data || [];
  const filteredItems = search
    ? items.filter((item) => {
        const term = search.toLowerCase();
        return item.name?.toLowerCase().includes(term);
      })
    : items;
  const totalCount = data?.data?.total || items.length;

  return (
    <div className="p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div className="flex flex-col gap-1">
          <h3 className="text-xl font-bold">Domains</h3>
          <span className="text-sm text-muted-foreground">Total: {totalCount}</span>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search by name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-72"
            />
          </div>
        </div>
        <PermissionGuard permission="create">
          <Button onClick={handleAdd}>
            <Plus className="mr-1 h-4 w-4" /> Add Domain
          </Button>
        </PermissionGuard>
      </div>

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <DomainTable
          items={filteredItems}
          page={page}
          limit={limit}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {!search && (
        <div className="flex justify-center mt-4 gap-2">
          <Button size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>Prev</Button>
          <span className="px-3 py-1">Page {page} of {data?.data.pages}</span>
          <Button size="sm" disabled={page === data?.data.pages} onClick={() => setPage(page + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}
