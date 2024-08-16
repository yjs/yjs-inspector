import { WebsocketProvider } from "y-websocket";
import * as Y from "yjs";
import { ConnectProvider } from "./types";

export class WebSocketConnectProvider implements ConnectProvider {
  doc: Y.Doc;
  private provider: WebsocketProvider;

  constructor(url: string, room: string, doc: Y.Doc) {
    this.doc = doc;
    this.provider = new WebsocketProvider(url, room, doc);
  }

  connect() {
    this.provider.connect();
  }

  disconnect() {
    this.provider.disconnect();
    this.provider.destroy();
  }

  async waitForSynced() {
    return new Promise<void>((resolve) => {
      this.provider.once("synced", () => resolve());
    });
  }
}
