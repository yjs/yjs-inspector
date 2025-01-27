import { useCallback, useEffect, useRef, useState } from "react";

// Ported from https://github.com/react-dropzone/react-dropzone/issues/753#issuecomment-774782919
function useDropZone(callback: (files: FileList) => void | Promise<void>) {
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);

  const onDragEnter = useCallback((event: DragEvent) => {
    event.preventDefault();
    dragCounter.current++;
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((event: DragEvent) => {
    event.preventDefault();
    dragCounter.current--;
    if (dragCounter.current > 0) return;
    setIsDragging(false);
  }, []);

  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
  }, []);

  const onDrop = useCallback(
    async (event: DragEvent) => {
      event.preventDefault();
      setIsDragging(false);
      if (
        event.dataTransfer &&
        event.dataTransfer.files &&
        event.dataTransfer.files.length > 0
      ) {
        dragCounter.current = 0;
        await callback(event.dataTransfer.files);
        event.dataTransfer.clearData();
      }
    },
    [callback],
  );

  useEffect(() => {
    window.addEventListener("dragenter", onDragEnter);
    window.addEventListener("dragleave", onDragLeave);
    window.addEventListener("dragover", onDragOver);
    window.addEventListener("drop", onDrop);

    return () => {
      window.removeEventListener("dragenter", onDragEnter);
      window.removeEventListener("dragleave", onDragLeave);
      window.removeEventListener("dragover", onDragOver);
      window.removeEventListener("drop", onDrop);
    };
  }, [onDragEnter, onDragLeave, onDragOver, onDrop]);

  return isDragging;
}

export function FullScreenDropZone({
  text,
  onDrop,
}: {
  text: string;
  onDrop: (files: FileList) => void | Promise<void>;
}) {
  const isDragging = useDropZone(onDrop);
  return (
    <div
      className={`bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-gray-900 p-4 ${isDragging ? "bg-opacity-50" : "hidden"}`}
    >
      <div className="flex h-full w-full items-center justify-center rounded-lg border-4 border-dashed border-white p-8">
        <span className="text-2xl text-white">{text}</span>
      </div>
    </div>
  );
}
