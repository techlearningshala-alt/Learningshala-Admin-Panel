"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchAuthors } from "@/lib/api";
import { Label } from "@/components/ui/label";

export default function AuthorSelect({
  label = "Author Name",
  name = "author_name",
  register,
  requiredMessage,
  error,
  className = "w-full border rounded px-3 py-2",
}) {
  const { data: authorResponse, isLoading: isLoadingAuthors } = useQuery({
    queryKey: ["authors", "all-for-shared-author-select"],
    queryFn: () => fetchAuthors({ page: 1, limit: 500 }),
  });

  const authors = useMemo(
    () => authorResponse?.data?.data || authorResponse?.data || [],
    [authorResponse]
  );

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {isLoadingAuthors ? (
        <p className="text-sm text-muted-foreground">Loading authors...</p>
      ) : (
        <select
          className={className}
          {...register(name, requiredMessage ? { required: requiredMessage } : undefined)}
        >
          <option value="">Select Author</option>
          {authors.map((author) => (
            <option key={author.id} value={author.author_name}>
              {author.author_name}
            </option>
          ))}
        </select>
      )}
      {error && <p className="text-xs text-red-500">{error.message}</p>}
    </div>
  );
}

