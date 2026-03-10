"use client"

import { useState, useRef, useCallback } from "react"
import { Header } from "@/components/drafthread/header"
import { InputForm } from "@/components/drafthread/input-form"
import { ThreadPreview } from "@/components/drafthread/thread-preview"
import type { ThreadData, FormData } from "@/lib/drafthread-types"

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
    <div className="h-screen flex flex-col bg-zinc-950">
      <Header />

      {/* Mobile Tabs */}
      <div className="lg:hidden flex border-b border-zinc-800">
        <button
          onClick={() => setActivePanel("write")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activePanel === "write"
              ? "text-zinc-100 border-b-2 border-orange-500"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          Write
        </button>
        <button
          onClick={() => setActivePanel("preview")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activePanel === "preview"
              ? "text-zinc-100 border-b-2 border-orange-500"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          Preview
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Input Form */}
        <div
          className={`${
            activePanel === "write" ? "flex" : "hidden"
          } lg:flex w-full lg:w-[480px] lg:shrink-0 flex-col overflow-y-auto border-r border-zinc-800 px-6 py-8 pb-24 lg:pb-8`}
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
          className={`${
            activePanel === "preview" ? "flex" : "hidden"
          } lg:flex flex-1 flex-col overflow-y-auto bg-zinc-950 px-6 py-8 pb-24 lg:pb-8`}
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
      </div>

      {/* Mobile Sticky Generate Button */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-zinc-950 border-t border-zinc-800">
        <button
          onClick={handleGenerate}
          disabled={isGenerating || cooldown || !formData.topic || !formData.keyPoints}
          className="w-full h-12 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
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
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
