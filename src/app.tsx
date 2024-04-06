import { Toaster } from "./components/ui/toaster";
import { ThemeProvider } from "./components/theme-provider";
import { Header } from "./components/site-header";
import { ConfigPanel } from "./components/config-panel";
import { PreviewPanel } from "./components/preview-panel";
import * as Y from "yjs";

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
