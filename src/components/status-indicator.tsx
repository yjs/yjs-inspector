import { CloudDownload, CloudUpload, Unplug } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDownloadListener, useUploadListener } from "../state/index";

export function StatusIndicator({ className }: { className?: string }) {
  const [status, setStatus] = useState<"download" | "upload" | "none">("none");
  const timeoutRef = useRef<number | null>(null);

  const resetStatus = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = window.setTimeout(() => {
      setStatus("none");
    }, 1000);
  }, []);

  useDownloadListener(
    useCallback(() => {
      setStatus("download");
      resetStatus();
    }, [resetStatus]),
  );

  useUploadListener(
    useCallback(() => {
      setStatus("upload");
      resetStatus();
    }, [resetStatus]),
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      {status === "none" && <Unplug className={className} />}
      {status === "download" && <CloudDownload className={className} />}
      {status === "upload" && <CloudUpload className={className} />}
    </>
  );
}
