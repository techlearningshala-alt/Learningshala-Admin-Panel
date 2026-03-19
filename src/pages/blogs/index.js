"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import PermissionGuard from "@/components/common/PermissionGuard";
import BlogTable from "@/components/blogs/BlogTable";
import {
  fetchBlogs,
  deleteBlog,
  toggleBlogVerified,
} from "@/lib/api";
import { notifyError } from "@/lib/notify";
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
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [page, setPage] = useState(1);
  const limit = 20;
  const { setActionButton, setTotalCount } = useHeader();

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
      queryClient.invalidateQueries(["blogs"]);
    },
    onError: (err) => notifyError(err.response?.data?.message || "Delete failed"),
  });

  const toggleVerifiedMutation = useMutation({
    mutationFn: ({ id, verified }) => toggleBlogVerified(id, verified),
    onSuccess: () => {
      queryClient.invalidateQueries(["blogs"]);
    },
    onError: (err) => notifyError(err.response?.data?.message || "Toggle failed"),
  });

  // Blog handlers
  const handleAdd = () => {
    router.push("/blogs/add");
  };

  const handleEdit = (blog) => {
    router.push(`/blogs/edit/${blog.id}`);
  };

  // Set action button and total count in header
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
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

    // Cleanup: clear action button and total count when component unmounts
    return () => {
      setActionButton(null);
      setTotalCount(null);
    };
  }, [setActionButton, setTotalCount, total]);

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this blog?")) {
      deleteBlogMutation.mutate(id);
    }
  };

  const handleToggleVerified = (id, verified) => {
    toggleVerifiedMutation.mutate({ id, verified });
  };
  return (
    <div className="p-1 bg-gray-100 min-h-screen">
        <FiltersSection
          search={search}
          onSearchChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          searchPlaceholder="Search by title, or author"
          showClearButton={!!search || !!categoryFilter}
          onClearFilters={() => {
            setSearch("");
            setCategoryFilter("");
            setPage(1);
          }}
        >
        <div className="relative">
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="border border-gray-300 rounded-md px-4 py-0.5 pr-8 focus:border-blue-500 focus:ring-blue-500  text-gray-700 min-w-[200px]"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.title}
              </option>
            ))}
          </select>
        </div>
        </FiltersSection>

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
