"use client";

import { useDetailImagesStore } from "@/store/use-detail-images";
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "@hello-pangea/dnd";
import { X } from "lucide-react";
import Image from "next/image";

export function DetailImageList() {
  const { images, setImages, deleteImages } = useDetailImagesStore();

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const startIndex = result.source.index;
    const endIndex = result.destination.index;

    const updatedImages = [...images];
    const [reorderdImage] = updatedImages.splice(startIndex, 1);
    updatedImages.splice(endIndex, 0, reorderdImage);

    setImages(updatedImages);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="detail-images" direction="horizontal">
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="flex gap-2 overflow-x-auto"
          >
            {!images.length && (
              <div className="w-full h-[140px] rounded-md bg-slate-50 flex items-center justify-center text-sm text-slate-500 font-medium">
                이미지가 없습니다.
              </div>
            )}
            {images.map((image, imageIndex) => (
              <Draggable
                key={image.id}
                index={imageIndex}
                draggableId={`image-${image.id}`}
              >
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className="relative rounded-md aspect-square size-[140px] shrink-0"
                    {...provided.dragHandleProps}
                  >
                    <Image
                      fill
                      src={image.imageUrl}
                      alt="detail-image"
                      className="object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => deleteImages(imageIndex)}
                      className="absolute top-1 right-1 bg-white rounded-full p-1 border"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
