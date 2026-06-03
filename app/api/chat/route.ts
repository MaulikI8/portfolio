import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { saveChatMessage, getChatHistory, initDatabase } from '../../../lib/db'

const SYSTEM_PROMPT = `You are Maulik's AI Coding Mentor — a friendly, knowledgeable assistant embedded in his portfolio website.

ABOUT MAULIK:
- 19 years old (turning 20 on July 24, 2026), from Nepal
- BSc Hons Computing student at London Metropolitan University (via Islington College, Kathmandu)
- Backend-focused Full-Stack Developer
- Skills: Java, Python, C#, Django, React, SQL, TypeScript
- Notable projects: Shipra OMS (warehouse management), CV Craft Pro (AI resume builder), Fintech mobile app (hackathon)
- Currently on a 52-day learning sprint to get a job before his 20th birthday
- Website: maulikjoshi.com

THE 52-DAY PLAN (June 3 - July 24, 2026):
- Phase 1 (Days 1-14): Advanced Backend & Cloud (Docker, APIs, Auth, CI/CD, Redis, Cloud deployment)
- Phase 2 (Days 15-28): AI Engineering (LLM APIs, LangChain, RAG, Vector DBs, Prompt Engineering)
- Phase 3 (Days 29-38): Automation & Scripting (Web scraping, Browser automation, Email automation, ETL)
- Phase 4 (Days 39-52): Portfolio & Job Prep (Resume, LinkedIn, Interviews, Applications)

YOUR ROLE:
- Answer coding questions clearly with code examples
- Give motivational support — Maulik is on a tight deadline
- Suggest project ideas related to the current day's topic
- Explain concepts in simple terms (avoid unnecessary jargon)
- If asked about Maulik's skills/projects, answer based on the info above
- Keep responses concise but thorough (under 500 words unless the topic needs more)
- Use emojis sparingly for personality
- Format code blocks properly with language tags`

export async function POST(request: NextRequest) {
  try {
    if (process.env.POSTGRES_URL) {
      try {
        await initDatabase()
      } catch (e) {
        console.error('DB init failed', e)
      }
    }

    const { message, sessionId, pageContext } = await request.json()

    if (!message || !sessionId) {
      return NextResponse.json(
        { error: 'message and sessionId are required' },
        { status: 400 }
      )
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API key not configured. Set GEMINI_API_KEY in environment variables.' },
        { status: 500 }
      )
    }

    // Save user message to DB (optional)
    try {
      if (process.env.POSTGRES_URL) {
        await saveChatMessage(sessionId, 'user', message)
      }
    } catch (e) {
      console.error('DB save failed', e)
    }

    // Fetch recent chat history for context (optional)
    let history: any[] = []
    try {
      if (process.env.POSTGRES_URL) {
        history = await getChatHistory(sessionId, 10)
      }
    } catch (e) {
      console.error('DB fetch failed', e)
    }

    // Build conversation for Gemini
    const genAI = new GoogleGenerativeAI(apiKey)
    const finalSystemPrompt = SYSTEM_PROMPT + (pageContext ? `\n\nCURRENT PAGE CONTEXT (Use this to understand what the user is currently looking at):\n${pageContext}` : '');

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash-latest',
    })

    const chatHistory = history.length > 0 ? history.slice(0, -1).map((msg) => ({
      role: msg.role === 'user' ? 'user' as const : 'model' as const,
      parts: [{ text: msg.content }],
    })) : []

    const chat = model.startChat({
      history: [
        { role: 'user', parts: [{ text: 'System instruction: ' + finalSystemPrompt }] },
        { role: 'model', parts: [{ text: 'Understood! How can I help today?' }] },
        ...chatHistory,
      ],
    })

    const result = await chat.sendMessage(message)
    const response = result.response.text()

    // Save AI response to DB (optional)
    try {
      if (process.env.POSTGRES_URL) {
        await saveChatMessage(sessionId, 'model', response)
      }
    } catch (e) {
      console.error('DB save response failed', e)
    }

    return NextResponse.json({ response }, { status: 200 })
  } catch (error) {
    console.error('❌ Chat API error:', error)
    return NextResponse.json(
      { error: `API Error: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    )
  }
}
