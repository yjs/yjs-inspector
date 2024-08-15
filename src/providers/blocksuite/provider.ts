import { DocEngine } from "@blocksuite/sync";
import * as Y from "yjs";
import { ConnectProvider } from "../types";
import { NoopLogger } from "./utils";
import { WebSocketDocSource } from "./web-socket-doc-source";

export class BlocksuiteWebsocketProvider implements ConnectProvider {
  doc: Y.Doc;
  private docEngine: DocEngine;

  constructor(ws: WebSocket, doc: Y.Doc) {
    this.doc = doc;
    const docSource = new WebSocketDocSource(ws);
    this.docEngine = new DocEngine(doc, docSource, [], new NoopLogger());
  }

  connect() {
    this.docEngine.start();
    this.docEngine;
  }

  disconnect() {
    this.docEngine.forceStop();
  }

  destroy() {
    this.disconnect();
  }

  async waitForSynced() {
    await this.docEngine.waitForLoadedRootDoc();
  }
}
