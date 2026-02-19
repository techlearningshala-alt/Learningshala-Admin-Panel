"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import PermissionGuard from "@/components/common/PermissionGuard";
import AddBlogForm from "@/components/blogs/AddBlogForm";
import BlogTable from "@/components/blogs/BlogTable";
import {
  fetchBlogs,
  deleteBlog,
  addBlog,
  updateBlog,
  fetchBlogCategories,
  toggleBlogVerified,
} from "@/lib/api";
import { notifySuccess, notifyError } from "@/lib/notify";
import TableContainer from "@/components/common/TableContainer";
import FiltersSection from "@/components/common/FiltersSection";
import PaginationControls from "@/components/common/PaginationControls";
import { useHeader } from "@/context/HeaderContext";

const normalizeApiList = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  return [];
};

export default function BlogsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [page, setPage] = useState(1);
  const limit = 20;
  const { setActionButton, setTotalCount } = useHeader();

  // Reset state when route changes
  useEffect(() => {
    setShowForm(false);
    setEditingBlog(null);
    setSearch("");
    setCategoryFilter("");
    setPage(1);
  }, [router.pathname]);

  // Fetch blog categories for filter
  const { data: categoriesData } = useQuery({
    queryKey: ["blogCategories"],
    queryFn: () => fetchBlogCategories({ page: 1, limit: 1000 }),
  });
  const categories = normalizeApiList(categoriesData?.data?.data || []);

  // Fetch Blogs
  const { data: blogsData, isLoading } = useQuery({
    queryKey: ["blogs", page, search, categoryFilter],
    queryFn: () =>
      fetchBlogs({
        page,
        limit,
        search: search || undefined,
        category_id: categoryFilter || undefined,
      }),
    keepPreviousData: true,
  });
  const blogs = blogsData?.data?.data || [];
  const totalPages = blogsData?.data?.pages || 1;

  // Calculate total (before any early returns)
  const total = blogsData?.data?.total || 0;

  // Blog mutations
  const deleteBlogMutation = useMutation({
    mutationFn: deleteBlog,
    onSuccess: () => {
      notifySuccess("Blog deleted successfully");
      queryClient.invalidateQueries(["blogs"]);
    },
    onError: (err) => notifyError(err.response?.data?.message || "Delete failed"),
  });

  const addBlogMutation = useMutation({
    mutationFn: addBlog,
    onSuccess: () => {
      notifySuccess("Blog added successfully");
      queryClient.invalidateQueries(["blogs"]);
    },
    onError: (err) => notifyError(err.response?.data?.message || "Add failed"),
  });

  const updateBlogMutation = useMutation({
    mutationFn: ({ id, formData }) => updateBlog(id, formData),
    onSuccess: () => {
      notifySuccess("Blog updated successfully");
      queryClient.invalidateQueries(["blogs"]);
    },
    onError: (err) => notifyError(err.response?.data?.message || "Update failed"),
  });

  const toggleVerifiedMutation = useMutation({
    mutationFn: ({ id, verified }) => toggleBlogVerified(id, verified),
    onSuccess: () => {
      notifySuccess("Blog verification status updated successfully");
      queryClient.invalidateQueries(["blogs"]);
    },
    onError: (err) => notifyError(err.response?.data?.message || "Toggle failed"),
  });

  // Blog handlers
  const handleAdd = () => {
    setEditingBlog(null);
    setShowForm(true);
  };

  // Set action button and total count in header (must be before early return)
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    if (!showForm) {
      const actionBtn = (
        <PermissionGuard permission="create">
          <Button 
            onClick={handleAdd}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
          >
            <Plus className="mr-2 h-3 w-5" /> Add Blog
          </Button>
        </PermissionGuard>
      );
      setActionButton(actionBtn);
      setTotalCount(total);
    } else {
      setActionButton(null);
      setTotalCount(null);
    }

    // Cleanup: clear action button and total count when component unmounts
    return () => {
      setActionButton(null);
      setTotalCount(null);
    };
  }, [setActionButton, setTotalCount, total, showForm]);

  const handleEdit = (blog) => {
    setEditingBlog(blog);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this blog?")) {
      deleteBlogMutation.mutate(id);
    }
  };

  const handleToggleVerified = (id, verified) => {
    toggleVerifiedMutation.mutate({ id, verified });
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingBlog(null);
  };

  const handleFormSuccess = async (formData, editingBlog) => {
    if (editingBlog) {
      const result = await updateBlogMutation.mutateAsync({ id: editingBlog.id, formData });
      setShowForm(false);
      setEditingBlog(null);
      return result;
    } else {
      const result = await addBlogMutation.mutateAsync(formData);
      setShowForm(false);
      setEditingBlog(null);
      return result;
    }
  };

  // Show form view
  if (showForm) {
    return (
      <AddBlogForm
        item={editingBlog}
        onCancel={handleFormClose}
        onSuccess={handleFormSuccess}
      />
    );
  }

  // Show table view
  return (
    <div className="p-1 bg-gray-100 min-h-screen">
      <div className="mb-4 space-y-2">
        <FiltersSection
          search={search}
          onSearchChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          searchPlaceholder="Search by title, description, or author"
          showClearButton={!!search || !!categoryFilter}
          onClearFilters={() => {
            setSearch("");
            setCategoryFilter("");
            setPage(1);
          }}
        />
        <div className="px-1">
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="w-full max-w-xs border rounded px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <TableContainer
        isLoading={isLoading}
        isEmpty={!isLoading && blogs.length === 0}
        loadingText="Loading blogs..."
        emptyText="No blogs found."
      >
        <BlogTable
          items={blogs}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleVerified={handleToggleVerified}
        />
      </TableContainer>

      {totalPages > 1 && !search && !categoryFilter && (
        <PaginationControls
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
