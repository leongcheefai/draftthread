import { Zap } from "lucide-react"

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md px-6 py-3 flex items-center justify-between">
      <div className="flex items-center">
        <Zap className="w-5 h-5 text-primary mr-2" aria-hidden="true" />
        <h1 className="text-xl font-bold tracking-tight text-foreground">Drafthread</h1>
        <span className="text-xs text-muted-foreground ml-3 hidden sm:block">
          Turn ideas into viral threads
        </span>
      </div>
      <span className="text-xs text-muted-foreground/70">X + Threads</span>
    </header>
  )
}
