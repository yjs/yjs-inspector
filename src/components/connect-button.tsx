import { Cable, Unplug } from "lucide-react";
import { useState } from "react";
import { WebsocketProvider } from "y-websocket";
import { useYDoc } from "../state";
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

export function ConnectButton() {
  const [yDoc] = useYDoc();
  const [url, setUrl] = useState("wss://demos.yjs.dev/ws");
  const [room, setRoom] = useState("monaco-demo");
  const [provider, setProvider] = useState<WebsocketProvider>();
  const [connected, setConnected] = useState(false);
  const [open, setOpen] = useState(false);

  const onConnect = () => {
    if (connected) {
      throw new Error("Should not be able to connect when already connected");
    }
    provider?.disconnect();
    const newProvider = new WebsocketProvider(url, room, yDoc);
    newProvider.connect();
    setProvider(newProvider);
    setConnected(true);
    setOpen(false);
  };
  return (
    <Dialog open={open} onOpenChange={(open) => setOpen(open)}>
      <Button
        variant="secondary"
        onClick={() => {
          if (connected) {
            provider?.disconnect();
            setProvider(undefined);
            setConnected(false);
            return;
          }
          setOpen(true);
        }}
      >
        {connected ? (
          <>
            <Unplug className="mr-2 h-4 w-4" />
            Disconnect
          </>
        ) : (
          <>
            <Cable className="mr-2 h-4 w-4" />
            Connect
          </>
        )}
      </Button>

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

            <Select value="y-websocket">
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="y-websocket">y-websocket</SelectItem>
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
              value={room}
              onInput={(e) => setRoom(e.currentTarget.value)}
              placeholder="room-name"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onConnect}>Connect</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
