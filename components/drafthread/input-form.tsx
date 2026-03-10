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

const focusRing = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"

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
      <fieldset>
        <legend className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
          Platform
        </legend>
        <div className="flex gap-3" role="radiogroup" aria-label="Platform">
          <button
            role="radio"
            aria-checked={platform === "x"}
            onClick={() => setPlatform("x")}
            className={`flex-1 h-16 flex flex-col items-center justify-center gap-1 rounded-xl border-2 transition-all ${focusRing} ${
              platform === "x"
                ? "border-foreground bg-accent"
                : "border-accent bg-secondary hover:border-muted-foreground"
            }`}
          >
            <span className="text-xl font-black text-foreground" aria-hidden="true">&#x1D54F;</span>
            <span className="text-xs text-accent-foreground">280 chars · 5-8 tweets</span>
          </button>
          <button
            role="radio"
            aria-checked={platform === "threads"}
            onClick={() => setPlatform("threads")}
            className={`flex-1 h-16 flex flex-col items-center justify-center gap-1 rounded-xl border-2 transition-all ${focusRing} ${
              platform === "threads"
                ? "border-purple-500 bg-accent"
                : "border-accent bg-secondary hover:border-muted-foreground"
            }`}
          >
            <span className="text-xl font-black text-purple-400" aria-hidden="true">@</span>
            <span className="text-xs text-accent-foreground">500 chars · 4-6 posts</span>
          </button>
        </div>
      </fieldset>

      {/* Thread Type */}
      <fieldset>
        <legend className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
          Thread Type
        </legend>
        <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Thread type">
          {THREAD_TYPES.map(({ type, label, icon }) => (
            <button
              key={type}
              role="radio"
              aria-checked={formData.threadType === type}
              onClick={() => updateField("threadType", type)}
              className={`p-3 flex flex-col items-center gap-1 rounded-xl border transition-all ${focusRing} ${
                formData.threadType === type
                  ? "border-primary bg-primary/10"
                  : "border-accent bg-secondary hover:border-muted-foreground"
              }`}
            >
              <span className={formData.threadType === type ? "text-primary" : "text-accent-foreground"} aria-hidden="true">
                {icon}
              </span>
              <span className="text-xs font-medium text-secondary-foreground">{label}</span>
            </button>
          ))}
        </div>
      </fieldset>

      {/* Tone */}
      <fieldset>
        <legend className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
          Tone
        </legend>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Tone">
          {TONES.map((tone) => (
            <button
              key={tone}
              role="radio"
              aria-checked={formData.tone === tone}
              onClick={() => updateField("tone", tone)}
              className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors capitalize ${focusRing} ${
                formData.tone === tone
                  ? "border-primary text-primary bg-primary/10"
                  : "border-accent text-accent-foreground bg-transparent hover:border-muted-foreground"
              }`}
            >
              {tone}
            </button>
          ))}
        </div>
      </fieldset>

      {/* Content Inputs */}
      <div>
        <label htmlFor="topic" className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 block">
          Topic
        </label>
        <textarea
          id="topic"
          value={formData.topic}
          onChange={(e) => updateField("topic", e.target.value)}
          placeholder="What is this thread about?"
          className="w-full h-20 resize-none bg-secondary border border-accent focus:border-primary focus:outline-none rounded-lg p-3 text-sm text-foreground placeholder:text-muted-foreground/70 transition-colors"
        />
      </div>

      <div>
        <label htmlFor="key-points" className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 block">
          Key Points
        </label>
        <textarea
          id="key-points"
          value={formData.keyPoints}
          onChange={(e) => updateField("keyPoints", e.target.value)}
          placeholder="Paste notes, bullet points, anything..."
          aria-describedby="key-points-hint"
          className="w-full h-36 resize-none bg-secondary border border-accent focus:border-primary focus:outline-none rounded-lg p-3 text-sm text-foreground placeholder:text-muted-foreground/70 transition-colors"
        />
        <p id="key-points-hint" className="text-xs text-muted-foreground/70 mt-1.5">
          Raw notes, bullet points, or a paragraph — AI will structure it
        </p>
      </div>

      <div>
        <label htmlFor="cta" className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 block">
          Call to Action
        </label>
        <textarea
          id="cta"
          value={formData.cta}
          onChange={(e) => updateField("cta", e.target.value)}
          placeholder="What should readers do after reading?"
          aria-describedby="cta-hint"
          className="w-full h-16 resize-none bg-secondary border border-accent focus:border-primary focus:outline-none rounded-lg p-3 text-sm text-foreground placeholder:text-muted-foreground/70 transition-colors"
        />
        <p id="cta-hint" className="text-xs text-muted-foreground/70 mt-1.5">e.g., Follow for more, DM me, Check the link in bio</p>
      </div>

      {/* Settings Row */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <label htmlFor="handle" className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2 block">
            @handle
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground" aria-hidden="true">@</span>
            <input
              id="handle"
              type="text"
              value={formData.handle}
              onChange={(e) => updateField("handle", e.target.value)}
              placeholder="yourhandle"
              className="w-full h-9 pl-7 pr-3 text-sm bg-secondary border border-accent focus:border-primary focus:outline-none rounded-lg text-foreground placeholder:text-muted-foreground/70 transition-colors"
            />
          </div>
        </div>
        <div className="flex items-center gap-3 pt-5">
          <Switch
            id="number-tweets"
            checked={formData.numberTweets}
            onCheckedChange={(checked) => updateField("numberTweets", checked)}
            aria-label="Number tweets"
          />
          <label htmlFor="number-tweets" className="text-xs text-accent-foreground">Number tweets (1/7)</label>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive-foreground text-sm"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
          <p className="flex-1">{error}</p>
          <button
            onClick={onDismissError}
            aria-label="Dismiss error"
            className={`shrink-0 p-1 -m-1 ${focusRing}`}
          >
            <X className="w-4 h-4 hover:text-destructive transition-colors" />
          </button>
        </div>
      )}

      {/* Generate Button - Hidden on mobile (using sticky button instead) */}
      <div className="hidden lg:block">
        <button
          onClick={onGenerate}
          disabled={isGenerating || isDisabled || !formData.topic || !formData.keyPoints}
          className={`w-full h-12 bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 ${focusRing}`}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              Writing your thread...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" aria-hidden="true" />
              Generate Thread
            </>
          )}
        </button>
      </div>

      {/* Quick Examples */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-muted-foreground/70">Try an example:</span>
        <button
          onClick={() => onLoadExample("featureLaunch")}
          className={`text-muted-foreground hover:text-secondary-foreground transition-colors flex items-center gap-1 ${focusRing} rounded px-1 py-0.5`}
        >
          <Rocket className="w-3 h-3" aria-hidden="true" />
          Feature Launch
        </button>
        <button
          onClick={() => onLoadExample("lessonLearned")}
          className={`text-muted-foreground hover:text-secondary-foreground transition-colors flex items-center gap-1 ${focusRing} rounded px-1 py-0.5`}
        >
          <Lightbulb className="w-3 h-3" aria-hidden="true" />
          Lesson Learned
        </button>
        <button
          onClick={() => onLoadExample("milestone")}
          className={`text-muted-foreground hover:text-secondary-foreground transition-colors flex items-center gap-1 ${focusRing} rounded px-1 py-0.5`}
        >
          <Target className="w-3 h-3" aria-hidden="true" />
          Milestone
        </button>
      </div>
    </div>
  )
}
