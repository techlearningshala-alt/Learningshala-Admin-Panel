"use client";

import React from "react";
import dynamic from "next/dynamic";


// ✅ Dynamically import CKEditorClient to avoid SSR issues
const CKEditorClient = dynamic(() => import("./CkEditorClient"), {
  ssr: false,
  loading: () => <p>Loading editor...</p>,
});

const SafeCKEditor = ({ value, onChange }) => {
  return (
    <div className="w-full">
      <CKEditorClient editorData={value} onChange={onChange} />
    </div>
  );
};

export default SafeCKEditor;