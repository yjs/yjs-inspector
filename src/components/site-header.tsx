import { Github } from "lucide-react";
import packageJSON from "../../package.json";
import { ModeToggle } from "./mode-toggle";
import { badgeVariants } from "./ui/badge";
import { Button } from "./ui/button";
import yjsLogo from "/yjs.png";

export function Header() {
  return (
    <header className="border-border/40 bg-background/95 supports-backdrop-filter:bg-background/60 w-full border-b backdrop-blur-sm">
      <div className="container flex h-14 max-w-(--breakpoint-2xl) items-center gap-2">
        <div className="mr-6 flex items-center space-x-2">
          <a href="/">
            <img src={yjsLogo} className="mr-2 h-8 w-8" alt="Yjs logo" />
          </a>

          <span className="hidden font-bold sm:inline-block">
            Yjs Inspector
          </span>
        </div>
        {/* Placeholder for right side of header */}
        <div className="ml-auto"></div>
        <a
          className={badgeVariants({ variant: "default" })}
          href="https://docs.yjs.dev/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Yjs Version: {packageJSON.dependencies.yjs}
        </a>
        <ModeToggle />
        <Button variant="ghost" size="icon" asChild>
          <a
            href="https://github.com/yjs/yjs-inspector"
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
