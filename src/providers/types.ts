import * as Y from "yjs";

export interface ConnectProvider {
  doc: Y.Doc;
  connect(): void;
  disconnect(): void;
  waitForSynced(): Promise<void>;
}
