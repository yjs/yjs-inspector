import { Button } from "./components/ui/button";
import yjsLogo from "/yjs.png";
import { useYDoc } from "./state";
import * as Y from "yjs";

function Header() {
  return (
    <header className="flex items-center bg-gray-100 p-4 text-center">
      <img src={yjsLogo} className="mr-2 h-8 w-8" alt="Yjs logo" />
      <h1 className="text-2xl font-bold text-gray-800">YDoc Playground</h1>

      <a
        className="ml-auto text-sm text-gray-600 underline"
        href="https://github.com/swc-project/swc-playground"
        target="_blank"
        rel="noopener noreferrer"
      >
        GitHub
      </a>
    </header>
  );
}

export function App() {
  const [, setYDoc] = useYDoc();

  return (
    <>
      <Header />

      <div>
        <Button
          onClick={async () => {
            setYDoc(new Y.Doc());
            const handles = await window.showOpenFilePicker({
              startIn: "downloads",
            });
            const file = await handles[0].getFile();
            const yDocUpdate = await file.arrayBuffer();
            const yDoc = new Y.Doc();
            try {
              Y.applyUpdate(yDoc, new Uint8Array(yDocUpdate));
              setYDoc(yDoc);
            } catch (error) {
              console.error(error);
            }
          }}
        >
          Select YDoc
        </Button>
      </div>
    </>
  );
}
