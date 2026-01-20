"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X } from "lucide-react";
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

const normalizeApiList = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  return [];
};

export default function BlogsPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [page, setPage] = useState(1);
  const limit = 20;

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
  const total = blogsData?.data?.total || 0;
  const totalPages = blogsData?.data?.pages || 1;

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
    <div className="p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold">All Blogs</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Total: {total} {search && `(filtered)`}
          </p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <div className="relative w-72">
              <Input
                placeholder="Search by title, description, or author"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pr-8"
              />
              {search && (
                <button
                  onClick={() => {
                    setSearch("");
                    setPage(1);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              className="border rounded px-3 py-2 w-72"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.title}
                </option>
              ))}
            </select>
            {(search || categoryFilter) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearch("");
                  setCategoryFilter("");
                  setPage(1);
                }}
                className="flex items-center gap-1"
              >
                <X className="h-4 w-4" />
                Clear Filters
              </Button>
            )}
          </div>
        </div>
        <PermissionGuard permission="create">
          <Button onClick={handleAdd}>
            <Plus className="mr-1 h-4 w-4" /> Add Blog
          </Button>
        </PermissionGuard>
      </div>

      {isLoading ? (
        <p>Loading blogs...</p>
      ) : blogs.length > 0 ? (
        <>
          <BlogTable
            items={blogs}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleVerified={handleToggleVerified}
          />
          {totalPages > 1 && !search && !categoryFilter && (
            <div className="flex justify-center items-center gap-2 pt-4">
              <Button
                size="sm"
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              >
                Prev
              </Button>
              <span className="text-sm">
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
        </>
      ) : (
        <p className="text-sm text-muted-foreground">No blogs found.</p>
      )}
    </div>
  );
}
