import packageJSON from "../../package.json";
import { ModeToggle } from "./mode-toggle";
import { badgeVariants } from "./ui/badge";
import { Button } from "./ui/button";
import yjsLogo from "/yjs.png";

function GitHubIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="currentColor"
      focusable="false"
      height="24"
      viewBox="0 0 24 24"
      width="24"
    >
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.438 9.795 8.205 11.385.6.111.82-.261.82-.577 0-.285-.011-1.04-.016-2.04-3.338.726-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.73.083-.73 1.205.085 1.84 1.238 1.84 1.238 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.305.762-1.605-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.984-.399 3.004-.404 1.019.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.119 3.176.77.84 1.235 1.91 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222 0 1.606-.014 2.899-.014 3.293 0 .319.216.694.824.576C20.565 21.791 24 17.309 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

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
            <GitHubIcon />
            <span className="sr-only">GitHub</span>
          </a>
        </Button>
      </div>
    </header>
  );
}
