"use client";

import { Button } from "@/components/ui/button";
import DataTable from "@/components/table/DataTable";
import { Pencil, Trash } from "lucide-react";
import dynamic from "next/dynamic";

// Dynamically import CKEditor to avoid SSR issues
const CKEditor = dynamic(() => import("@/components/CKEditor"), {
  ssr: false,
  loading: () => <div className="text-sm text-gray-500">Loading editor...</div>,
});

// Component to render HTML content in table cell
const HtmlContent = ({ content }) => {
  if (!content || content === null || content === undefined) {
    return <span className="text-gray-400 italic">No answer</span>;
  }
  
  // Ensure content is a string
  const htmlContent = String(content);
  
  // If content is empty after trimming, show placeholder
  if (!htmlContent.trim()) {
    return <span className="text-gray-400 italic">No answer</span>;
  }
  
  // Check if content contains HTML tags
  const hasHtml = /<[^>]+>/.test(htmlContent);
  
  return (
    <div className="w-full">
      {hasHtml ? (
        <div 
          className="text-sm"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
          style={{
            maxHeight: "100px",
            overflowY: "auto",
            wordWrap: "break-word",
            lineHeight: "1.4",
          }}
        />
      ) : (
        <div 
          className="text-sm"
          style={{
            maxHeight: "100px",
            overflowY: "auto",
            wordWrap: "break-word",
            lineHeight: "1.4",
            whiteSpace: "pre-wrap",
          }}
        >
          {htmlContent}
        </div>
      )}
    </div>
  );
};

export default function UniversityCourseFaqTable({ data, onEdit, onDelete }) {
  const columns = [
    { key: "course_name", label: "Course" },
    { key: "title", label: "Question" },
    { 
      key: "description", 
      label: "Answer",
      render: (row) => {
        return <HtmlContent content={row.description} />;
      }
    },
    { key: "heading", label: "Category" },
    {
      key: "actions",
      label: "Actions",
      render: (item) => (
        <div className="flex gap-1">
          <Button size="sm" variant="outline" onClick={() => onEdit(item)}>
            <Pencil className="h-2 w-2" />
          </Button>
          <Button size="sm" variant="destructive" onClick={() => onDelete(item.id)}>
            <Trash className="h-2 w-2" />
          </Button>
        </div>
      ),
    },
  ];

  return <DataTable columns={columns} data={data} />;
}

