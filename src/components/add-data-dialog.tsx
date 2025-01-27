import { Path } from "@textea/json-viewer";
import { Braces, Brackets, Type } from "lucide-react";
import { ComponentProps, useState } from "react";
import * as Y from "yjs";
import { getHumanReadablePath } from "../utils";
import { getYTypeName, isYDoc, isYMap, isYShape } from "../y-shape";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { toast } from "./ui/use-toast";

export function AddDataDialog({
  target,
  path,
  ...props
}: { target: unknown; path: Path } & ComponentProps<typeof Dialog>) {
  const humanReadablePath = getHumanReadablePath(path);
  const [tab, setTab] = useState<"yMap" | "yArray" | "yText">("yMap");
  const [key, setKey] = useState<string>("");

  const handleAdd = () => {
    if (!key) {
      toast({
        variant: "destructive",
        description: "Key is required",
        duration: 2000,
      });
      return;
    }
    if (!isYShape(target)) {
      toast({
        variant: "destructive",
        description: "Invalid target",
        duration: 2000,
      });
      console.error("Invalid target", target);
      return;
    }
    if (isYDoc(target)) {
      if (tab === "yMap") {
        target.getMap(key);
        props.onOpenChange?.(false);
        setKey("");
        return;
      }
      if (tab === "yArray") {
        target.getArray(key);
        props.onOpenChange?.(false);
        setKey("");
        return;
      }
      if (tab === "yText") {
        target.getText(key);
        props.onOpenChange?.(false);
        setKey("");
        return;
      }
      throw new Error("Invalid tab");
    }
    if (isYMap(target)) {
      const tabMap = {
        yMap: Y.Map,
        yArray: Y.Array,
        yText: Y.Text,
      } as const;
      target.set(key, new tabMap[tab]());

      props.onOpenChange?.(false);
      setKey("");
      return;
    }
    console.error("Invalid add target", path, target);
    throw new Error("Invalid add target");
  };

  const KeyField = (
    <div className="space-y-1">
      <Label htmlFor="add-dialog-name-input">Key</Label>
      <Input
        id="add-dialog-name-input"
        autoFocus
        placeholder="key"
        value={key}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleAdd();
          }
        }}
        onChange={(e) => {
          setKey(e.target.value);
        }}
      />
    </div>
  );

  return (
    <Dialog {...props}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add YType</DialogTitle>
          <DialogDescription>
            Add a new YType to&nbsp;
            <code className="bg-secondary rounded-md p-1 font-mono text-sm">
              {isYShape(target) ? getYTypeName(target) : "object"}
            </code>
            &nbsp;at&nbsp;
            <code className="bg-secondary rounded-md p-1 font-mono text-sm">
              {humanReadablePath}
            </code>
          </DialogDescription>
        </DialogHeader>

        <Tabs
          className="flex gap-4"
          defaultValue="yMap"
          value={tab}
          onValueChange={(value) =>
            setTab(value as "yMap" | "yArray" | "yText")
          }
        >
          <TabsList className="grid h-full grid-rows-3">
            <TabsTrigger value="yMap">
              <Braces className="mr-2 h-4 w-4" />
              YMap
            </TabsTrigger>
            <TabsTrigger value="yArray">
              <Brackets className="mr-2 h-4 w-4" />
              YArray
            </TabsTrigger>
            <TabsTrigger value="yText">
              <Type className="mr-2 h-4 w-4" />
              YText
            </TabsTrigger>
          </TabsList>

          <TabsContent value="yMap" className="space-y-2">
            {KeyField}

            <div className="space-y-1">
              <Label htmlFor="value">Value</Label>
              <Input id="value" disabled defaultValue="new Y.Map()" />
            </div>
          </TabsContent>

          <TabsContent value="yArray" className="space-y-2">
            {KeyField}

            <div className="space-y-1">
              <Label htmlFor="value">Value</Label>
              <Input id="value" disabled defaultValue="new Y.Array()" />
            </div>
          </TabsContent>
          <TabsContent value="yText" className="space-y-2">
            {KeyField}

            <div className="space-y-1">
              <Label htmlFor="value">Value</Label>
              <Input id="value" disabled defaultValue="new Y.Text()" />
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button onClick={handleAdd}>Add</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
