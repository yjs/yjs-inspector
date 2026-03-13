import { Path } from "@textea/json-viewer";
import { Braces, Brackets, FileJson, Type } from "lucide-react";
import { ComponentProps, useState } from "react";
import * as Y from "yjs";
import {
  getHumanReadablePath,
  parsePrimitiveValue,
  type PrimitiveHint,
} from "../utils";
import { jsonToY } from "../utils/json-to-y";
import { getYTypeName, isYArray, isYDoc, isYMap, isYShape } from "../y-shape";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { toast } from "./ui/use-toast";

type AddValueKind = "primitive" | "yType";
type YTypeKind = "yMap" | "yArray" | "yText";

export function AddDataDialog({
  target,
  path,
  ...props
}: { target: unknown; path: Path } & ComponentProps<typeof Dialog>) {
  const humanReadablePath = getHumanReadablePath(path);
  const [tab, setTab] = useState<YTypeKind>("yMap");
  const [key, setKey] = useState<string>("");
  const [addValueKind, setAddValueKind] = useState<AddValueKind>("primitive");
  const [yTypeKind, setYTypeKind] = useState<YTypeKind>("yMap");
  const [valueString, setValueString] = useState("");
  const [valueHint, setValueHint] = useState<PrimitiveHint | "auto">("auto");
  const [insertAtEnd, setInsertAtEnd] = useState(true);
  const [insertIndex, setInsertIndex] = useState("0");
  const [addMode, setAddMode] = useState<"addItem" | "fromJson">("addItem");
  const [jsonInput, setJsonInput] = useState("");
  const [jsonMerge, setJsonMerge] = useState(true);

  const handleAdd = () => {
    if (!isYShape(target)) {
      toast({
        variant: "destructive",
        description: "Invalid target",
        duration: 2000,
      });
      return;
    }

    if (isYDoc(target)) {
      if (!key.trim()) {
        toast({
          variant: "destructive",
          description: "Key is required",
          duration: 2000,
        });
        return;
      }
      if (tab === "yMap") {
        target.getMap(key);
      } else if (tab === "yArray") {
        target.getArray(key);
      } else {
        target.getText(key);
      }
      props.onOpenChange?.(false);
      setKey("");
      return;
    }

    if (isYMap(target)) {
      if (!key.trim()) {
        toast({
          variant: "destructive",
          description: "Key is required",
          duration: 2000,
        });
        return;
      }
      if (addValueKind === "primitive") {
        try {
          const hint =
            valueHint === "auto" ? undefined : (valueHint as PrimitiveHint);
          const value = parsePrimitiveValue(valueString, hint);
          target.set(key, value);
        } catch (e) {
          toast({
            variant: "destructive",
            description: e instanceof Error ? e.message : "Invalid value",
            duration: 2000,
          });
          return;
        }
      } else {
        const typeMap = {
          yMap: Y.Map,
          yArray: Y.Array,
          yText: Y.Text,
        } as const;
        target.set(key, new typeMap[yTypeKind]());
      }
      props.onOpenChange?.(false);
      setKey("");
      setValueString("");
      return;
    }

    if (isYArray(target)) {
      let value: unknown;
      if (addValueKind === "primitive") {
        try {
          const hint =
            valueHint === "auto" ? undefined : (valueHint as PrimitiveHint);
          value = parsePrimitiveValue(valueString, hint);
        } catch (e) {
          toast({
            variant: "destructive",
            description: e instanceof Error ? e.message : "Invalid value",
            duration: 2000,
          });
          return;
        }
      } else {
        const typeMap = {
          yMap: Y.Map,
          yArray: Y.Array,
          yText: Y.Text,
        } as const;
        value = new typeMap[yTypeKind]();
      }
      const index = insertAtEnd ? target.length : parseInt(insertIndex, 10);
      if (!insertAtEnd && (Number.isNaN(index) || index < 0 || index > target.length)) {
        toast({
          variant: "destructive",
          description: "Index must be between 0 and array length",
          duration: 2000,
        });
        return;
      }
      if (insertAtEnd) {
        target.push([value]);
      } else {
        target.insert(index, [value]);
      }
      props.onOpenChange?.(false);
      setValueString("");
      setInsertIndex(String(target.length));
      return;
    }

    console.error("Invalid add target", path, target);
    toast({
      variant: "destructive",
      description: "Invalid add target",
      duration: 2000,
    });
  };

  const handleAddFromJson = () => {
    if (!target || !isYShape(target)) return;
    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonInput.trim() || "null");
    } catch {
      toast({
        variant: "destructive",
        description: "Invalid JSON",
        duration: 2000,
      });
      return;
    }
    if (isYMap(target)) {
      if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
        const obj = parsed as Record<string, unknown>;
        if (jsonMerge) {
          for (const [k, v] of Object.entries(obj)) {
            target.set(k, jsonToY(v));
          }
        } else {
          const keys = Array.from(target.keys());
          for (const k of keys) {
            target.delete(k);
          }
          for (const [k, v] of Object.entries(obj)) {
            target.set(k, jsonToY(v));
          }
        }
      } else if (Array.isArray(parsed)) {
        target.set("_imported", jsonToY(parsed));
      } else {
        target.set("_imported", jsonToY(parsed));
      }
      props.onOpenChange?.(false);
      setJsonInput("");
      return;
    }
    if (isYArray(target)) {
      const value = jsonToY(parsed);
      if (jsonMerge) {
        target.push([value]);
      } else {
        const arr = Array.isArray(parsed) ? parsed : [parsed];
        target.delete(0, target.length);
        const converted = arr.map((item) => jsonToY(item));
        if (converted.length > 0) {
          target.push(converted);
        }
      }
      props.onOpenChange?.(false);
      setJsonInput("");
      return;
    }
  };

  const keyField = (
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
        onChange={(e) => setKey(e.currentTarget.value)}
      />
    </div>
  );

  const primitiveValueField = (
    <div className="space-y-2">
      <div className="space-y-1">
        <Label htmlFor="add-dialog-value-input">Value</Label>
        <Input
          id="add-dialog-value-input"
          placeholder='e.g. "hello", 42, true'
          value={valueString}
          onChange={(e) => setValueString(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAdd();
            }
          }}
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="add-dialog-hint">Interpret as</Label>
        <Select
          value={valueHint}
          onValueChange={(v) => setValueHint(v as PrimitiveHint | "auto")}
        >
          <SelectTrigger id="add-dialog-hint">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="auto">Auto (JSON parse)</SelectItem>
            <SelectItem value="string">String</SelectItem>
            <SelectItem value="number">Number</SelectItem>
            <SelectItem value="boolean">Boolean</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const yTypeValueTabs = (
    <Tabs
      value={yTypeKind}
      onValueChange={(v) => setYTypeKind(v as YTypeKind)}
      className="space-y-2"
    >
      <TabsList className="grid grid-cols-3">
        <TabsTrigger value="yMap">
          <Braces className="mr-1 h-3 w-3" />
          YMap
        </TabsTrigger>
        <TabsTrigger value="yArray">
          <Brackets className="mr-1 h-3 w-3" />
          YArray
        </TabsTrigger>
        <TabsTrigger value="yText">
          <Type className="mr-1 h-3 w-3" />
          YText
        </TabsTrigger>
      </TabsList>
      <TabsContent value="yMap" className="text-muted-foreground text-sm">
        new Y.Map()
      </TabsContent>
      <TabsContent value="yArray" className="text-muted-foreground text-sm">
        new Y.Array()
      </TabsContent>
      <TabsContent value="yText" className="text-muted-foreground text-sm">
        new Y.Text()
      </TabsContent>
    </Tabs>
  );

  if (!target || !isYShape(target)) {
    return (
      <Dialog {...props}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add</DialogTitle>
            <DialogDescription>No target selected.</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog {...props}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add</DialogTitle>
          <DialogDescription>
            Add to&nbsp;
            <code className="bg-secondary rounded-md p-1 font-mono text-sm">
              {getYTypeName(target)}
            </code>
            &nbsp;at&nbsp;
            <code className="bg-secondary rounded-md p-1 font-mono text-sm">
              {humanReadablePath}
            </code>
          </DialogDescription>
        </DialogHeader>

        {isYDoc(target) && (
          <>
            {keyField}
            <Tabs
              value={tab}
              onValueChange={(v) => setTab(v as "yMap" | "yArray" | "yText")}
            >
              <TabsList className="grid grid-cols-3">
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
              <TabsContent value="yMap" className="mt-2" />
              <TabsContent value="yArray" className="mt-2" />
              <TabsContent value="yText" className="mt-2" />
            </Tabs>
          </>
        )}

        {isYMap(target) && (
          <Tabs
            value={addMode}
            onValueChange={(v) => setAddMode(v as "addItem" | "fromJson")}
          >
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="addItem">Add key/value</TabsTrigger>
              <TabsTrigger value="fromJson">
                <FileJson className="mr-2 h-4 w-4" />
                Add from JSON
              </TabsTrigger>
            </TabsList>
            <TabsContent value="addItem" className="space-y-4 mt-2">
              {keyField}
              <div className="space-y-2">
                <Label>Value type</Label>
                <Tabs
                  value={addValueKind}
                  onValueChange={(v) => setAddValueKind(v as AddValueKind)}
                >
                  <TabsList className="grid grid-cols-2">
                    <TabsTrigger value="primitive">Primitive</TabsTrigger>
                    <TabsTrigger value="yType">Y type</TabsTrigger>
                  </TabsList>
                  <TabsContent value="primitive" className="mt-2">
                    {primitiveValueField}
                  </TabsContent>
                  <TabsContent value="yType" className="mt-2">
                    {yTypeValueTabs}
                  </TabsContent>
                </Tabs>
              </div>
            </TabsContent>
            <TabsContent value="fromJson" className="space-y-4 mt-2">
              <div className="space-y-1">
                <Label htmlFor="add-dialog-json">JSON</Label>
                <textarea
                  id="add-dialog-json"
                  className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus:ring-ring flex min-h-[120px] w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder='{"key": "value"} or ["a", "b"]'
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.currentTarget.value)}
                />
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={jsonMerge}
                  onChange={(e) => setJsonMerge(e.target.checked)}
                />
                Merge with existing (only set new keys)
              </label>
            </TabsContent>
          </Tabs>
        )}

        {isYArray(target) && (
          <Tabs
            value={addMode}
            onValueChange={(v) => setAddMode(v as "addItem" | "fromJson")}
          >
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="addItem">Add item</TabsTrigger>
              <TabsTrigger value="fromJson">
                <FileJson className="mr-2 h-4 w-4" />
                Add from JSON
              </TabsTrigger>
            </TabsList>
            <TabsContent value="addItem" className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label>Position</Label>
                <div className="flex flex-wrap items-center gap-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={insertAtEnd}
                      onChange={() => setInsertAtEnd(true)}
                    />
                    At end
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={!insertAtEnd}
                      onChange={() => setInsertAtEnd(false)}
                    />
                    At index
                  </label>
                  {!insertAtEnd && (
                    <Input
                      type="number"
                      min={0}
                      max={target.length}
                      className="w-20"
                      value={insertIndex}
                      onChange={(e) => setInsertIndex(e.currentTarget.value)}
                    />
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Value type</Label>
                <Tabs
                  value={addValueKind}
                  onValueChange={(v) => setAddValueKind(v as AddValueKind)}
                >
                  <TabsList className="grid grid-cols-2">
                    <TabsTrigger value="primitive">Primitive</TabsTrigger>
                    <TabsTrigger value="yType">Y type</TabsTrigger>
                  </TabsList>
                  <TabsContent value="primitive" className="mt-2">
                    {primitiveValueField}
                  </TabsContent>
                  <TabsContent value="yType" className="mt-2">
                    {yTypeValueTabs}
                  </TabsContent>
                </Tabs>
              </div>
            </TabsContent>
            <TabsContent value="fromJson" className="space-y-4 mt-2">
              <div className="space-y-1">
                <Label htmlFor="add-dialog-json-arr">JSON</Label>
                <textarea
                  id="add-dialog-json-arr"
                  className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus:ring-ring flex min-h-[120px] w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder='["a", "b"] or {"nested": "object"}'
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.currentTarget.value)}
                />
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={jsonMerge}
                  onChange={(e) => setJsonMerge(e.target.checked)}
                />
                Merge (append as one item); uncheck to replace array
              </label>
            </TabsContent>
          </Tabs>
        )}

        <DialogFooter>
          {(isYMap(target) || isYArray(target)) && addMode === "fromJson" ? (
            <Button onClick={handleAddFromJson}>Apply</Button>
          ) : (
            <Button onClick={handleAdd}>Add</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
