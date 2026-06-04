import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export const runtime = 'edge' // Edge runtime has a 30s timeout on Vercel Hobby!
export const maxDuration = 30 // Allow up to 30 seconds for long generation

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API Key not configured on the server.' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { topic, phase, description, day } = body

    if (!topic) {
      return NextResponse.json({ error: 'Topic is required.' }, { status: 400 })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const prompt = `
You are a no-nonsense senior engineer writing a practical study guide. The reader is a CS student who already knows how to code — don't talk down to them.

Topic: "${topic}" (Phase: ${phase}, Day ${day}/52)
Context: ${description}

Write a focused, practical technical guide in clean Markdown. Follow these rules strictly:

STYLE RULES:
- Be direct. No fluff, no cheerleading, no "like you're 5" analogies.
- Write like a senior dev explaining to a junior dev over coffee — casual but technical.
- Keep it under 1500 words. Quality over quantity.
- Use short paragraphs. No walls of text.

STRUCTURE (use these exact headers):
## Why This Matters
2-3 sentences on why this skill gets you hired. No generic motivational filler.

## Key Concepts
Explain the core ideas concisely. Use bullet points. Include gotchas and common mistakes.

## Hands-On: Build It
A single, focused code example that actually works. Pick the most relevant language (Python or Node.js preferred). Include inline comments for non-obvious parts only.

## Cheat Sheet
A quick-reference table or bullet list of commands, patterns, or rules to remember.

## Interview Prep
3-4 real interview questions with brief model answers (2-3 sentences each).

## Today's Task
One specific, achievable task they can finish in 1-2 hours. Be concrete — "Build X that does Y" not "explore and experiment."
    `

    const result = await model.generateContentStream(prompt)

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            controller.enqueue(new TextEncoder().encode(chunk.text()))
          }
        } catch (e) {
          controller.error(e)
        }
        controller.close()
      }
    })

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive'
      }
    })
  } catch (error: any) {
    console.error('Error generating guide:', error)
    return NextResponse.json(
      { error: `Failed to generate the guide. API Error: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    )
  }
}
