"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import PermissionGuard from "@/components/common/PermissionGuard";
import NewsTable from "@/components/news/NewsTable";
import {
  fetchNews,
  fetchNewsCategories,
  deleteNews,
  toggleNewsVerified,
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

export default function NewsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [page, setPage] = useState(1);
  const limit = 20;
  const { setActionButton, setTotalCount } = useHeader();

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  useEffect(() => {
    let mounted = true;
    const loadCategories = async () => {
      try {
        setCategoriesLoading(true);
        const res = await fetchNewsCategories({ page: 1, limit: 200 });
        if (!mounted) return;
        setCategories(normalizeApiList(res));
      } catch (err) {
        if (!mounted) return;
        console.error("Failed to load news categories:", err);
        setCategories([]);
      } finally {
        if (mounted) setCategoriesLoading(false);
      }
    };
    loadCategories();
    return () => {
      mounted = false;
    };
  }, []);

  const { data: newsData, isLoading } = useQuery({
    queryKey: ["news", page, search, categoryFilter],
    queryFn: () =>
      fetchNews({
        page,
        limit,
        search: search || undefined,
        category_id: categoryFilter || undefined,
      }),
    keepPreviousData: true,
  });
  const newsList = newsData?.data?.data || [];
  const totalPages = newsData?.data?.pages || 1;
  const total = newsData?.data?.total || 0;

  const deleteNewsMutation = useMutation({
    mutationFn: deleteNews,
    onSuccess: () => {
      queryClient.invalidateQueries(["news"]);
    },
    onError: (err) => notifyError(err.response?.data?.message || "Delete failed"),
  });

  const toggleVerifiedMutation = useMutation({
    mutationFn: ({ id, verified }) => toggleNewsVerified(id, verified),
    onSuccess: () => {
      queryClient.invalidateQueries(["news"]);
    },
    onError: (err) => notifyError(err.response?.data?.message || "Toggle failed"),
  });

  const handleAdd = () => {
    router.push("/news/add");
  };

  const handleEdit = (row) => {
    router.push(`/news/edit/${row.id}`);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    const actionBtn = (
      <PermissionGuard permission="create">
        <Button
          onClick={handleAdd}
          className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
        >
          <Plus className="mr-2 h-3 w-5" /> Add News
        </Button>
      </PermissionGuard>
    );
    setActionButton(actionBtn);
    setTotalCount(total);

    return () => {
      setActionButton(null);
      setTotalCount(null);
    };
  }, [setActionButton, setTotalCount, total]);

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this news item?")) {
      deleteNewsMutation.mutate(id);
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
            {categoriesLoading ? <option disabled>Loading...</option> : null}
          </select>
        </div>
      </FiltersSection>

      <TableContainer
        isLoading={isLoading}
        isEmpty={!isLoading && newsList.length === 0}
        loadingText="Loading news..."
        emptyText="No news found."
      >
        <NewsTable
          items={newsList}
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
