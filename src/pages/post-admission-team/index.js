"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchPostAdmissionTeam, deletePostAdmissionTeamMember } from "@/lib/api";
import { notifySuccess, notifyError } from "@/lib/notify";
import AddPostAdmissionTeamForm from "@/components/post-admission-team/AddPostAdmissionTeamForm";
import PostAdmissionTeamTable from "@/components/post-admission-team/PostAdmissionTeamTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import PermissionGuard from "@/components/common/PermissionGuard";
import TableContainer from "@/components/common/TableContainer";
import PaginationControls from "@/components/common/PaginationControls";
import { useHeader } from "@/context/HeaderContext";

export default function PostAdmissionTeamPage() {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editMember, setEditMember] = useState(null);
  const [page, setPage] = useState(1);
  const limit = 10;
  const queryClient = useQueryClient();
  const { setActionButton, setTotalCount } = useHeader();

  useEffect(() => {
    setShowForm(false);
    setEditMember(null);
    setPage(1);
  }, [router.pathname]);

  const { data, isLoading } = useQuery({
    queryKey: ["post-admission-team", page],
    queryFn: () => fetchPostAdmissionTeam({ page, limit }),
    keepPreviousData: true,
  });

  const deleteMutation = useMutation({
    mutationFn: deletePostAdmissionTeamMember,
    onSuccess: () => {
      notifySuccess("Post admission team member deleted successfully");
      queryClient.invalidateQueries(["post-admission-team"]);
    },
    onError: (err) => notifyError(err.response?.data?.message || "Delete failed"),
  });

  const handleAdd = () => {
    setEditMember(null);
    setShowForm(true);
  };

  const handleEdit = (member) => {
    setEditMember(member);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this post admission team member?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditMember(null);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditMember(null);
    queryClient.invalidateQueries(["post-admission-team"]);
  };

  const total = data?.data?.total || 0;
  const items = data?.data?.data || [];

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!showForm) {
      const actionBtn = (
        <PermissionGuard permission="create">
          <Button
            onClick={handleAdd}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
          >
            <Plus className="mr-2 h-3 w-5" /> Add Member
          </Button>
        </PermissionGuard>
      );
      setActionButton(actionBtn);
      setTotalCount(total);
    } else {
      setActionButton(null);
      setTotalCount(null);
    }

    return () => {
      setActionButton(null);
      setTotalCount(null);
    };
  }, [setActionButton, setTotalCount, total, showForm]);

  if (showForm) {
    return (
      <AddPostAdmissionTeamForm
        member={editMember}
        onCancel={handleFormClose}
        onSuccess={handleFormSuccess}
      />
    );
  }

  return (
    <div className="p-1 bg-gray-100 min-h-screen">
      <TableContainer
        isLoading={isLoading}
        isEmpty={!isLoading && items.length === 0}
        loadingText="Loading post admission team..."
        emptyText="No post admission team members found."
      >
        <PostAdmissionTeamTable members={items} onEdit={handleEdit} onDelete={handleDelete} />
      </TableContainer>

      <PaginationControls
        currentPage={page}
        totalPages={data?.data?.pages || 1}
        onPageChange={setPage}
      />
    </div>
  );
}
