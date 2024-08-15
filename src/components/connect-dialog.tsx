import { RocketIcon } from "lucide-react";
import { useState } from "react";
import * as Y from "yjs";
import { useYDoc } from "../state";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Button } from "./ui/button";
import {
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
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Switch } from "./ui/switch";

const officialDemos = [
  {
    name: "ProseMirror",
    room: "prosemirror-demo-2024/06",
    url: "https://demos.yjs.dev/prosemirror/prosemirror.html",
  },
  {
    name: "ProseMirror with Version History",
    room: "prosemirror-versions-demo-2024/06",
    url: "https://demos.yjs.dev/prosemirror-versions/prosemirror-versions.html",
  },
  {
    name: "Quill",
    room: "quill-demo-2024/06",
    url: "https://demos.yjs.dev/quill/quill.html",
  },
  {
    name: "Monaco",
    room: "monaco-demo-2024/06",
    url: "https://demos.yjs.dev/monaco/monaco.html",
  },
  {
    name: "CodeMirror",
    room: "codemirror-demo-2024/06",
    url: "https://demos.yjs.dev/codemirror/codemirror.html",
  },
  {
    name: "CodeMirror 6",
    room: "codemirror.next-demo-2024/06",
    url: "https://demos.yjs.dev/codemirror.next/codemirror.next.html",
  },
] as const;

export function ConnectDialog({
  onConnect,
}: {
  onConnect: (data: { doc: Y.Doc; url: string; room: string }) => void;
}) {
  const [yDoc] = useYDoc();
  const [url, setUrl] = useState("wss://demos.yjs.dev/ws");
  const [room, setRoom] = useState("quill-demo-2024/06");
  const [provider, setProvider] = useState("quill-demo-2024/06");
  const [needCreateNewDoc, setNeedCreateNewDoc] = useState(true);
  const officialDemo = officialDemos.find((demo) => demo.room === provider);

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Connect</DialogTitle>
        <DialogDescription>
          Collaborate with others by connecting to a shared YDoc
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="provider-input" className="text-right">
            Provider
          </Label>

          <Select
            value={provider}
            onValueChange={(value) => {
              setProvider(value);
              const demo = officialDemos.find((demo) => demo.room === provider);
              if (demo) {
                setUrl("wss://demos.yjs.dev/ws");
                setRoom(demo.room);
                return;
              }
            }}
          >
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Select a provider" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Official Demos</SelectLabel>
                {officialDemos.map((demo) => (
                  <SelectItem key={demo.room} value={demo.room}>
                    {demo.name}
                  </SelectItem>
                ))}
              </SelectGroup>

              <SelectGroup>
                <SelectLabel>Customs</SelectLabel>
                <SelectItem value="y-websocket">y-websocket</SelectItem>
                <SelectItem value="y-webrtc" disabled>
                  y-webrtc (coming soon)
                </SelectItem>
                <SelectItem value="blocksuite">
                  Blocksuite Playground
                </SelectItem>
                <SelectItem value="liveblocks" disabled>
                  LiveblocksProvider (coming soon)
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="url-input" className="text-right">
            URL
          </Label>
          <Input
            id="url-input"
            value={url}
            disabled={!!officialDemo}
            onInput={(e) => setUrl(e.currentTarget.value)}
            placeholder="wss://demos.yjs.dev/ws"
            className="col-span-3"
          />
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="room-input" className="text-right">
            Room
          </Label>
          <Input
            id="room-input"
            className="col-span-3"
            disabled={!!officialDemo}
            value={room}
            onInput={(e) => setRoom(e.currentTarget.value)}
            placeholder="room-name"
          />
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Switch
            id="create-new-doc"
            className="justify-self-end"
            checked={needCreateNewDoc}
            onCheckedChange={(value) => setNeedCreateNewDoc(value)}
          />
          <Label htmlFor="create-new-doc" className="col-span-3">
            Create a new YDoc before connecting
          </Label>
        </div>

        {officialDemo && (
          <Alert>
            <RocketIcon className="h-4 w-4" />
            <AlertTitle>Heads up!</AlertTitle>
            <AlertDescription>
              Click here to access the&nbsp;
              <a
                className="text-primary underline"
                href={officialDemo.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {officialDemo.name}
              </a>
              &nbsp;demo.
            </AlertDescription>
          </Alert>
        )}
      </div>
      <DialogFooter>
        <Button
          onClick={() => {
            if (needCreateNewDoc) {
              onConnect({ url, room, doc: new Y.Doc() });
              return;
            }
            onConnect({ url, room, doc: yDoc });
          }}
        >
          Connect
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
