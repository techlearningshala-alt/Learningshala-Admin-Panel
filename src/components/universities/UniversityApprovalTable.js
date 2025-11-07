"use client";

import { Button } from "@/components/ui/button";
import { Pencil, Trash } from "lucide-react";
import DataTable from "../table/DataTable";

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
    <div className="max-w-md min-w-[200px]">
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

export default function UniversityApprovalTable({ items, onEdit, onDelete }) {
  const columns = [
    { key: "id", label: "ID" },
    {
      key: "title",
      label: "Title",
      render: (row) => (
        <Button variant="link" onClick={() => onEdit(row)}>
          {row.title}
        </Button> 
      ),
    },
    { key: "description", label: "Description",render: (row) => <HtmlContent content={row.description} /> },
    {
      key: "logo",
      label: "Logo",
      render: (row) =>
        row.logo ? (
          <img
            src={`${process.env.NEXT_PUBLIC_thumbnail_URL}${row.logo}`}
            alt="logo"
            className="h-10 w-10 object-contain rounded"
          />
        ) : null,
    },
  ];

  const actions = [
    {
      key: (props) => (
        <Button size="sm" variant="outline" onClick={() => onEdit(props.row)}>
          <Pencil className="mr-1 h-4 w-4" /> Edit
        </Button>
      ),
    },
    {
      key: (props) => (
        <Button size="sm" variant="destructive" onClick={() => onDelete(props.row.id)}>
          <Trash className="mr-1 h-4 w-4" /> Delete
        </Button>
      ),
    },
  ];

  return <DataTable columns={columns} data={items} actions={actions} />;
}
