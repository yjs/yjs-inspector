import { Cable, RotateCw, Unplug } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { ConnectProvider } from "../providers/types";
import { useYDoc } from "../state";
import { ConnectDialog } from "./connect-dialog";
import { Button } from "./ui/button";
import { Dialog } from "./ui/dialog";

export function ConnectButton() {
  const [yDoc] = useYDoc();
  const [open, setOpen] = useState(false);
  const [provider, setProvider] = useState<ConnectProvider>();
  const [connectState, setConnectState] = useState<
    "connecting" | "connected" | "disconnected"
  >("disconnected");

  const disconnect = useCallback(() => {
    if (connectState === "disconnected") return;
    provider?.disconnect();
    setProvider(undefined);
    setConnectState("disconnected");
  }, [connectState, provider]);

  // This effect is for convenience, it is evil. We should add the connect logic to global state and handle it there.
  useEffect(() => {
    // Disconnect when the yDoc changes
    if (connectState === "disconnected") return;
    if (!provider) {
      console.error(
        "Provider should be defined when connectState is not disconnected",
        provider,
        connectState,
      );
      return;
    }
    if (yDoc !== provider.doc) {
      disconnect();
    }
  }, [yDoc, disconnect, provider, connectState]);

  const onConnect = useCallback(
    (provider: ConnectProvider) => {
      if (connectState !== "disconnected") {
        throw new Error("Should not be able to connect when already connected");
      }
      provider.connect();
      setConnectState("connecting");
      provider.waitForSynced().then(() => {
        setConnectState("connected");
      });
      setProvider(provider);
      setOpen(false);
    },
    [connectState],
  );

  const handleClick = () => {
    if (connectState === "disconnected") {
      setOpen(true);
      return;
    }
    disconnect();
    return;
  };

  if (connectState === "connecting") {
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

  if (connectState === "connected") {
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
