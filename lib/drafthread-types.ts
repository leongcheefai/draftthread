export type Platform = "x" | "threads"
export type ThreadType = "lesson" | "launch" | "milestone" | "story" | "listicle"
export type Tone = "professional" | "casual" | "bold" | "educational"
export type TweetType = "hook" | "insight" | "cta"

export interface Tweet {
  index: number
  type: TweetType
  content: string
  charCount: number
}

export interface ThreadData {
  platform: Platform
  totalTweets: number
  tweets: Tweet[]
}

export interface FormData {
  topic: string
  keyPoints: string
  cta: string
  handle: string
  threadType: ThreadType
  tone: Tone
  numberTweets: boolean
}
