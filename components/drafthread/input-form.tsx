"use client"

import {
  Lightbulb,
  Rocket,
  Target,
  BookOpen,
  List,
  Zap,
  Loader2,
  AlertCircle,
  X,
} from "lucide-react"
import { Switch } from "@/components/ui/switch"
import type { FormData, ThreadType, Tone } from "@/lib/drafthread-types"

interface InputFormProps {
  formData: FormData
  setFormData: React.Dispatch<React.SetStateAction<FormData>>
  platform: "x" | "threads"
  setPlatform: (platform: "x" | "threads") => void
  onGenerate: () => void
  onLoadExample: (example: "featureLaunch" | "lessonLearned" | "milestone") => void
  isGenerating: boolean
  isDisabled?: boolean
  error?: string | null
  onDismissError?: () => void
}

const THREAD_TYPES: { type: ThreadType; label: string; icon: React.ReactNode }[] = [
  { type: "lesson", label: "Lesson", icon: <Lightbulb className="w-5 h-5" /> },
  { type: "launch", label: "Launch", icon: <Rocket className="w-5 h-5" /> },
  { type: "milestone", label: "Milestone", icon: <Target className="w-5 h-5" /> },
  { type: "story", label: "Story", icon: <BookOpen className="w-5 h-5" /> },
  { type: "listicle", label: "Listicle", icon: <List className="w-5 h-5" /> },
]

const TONES: Tone[] = ["professional", "casual", "bold", "educational"]

export function InputForm({
  formData,
  setFormData,
  platform,
  setPlatform,
  onGenerate,
  onLoadExample,
  isGenerating,
  isDisabled,
  error,
  onDismissError,
}: InputFormProps) {
  const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-6">
      {/* Platform Toggle */}
      <section>
        <label className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-3 block">
          Platform
        </label>
        <div className="flex gap-3">
          <button
            onClick={() => setPlatform("x")}
            className={`flex-1 h-16 flex flex-col items-center justify-center gap-1 rounded-xl border-2 transition-all cursor-pointer ${
              platform === "x"
                ? "border-white bg-zinc-700"
                : "border-zinc-700 bg-zinc-800 hover:border-zinc-500"
            }`}
          >
            <span className="text-xl font-black text-white">𝕏</span>
            <span className="text-xs text-zinc-400">280 chars · 5-8 tweets</span>
          </button>
          <button
            onClick={() => setPlatform("threads")}
            className={`flex-1 h-16 flex flex-col items-center justify-center gap-1 rounded-xl border-2 transition-all cursor-pointer ${
              platform === "threads"
                ? "border-purple-500 bg-zinc-700"
                : "border-zinc-700 bg-zinc-800 hover:border-zinc-500"
            }`}
          >
            <span className="text-xl font-black text-purple-400">@</span>
            <span className="text-xs text-zinc-400">500 chars · 4-6 posts</span>
          </button>
        </div>
      </section>

      {/* Thread Type */}
      <section>
        <label className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-3 block">
          Thread Type
        </label>
        <div className="grid grid-cols-3 gap-2">
          {THREAD_TYPES.map(({ type, label, icon }) => (
            <button
              key={type}
              onClick={() => updateField("threadType", type)}
              className={`p-3 flex flex-col items-center gap-1 rounded-xl border transition-all cursor-pointer ${
                formData.threadType === type
                  ? "border-orange-500 bg-orange-500/10"
                  : "border-zinc-700 bg-zinc-800 hover:border-zinc-500"
              }`}
            >
              <span className={formData.threadType === type ? "text-orange-400" : "text-zinc-400"}>
                {icon}
              </span>
              <span className="text-xs font-medium text-zinc-300">{label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Tone */}
      <section>
        <label className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-3 block">
          Tone
        </label>
        <div className="flex flex-wrap gap-2">
          {TONES.map((tone) => (
            <button
              key={tone}
              onClick={() => updateField("tone", tone)}
              className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors cursor-pointer capitalize ${
                formData.tone === tone
                  ? "border-orange-500 text-orange-400 bg-orange-500/10"
                  : "border-zinc-700 text-zinc-400 bg-transparent hover:border-zinc-500"
              }`}
            >
              {tone}
            </button>
          ))}
        </div>
      </section>

      {/* Content Inputs */}
      <section>
        <label className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-3 block">
          Topic
        </label>
        <textarea
          value={formData.topic}
          onChange={(e) => updateField("topic", e.target.value)}
          placeholder="What is this thread about?"
          className="w-full h-20 resize-none bg-zinc-800 border border-zinc-700 focus:border-orange-500 focus:outline-none rounded-lg p-3 text-sm text-zinc-100 placeholder:text-zinc-600 transition-colors"
        />
      </section>

      <section>
        <label className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-3 block">
          Key Points
        </label>
        <textarea
          value={formData.keyPoints}
          onChange={(e) => updateField("keyPoints", e.target.value)}
          placeholder="Paste notes, bullet points, anything..."
          className="w-full h-36 resize-none bg-zinc-800 border border-zinc-700 focus:border-orange-500 focus:outline-none rounded-lg p-3 text-sm text-zinc-100 placeholder:text-zinc-600 transition-colors"
        />
        <p className="text-xs text-zinc-600 mt-1.5">
          Raw notes, bullet points, or a paragraph — AI will structure it
        </p>
      </section>

      <section>
        <label className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-3 block">
          Call to Action
        </label>
        <textarea
          value={formData.cta}
          onChange={(e) => updateField("cta", e.target.value)}
          placeholder="What should readers do after reading?"
          className="w-full h-16 resize-none bg-zinc-800 border border-zinc-700 focus:border-orange-500 focus:outline-none rounded-lg p-3 text-sm text-zinc-100 placeholder:text-zinc-600 transition-colors"
        />
        <p className="text-xs text-zinc-600 mt-1.5">What should readers do after reading?</p>
      </section>

      {/* Settings Row */}
      <section className="flex items-center gap-4">
        <div className="flex-1">
          <label className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2 block">
            @handle
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-500">@</span>
            <input
              type="text"
              value={formData.handle}
              onChange={(e) => updateField("handle", e.target.value)}
              placeholder="yourhandle"
              className="w-full h-9 pl-7 pr-3 text-sm bg-zinc-800 border border-zinc-700 focus:border-orange-500 focus:outline-none rounded-lg text-zinc-100 placeholder:text-zinc-600 transition-colors"
            />
          </div>
        </div>
        <div className="flex items-center gap-3 pt-5">
          <Switch
            checked={formData.numberTweets}
            onCheckedChange={(checked) => updateField("numberTweets", checked)}
          />
          <span className="text-xs text-zinc-400">Number tweets (1/7)</span>
        </div>
      </section>

      {/* Error Banner */}
      {error && (
        <div className="flex items-start gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p className="flex-1">{error}</p>
          <button onClick={onDismissError} className="cursor-pointer shrink-0">
            <X className="w-4 h-4 hover:text-red-300 transition-colors" />
          </button>
        </div>
      )}

      {/* Generate Button - Hidden on mobile (using sticky button instead) */}
      <div className="hidden lg:block">
        <button
          onClick={onGenerate}
          disabled={isGenerating || isDisabled || !formData.topic || !formData.keyPoints}
          className="w-full h-12 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Writing your thread...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              Generate Thread
            </>
          )}
        </button>
      </div>

      {/* Quick Examples */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-zinc-600">Try an example:</span>
        <button
          onClick={() => onLoadExample("featureLaunch")}
          className="text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer flex items-center gap-1"
        >
          <Rocket className="w-3 h-3" />
          Feature Launch
        </button>
        <button
          onClick={() => onLoadExample("lessonLearned")}
          className="text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer flex items-center gap-1"
        >
          <Lightbulb className="w-3 h-3" />
          Lesson Learned
        </button>
        <button
          onClick={() => onLoadExample("milestone")}
          className="text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer flex items-center gap-1"
        >
          <Target className="w-3 h-3" />
          Milestone
        </button>
      </div>
    </div>
  )
}
