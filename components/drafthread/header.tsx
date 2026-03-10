import { Zap } from "lucide-react"

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md px-6 py-3 flex items-center justify-between">
      <div className="flex items-center">
        <Zap className="w-5 h-5 text-orange-500 mr-2" aria-hidden="true" />
        <h1 className="text-xl font-bold tracking-tight text-zinc-50">Drafthread</h1>
        <span className="text-xs text-zinc-500 ml-3 hidden sm:block">
          Turn ideas into viral threads
        </span>
      </div>
      <span className="text-xs text-zinc-600">X + Threads</span>
    </header>
  )
}
