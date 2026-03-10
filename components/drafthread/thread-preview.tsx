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
        <Zap className="w-16 h-16 text-zinc-700 mb-4" />
        <h3 className="text-lg font-medium text-zinc-400 mb-2">Your thread will appear here</h3>
        <p className="text-sm text-zinc-600 mb-8">Fill in the form and hit Generate</p>
        <div className="flex gap-3">
          <button
            onClick={() => onLoadExample("featureLaunch")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-300 text-sm hover:border-zinc-500 transition-colors cursor-pointer"
          >
            <Rocket className="w-4 h-4" />
            Feature Launch example
          </button>
          <button
            onClick={() => onLoadExample("lessonLearned")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-300 text-sm hover:border-zinc-500 transition-colors cursor-pointer"
          >
            <Lightbulb className="w-4 h-4" />
            Lesson Learned example
          </button>
        </div>
      </div>
    )
  }

  // Generating State
  if (isGenerating) {
    return (
      <div className="flex-1">
        <div className="mb-6">
          <p className="text-sm text-zinc-300 mb-3">Writing your thread...</p>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full bg-orange-500 rounded-full animate-pulse" style={{ width: "60%" }} />
            </div>
            <span className="text-xs text-zinc-500">Crafting hook</span>
          </div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 animate-pulse">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-zinc-800" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-zinc-800 rounded w-32" />
                  <div className="h-3 bg-zinc-800 rounded w-24" />
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="h-3 bg-zinc-800 rounded w-full" />
                <div className="h-3 bg-zinc-800 rounded w-4/5" />
                <div className="h-3 bg-zinc-800 rounded w-3/5" />
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
          <span className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Preview</span>
          <span className="text-xs text-zinc-600">·</span>
          <span className="text-xs text-zinc-400">
            {platform === "x" ? "X (Twitter)" : "Threads"}
          </span>
        </div>
        <button
          onClick={() => setPlatform(platform === "x" ? "threads" : "x")}
          className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
        >
          Switch to {platform === "x" ? "Threads" : "X"}
        </button>
      </div>

      {/* Thread Cards */}
      <div className="space-y-0">
        {threadData?.tweets.map((tweet, i) => (
          <div key={tweet.index}>
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
        <div className="mt-8 pt-6 border-t border-zinc-800">
          <p className="text-xs text-zinc-500 mb-4">
            {threadData.totalTweets} tweets · {totalChars.toLocaleString()} chars total
          </p>
          <div className="flex gap-3 mb-4">
            <button
              onClick={() => copyFullThread("full")}
              className="flex-1 h-10 flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 text-sm font-medium rounded-lg transition-colors cursor-pointer"
            >
              {copiedAll === "full" ? (
                <>
                  <Check className="w-4 h-4 text-green-500" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy Full Thread
                </>
              )}
            </button>
            <button
              onClick={() => copyFullThread("typefully")}
              className="flex-1 h-10 flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 text-sm font-medium rounded-lg transition-colors cursor-pointer"
            >
              {copiedAll === "typefully" ? (
                <>
                  <Check className="w-4 h-4 text-green-500" />
                  Copied!
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Copy for Typefully
                </>
              )}
            </button>
          </div>
          <button
            onClick={onRegenerate}
            className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 text-xs transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Regenerate
          </button>
        </div>
      )}
    </div>
  )
}

function ThreadConnector() {
  return (
    <div className="flex justify-center py-1">
      <div className="flex flex-col items-center">
        <div className="w-px h-3 bg-zinc-700" />
        <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
        <div className="w-px h-3 bg-zinc-700" />
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
      ? "border-l-2 border-l-orange-500"
      : tweet.type === "cta"
        ? "border-l-2 border-l-green-500"
        : ""

  return (
    <div
      className={`relative bg-zinc-900 border border-zinc-800 rounded-2xl p-4 ${borderClass} ${
        isOverLimit ? "ring-1 ring-red-500 bg-red-500/5" : ""
      }`}
    >
      {/* Badge */}
      {tweet.type !== "insight" && (
        <span
          className={`absolute top-3 right-12 text-xs px-2 py-0.5 rounded-full ${
            tweet.type === "hook"
              ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
              : "bg-green-500/20 text-green-400 border border-green-500/30"
          }`}
        >
          {tweet.type}
        </span>
      )}

      {/* Edit Button */}
      <button
        onClick={onEdit}
        className="absolute top-3 right-3 cursor-pointer"
      >
        <Pencil className="w-3.5 h-3.5 text-zinc-600 hover:text-zinc-300 transition-colors" />
      </button>

      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
          {handle.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-100 text-sm">{handle}</span>
            <span className="text-zinc-500 text-xs">@{handle} · now</span>
          </div>
          <p className="text-xs text-zinc-600">Indie hacker</p>
        </div>
      </div>

      {/* Content */}
      {isEditing ? (
        <textarea
          value={tweet.content}
          onChange={(e) => onUpdate(e.target.value)}
          className="w-full mt-3 bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-sm text-zinc-100 leading-relaxed resize-none focus:outline-none focus:border-orange-500"
          rows={5}
          autoFocus
        />
      ) : (
        <p className="text-sm text-zinc-100 leading-relaxed mt-3 whitespace-pre-wrap">
          {tweet.content}
          {numberTweets && (
            <span className="text-zinc-500"> {tweet.index}/{totalTweets}</span>
          )}
        </p>
      )}

      {/* Action Row */}
      <div className="flex items-center gap-5 mt-3 pt-3 border-t border-zinc-800">
        <Heart className="w-4 h-4 text-zinc-600" />
        <Repeat2 className="w-4 h-4 text-zinc-600" />
        <MessageCircle className="w-4 h-4 text-zinc-600" />
        <Share className="w-4 h-4 text-zinc-600" />
        <div className="ml-auto flex items-center gap-2">
          <span
            className={`font-mono text-xs ${
              isOverLimit
                ? "text-red-500 font-semibold"
                : isWarning
                  ? "text-amber-500"
                  : "text-zinc-600"
            }`}
          >
            {tweet.charCount}/{charLimit}
            {isOverLimit && " ⚠️"}
          </span>
          <button onClick={onCopy} className="cursor-pointer">
            {isCopied ? (
              <Check className="w-3.5 h-3.5 text-green-500" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-zinc-600 hover:text-zinc-300 transition-colors" />
            )}
          </button>
        </div>
      </div>
    </div>
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
      ? "border-l-2 border-l-orange-500"
      : tweet.type === "cta"
        ? "border-l-2 border-l-green-500"
        : ""

  return (
    <div
      className={`relative bg-zinc-900 border border-zinc-700 rounded-2xl p-4 ${borderClass} ${
        isOverLimit ? "ring-1 ring-red-500 bg-red-500/5" : ""
      }`}
    >
      {/* Badge */}
      {tweet.type !== "insight" && (
        <span
          className={`absolute top-3 right-12 text-xs px-2 py-0.5 rounded-full ${
            tweet.type === "hook"
              ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
              : "bg-green-500/20 text-green-400 border border-green-500/30"
          }`}
        >
          {tweet.type}
        </span>
      )}

      {/* Edit Button */}
      <button
        onClick={onEdit}
        className="absolute top-3 right-3 cursor-pointer"
      >
        <Pencil className="w-3.5 h-3.5 text-zinc-600 hover:text-zinc-300 transition-colors" />
      </button>

      {/* Header with Thread Line */}
      <div className="flex gap-3">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
            {handle.charAt(0).toUpperCase()}
          </div>
          {showThreadLine && <div className="w-px flex-1 bg-zinc-700 mt-2" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-100 text-sm">{handle}</span>
          </div>
          <p className="text-xs text-zinc-600">now · @ Threads</p>

          {/* Content */}
          {isEditing ? (
            <textarea
              value={tweet.content}
              onChange={(e) => onUpdate(e.target.value)}
              className="w-full mt-3 bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-[15px] text-zinc-100 leading-relaxed resize-none focus:outline-none focus:border-purple-500"
              rows={5}
              autoFocus
            />
          ) : (
            <p className="text-[15px] text-zinc-100 leading-relaxed mt-3 whitespace-pre-wrap">
              {tweet.content}
              {numberTweets && (
                <span className="text-zinc-500"> {tweet.index}/{totalTweets}</span>
              )}
            </p>
          )}

          {/* Action Row */}
          <div className="flex items-center gap-5 mt-3 pt-3 border-t border-zinc-800">
            <div className="flex items-center gap-1 text-zinc-600">
              <Heart className="w-4 h-4" />
              <span className="text-xs">0</span>
            </div>
            <div className="flex items-center gap-1 text-zinc-600">
              <MessageCircle className="w-4 h-4" />
              <span className="text-xs">0</span>
            </div>
            <div className="flex items-center gap-1 text-zinc-600">
              <Repeat2 className="w-4 h-4" />
              <span className="text-xs">0</span>
            </div>
            <div className="flex items-center gap-1 text-zinc-600">
              <Share className="w-4 h-4" />
              <span className="text-xs">0</span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <span
                className={`font-mono text-xs ${
                  isOverLimit
                    ? "text-red-500 font-semibold"
                    : isWarning
                      ? "text-amber-500"
                      : "text-zinc-600"
                }`}
              >
                {tweet.charCount}/{charLimit}
                {isOverLimit && " ⚠️"}
              </span>
              <button onClick={onCopy} className="cursor-pointer">
                {isCopied ? (
                  <Check className="w-3.5 h-3.5 text-green-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-zinc-600 hover:text-zinc-300 transition-colors" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
