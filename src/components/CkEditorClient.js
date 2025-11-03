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
  Base64UploadAdapter,
  CloudServices, // <-- REMOVED if you don't have a license. Put back only if licensed.
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
} from "ckeditor5";

// Editor UI + content CSS
import "ckeditor5/ckeditor5.css";
import "@ckeditor/ckeditor5-theme-lark";

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
            CloudServices,
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
            SourceEditing,
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
            "|",
            "link",
            "uploadImage",
            "insertTable",
            "blockQuote",
            "|",
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
            addTargetToExternalLinks: true,
            defaultProtocol: "https://",
            decorators: {
              openInNewTab: {
                mode: 'manual',
                label: 'Open in a new tab',
                attributes: {
                  target: '_blank',
                  rel: 'noopener noreferrer'
                }
              }
            }
          },
          table: {
            contentToolbar: ["tableColumn", "tableRow", "mergeTableCells"],
          },        
          initialData: editorData,
        }}
        onReady={(editor) => {
          console.log("[CKEditorClient] Editor ready");
          editorRef.current = editor;
        }}
        onChange={(_, editor) => {
          const data = editor.getData();
          if (typeof onChange === "function") onChange(data);
        }}
        onFocus={() => typeof onFocus === "function" && onFocus()}
        onBlur={() => typeof onBlur === "function" && onBlur()}
      />
    </div>
  );
};

export default CKEditorClient;