"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Toggle } from "@/components/ui/toggle";
import { type Editor } from "@tiptap/react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Columns,
  Heading1,
  Heading2,
  Heading3,
  ImageIcon,
  Italic,
  List,
  ListOrdered,
  Minus,
  Plus,
  Rows,
  SearchIcon,
  Strikethrough,
  Table,
  Trash,
  UploadIcon,
} from "lucide-react";
import { useState } from "react";
import { Input } from "../ui/input";

interface Props {
  editor: Editor;
}

export function TiptapToolbar({ editor }: Props) {
  return (
    <div className="border border-input rounded-md overflow-x-auto">
      <div className="flex items-center gap-x-2 p-1 w-[200px]">
        <Toggle
          pressed={editor.isActive("heading", { level: 1 })}
          onPressedChange={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
        >
          <Heading1 className="size-4" />
        </Toggle>
        <Toggle
          pressed={editor.isActive("heading", { level: 2 })}
          onPressedChange={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          <Heading2 className="size-4" />
        </Toggle>
        <Toggle
          pressed={editor.isActive("heading", { level: 3 })}
          onPressedChange={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
        >
          <Heading3 className="size-4" />
        </Toggle>
        <Toggle
          pressed={editor.isActive({ textAlign: "left" })}
          onPressedChange={() =>
            editor.chain().focus().setTextAlign("left").run()
          }
        >
          <AlignLeft className="size-4" />
        </Toggle>
        <Toggle
          pressed={editor.isActive({ textAlign: "center" })}
          onPressedChange={() =>
            editor.chain().focus().setTextAlign("center").run()
          }
        >
          <AlignCenter className="size-4" />
        </Toggle>
        <Toggle
          pressed={editor.isActive({ textAlign: "right" })}
          onPressedChange={() =>
            editor.chain().focus().setTextAlign("right").run()
          }
        >
          <AlignRight className="size-4" />
        </Toggle>
        <Toggle
          pressed={editor.isActive("bold")}
          onPressedChange={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="size-4" />
        </Toggle>
        <Toggle
          pressed={editor.isActive("italic")}
          onPressedChange={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="size-4" />
        </Toggle>
        <Toggle
          pressed={editor.isActive("strike")}
          onPressedChange={() => editor.chain().focus().toggleStrike().run()}
        >
          <Strikethrough className="size-4" />
        </Toggle>
        <Toggle
          pressed={editor.isActive("bulletList")}
          onPressedChange={() =>
            editor.chain().focus().toggleBulletList().run()
          }
        >
          <List className="size-4" />
        </Toggle>
        <Toggle
          pressed={editor.isActive("orderedList")}
          onPressedChange={() =>
            editor.chain().focus().toggleOrderedList().run()
          }
        >
          <ListOrdered className="size-4" />
        </Toggle>

        {/* <ImageButton editor={editor} /> */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() =>
            editor.chain().focus().insertTable({ rows: 2, cols: 2 }).run()
          }
          className="gap-x-0 shrink-0"
        >
          <Plus className="!size-3" />
          <Table className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().deleteTable().run()}
          className="gap-x-0 shrink-0"
        >
          <Trash className="!size-3" />
          <Table className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().addColumnAfter().run()}
          className="gap-x-0 shrink-0"
        >
          <Plus className="!size-3" />
          <Columns className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().deleteColumn().run()}
          className="gap-x-0 shrink-0"
        >
          <Minus className="!size-3" />
          <Columns className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().addRowAfter().run()}
          className="gap-x-0 shrink-0"
        >
          <Plus className="!size-3" />
          <Rows className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().deleteRow().run()}
          className="gap-x-0 shrink-0"
        >
          <Minus className="!size-3" />
          <Rows className="size-4" />
        </Button>
      </div>
    </div>
  );
}

function ImageButton({ editor }: { editor: Editor }) {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const onChange = (src: string) => {
    editor.chain().focus().setImage({ src }).run();
  };

  const onUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const imageUrl = URL.createObjectURL(file);
        onChange(imageUrl);
      }
    };

    input.click();
  };

  const handleImageSubmit = () => {
    if (imageUrl) {
      onChange(imageUrl);
      setImageUrl("");
      setIsDialogOpen(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0"
          >
            <ImageIcon className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={onUpload}>
            <UploadIcon className="size-4" />
            이미지 업로드
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsDialogOpen(true)}>
            <SearchIcon className="size-4" />
            이미지 주소 입력
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>이미지 주소 입력</DialogTitle>
          </DialogHeader>

          <Input
            placeholder="이미지 주소를 입력해주세요."
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleImageSubmit();
              }
            }}
          />
          <DialogFooter>
            <Button onClick={handleImageSubmit}>확인</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
