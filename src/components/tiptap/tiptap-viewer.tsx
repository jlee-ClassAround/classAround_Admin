import { cn } from "@/lib/utils";

interface Props {
  content: string;
  className?: string;
}

export function TiptapViewer({ content, className }: Props) {
  return (
    <div
      className={cn("tiptap-content [&_p]:min-h-6", className)}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
