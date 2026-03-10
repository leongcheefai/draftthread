import Anthropic from "@anthropic-ai/sdk"
import { type NextRequest, NextResponse } from "next/server"

const anthropic = new Anthropic()

const PLATFORM_RULES = {
  x: {
    maxChars: 280,
    idealTweets: "5-8",
    style: "punchy, no fluff, one idea per tweet, no hashtags unless essential",
    hookStyle:
      "controversial take, bold claim, or curiosity-gap opener. NO 'I' as first word.",
  },
  threads: {
    maxChars: 500,
    idealTweets: "4-6",
    style:
      "slightly longer, more conversational, Meta/Instagram audience, warmer tone",
    hookStyle:
      "relatable opener, story-based, or question. More personal than X.",
  },
} as const

const THREAD_TYPE_GUIDES = {
  lesson:
    "Structure as: hook (the hard lesson) → context → 3-5 specific insights → what you wish you knew → CTA",
  launch:
    "Structure as: hook (the big announcement) → problem it solves → how it works → who it is for → proof/traction → CTA",
  milestone:
    "Structure as: hook (the milestone number) → where you started → key turning points → what worked → what did not → CTA",
  story:
    "Structure as: hook (the dramatic moment) → backstory → the journey → the climax → the lesson → CTA",
  listicle:
    "Structure as: hook (X things I learned/found/built) → one insight per tweet, specific and actionable → CTA",
} as const

const SYSTEM_PROMPT = `You are an expert social media ghostwriter specialising in viral threads for indie hackers and SaaS founders. You write threads that feel authentic, specific, and valuable — never generic or hype-filled.

Rules you always follow:
- Every thread starts with a scroll-stopping hook tweet
- Each tweet contains ONE idea only — no cramming
- Be specific with numbers, timeframes, and details — vague is forgettable
- Write like a smart human, not a marketing bot
- Never use hollow phrases like "game-changer", "revolutionary", "unlock your potential"
- Hook tweet never starts with "I" — start with the insight, result, or question
- CTA tweet is specific — not just "follow me", but WHY they should follow or what to do next
- Return ONLY valid JSON, no markdown fences, no preamble`

interface GenerateRequest {
  platform: "x" | "threads"
  threadType: "lesson" | "launch" | "milestone" | "story" | "listicle"
  tone: "professional" | "casual" | "bold" | "educational"
  topic: string
  keyPoints: string
  cta: string
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as GenerateRequest
    const { platform, threadType, tone, topic, keyPoints, cta } = body

    if (!topic?.trim() || !keyPoints?.trim()) {
      return NextResponse.json(
        { error: "Topic and key points are required" },
        { status: 400 }
      )
    }

    const rules = PLATFORM_RULES[platform]
    const typeGuide = THREAD_TYPE_GUIDES[threadType]

    const userPrompt = `Create a ${platform === "x" ? "Twitter/X" : "Threads"} thread about:

TOPIC: ${topic}

KEY POINTS TO COVER:
${keyPoints}

DESIRED CTA: ${cta}

THREAD TYPE: ${threadType}
STRUCTURE GUIDE: ${typeGuide}

TONE: ${tone}
PLATFORM RULES:
- Max characters per post: ${rules.maxChars}
- Ideal number of posts: ${rules.idealTweets}
- Style: ${rules.style}
- Hook style: ${rules.hookStyle}

Return a JSON object with this exact shape:
{
  "platform": "${platform}",
  "tweets": [
    {
      "index": 1,
      "content": "hook tweet text here",
      "charCount": 0,
      "type": "hook"
    },
    {
      "index": 2,
      "content": "insight tweet text here",
      "charCount": 0,
      "type": "insight"
    },
    {
      "index": N,
      "content": "cta tweet text here",
      "charCount": 0,
      "type": "cta"
    }
  ],
  "totalTweets": N
}

Calculate charCount accurately for each tweet. Do not exceed ${rules.maxChars} characters per tweet.`

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    })

    const textBlock = response.content.find((block) => block.type === "text")
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json(
        { error: "No text response from AI" },
        { status: 500 }
      )
    }

    // Strip markdown fences if present
    const clean = textBlock.text.replace(/```json|```/g, "").trim()

    const parsed = JSON.parse(clean)

    // Recalculate charCount client-side (source of truth)
    parsed.tweets = parsed.tweets.map(
      (t: { content: string; index: number; type: string }) => ({
        ...t,
        charCount: t.content.length,
      })
    )

    return NextResponse.json(parsed)
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Failed to parse AI response. Please try again." },
        { status: 500 }
      )
    }
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
