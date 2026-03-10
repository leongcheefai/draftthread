"use client"

import { useState } from "react"
import {
  Zap,
  Heart,
  Repeat2,
  MessageCircle,
  Share,
  Pencil,
  Copy,
  Check,
  RefreshCw,
  Rocket,
  Lightbulb,
} from "lucide-react"
import type { ThreadData, Platform } from "@/lib/drafthread-types"

const focusRing = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"

interface ThreadPreviewProps {
  threadData: ThreadData | null
  platform: Platform
  setPlatform: (platform: Platform) => void
  handle: string
  isGenerating: boolean
  onRegenerate: () => void
  onUpdateTweet: (index: number, content: string) => void
  onLoadExample: (example: "featureLaunch" | "lessonLearned" | "milestone") => void
  numberTweets: boolean
}

export function ThreadPreview({
  threadData,
  platform,
  setPlatform,
  handle,
  isGenerating,
  onRegenerate,
  onUpdateTweet,
  onLoadExample,
  numberTweets,
}: ThreadPreviewProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [copiedAll, setCopiedAll] = useState<"full" | "typefully" | null>(null)

  const charLimit = platform === "x" ? 280 : 500

  const copyToClipboard = async (text: string, index?: number) => {
    await navigator.clipboard.writeText(text)
    if (index !== undefined) {
      setCopiedIndex(index)
      setTimeout(() => setCopiedIndex(null), 1500)
    }
  }

  const copyFullThread = async (format: "full" | "typefully") => {
    if (!threadData) return
    const separator = format === "full" ? "\n\n———\n\n" : "\n\n---\n\n"
    const text = threadData.tweets.map((t) => t.content).join(separator)
    await navigator.clipboard.writeText(text)
    setCopiedAll(format)
    setTimeout(() => setCopiedAll(null), 1500)
  }

  const totalChars = threadData?.tweets.reduce((sum, t) => sum + t.charCount, 0) || 0

  // Empty State
  if (!threadData && !isGenerating) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
        <Zap className="w-16 h-16 text-accent mb-4" aria-hidden="true" />
        <h2 className="text-lg font-medium text-accent-foreground mb-2">Your thread will appear here</h2>
        <p className="text-sm text-muted-foreground/70 mb-8">Fill in the form and hit Generate</p>
        <div className="flex gap-3">
          <button
            onClick={() => onLoadExample("featureLaunch")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary border border-accent text-secondary-foreground text-sm hover:border-muted-foreground transition-colors ${focusRing}`}
          >
            <Rocket className="w-4 h-4" aria-hidden="true" />
            Feature Launch example
          </button>
          <button
            onClick={() => onLoadExample("lessonLearned")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary border border-accent text-secondary-foreground text-sm hover:border-muted-foreground transition-colors ${focusRing}`}
          >
            <Lightbulb className="w-4 h-4" aria-hidden="true" />
            Lesson Learned example
          </button>
        </div>
      </div>
    )
  }

  // Generating State
  if (isGenerating) {
    return (
      <div className="flex-1" aria-busy="true" aria-label="Generating thread">
        <div className="mb-6">
          <p className="text-sm text-secondary-foreground mb-3">Writing your thread...</p>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden" role="progressbar" aria-label="Generating">
              <div className="h-full bg-primary rounded-full animate-pulse" style={{ width: "60%" }} />
            </div>
            <span className="text-xs text-muted-foreground">Crafting hook</span>
          </div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card border border-border rounded-2xl p-4 animate-pulse" aria-hidden="true">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-secondary rounded w-32" />
                  <div className="h-3 bg-secondary rounded w-24" />
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="h-3 bg-secondary rounded w-full" />
                <div className="h-3 bg-secondary rounded w-4/5" />
                <div className="h-3 bg-secondary rounded w-3/5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Thread Preview
  return (
    <div className="flex-1">
      {/* Platform Preview Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Preview</h2>
          <span className="text-xs text-muted-foreground/70" aria-hidden="true">·</span>
          <span className="text-xs text-accent-foreground">
            {platform === "x" ? "X (Twitter)" : "Threads"}
          </span>
        </div>
        <button
          onClick={() => setPlatform(platform === "x" ? "threads" : "x")}
          className={`text-xs text-muted-foreground hover:text-secondary-foreground transition-colors ${focusRing} rounded px-2 py-1`}
        >
          Switch to {platform === "x" ? "Threads" : "X"}
        </button>
      </div>

      {/* Thread Cards */}
      <div className="space-y-0" role="list" aria-label="Thread posts">
        {threadData?.tweets.map((tweet, i) => (
          <div key={tweet.index} role="listitem">
            {platform === "x" ? (
              <XTweetCard
                tweet={tweet}
                handle={handle}
                charLimit={charLimit}
                isEditing={editingIndex === tweet.index}
                isCopied={copiedIndex === tweet.index}
                onEdit={() => setEditingIndex(editingIndex === tweet.index ? null : tweet.index)}
                onCopy={() => copyToClipboard(tweet.content, tweet.index)}
                onUpdate={(content) => onUpdateTweet(tweet.index, content)}
                numberTweets={numberTweets}
                totalTweets={threadData.totalTweets}
              />
            ) : (
              <ThreadsPostCard
                tweet={tweet}
                handle={handle}
                charLimit={charLimit}
                isEditing={editingIndex === tweet.index}
                isCopied={copiedIndex === tweet.index}
                onEdit={() => setEditingIndex(editingIndex === tweet.index ? null : tweet.index)}
                onCopy={() => copyToClipboard(tweet.content, tweet.index)}
                onUpdate={(content) => onUpdateTweet(tweet.index, content)}
                showThreadLine={i < threadData.tweets.length - 1}
                numberTweets={numberTweets}
                totalTweets={threadData.totalTweets}
              />
            )}
            {/* Thread Connector (X only) */}
            {platform === "x" && i < threadData.tweets.length - 1 && <ThreadConnector />}
          </div>
        ))}
      </div>

      {/* Copy Section */}
      {threadData && (
        <div className="mt-8 pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground mb-4">
            {threadData.totalTweets} tweets · {totalChars.toLocaleString()} chars total
          </p>
          <div className="flex gap-3 mb-4">
            <button
              onClick={() => copyFullThread("full")}
              className={`flex-1 h-10 flex items-center justify-center gap-2 bg-secondary hover:bg-accent border border-accent text-foreground text-sm font-medium rounded-lg transition-colors ${focusRing}`}
            >
              {copiedAll === "full" ? (
                <>
                  <Check className="w-4 h-4 text-green-500" aria-hidden="true" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" aria-hidden="true" />
                  Copy Full Thread
                </>
              )}
            </button>
            <button
              onClick={() => copyFullThread("typefully")}
              className={`flex-1 h-10 flex items-center justify-center gap-2 bg-secondary hover:bg-accent border border-accent text-foreground text-sm font-medium rounded-lg transition-colors ${focusRing}`}
            >
              {copiedAll === "typefully" ? (
                <>
                  <Check className="w-4 h-4 text-green-500" aria-hidden="true" />
                  Copied!
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" aria-hidden="true" />
                  Copy for Typefully
                </>
              )}
            </button>
          </div>
          <button
            onClick={onRegenerate}
            className={`flex items-center gap-1.5 text-muted-foreground hover:text-secondary-foreground text-xs transition-colors rounded px-2 py-1 -ml-2 ${focusRing}`}
          >
            <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
            Regenerate
          </button>
        </div>
      )}
    </div>
  )
}

function ThreadConnector() {
  return (
    <div className="flex justify-center py-1" aria-hidden="true">
      <div className="flex flex-col items-center">
        <div className="w-px h-3 bg-accent" />
        <div className="w-1.5 h-1.5 rounded-full bg-accent" />
        <div className="w-px h-3 bg-accent" />
      </div>
    </div>
  )
}

interface TweetCardProps {
  tweet: {
    index: number
    type: "hook" | "insight" | "cta"
    content: string
    charCount: number
  }
  handle: string
  charLimit: number
  isEditing: boolean
  isCopied: boolean
  onEdit: () => void
  onCopy: () => void
  onUpdate: (content: string) => void
  numberTweets: boolean
  totalTweets: number
}

function XTweetCard({
  tweet,
  handle,
  charLimit,
  isEditing,
  isCopied,
  onEdit,
  onCopy,
  onUpdate,
  numberTweets,
  totalTweets,
}: TweetCardProps) {
  const isOverLimit = tweet.charCount > charLimit
  const isWarning = tweet.charCount >= charLimit * 0.9 && !isOverLimit

  const borderClass =
    tweet.type === "hook"
      ? "border-l-2 border-l-primary"
      : tweet.type === "cta"
        ? "border-l-2 border-l-green-500"
        : ""

  return (
    <article
      aria-label={`Tweet ${tweet.index} of ${totalTweets}${tweet.type !== "insight" ? ` (${tweet.type})` : ""}`}
      className={`relative bg-card border border-border rounded-2xl p-4 ${borderClass} ${
        isOverLimit ? "ring-1 ring-destructive bg-destructive/5" : ""
      }`}
    >
      {/* Badge */}
      {tweet.type !== "insight" && (
        <span
          className={`absolute top-3 right-14 text-xs px-2 py-0.5 rounded-full ${
            tweet.type === "hook"
              ? "bg-primary/20 text-primary border border-primary/30"
              : "bg-green-500/20 text-green-400 border border-green-500/30"
          }`}
        >
          {tweet.type}
        </span>
      )}

      {/* Edit Button */}
      <button
        onClick={onEdit}
        aria-label={isEditing ? "Stop editing tweet" : "Edit tweet"}
        aria-pressed={isEditing}
        className={`absolute top-2 right-2 p-1.5 rounded-md ${focusRing}`}
      >
        <Pencil className="w-3.5 h-3.5 text-muted-foreground/70 hover:text-secondary-foreground transition-colors" />
      </button>

      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold shrink-0" aria-hidden="true">
          {handle.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground text-sm">{handle}</span>
            <span className="text-muted-foreground text-xs">@{handle} · now</span>
          </div>
          <p className="text-xs text-muted-foreground/70">Indie hacker</p>
        </div>
      </div>

      {/* Content */}
      {isEditing ? (
        <textarea
          value={tweet.content}
          onChange={(e) => onUpdate(e.target.value)}
          className="w-full mt-3 bg-secondary border border-accent rounded-lg p-2 text-sm text-foreground leading-relaxed resize-none focus:outline-none focus:border-primary"
          rows={5}
          autoFocus
          aria-label={`Edit tweet ${tweet.index} content`}
        />
      ) : (
        <p className="text-sm text-foreground leading-relaxed mt-3 whitespace-pre-wrap break-words">
          {tweet.content}
          {numberTweets && (
            <span className="text-muted-foreground"> {tweet.index}/{totalTweets}</span>
          )}
        </p>
      )}

      {/* Action Row */}
      <div className="flex items-center gap-5 mt-3 pt-3 border-t border-border" aria-hidden="true">
        <Heart className="w-4 h-4 text-muted-foreground/70" />
        <Repeat2 className="w-4 h-4 text-muted-foreground/70" />
        <MessageCircle className="w-4 h-4 text-muted-foreground/70" />
        <Share className="w-4 h-4 text-muted-foreground/70" />
        <div className="ml-auto flex items-center gap-2">
          <span
            aria-hidden="true"
            className={`font-mono text-xs ${
              isOverLimit
                ? "text-destructive font-semibold"
                : isWarning
                  ? "text-amber-500"
                  : "text-muted-foreground/70"
            }`}
          >
            {tweet.charCount}/{charLimit}
            {isOverLimit && " ⚠️"}
          </span>
          <button
            onClick={onCopy}
            aria-label={isCopied ? "Copied" : "Copy tweet"}
            className={`p-1.5 -m-0.5 rounded-md ${focusRing}`}
          >
            {isCopied ? (
              <Check className="w-3.5 h-3.5 text-green-500" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-muted-foreground/70 hover:text-secondary-foreground transition-colors" />
            )}
          </button>
        </div>
      </div>
      {/* Screen-reader char count */}
      <span className="sr-only">
        {tweet.charCount} of {charLimit} characters{isOverLimit ? ", over limit" : isWarning ? ", near limit" : ""}
      </span>
    </article>
  )
}

function ThreadsPostCard({
  tweet,
  handle,
  charLimit,
  isEditing,
  isCopied,
  onEdit,
  onCopy,
  onUpdate,
  showThreadLine,
  numberTweets,
  totalTweets,
}: TweetCardProps & { showThreadLine: boolean }) {
  const isOverLimit = tweet.charCount > charLimit
  const isWarning = tweet.charCount >= charLimit * 0.9 && !isOverLimit

  const borderClass =
    tweet.type === "hook"
      ? "border-l-2 border-l-primary"
      : tweet.type === "cta"
        ? "border-l-2 border-l-green-500"
        : ""

  return (
    <article
      aria-label={`Post ${tweet.index} of ${totalTweets}${tweet.type !== "insight" ? ` (${tweet.type})` : ""}`}
      className={`relative bg-card border border-accent rounded-2xl p-4 ${borderClass} ${
        isOverLimit ? "ring-1 ring-destructive bg-destructive/5" : ""
      }`}
    >
      {/* Badge */}
      {tweet.type !== "insight" && (
        <span
          className={`absolute top-3 right-14 text-xs px-2 py-0.5 rounded-full ${
            tweet.type === "hook"
              ? "bg-primary/20 text-primary border border-primary/30"
              : "bg-green-500/20 text-green-400 border border-green-500/30"
          }`}
        >
          {tweet.type}
        </span>
      )}

      {/* Edit Button */}
      <button
        onClick={onEdit}
        aria-label={isEditing ? "Stop editing post" : "Edit post"}
        aria-pressed={isEditing}
        className={`absolute top-2 right-2 p-1.5 rounded-md ${focusRing}`}
      >
        <Pencil className="w-3.5 h-3.5 text-muted-foreground/70 hover:text-secondary-foreground transition-colors" />
      </button>

      {/* Header with Thread Line */}
      <div className="flex gap-3">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold shrink-0" aria-hidden="true">
            {handle.charAt(0).toUpperCase()}
          </div>
          {showThreadLine && <div className="w-px flex-1 bg-accent mt-2" aria-hidden="true" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground text-sm">{handle}</span>
          </div>
          <p className="text-xs text-muted-foreground/70">now · @ Threads</p>

          {/* Content */}
          {isEditing ? (
            <textarea
              value={tweet.content}
              onChange={(e) => onUpdate(e.target.value)}
              className="w-full mt-3 bg-secondary border border-accent rounded-lg p-2 text-[15px] text-foreground leading-relaxed resize-none focus:outline-none focus:border-purple-500"
              rows={5}
              autoFocus
              aria-label={`Edit post ${tweet.index} content`}
            />
          ) : (
            <p className="text-[15px] text-foreground leading-relaxed mt-3 whitespace-pre-wrap break-words">
              {tweet.content}
              {numberTweets && (
                <span className="text-muted-foreground"> {tweet.index}/{totalTweets}</span>
              )}
            </p>
          )}

          {/* Action Row */}
          <div className="flex items-center gap-5 mt-3 pt-3 border-t border-border" aria-hidden="true">
            <div className="flex items-center gap-1 text-muted-foreground/70">
              <Heart className="w-4 h-4" />
              <span className="text-xs">0</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground/70">
              <MessageCircle className="w-4 h-4" />
              <span className="text-xs">0</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground/70">
              <Repeat2 className="w-4 h-4" />
              <span className="text-xs">0</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground/70">
              <Share className="w-4 h-4" />
              <span className="text-xs">0</span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <span
                aria-hidden="true"
                className={`font-mono text-xs ${
                  isOverLimit
                    ? "text-destructive font-semibold"
                    : isWarning
                      ? "text-amber-500"
                      : "text-muted-foreground/70"
                }`}
              >
                {tweet.charCount}/{charLimit}
                {isOverLimit && " ⚠️"}
              </span>
              <button
                onClick={onCopy}
                aria-label={isCopied ? "Copied" : "Copy post"}
                className={`p-1.5 -m-0.5 rounded-md ${focusRing}`}
              >
                {isCopied ? (
                  <Check className="w-3.5 h-3.5 text-green-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-muted-foreground/70 hover:text-secondary-foreground transition-colors" />
                )}
              </button>
            </div>
          </div>
          {/* Screen-reader char count */}
          <span className="sr-only">
            {tweet.charCount} of {charLimit} characters{isOverLimit ? ", over limit" : isWarning ? ", near limit" : ""}
          </span>
        </div>
      </div>
    </article>
  )
}
