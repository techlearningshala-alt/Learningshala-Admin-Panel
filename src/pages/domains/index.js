"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchDomains, deleteDomain } from "@/lib/menuApi";
import { notifySuccess, notifyError } from "@/lib/notify";
import AddDomainForm from "@/components/menu/AddDomainForm";
import DomainTable from "@/components/menu/DomainTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function DomainsPage() {
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["domains", page],
    queryFn: () => fetchDomains({ page, limit: 10 }),
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
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Domains</h2>
        <Button onClick={handleAdd}>
          <Plus className="mr-1 h-4 w-4" /> Add Domain
        </Button>
      </div>

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <DomainTable
          items={data?.data?.data || []}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      <div className="flex justify-center mt-4 gap-2">
        <Button size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>Prev</Button>
        <span className="px-3 py-1">Page {page} of {data?.data.pages}</span>
        <Button size="sm" disabled={page === data?.data.pages} onClick={() => setPage(page + 1)}>Next</Button>
      </div>
    </div>
  );
}
