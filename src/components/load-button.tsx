import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { File, Link, RotateCw, Upload } from "lucide-react";
import { useState } from "react";
import * as Y from "yjs";
import { useYDoc } from "../state";
import { fileToYDoc } from "../utils";
import { toast } from "./ui/use-toast";

function LoadFromUrlDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState("");
  const [, setYDoc] = useYDoc();

  const handleLoadYDoc = async () => {
    setLoading(true);
    try {
      const resp = await fetch(url);
      if (!resp.ok) {
        throw new Error("Failed to fetch YDoc");
      }
      const buffer = await resp.arrayBuffer();
      const uint8 = new Uint8Array(buffer);
      const yDoc = new Y.Doc();
      Y.applyUpdate(yDoc, uint8);
      setYDoc(yDoc);
      setOpen(false);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load YDoc",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Load from URL</DialogTitle>
          <DialogDescription>
            Paste the URL of the YDoc you want to load
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-2">
            <Label htmlFor="load-from-url-input" className="sr-only">
              URL
            </Label>
            <Input
              id="load-from-url-input"
              type="url"
              placeholder="https://example.com/ydoc"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleLoadYDoc();
                }
              }}
              onChange={(e) => {
                setUrl(e.target.value);
              }}
            />
          </div>
        </div>
        <DialogFooter>
          <Button disabled={loading} onClick={handleLoadYDoc}>
            {loading && <RotateCw className="mr-2 h-4 w-4 animate-spin" />}
            Load
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
LoadFromUrlDialog.Trigger = DialogTrigger;

export function LoadButton() {
  const [yDoc, setYDoc] = useYDoc();

  return (
    <LoadFromUrlDialog>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button>
            <Upload className="mr-2 h-4 w-4" />
            Load YDoc
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            onClick={async () => {
              yDoc.destroy();
              setYDoc(new Y.Doc());
              const handles = await window.showOpenFilePicker({
                startIn: "downloads",
              });
              const file = await handles[0].getFile();
              try {
                const newYDoc = await fileToYDoc(file);
                setYDoc(newYDoc);
              } catch (error) {
                console.error(error);
                toast({
                  variant: "destructive",
                  title: "Error",
                  description: "Failed to load YDoc",
                });
              }
            }}
          >
            <File className="mr-2 h-4 w-4" />
            Load from file
          </DropdownMenuItem>

          <LoadFromUrlDialog.Trigger asChild>
            <DropdownMenuItem>
              <Link className="mr-2 h-4 w-4" />
              Load from URL
            </DropdownMenuItem>
          </LoadFromUrlDialog.Trigger>
        </DropdownMenuContent>
      </DropdownMenu>
    </LoadFromUrlDialog>
  );
}
