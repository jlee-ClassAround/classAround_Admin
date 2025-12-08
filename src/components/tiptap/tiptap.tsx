"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

import Paragraph from "@tiptap/extension-paragraph";
import Heading from "@tiptap/extension-heading";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import Youtube from "@tiptap/extension-youtube";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";

import Image from "@tiptap/extension-image";
import ImageResize from "tiptap-extension-resize-image";
import Table from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";

import { TiptapToolbar } from "./tiptap-toolbar";
import { cn } from "@/lib/utils";
import { EditorSkeleton } from "../skeletons/editor-skeleton";
interface Props {
  content: string;
  onChange: (content: string) => void;
  className?: string;
}

const Tiptap = ({ content, onChange, className }: Props) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Paragraph,
      Link.configure({
        HTMLAttributes: {
          class: "text-primary underline cursor-pointer",
        },
        openOnClick: true,
        autolink: true,
        defaultProtocol: "https",
        protocols: ["http", "https"],
        isAllowedUri: (url, ctx) => {
          try {
            // construct URL
            const parsedUrl = url.includes(":")
              ? new URL(url)
              : new URL(`${ctx.defaultProtocol}://${url}`);

            // use default validation
            if (!ctx.defaultValidate(parsedUrl.href)) {
              return false;
            }

            // disallowed protocols
            const disallowedProtocols = ["ftp", "file", "mailto"];
            const protocol = parsedUrl.protocol.replace(":", "");

            if (disallowedProtocols.includes(protocol)) {
              return false;
            }

            // only allow protocols specified in ctx.protocols
            const allowedProtocols = ctx.protocols.map((p) =>
              typeof p === "string" ? p : p.scheme
            );

            if (!allowedProtocols.includes(protocol)) {
              return false;
            }

            // disallowed domains
            const disallowedDomains = [
              "example-phishing.com",
              "malicious-site.net",
            ];
            const domain = parsedUrl.hostname;

            if (disallowedDomains.includes(domain)) {
              return false;
            }

            // all checks have passed
            return true;
          } catch {
            return false;
          }
        },
        shouldAutoLink: (url) => {
          try {
            // construct URL
            const parsedUrl = url.includes(":")
              ? new URL(url)
              : new URL(`https://${url}`);

            // only auto-link if the domain is not in the disallowed list
            const disallowedDomains = [
              "example-no-autolink.com",
              "another-no-autolink.com",
            ];
            const domain = parsedUrl.hostname;

            return !disallowedDomains.includes(domain);
          } catch {
            return false;
          }
        },
      }),
      Image,
      ImageResize,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Heading.configure({
        HTMLAttributes: {
          class: "tiptap-heading",
        },
      }),
      BulletList.configure({
        HTMLAttributes: {
          class: "list-disc pl-5",
        },
        keepMarks: true,
        keepAttributes: true,
      }),
      OrderedList.configure({
        HTMLAttributes: {
          class: "list-decimal pl-5",
        },
      }),
      Youtube.configure({
        controls: false,
        nocookie: true,
        modestBranding: true,
      }),
      Table.configure({
        resizable: true,
        cellMinWidth: 100,
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: "border border-input px-2 py-1",
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: "border border-input px-2 py-1",
        },
      }),
      TableRow,
    ],
    content,
    editorProps: {
      attributes: {
        class: cn(
          "focus:outline-none rounded-md border min-h-[350px] border-input focus:ring-1 ring-black disabled:cursor-not-allowed disabled:opacity-50 p-3 max-h-[600px] overflow-y-auto",
          className
        ),
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) return <EditorSkeleton />;

  return (
    <div className="space-y-2">
      <TiptapToolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
};

export default Tiptap;
