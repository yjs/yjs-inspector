import { Cable, RocketIcon, RotateCw, Unplug } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { WebsocketProvider } from "y-websocket";
import { useYDoc } from "../state";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
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
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export function ConnectButton() {
  const [yDoc] = useYDoc();
  const [preDoc, setPreDoc] = useState(yDoc);
  const [provider, setProvider] = useState<WebsocketProvider>();
  const [connected, setConnected] = useState(false);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const disconnect = useCallback(() => {
    if (!connected) return;
    provider?.disconnect();
    provider?.destroy();
    setProvider(undefined);
    setConnected(false);
  }, [connected, provider]);

  useEffect(() => {
    // Disconnect when the yDoc changes
    if (yDoc !== preDoc) {
      setPreDoc(yDoc);
      disconnect();
    }
  }, [yDoc, preDoc, provider, disconnect]);

  const onConnect = ({ url, room }: { url: string; room: string }) => {
    if (connected) {
      throw new Error("Should not be able to connect when already connected");
    }
    provider?.disconnect();
    const wsProvider = new WebsocketProvider(url, room, yDoc);
    wsProvider.on("sync", (isSynced: boolean) => {
      if (isSynced) {
        setLoading(false);
      }
    });
    wsProvider.connect();
    setLoading(true);
    setProvider(wsProvider);
    setConnected(true);
    setOpen(false);
  };

  const handleClick = () => {
    if (connected) {
      disconnect();
      return;
    }
    setOpen(true);
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={(open) => setOpen(open)}>
        <Button variant="secondary" onClick={handleClick}>
          <RotateCw className="mr-2 h-4 w-4 animate-spin" />
          Connecting
        </Button>
        <ConnectDialog onConnect={onConnect} />
      </Dialog>
    );
  }

  if (connected) {
    return (
      <Dialog open={open} onOpenChange={(open) => setOpen(open)}>
        <Button variant="secondary" onClick={handleClick}>
          <Unplug className="mr-2 h-4 w-4" />
          Disconnect
        </Button>
        <ConnectDialog onConnect={onConnect} />
      </Dialog>
    );
  }
  return (
    <Dialog open={open} onOpenChange={(open) => setOpen(open)}>
      <Button variant="secondary" onClick={handleClick}>
        <Cable className="mr-2 h-4 w-4" />
        Connect
      </Button>
      <ConnectDialog onConnect={onConnect} />
    </Dialog>
  );
}

const officialDemos = [
  {
    name: "ProseMirror",
    value: "prosemirror-demo",
    url: "https://demos.yjs.dev/prosemirror/prosemirror.html",
  },
  {
    name: "ProseMirror with Version History",
    value: "prosemirror-versions-demo",
    url: "https://demos.yjs.dev/prosemirror-versions/prosemirror-versions.html",
  },
  {
    name: "Quill",
    value: "quill-demo-5",
    url: "https://demos.yjs.dev/quill/quill.html",
  },
  {
    name: "Monaco",
    value: "monaco-demo",
    url: "https://demos.yjs.dev/monaco/monaco.html",
  },
  {
    name: "CodeMirror",
    value: "codemirror-demo",
    url: "https://demos.yjs.dev/codemirror/codemirror.html",
  },
  {
    name: "CodeMirror 6",
    value: "codemirror.next-demo",
    url: "https://demos.yjs.dev/codemirror.next/codemirror.next.html",
  },
] as const;

function ConnectDialog({
  onConnect,
}: {
  onConnect: (data: { url: string; room: string }) => void;
}) {
  const [url, setUrl] = useState("wss://demos.yjs.dev/ws");
  const [room, setRoom] = useState("quill-demo-5");
  const [provider, setProvider] = useState("quill-demo-5");
  const officialDemo = officialDemos.find((demo) => demo.value === provider);

  // This effect is unnecessary, but it's convenient
  useEffect(() => {
    if (officialDemo) {
      const demo = officialDemos.find((demo) => demo.value === provider);
      if (demo) {
        setUrl("wss://demos.yjs.dev/ws");
        setRoom(demo.value);
      }
    }
  }, [officialDemo, provider]);

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
            }}
          >
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Select a provider" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Official Demos</SelectLabel>
                {officialDemos.map((demo) => (
                  <SelectItem key={demo.value} value={demo.value}>
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
        <Button onClick={() => onConnect({ url, room })}>Connect</Button>
      </DialogFooter>
    </DialogContent>
  );
}
