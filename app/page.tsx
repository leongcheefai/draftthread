"use client"

import { useState, useRef, useCallback, Component, type ReactNode } from "react"
import { Header } from "@/components/drafthread/header"
import { InputForm } from "@/components/drafthread/input-form"
import { ThreadPreview } from "@/components/drafthread/thread-preview"
import type { ThreadData, FormData } from "@/lib/drafthread-types"
import { Zap } from "lucide-react"

// Error Boundary
class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen flex flex-col items-center justify-center bg-background px-6">
          <Zap className="w-12 h-12 text-accent mb-4" />
          <h1 className="text-lg font-medium text-secondary-foreground mb-2">Something went wrong</h1>
          <p className="text-sm text-muted-foreground mb-6 text-center max-w-md">
            {this.state.error?.message || "An unexpected error occurred."}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 bg-secondary hover:bg-accent border border-accent text-foreground text-sm font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Try again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

const EXAMPLE_DATA = {
  featureLaunch: {
    topic: "Launching a new AI-powered email client that writes replies for you",
    keyPoints: `- Uses GPT-4 to understand context
- Learns your writing style over time
- One-click replies for 80% of emails
- Works with Gmail and Outlook
- Beta launching next week`,
    cta: "Join the waitlist to get early access and 50% off lifetime",
    threadType: "launch" as const,
    tone: "bold" as const,
  },
  lessonLearned: {
    topic: "I just hit RM 1,000 MRR with my first SaaS after 8 months of building",
    keyPoints: `- Took 8 months from idea to first RM
- First 3 months: zero revenue
- Turning point: lifetime deal launch
- What worked: niche communities
- What failed: cold email, PH launch`,
    cta: "Follow for weekly updates on the road to RM 10k MRR",
    threadType: "lesson" as const,
    tone: "casual" as const,
  },
  milestone: {
    topic: "Just crossed 10,000 users on my side project",
    keyPoints: `- Started as a weekend project
- First 1000 users took 6 months
- Last 9000 took only 2 months
- Key growth lever: SEO content
- Revenue: $2,400/mo`,
    cta: "DM me if you want to learn how I did SEO for a developer tool",
    threadType: "milestone" as const,
    tone: "professional" as const,
  },
}

export default function DrafthreadPage() {
  return (
    <ErrorBoundary>
      <DrafthreadApp />
    </ErrorBoundary>
  )
}

function DrafthreadApp() {
  const [activePanel, setActivePanel] = useState<"write" | "preview">("write")
  const [platform, setPlatform] = useState<"x" | "threads">("x")
  const [threadData, setThreadData] = useState<ThreadData | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cooldown, setCooldown] = useState(false)
  const cooldownRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [formData, setFormData] = useState<FormData>({
    topic: EXAMPLE_DATA.lessonLearned.topic,
    keyPoints: EXAMPLE_DATA.lessonLearned.keyPoints,
    cta: EXAMPLE_DATA.lessonLearned.cta,
    handle: "cheefai",
    threadType: "lesson",
    tone: "casual",
    numberTweets: true,
  })

  const handleGenerate = useCallback(async () => {
    if (!formData.topic.trim() || !formData.keyPoints.trim()) return
    if (isGenerating || cooldown) return

    setIsGenerating(true)
    setError(null)

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform,
          threadType: formData.threadType,
          tone: formData.tone,
          topic: formData.topic,
          keyPoints: formData.keyPoints,
          cta: formData.cta,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || `Request failed (${res.status})`)
      }

      setThreadData(data as ThreadData)
      setActivePanel("preview")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setIsGenerating(false)
      // 3-second cooldown to prevent double-clicks
      setCooldown(true)
      if (cooldownRef.current) clearTimeout(cooldownRef.current)
      cooldownRef.current = setTimeout(() => setCooldown(false), 3000)
    }
  }, [formData, platform, isGenerating, cooldown])

  const handleRegenerate = () => {
    handleGenerate()
  }

  const handleLoadExample = (example: keyof typeof EXAMPLE_DATA) => {
    const data = EXAMPLE_DATA[example]
    setFormData((prev) => ({
      ...prev,
      topic: data.topic,
      keyPoints: data.keyPoints,
      cta: data.cta,
      threadType: data.threadType,
      tone: data.tone,
    }))
  }

  const handleUpdateTweet = (index: number, content: string) => {
    if (!threadData) return
    setThreadData({
      ...threadData,
      tweets: threadData.tweets.map((tweet) =>
        tweet.index === index ? { ...tweet, content, charCount: content.length } : tweet
      ),
    })
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <Header />

      {/* Mobile Tabs */}
      <div className="lg:hidden flex border-b border-border" role="tablist" aria-label="Editor panels">
        <button
          role="tab"
          aria-selected={activePanel === "write"}
          aria-controls="panel-write"
          onClick={() => setActivePanel("write")}
          className={`flex-1 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset ${
            activePanel === "write"
              ? "text-foreground border-b-2 border-primary"
              : "text-muted-foreground hover:text-secondary-foreground"
          }`}
        >
          Write
        </button>
        <button
          role="tab"
          aria-selected={activePanel === "preview"}
          aria-controls="panel-preview"
          onClick={() => setActivePanel("preview")}
          className={`flex-1 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset ${
            activePanel === "preview"
              ? "text-foreground border-b-2 border-primary"
              : "text-muted-foreground hover:text-secondary-foreground"
          }`}
        >
          Preview
        </button>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Panel - Input Form */}
        <div
          id="panel-write"
          role="tabpanel"
          aria-label="Write"
          className={`${
            activePanel === "write" ? "flex" : "hidden"
          } lg:flex w-full lg:w-[480px] lg:shrink-0 flex-col overflow-y-auto border-r border-border px-6 py-8 pb-24 lg:pb-8`}
        >
          <InputForm
            formData={formData}
            setFormData={setFormData}
            platform={platform}
            setPlatform={setPlatform}
            onGenerate={handleGenerate}
            onLoadExample={handleLoadExample}
            isGenerating={isGenerating}
            isDisabled={cooldown}
            error={error}
            onDismissError={() => setError(null)}
          />
        </div>

        {/* Right Panel - Thread Preview */}
        <div
          id="panel-preview"
          role="tabpanel"
          aria-label="Preview"
          className={`${
            activePanel === "preview" ? "flex" : "hidden"
          } lg:flex flex-1 flex-col overflow-y-auto bg-background px-6 py-8 pb-24 lg:pb-8`}
        >
          <ThreadPreview
            threadData={threadData}
            platform={platform}
            setPlatform={setPlatform}
            handle={formData.handle || "yourhandle"}
            isGenerating={isGenerating}
            onRegenerate={handleRegenerate}
            onUpdateTweet={handleUpdateTweet}
            onLoadExample={handleLoadExample}
            numberTweets={formData.numberTweets}
          />
        </div>
      </main>

      {/* Mobile Sticky Generate Button */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border">
        <button
          onClick={handleGenerate}
          disabled={isGenerating || cooldown || !formData.topic || !formData.keyPoints}
          className="w-full h-12 bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {isGenerating ? (
            <>
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Writing your thread...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
              Generate Thread
            </>
          )}
        </button>
      </div>
    </div>
  )
}
