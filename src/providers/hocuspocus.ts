import {
  HocuspocusProvider,
  HocuspocusProviderConfiguration,
} from "@hocuspocus/provider";
import * as Y from "yjs";
import { ConnectProvider } from "./types";

export class HocuspocusConnectProvider implements ConnectProvider {
  doc: Y.Doc;
  private provider?: HocuspocusProvider;
  private config: HocuspocusProviderConfiguration;

  constructor(url: string, name: string, doc: Y.Doc, token?: string) {
    this.doc = doc;
    this.config = { url, name, token, document: this.doc };
  }

  connect() {
    if (this.provider) {
      return;
    }
    this.provider = new HocuspocusProvider(this.config);
  }

  disconnect() {
    this.provider?.destroy();
    this.provider = undefined;
  }

  async waitForSynced() {
    if (!this.provider) {
      throw new Error("Hocuspocus provider is not connected");
    }
    if (this.provider.isSynced) {
      return;
    }
    const provider = this.provider;
    return new Promise<void>((resolve) => {
      const handler = () => {
        provider.off("synced", handler);
        resolve();
      };
      provider.on("synced", handler);
    });
  }
}
