import * as Y from "yjs";

export async function fileToYDoc(file: File) {
  // TODO handle base64 encoding
  // https://docs.yjs.dev/api/document-updates#example-base64-encoding
  const yDocUpdate = new Uint8Array(await file.arrayBuffer());
  const newYDoc = new Y.Doc();
  // For debugging
  Y.logUpdate(yDocUpdate);
  Y.applyUpdate(newYDoc, yDocUpdate);
  return newYDoc;
}
