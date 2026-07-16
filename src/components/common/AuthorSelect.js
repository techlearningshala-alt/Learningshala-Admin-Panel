"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchAuthors } from "@/lib/api";
import { Label } from "@/components/ui/label";

export default function AuthorSelect({
  label = "Author Name",
  name = "author_name",
  register,
  watch,
  requiredMessage,
  error,
  className = "w-full border rounded px-3 py-2",
  tag,
  placeholder = "Select Author",
  loadingText = "Loading authors...",
}) {
  const { data: authorResponse, isLoading: isLoadingAuthors } = useQuery({
    queryKey: ["authors", "select", tag || "all"],
    queryFn: () => fetchAuthors({ page: 1, limit: 500, tag }),
  });

  const authors = useMemo(
    () => authorResponse?.data?.data || authorResponse?.data || [],
    [authorResponse]
  );

  const registerProps = register(
    name,
    requiredMessage ? { required: requiredMessage } : undefined
  );
  const selectedValue = watch ? watch(name) || "" : undefined;

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {/* Keep select mounted so edit values are not lost while options load */}
      <select
        className={className}
        disabled={isLoadingAuthors}
        {...registerProps}
        {...(selectedValue !== undefined ? { value: selectedValue } : {})}
      >
        <option value="">{isLoadingAuthors ? loadingText : placeholder}</option>
        {authors.map((author) => (
          <option key={author.id} value={author.author_name}>
            {author.author_name}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500">{error.message}</p>}
    </div>
  );
}
