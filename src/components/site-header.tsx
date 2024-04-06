import { Button } from "./ui/button";
import yjsLogo from "/yjs.png";
import { ModeToggle } from "./mode-toggle";
import { Github } from "lucide-react";

export function Header() {
  return (
    <header className="w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center gap-2">
        <div className="mr-6 flex items-center space-x-2">
          <a
            href="https://docs.yjs.dev/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src={yjsLogo} className="mr-2 h-8 w-8" alt="Yjs logo" />
          </a>

          <span className="hidden font-bold sm:inline-block">
            YDoc Playground
          </span>
        </div>
        {/* Placeholder for right side of header */}
        <div className="ml-auto"></div>
        <ModeToggle />
        <Button variant="ghost" size="icon" asChild>
          <a
            href="https://github.com/lawvs/ydoc-playground"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Github />
            <span className="sr-only">GitHub</span>
          </a>
        </Button>
      </div>
    </header>
  );
}
