import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

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
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' })

    const prompt = `
      You are an expert senior software engineer mentoring a junior developer named Maulik Joshi. 
      Maulik is on Day ${day} of his 52-day sprint to get a backend/fullstack job by his 20th birthday.
      
      His topic for today is: "${topic}" (Phase: ${phase}).
      The brief description is: "${description}".

      Write a highly detailed, comprehensive, and engaging technical guide for Maulik to learn this topic today.
      
      Format the output in clean Markdown. Your response MUST include:
      1. A brief introduction explaining WHY this topic is important in real-world jobs.
      2. Core concepts explained simply (like he is 5).
      3. A step-by-step tutorial or practical implementation guide.
      4. ACTUAL CODE EXAMPLES (in Python, Node.js, Java, or Bash depending on context) with comments.
      5. Common interview questions related to this topic.
      6. A small homework/action item for him to complete today.

      Use engaging, encouraging language. Use bolding and headers to make it readable.
    `

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    return NextResponse.json({ guide: text })
  } catch (error: any) {
    console.error('Error generating guide:', error)
    return NextResponse.json(
      { error: 'Failed to generate the guide. The AI might be taking a break.' },
      { status: 500 }
    )
  }
}
