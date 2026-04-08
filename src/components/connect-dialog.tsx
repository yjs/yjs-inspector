import { BlocksuiteWebsocketProvider } from "@/providers/blocksuite/provider";
import { HocuspocusConnectProvider } from "@/providers/hocuspocus";
import { WebSocketConnectProvider } from "@/providers/websocket";
import { RocketIcon, TriangleAlert } from "lucide-react";
import { useState } from "react";
import * as Y from "yjs";
import { ConnectProvider } from "../providers/types";
import { useYDoc } from "../state/index";
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

// Hardcoded in the playground of blocksuite
// See https://github.com/toeverything/blocksuite/blob/db6e9d278e4d821e1d5aea912681e8fd1692b39e/packages/playground/apps/default/utils/collection.ts#L66
const BLOCKSUITE_PLAYGROUND_DOC_GUID = "collabPlayground";
const BLOCKSUITE_NAME = "Blocksuite Playground";
const HOCUSPOCUS_NAME = "hocuspocus";

const dailyRoomSuffix = new Date().toLocaleDateString("en-CA");
const createDailyRoom = (prefix: string) => `${prefix}-${dailyRoomSuffix}`;

const officialDemos = [
  {
    name: "ProseMirror",
    room: createDailyRoom("prosemirror-demo"),
    url: "wss://demos.yjs.dev/ws",
    demoUrl: "https://demos.yjs.dev/prosemirror/prosemirror.html",
  },
  {
    name: "ProseMirror with Version History",
    room: createDailyRoom("prosemirror-versions-demo"),
    url: "wss://demos.yjs.dev/ws",
    demoUrl:
      "https://demos.yjs.dev/prosemirror-versions/prosemirror-versions.html",
  },
  {
    name: "Quill",
    room: createDailyRoom("quill-demo"),
    url: "wss://demos.yjs.dev/ws",
    demoUrl: "https://demos.yjs.dev/quill/quill.html",
  },
  {
    name: "Monaco",
    room: createDailyRoom("monaco-demo"),
    url: "wss://demos.yjs.dev/ws",
    demoUrl: "https://demos.yjs.dev/monaco/monaco.html",
  },
  // {
  //   name: "Monaco React",
  //   room: createDailyRoom("monaco-react-demo"),
  //   url: "wss://demos.yjs.dev/ws",
  //   demoUrl: "https://demos.yjs.dev/monaco-react/index.html",
  // },
  {
    name: "CodeMirror",
    room: createDailyRoom("codemirror-demo"),
    url: "wss://demos.yjs.dev/ws",
    demoUrl: "https://demos.yjs.dev/codemirror/codemirror.html",
  },
  {
    name: "CodeMirror 6",
    room: createDailyRoom("codemirror.next-demo"),
    url: "wss://demos.yjs.dev/ws",
    demoUrl: "https://demos.yjs.dev/codemirror.next/codemirror.next.html",
  },
  // {
  //   name: "ProseMirror React",
  //   room: createDailyRoom("prosemirror-react-demo"),
  //   url: "wss://demos.yjs.dev/ws",
  //   demoUrl: "https://demos.yjs.dev/react-prosemirror/index.html",
  // },
  {
    name: BLOCKSUITE_NAME,
    room: "",
    url: "wss://blocksuite-playground.toeverything.workers.dev",
    demoUrl: "https://try-blocksuite.vercel.app",
    custom: true,
  },
];

export function ConnectDialog({
  onConnect,
}: {
  onConnect: (provider: ConnectProvider) => void;
}) {
  const [yDoc, setYDoc] = useYDoc();
  const [url, setUrl] = useState("wss://demos.yjs.dev/ws");
  const [room, setRoom] = useState(() => createDailyRoom("quill-demo"));
  const [provider, setProvider] = useState("Quill");
  const [needCreateNewDoc, setNeedCreateNewDoc] = useState(true);
  const [token, setToken] = useState("");
  const officialDemo = officialDemos.find((demo) => demo.name === provider);

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
              if (value === HOCUSPOCUS_NAME) {
                setUrl("");
                setToken("");
                return;
              }
              const demo = officialDemos.find((demo) => demo.name === value);
              if (demo) {
                setUrl(demo.url);
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
                {
                  // Ad-hoc remove the blocksuite playground from the official demos
                  officialDemos
                    .filter((i) => i.name !== BLOCKSUITE_NAME)
                    .map((demo) => (
                      <SelectItem key={demo.name} value={demo.name}>
                        {demo.name}
                      </SelectItem>
                    ))
                }
              </SelectGroup>

              <SelectGroup>
                <SelectLabel>Customs</SelectLabel>
                <SelectItem value="y-websocket">y-websocket</SelectItem>
                <SelectItem value="y-webrtc" disabled>
                  y-webrtc (coming soon)
                </SelectItem>
                <SelectItem value={BLOCKSUITE_NAME}>
                  {BLOCKSUITE_NAME}
                </SelectItem>
                <SelectItem value="liveblocks" disabled>
                  LiveblocksProvider (coming soon)
                </SelectItem>
                <SelectItem value={HOCUSPOCUS_NAME}>
                  HocuspocusProvider
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
            disabled={!!officialDemo && !officialDemo.custom}
            value={room}
            onInput={(e) => setRoom(e.currentTarget.value)}
            placeholder="Please enter a room name"
          />
        </div>

        {provider === HOCUSPOCUS_NAME && (
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="token-input" className="text-right">
              Token
            </Label>
            <Input
              id="token-input"
              type="password"
              className="col-span-3"
              value={token}
              onInput={(e) => setToken(e.currentTarget.value)}
              placeholder="Optional authentication token"
            />
          </div>
        )}

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

        {!needCreateNewDoc && (
          <Alert variant="destructive">
            <TriangleAlert className="h-4 w-4" />
            <AlertTitle>Caution!</AlertTitle>
            <AlertDescription>
              This may contaminate the remote YDoc. Make sure you know what you
              are doing.
            </AlertDescription>
          </Alert>
        )}

        {officialDemo && (
          <Alert>
            <RocketIcon className="h-4 w-4" />
            <AlertTitle>Heads up!</AlertTitle>
            <AlertDescription>
              Click here to access the&nbsp;
              <a
                className="text-primary underline"
                href={officialDemo.demoUrl}
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
          disabled={!url || !room}
          onClick={async () => {
            const doc = needCreateNewDoc
              ? new Y.Doc(
                  provider === BLOCKSUITE_NAME
                    ? { guid: BLOCKSUITE_PLAYGROUND_DOC_GUID }
                    : undefined,
                )
              : yDoc;
            setYDoc(doc);
            if (provider === BLOCKSUITE_NAME) {
              const ws = new WebSocket(new URL(`/room/${room}`, url));
              // Fix Uncaught (in promise) DOMException: Failed to execute 'send' on 'WebSocket': Still in CONNECTING state.
              await new Promise((resolve, reject) => {
                ws.addEventListener("open", resolve);
                ws.addEventListener("error", reject);
              });
              const connectProvider = new BlocksuiteWebsocketProvider(ws, doc);
              onConnect(connectProvider);
              return;
            }

            if (provider === HOCUSPOCUS_NAME) {
              const connectProvider = new HocuspocusConnectProvider(
                url,
                room,
                doc,
                token || undefined,
              );
              onConnect(connectProvider);
              return;
            }

            const connectProvider = new WebSocketConnectProvider(
              url,
              room,
              doc,
            );

            onConnect(connectProvider);
          }}
        >
          Connect
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
