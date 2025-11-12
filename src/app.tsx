import * as Y from "yjs";
import { ConfigPanel } from "./components/config-panel";
import { PreviewPanel } from "./components/preview-panel";
import { Header } from "./components/site-header";
import { ThemeProvider } from "./components/theme-provider";
import { Toaster } from "./components/ui/toaster";

export function App() {
  return (
    <ThemeProvider>
      <div className="flex h-screen flex-col">
        <Header />
        <div className="flex h-full gap-4 overflow-hidden p-4">
          <ConfigPanel />
          <PreviewPanel />
        </div>
      </div>
      <Toaster />
    </ThemeProvider>
  );
}

// For debugging
(globalThis as any).Y = Y;
console.info("Tip: You can access Yjs via 'Y' in the console for debugging");
