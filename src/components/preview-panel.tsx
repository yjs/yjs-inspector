import { Button } from "./ui/button";
import { Bug } from "lucide-react";

export function PreviewPanel() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex">
        <h2 className="mb-4 flex-1 text-xl">YDoc</h2>
        <Button variant="secondary" size="sm" asChild>
          <a
            href="https://github.com/lawvs/ydoc-playground/issues/new"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Bug className="mr-2 h-4 w-4" />
            Report issue
          </a>
        </Button>
      </div>
    </div>
  );
}
