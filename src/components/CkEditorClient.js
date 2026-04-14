"use client";

import React, { useEffect, useRef } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import {
  ClassicEditor,
  Autoformat,
  BlockQuote,
  Bold,
  Italic,
  Underline,
  Alignment,
  Base64UploadAdapter,
  Essentials,
  Heading,
  Image,
  ImageCaption,
  ImageResize,
  ImageStyle,
  ImageToolbar,
  ImageUpload,
  ImageBlock,
  Indent,
  IndentBlock,
  Link,
  PictureEditing,
  List,
  Font,
  Mention,
  Paragraph,
  PasteFromOffice,
  Table,
  TableColumnResize,
  TableToolbar,
  TextTransformation,
  SourceEditing,
  GeneralHtmlSupport,
} from "ckeditor5";

// Editor UI + content CSS
import "ckeditor5/ckeditor5.css";
import "@ckeditor/ckeditor5-theme-lark";

const trimTrailingSlash = (value = "") => String(value).replace(/\/+$/, "");

const getPublicAssetUrl = (filePath) => {
  if (!filePath || typeof filePath !== "string") return "";
  if (filePath.startsWith("http://") || filePath.startsWith("https://")) return filePath;

  const apiBase = trimTrailingSlash(process.env.NEXT_PUBLIC_API_URL || "");
  const thumbnailBase = trimTrailingSlash(process.env.NEXT_PUBLIC_thumbnail_URL || "");

  if (filePath.startsWith("/uploads/")) {
    const apiOrigin = apiBase.replace(/\/api\/cms$/i, "");
    return apiOrigin ? `${apiOrigin}${filePath}` : filePath;
  }

  if (thumbnailBase) {
    return `${thumbnailBase}/${filePath.replace(/^\/+/, "")}`;
  }

  if (apiBase) {
    const apiOrigin = apiBase.replace(/\/api\/cms$/i, "");
    return `${apiOrigin}/${filePath.replace(/^\/+/, "")}`;
  }

  return filePath;
};

const getAltFromImageSrc = (src = "") => {
  try {
    if (!src) return "";
    const cleanSrc = src.split("?")[0].split("#")[0];
    const lastPart = cleanSrc.split("/").pop() || "";
    const withoutExt = lastPart.replace(/\.[^.]+$/, "");
    const decoded = decodeURIComponent(withoutExt);
    // Remove common trailing numeric suffixes used for uniqueness/timestamps.
    const withoutTrailingNumericSuffix = decoded.replace(/([_-])\d{6,}$/, "");
    return decoded
      .replace(decoded, withoutTrailingNumericSuffix)
      .replace(/[_-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  } catch {
    return "";
  }
};

const ensureImageAltFromSrc = (html = "") => {
  if (!html || typeof window === "undefined") return html;
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const images = doc.querySelectorAll("img");
    let changed = false;

    images.forEach((img) => {
      const currentAlt = (img.getAttribute("alt") || "").trim();
      if (currentAlt) return;
      const src = img.getAttribute("src") || "";
      const generatedAlt = getAltFromImageSrc(src);
      if (generatedAlt) {
        img.setAttribute("alt", generatedAlt);
        changed = true;
      }
    });

    return changed ? doc.body.innerHTML : html;
  } catch {
    return html;
  }
};

class CmsUploadAdapter {
  constructor(loader) {
    this.loader = loader;
    this.controller = new AbortController();
  }

  async upload() {
    const file = await this.loader.file;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("file_type", "image");

    const token =
      (typeof window !== "undefined" && localStorage.getItem("token")) ||
      (typeof window !== "undefined" && sessionStorage.getItem("token")) ||
      process.env.NEXT_PUBLIC_JWT_TOKEN ||
      "";

    const apiBase = trimTrailingSlash(process.env.NEXT_PUBLIC_API_URL || "");
    const uploadUrl = `${apiBase}/uploads`;

    const response = await fetch(uploadUrl, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
      signal: this.controller.signal,
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result?.success) {
      throw new Error(result?.message || "Image upload failed");
    }

    const filePath =
      result?.data?.url ||
      result?.data?.file_url ||
      result?.data?.file_path ||
      "";
    const imageUrl = getPublicAssetUrl(filePath);

    if (!imageUrl) {
      throw new Error("Upload succeeded but image URL was empty");
    }

    return { default: imageUrl };
  }

  abort() {
    this.controller.abort();
  }
}

/**
 * CKEditorClient
 * Props:
 *  - editorData (string) initial content
 *  - onChange (fn) receives html string
 *  - onFocus (fn) optional
 *  - onBlur (fn) optional
 */
const CKEditorClient = ({ editorData = "", onChange, onFocus, onBlur }) => {
  const editorRef = useRef(null);
  
  useEffect(() => {
    // Simple: move balloon panels inside dialog to avoid focus trap
    const moveBalloons = () => {
      const dialog = document.querySelector("[role='dialog']");
      const balloons = document.querySelectorAll(".ck-balloon-panel");
      
      balloons.forEach(balloon => {
        if (dialog && !dialog.contains(balloon)) {
          const style = balloon.getAttribute('style');
          dialog.appendChild(balloon);
          if (style) balloon.setAttribute('style', style);
        }
      });
    };

    const observer = new MutationObserver(moveBalloons);
    observer.observe(document.body, { childList: true, subtree: true });
    
    return () => observer.disconnect();
  }, []);

  // Update editor data when editorData prop changes
  useEffect(() => {
    if (editorRef.current && editorData !== undefined) {
      const currentData = editorRef.current.getData();
      if (currentData !== editorData) {
        editorRef.current.setData(editorData || "");
      }
    }
  }, [editorData]);
 
  return (
    <div className="w-full">
      <CKEditor
        editor={ClassicEditor}
        data={editorData || ""}
        config={{
          licenseKey: "GPL",
          plugins: [
            Autoformat,
            BlockQuote,
            Bold,
            Essentials,
            Heading,
            Image,
            ImageCaption,
            ImageResize,
            ImageStyle,
            ImageToolbar,
            ImageUpload,
            Base64UploadAdapter,
            Indent,
            IndentBlock,
            Italic,
            Link,
            Font,
            List,
            Mention,
            Paragraph,
            PasteFromOffice,
            PictureEditing,
            Table,
            TableColumnResize,
            TableToolbar,
            TextTransformation,
            Underline,
            Alignment,
            SourceEditing,
            GeneralHtmlSupport,
          ],
          toolbar: [
            "undo",
            "redo",
            "|",
            "heading",
            "|",
            "bold",
            "italic",
            "underline",
            "alignment",
            "|",
            "link",
            "uploadImage",
            "insertTable",
            "blockQuote",
            "|",
            "fontSize",
            "fontColor",
            "fontBackgroundColor",
            "|",
            "bulletedList",
            "numberedList",
            "|",
            "outdent",
            "indent",
            "sourceEditing",
          ],

          alignment: {
            options: ["left", "center", "right", "justify"],
          },
 
          heading: {
            options: [
              {
                model: "paragraph",
                title: "Paragraph",
                class: "ck-heading_paragraph",
              },
              {
                model: "heading1",
                view: "h1",
                title: "Heading 1",
                class: "ck-heading_heading1",
              },
              {
                model: "heading2",
                view: "h2",
                title: "Heading 2",
                class: "ck-heading_heading2",
              },
              {
                model: "heading3",
                view: "h3",
                title: "Heading 3",
                class: "ck-heading_heading3",
              },
              {
                model: "heading4",
                view: "h4",
                title: "Heading 4",
                class: "ck-heading_heading4",
              },
              {
                model: "heading5",
                view: "h5",
                title: "Heading 5",
                class: "ck-heading_heading5",
              },
              {
                model: "heading6",
                view: "h6",
                title: "Heading 6",
                class: "ck-heading_heading6",
              },
            ],
          },
          image: {
            resizeOptions: [
              {
                name: "resizeImage:original",
                label: "Default image width",
                value: null,
              },
              {
                name: "resizeImage:50",
                label: "50% page width",
                value: "50",
              },
              {
                name: "resizeImage:75",
                label: "75% page width",
                value: "75",
              },
            ],
            toolbar: [
              "imageTextAlternative",
              "toggleImageCaption",
              "|",
              "imageStyle:inline",
              "imageStyle:wrapText",
              "imageStyle:breakText",
              "|",
              "resizeImage",
            ],
          },
          // fontSize: {
          //   options: [
          //     "tiny",
          //     "small",
          //     "default",
          //     "big",
          //     "huge",
          //   ],
          //   supportAllValues: true,
          // },
          fontColor: {
            colors: [
              {
                color: "hsl(0, 0%, 0%)",
                label: "Black",
              },
              {
                color: "hsl(0, 0%, 30%)",
                label: "Dim grey",
              },
              {
                color: "hsl(0, 0%, 60%)",
                label: "Grey",
              },
              {
                color: "hsl(0, 0%, 90%)",
                label: "Light grey",
              },
              {
                color: "hsl(0, 0%, 100%)",
                label: "White",
                hasBorder: true,
              },
              {
                color: "hsl(0, 0%, 100%)",
                label: "White",
                hasBorder: true,
              },
              {
                color: "hsl(0, 75%, 60%)",
                label: "Red",
              },
              {
                color: "hsl(30, 75%, 60%)",
                label: "Orange",
              },
              {
                color: "hsl(60, 75%, 60%)",
                label: "Yellow",
              },
              {
                color: "hsl(90, 75%, 60%)",
                label: "Light green",
              },
              {
                color: "hsl(120, 75%, 60%)",
                label: "Green",
              },
            ],
          },
          fontBackgroundColor: {
            colors: [
              {
                color: "hsl(0, 75%, 60%)",
                label: "Red",
              },
              {
                color: "hsl(30, 75%, 60%)",
                label: "Orange",
              },
              {
                color: "hsl(60, 75%, 60%)",
                label: "Yellow",
              },
              {
                color: "hsl(90, 75%, 60%)",
                label: "Light green",
              },
              {
                color: "hsl(120, 75%, 60%)",
                label: "Green",
              },
              {
                color: "hsl(0, 0%, 0%)",
                label: "Black",
              },
              {
                color: "hsl(0, 0%, 30%)",
                label: "Dim grey",
              },
              {
                color: "hsl(0, 0%, 60%)",
                label: "Grey",
              },
              {
                color: "hsl(0, 0%, 90%)",
                label: "Light grey",
              },
            ],
          },
          link: {
            // Do not auto-force target/rel; let user or decorators control it
            addTargetToExternalLinks: false,
            defaultProtocol: "https://",
            decorators: {
              openInNewTab: {
                mode: "manual",
                label: "Open in a new tab",
                attributes: {
                  target: "_blank",
                  // rel: "noopener noreferrer",
                },
              },
            },
          },
          // Allow custom attributes like rel="nofollow" on links (and any other tags if needed)
          htmlSupport: {
            allow: [
              {
                name: "a",
                attributes: ["rel", "target"],
              },
            ],
          },
          table: {
            contentToolbar: ["tableColumn", "tableRow", "mergeTableCells"],
          },        
          initialData: editorData,
        }}
        onReady={(editor) => {
          console.log("[CKEditorClient] Editor ready");
          try {
            const fileRepository = editor.plugins.get("FileRepository");
            fileRepository.createUploadAdapter = (loader) =>
              new CmsUploadAdapter(loader);
          } catch (error) {
            console.error("[CKEditorClient] Failed to set upload adapter:", error);
          }
          editorRef.current = editor;
        }}
        onChange={(_, editor) => {
          const data = editor.getData();
          const dataWithAlt = ensureImageAltFromSrc(data);
          if (typeof onChange === "function") onChange(dataWithAlt);
        }}
        onFocus={() => typeof onFocus === "function" && onFocus()}
        onBlur={() => typeof onBlur === "function" && onBlur()}
      />
    </div>
  );
};

export default CKEditorClient;