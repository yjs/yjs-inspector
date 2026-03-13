import { HocuspocusProvider } from "@hocuspocus/provider";
import * as Y from "yjs";
import { ConnectProvider } from "./types";

export class HocuspocusConnectProvider implements ConnectProvider {
  doc: Y.Doc;
  private provider: HocuspocusProvider;

  constructor(
    url: string,
    name: string,
    doc: Y.Doc,
    token?: string | (() => string) | (() => Promise<string>),
  ) {
    this.doc = doc;
    this.provider = new HocuspocusProvider({
      url,
      name,
      document: doc,
      token: token ?? null,
    });
  }

  connect() {
    this.provider.connect();
  }

  disconnect() {
    this.provider.destroy();
  }

  async waitForSynced() {
    if (this.provider.isSynced) {
      return;
    }
    return new Promise<void>((resolve) => {
      const handler = () => {
        this.provider.off("synced", handler);
        resolve();
      };
      this.provider.on("synced", handler);
    });
  }
}
