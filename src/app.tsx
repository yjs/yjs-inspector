import { Toaster } from "./components/ui/toaster";
import { ThemeProvider } from "./components/theme-provider";
import { Header } from "./components/site-header";
import { ConfigPanel } from "./components/config-panel";
import { PreviewPanel } from "./components/preview-panel";

export function App() {
  return (
    <ThemeProvider>
      <div className="flex h-screen flex-col">
        <Header />
        <div className="flex h-full gap-4 p-4">
          <ConfigPanel />
          <PreviewPanel />
        </div>
      </div>
      <Toaster />
    </ThemeProvider>
  );
}
