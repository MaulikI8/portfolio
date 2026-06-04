'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Loader2, Sparkles, BookOpen, Clock, CalendarDays, CheckCircle2, Copy, Check, Send, Bot, User, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import ChatBot from '../components/ChatBot'

// ChatGPT-style code block with language header and copy button
function CodeBlock({ className, children, ...props }: any) {
  const [copied, setCopied] = useState(false)
  const match = /language-(\w+)/.exec(className || '')
  const lang = match ? match[1] : ''
  const code = String(children).replace(/\n$/, '')

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [code])

  // Inline code (no language class)
  if (!match) {
    return (
      <code className="bg-slate-800 text-emerald-300 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
        {children}
      </code>
    )
  }

  // Fenced code block
  return (
    <div className="my-4 rounded-lg overflow-hidden border border-slate-700 bg-slate-950">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800/80 border-b border-slate-700">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{lang}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-emerald-400 transition-colors"
        >
          {copied ? (
            <><Check className="w-3.5 h-3.5" /> Copied!</>
          ) : (
            <><Copy className="w-3.5 h-3.5" /> Copy</>
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto overflow-y-hidden !bg-transparent !border-0 !m-0">
        <code className={`text-sm font-mono leading-relaxed text-slate-200 ${className}`} {...props}>
          {children}
        </code>
      </pre>
    </div>
  )
}

interface Goal {
  id: number
  day_number: number
  date: string
  phase: string
  topic: string
  description: string
  status: 'pending' | 'in-progress' | 'completed'
  hours_spent: number
  notes: string | null
  completed_at: string | null
}

// Fallback data when database is unavailable
const FALLBACK_GOALS: Goal[] = [
  { id: 1, day_number: 1, date: '2026-06-03', phase: 'Backend & Cloud', topic: 'REST API Best Practices', description: 'Pagination, Filtering, Sorting — learn how production APIs handle large datasets efficiently.', status: 'pending', hours_spent: 0, notes: null, completed_at: null },
  { id: 2, day_number: 2, date: '2026-06-04', phase: 'Backend & Cloud', topic: 'API Security 101', description: 'Rate Limiting, CORS, OWASP Top 10 — protect your APIs from common attack vectors.', status: 'pending', hours_spent: 0, notes: null, completed_at: null },
  { id: 3, day_number: 3, date: '2026-06-05', phase: 'Backend & Cloud', topic: 'Advanced Authentication (JWT)', description: 'Deep dive into JWT tokens, refresh token rotation, and secure session management.', status: 'pending', hours_spent: 0, notes: null, completed_at: null },
  { id: 4, day_number: 4, date: '2026-06-06', phase: 'Backend & Cloud', topic: 'OAuth 2.0 Implementation', description: 'Implement "Login with Google/GitHub" — understand authorization code flow.', status: 'pending', hours_spent: 0, notes: null, completed_at: null },
  { id: 5, day_number: 5, date: '2026-06-07', phase: 'Backend & Cloud', topic: 'Docker Basics', description: 'Containerizing a Python/Django or Java app — write your first Dockerfile.', status: 'pending', hours_spent: 0, notes: null, completed_at: null },
  { id: 6, day_number: 6, date: '2026-06-08', phase: 'Backend & Cloud', topic: 'Docker Compose', description: 'Running app + PostgreSQL together — multi-container orchestration.', status: 'pending', hours_spent: 0, notes: null, completed_at: null },
  { id: 7, day_number: 7, date: '2026-06-09', phase: 'Backend & Cloud', topic: 'CI/CD with GitHub Actions', description: 'Writing a workflow to run tests automatically on every push.', status: 'pending', hours_spent: 0, notes: null, completed_at: null },
  { id: 8, day_number: 8, date: '2026-06-10', phase: 'Backend & Cloud', topic: 'Cloud Foundations', description: 'Setting up AWS/Azure, understanding IAM, regions, and basic services.', status: 'pending', hours_spent: 0, notes: null, completed_at: null },
  { id: 9, day_number: 9, date: '2026-06-11', phase: 'Backend & Cloud', topic: 'Database Hosting', description: 'Deploying a managed PostgreSQL DB on AWS RDS or Azure Database.', status: 'pending', hours_spent: 0, notes: null, completed_at: null },
  { id: 10, day_number: 10, date: '2026-06-12', phase: 'Backend & Cloud', topic: 'App Deployment', description: 'Deploying a Dockerized app to AWS EC2 or Azure App Service.', status: 'pending', hours_spent: 0, notes: null, completed_at: null },
  { id: 11, day_number: 11, date: '2026-06-13', phase: 'Backend & Cloud', topic: 'Caching with Redis', description: 'Introduction to Redis for faster API responses and session storage.', status: 'pending', hours_spent: 0, notes: null, completed_at: null },
  { id: 12, day_number: 12, date: '2026-06-14', phase: 'Backend & Cloud', topic: 'Message Queues & Celery', description: 'Background task processing — offload heavy work from your API.', status: 'pending', hours_spent: 0, notes: null, completed_at: null },
  { id: 13, day_number: 13, date: '2026-06-15', phase: 'Backend & Cloud', topic: 'Microservices Architecture', description: 'Understanding when and why to split a monolith into services.', status: 'pending', hours_spent: 0, notes: null, completed_at: null },
  { id: 14, day_number: 14, date: '2026-06-16', phase: 'Backend & Cloud', topic: 'Phase 1 Mini-Project', description: 'Deploy a secure, containerized, cached API to the cloud. Tie everything together.', status: 'pending', hours_spent: 0, notes: null, completed_at: null },
  { id: 15, day_number: 15, date: '2026-06-17', phase: 'AI Engineering', topic: 'LLM API Basics', description: 'Setting up OpenAI/Gemini API in Python — your first AI-powered script.', status: 'pending', hours_spent: 0, notes: null, completed_at: null },
  { id: 16, day_number: 16, date: '2026-06-18', phase: 'AI Engineering', topic: 'Prompt Engineering for Devs', description: 'System prompts, few-shot learning, and formatting JSON output from LLMs.', status: 'pending', hours_spent: 0, notes: null, completed_at: null },
  { id: 17, day_number: 17, date: '2026-06-19', phase: 'AI Engineering', topic: 'Building a Chat Endpoint', description: 'Create a backend API that wraps an LLM with conversation memory.', status: 'pending', hours_spent: 0, notes: null, completed_at: null },
  { id: 18, day_number: 18, date: '2026-06-20', phase: 'AI Engineering', topic: 'Introduction to LangChain', description: 'Chains, Models, and Output Parsers — the framework for AI apps.', status: 'pending', hours_spent: 0, notes: null, completed_at: null },
  { id: 19, day_number: 19, date: '2026-06-21', phase: 'AI Engineering', topic: 'Data Parsing with AI', description: 'Extracting structured data from unstructured text (invoices, emails, etc.).', status: 'pending', hours_spent: 0, notes: null, completed_at: null },
  { id: 20, day_number: 20, date: '2026-06-22', phase: 'AI Engineering', topic: 'Vector Databases', description: 'What are embeddings? Setting up Pinecone or ChromaDB.', status: 'pending', hours_spent: 0, notes: null, completed_at: null },
  { id: 21, day_number: 21, date: '2026-06-23', phase: 'AI Engineering', topic: 'Document Ingestion', description: 'Reading PDFs, chunking text, and creating embeddings for search.', status: 'pending', hours_spent: 0, notes: null, completed_at: null },
  { id: 22, day_number: 22, date: '2026-06-24', phase: 'AI Engineering', topic: 'RAG Step 1: Retrieval', description: 'Searching a vector database to find relevant context for a query.', status: 'pending', hours_spent: 0, notes: null, completed_at: null },
  { id: 23, day_number: 23, date: '2026-06-25', phase: 'AI Engineering', topic: 'RAG Step 2: Generation', description: 'Combining retrieved context with an LLM to answer questions accurately.', status: 'pending', hours_spent: 0, notes: null, completed_at: null },
  { id: 24, day_number: 24, date: '2026-06-26', phase: 'AI Engineering', topic: 'Agentic AI Basics', description: 'Giving the LLM tools — search, math, code execution.', status: 'pending', hours_spent: 0, notes: null, completed_at: null },
  { id: 25, day_number: 25, date: '2026-06-27', phase: 'AI Engineering', topic: 'AI Error Handling', description: 'What to do when the LLM hallucinates, timeouts, or returns garbage.', status: 'pending', hours_spent: 0, notes: null, completed_at: null },
  { id: 26, day_number: 26, date: '2026-06-28', phase: 'AI Engineering', topic: 'Optimizing AI Costs', description: 'Token counting, model selection, and caching strategies.', status: 'pending', hours_spent: 0, notes: null, completed_at: null },
  { id: 27, day_number: 27, date: '2026-06-29', phase: 'AI Engineering', topic: 'Vision APIs', description: 'Using AI to analyze images — receipt scanning, object detection.', status: 'pending', hours_spent: 0, notes: null, completed_at: null },
  { id: 28, day_number: 28, date: '2026-06-30', phase: 'AI Engineering', topic: 'Phase 2 Mini-Project', description: 'Add a RAG chatbot to your OMS or Fintech app. Full integration.', status: 'pending', hours_spent: 0, notes: null, completed_at: null },
  { id: 29, day_number: 29, date: '2026-07-01', phase: 'Automation', topic: 'Advanced Web Scraping', description: 'BeautifulSoup for static sites, handling pagination and rate limits.', status: 'pending', hours_spent: 0, notes: null, completed_at: null },
  { id: 30, day_number: 30, date: '2026-07-02', phase: 'Automation', topic: 'Browser Automation', description: 'Selenium/Playwright basics — automating browser interactions.', status: 'pending', hours_spent: 0, notes: null, completed_at: null },
  { id: 31, day_number: 31, date: '2026-07-03', phase: 'Automation', topic: 'Task Scheduling', description: 'Cron jobs, Windows Task Scheduler — running scripts at specific times.', status: 'pending', hours_spent: 0, notes: null, completed_at: null },
  { id: 32, day_number: 32, date: '2026-07-04', phase: 'Automation', topic: 'Email Automation', description: 'Sending automated emails via SendGrid/Nodemailer with templates.', status: 'pending', hours_spent: 0, notes: null, completed_at: null },
  { id: 33, day_number: 33, date: '2026-07-05', phase: 'Automation', topic: 'ChatOps & Bot Building', description: 'Creating a Slack/Discord bot that reports server status.', status: 'pending', hours_spent: 0, notes: null, completed_at: null },
  { id: 34, day_number: 34, date: '2026-07-06', phase: 'Automation', topic: 'Data Pipelines (ETL)', description: 'Extract → Transform → Load: moving data between systems automatically.', status: 'pending', hours_spent: 0, notes: null, completed_at: null },
  { id: 35, day_number: 35, date: '2026-07-07', phase: 'Automation', topic: 'File Automation', description: 'Scripts to organize, rename, convert, or process files in bulk.', status: 'pending', hours_spent: 0, notes: null, completed_at: null },
  { id: 36, day_number: 36, date: '2026-07-08', phase: 'Automation', topic: 'System Monitoring', description: 'Writing a script that checks if your website is up and alerts you.', status: 'pending', hours_spent: 0, notes: null, completed_at: null },
  { id: 37, day_number: 37, date: '2026-07-09', phase: 'Automation', topic: 'Test Automation', description: 'Writing automated test suites with pytest/JUnit.', status: 'pending', hours_spent: 0, notes: null, completed_at: null },
  { id: 38, day_number: 38, date: '2026-07-10', phase: 'Automation', topic: 'Phase 3 Mini-Project', description: 'Build a job-posting scraper that emails you daily summaries.', status: 'pending', hours_spent: 0, notes: null, completed_at: null },
  { id: 39, day_number: 39, date: '2026-07-11', phase: 'Job Prep', topic: 'Portfolio Goals Page (Design)', description: 'Design and build the /goals tracker page on maulikjoshi.com.', status: 'pending', hours_spent: 0, notes: null, completed_at: null },
  { id: 40, day_number: 40, date: '2026-07-12', phase: 'Job Prep', topic: 'Portfolio Goals Page (Backend)', description: 'API routes, database, and chatbot integration.', status: 'pending', hours_spent: 0, notes: null, completed_at: null },
  { id: 41, day_number: 41, date: '2026-07-13', phase: 'Job Prep', topic: 'Portfolio Goals Page (Frontend)', description: 'Interactive UI, animations, responsive layout.', status: 'pending', hours_spent: 0, notes: null, completed_at: null },
  { id: 42, day_number: 42, date: '2026-07-14', phase: 'Job Prep', topic: 'Portfolio Goals Page (Deploy)', description: 'Deploy, test, and polish the final version.', status: 'pending', hours_spent: 0, notes: null, completed_at: null },
  { id: 43, day_number: 43, date: '2026-07-15', phase: 'Job Prep', topic: 'Resume Revamp', description: 'Highlight OMS, Fintech, and new AI skills on your resume.', status: 'pending', hours_spent: 0, notes: null, completed_at: null },
  { id: 44, day_number: 44, date: '2026-07-16', phase: 'Job Prep', topic: 'LinkedIn Optimization', description: 'Professional headline, featured projects, and recruiter-friendly profile.', status: 'pending', hours_spent: 0, notes: null, completed_at: null },
  { id: 45, day_number: 45, date: '2026-07-17', phase: 'Job Prep', topic: 'System Design Interview Prep', description: 'How to talk about scaling apps — load balancers, databases, caching.', status: 'pending', hours_spent: 0, notes: null, completed_at: null },
  { id: 46, day_number: 46, date: '2026-07-18', phase: 'Job Prep', topic: 'Behavioral Interview Prep', description: 'The STAR method — Situation, Task, Action, Result.', status: 'pending', hours_spent: 0, notes: null, completed_at: null },
  { id: 47, day_number: 47, date: '2026-07-19', phase: 'Job Prep', topic: 'Mock Technical Interviews', description: 'Practice explaining your code and architecture decisions out loud.', status: 'pending', hours_spent: 0, notes: null, completed_at: null },
  { id: 48, day_number: 48, date: '2026-07-20', phase: 'Job Prep', topic: 'Open Source Contribution', description: 'Find a small bug on GitHub and submit your first PR.', status: 'pending', hours_spent: 0, notes: null, completed_at: null },
  { id: 49, day_number: 49, date: '2026-07-21', phase: 'Job Prep', topic: 'Cold Outreach Strategy', description: 'How to message engineers and recruiters on LinkedIn effectively.', status: 'pending', hours_spent: 0, notes: null, completed_at: null },
  { id: 50, day_number: 50, date: '2026-07-22', phase: 'Job Prep', topic: 'Apply to 20 Jobs', description: 'Targeted applications with customized cover letters.', status: 'pending', hours_spent: 0, notes: null, completed_at: null },
  { id: 51, day_number: 51, date: '2026-07-23', phase: 'Job Prep', topic: 'Buffer Day', description: 'Interview prep, finishing touches on portfolio, or catching up.', status: 'pending', hours_spent: 0, notes: null, completed_at: null },
  { id: 52, day_number: 52, date: '2026-07-24', phase: 'Job Prep', topic: 'Birthday! 🎂', description: 'July 24th — Happy 20th Birthday! Celebrate your massive growth.', status: 'pending', hours_spent: 0, notes: null, completed_at: null },
]

export default function DayGuidePage({ params }: { params: { day: string } }) {
  const dayNumber = parseInt(params.day, 10)
  
  const [goal, setGoal] = useState<Goal | null>(null)
  const [loading, setLoading] = useState(true)
  const [guideContent, setGuideContent] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Interactive lesson mode
  const [lessonActive, setLessonActive] = useState(false)
  const [lessonMessages, setLessonMessages] = useState<{role: 'user' | 'model', content: string}[]>([])
  const [lessonInput, setLessonInput] = useState('')
  const [isLessonLoading, setIsLessonLoading] = useState(false)
  const lessonEndRef = useRef<HTMLDivElement>(null)

  // Inline reply chat state (for full guide mode)
  const [replyMessages, setReplyMessages] = useState<{role: 'user' | 'model', content: string}[]>([])
  const [replyInput, setReplyInput] = useState('')
  const [isReplying, setIsReplying] = useState(false)
  const replyEndRef = useRef<HTMLDivElement>(null)

  const LESSON_SYSTEM_PROMPT = `You are a senior engineer teaching a CS student one-on-one. The student already knows how to code.

Topic: "${goal?.topic}" (Phase: ${goal?.phase}, Day ${goal?.day_number}/52)
Context: ${goal?.description}

TEACHING RULES:
- Teach ONE section at a time. After each section, STOP and wait for the student to respond.
- Keep each section short (150-300 words max). Use code examples where relevant.
- Be conversational. Ask them if they understood, or give them a small challenge before moving on.
- Use markdown formatting for code blocks and emphasis.
- Do NOT dump the entire guide at once.

LESSON FLOW (teach in this order, one at a time):
1. First message: Brief intro — why this topic matters for getting hired. End with "Ready to dive in?"
2. Core concept #1 — explain the first key idea. End with a quick comprehension check.
3. Core concept #2 — next idea. Include a code snippet.
4. Core concept #3 — if applicable.
5. Hands-on challenge — give them a specific small coding task to try.
6. Interview prep — 2-3 questions they might get asked, with brief answers.
7. Wrap-up — summarize what they learned and suggest what to build today.

If the student asks a question mid-lesson, answer it, then continue where you left off.
If they say "next", "continue", "got it", "yes", or similar, proceed to the next section.
If they seem confused, explain differently — don't just repeat yourself.`

  const sendLessonMessage = async (text: string) => {
    if (!text.trim() || isLessonLoading) return

    const userMsg = { role: 'user' as const, content: text.trim() }
    const updatedMessages = [...lessonMessages, userMsg]
    setLessonMessages(updatedMessages)
    setLessonInput('')
    setIsLessonLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          sessionId: `lesson_day_${dayNumber}`,
          history: lessonMessages,
          systemPromptOverride: LESSON_SYSTEM_PROMPT,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setLessonMessages(prev => [...prev, { role: 'model', content: data.response }])
      } else {
        setLessonMessages(prev => [...prev, { role: 'model', content: `⚠️ ${data.error || 'Something went wrong.'}` }])
      }
    } catch {
      setLessonMessages(prev => [...prev, { role: 'model', content: '⚠️ Network error. Try again.' }])
    } finally {
      setIsLessonLoading(false)
      setTimeout(() => lessonEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    }
  }

  const startLesson = () => {
    setLessonActive(true)
    setLessonMessages([])
    sendLessonMessage(`I'm ready to learn about "${goal?.topic}". Teach me step by step.`)
  }

  useEffect(() => {
    if (lessonMessages.length > 0) {
      setTimeout(() => lessonEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    }
  }, [lessonMessages])

  useEffect(() => {
    // Fetch goals and find the one for this day
    const fetchGoal = async () => {
      try {
        const res = await fetch('/api/goals')
        if (res.ok) {
          const data = await res.json()
          const found = data.goals.find((g: Goal) => g.day_number === dayNumber)
          if (found) {
            setGoal(found)
            try {
              const cachedGuide = localStorage.getItem(`guide_day_${dayNumber}`)
              if (cachedGuide) {
                setGuideContent(cachedGuide)
              }
            } catch (e) {
              // ignore
            }
          } else {
            setError('Day not found in your sprint plan.')
          }
        } else {
          // If fetch fails (e.g. database not seeded), use fallback data
          const found = FALLBACK_GOALS.find((g: Goal) => g.day_number === dayNumber)
          if (found) {
            setGoal(found)
            try {
              const cachedGuide = localStorage.getItem(`guide_day_${dayNumber}`)
              if (cachedGuide) {
                setGuideContent(cachedGuide)
              }
            } catch (e) {
              // ignore
            }
          } else {
            setError('Day not found in your sprint plan.')
          }
        }
      } catch (err) {
        // Use fallback on network error
        const found = FALLBACK_GOALS.find((g: Goal) => g.day_number === dayNumber)
        if (found) {
          setGoal(found)
          try {
            const cachedGuide = localStorage.getItem(`guide_day_${dayNumber}`)
            if (cachedGuide) {
              setGuideContent(cachedGuide)
            }
          } catch (e) {
            // ignore
          }
        } else {
          setError('Network error and could not load fallback data.')
        }
      } finally {
        setLoading(false)
      }
    }
    
    fetchGoal()
  }, [dayNumber])

  const generateGuide = async () => {
    if (!goal) return
    
    setIsGenerating(true)
    setError(null)
    
    try {
      const res = await fetch('/api/guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          day: goal.day_number,
          topic: goal.topic,
          phase: goal.phase,
          description: goal.description
        })
      })
      
      if (!res.ok) {
        const text = await res.text()
        throw new Error(`Server Error (${res.status}): ${text.substring(0, 100)}...`)
      }

      const reader = res.body?.getReader()
      if (!reader) throw new Error('Response body stream is missing')

      const decoder = new TextDecoder()
      let fullText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        fullText += chunk
        setGuideContent(fullText)
      }
      
      // Cache it so we don't regenerate every page load
      try {
        localStorage.setItem(`guide_day_${dayNumber}`, fullText)
      } catch (e) {
        // Ignore restricted storage errors
      }
    } catch (err: any) {
      setError(`Network error: ${err.message || String(err)}`)
    } finally {
      setIsGenerating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mb-4" />
        <h2 className="text-slate-100 font-black tracking-widest text-xl">LOADING DAY {dayNumber}</h2>
      </div>
    )
  }

  if (error || !goal) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-slate-100 font-black text-2xl mb-2">ERROR</h2>
        <p className="text-rose-400 font-bold mb-8">{error || 'Something went wrong.'}</p>
        <Link href="/goals">
          <button className="px-6 py-3 border-4 border-emerald-500 text-emerald-400 font-black hover:bg-emerald-500 hover:text-slate-950 transition-colors">
            BACK TO DASHBOARD
          </button>
        </Link>
      </div>
    )
  }

  return (
    <main className="bg-slate-950 text-slate-200 antialiased selection:bg-emerald-500/30 min-h-screen pb-24">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur-xl border-b-4 border-emerald-500/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/goals">
            <motion.div
              className="flex items-center gap-2 text-slate-400 hover:text-emerald-400 transition-colors font-black text-sm"
              whileHover={{ x: -3 }}
            >
              <ArrowLeft className="w-5 h-5" />
              SPRINT DASHBOARD
            </motion.div>
          </Link>
          <div className="font-black text-sm text-slate-500">
            DAY {goal.day_number} OF 52
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-12">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="inline-block px-4 py-1 border-2 border-emerald-500/30 text-emerald-400 font-black text-xs mb-4 uppercase">
            PHASE: {goal.phase}
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-slate-100 mb-6 leading-tight tracking-tight">
            {goal.topic}
          </h1>
          <p className="text-xl font-bold text-slate-400 mb-8 border-l-4 border-slate-700 pl-4">
            {goal.description}
          </p>

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 bg-slate-900 border-2 border-slate-800 px-4 py-2 font-bold text-sm text-slate-300">
              <CalendarDays className="w-4 h-4 text-emerald-500" />
              {new Date(goal.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </div>
            {goal.status === 'completed' && (
              <div className="flex items-center gap-2 bg-emerald-500/10 border-2 border-emerald-500/30 px-4 py-2 font-bold text-sm text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                Completed ({goal.hours_spent}h)
              </div>
            )}
          </div>
        </motion.div>

        {/* AI Guide Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-900 border-4 border-slate-800 p-6 sm:p-10 shadow-[8px_8px_0px_0px_rgba(2,6,23,1)]"
        >
          <div className="flex items-center gap-3 mb-8 pb-8 border-b-4 border-slate-800">
            <div className="w-12 h-12 bg-emerald-500 flex items-center justify-center border-4 border-slate-950 shadow-[4px_4px_0px_0px_rgba(2,6,23,1)]">
              <BookOpen className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-100">STUDY GUIDE</h2>
              <p className="text-sm font-bold text-slate-500">Custom tailored AI curriculum for today.</p>
            </div>
          </div>

          {!guideContent && !lessonActive ? (
            <div className="text-center py-12">
              <Sparkles className="w-16 h-16 text-emerald-500/30 mx-auto mb-6" />
              <h3 className="text-2xl font-black text-slate-100 mb-4">READY TO LEARN?</h3>
              <p className="text-slate-400 font-bold mb-8 max-w-lg mx-auto">
                Choose how you want to learn today's topic.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  onClick={startLesson}
                  disabled={isLessonLoading}
                  className="px-8 py-4 bg-emerald-500 text-slate-950 font-black text-lg border-4 border-slate-950 shadow-[6px_6px_0px_0px_rgba(2,6,23,1)] hover:shadow-[8px_8px_0px_0px_rgba(2,6,23,1)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 mx-auto sm:mx-0"
                  whileHover={{ y: -2, x: -2 }}
                  whileTap={{ y: 0, x: 0 }}
                >
                  <MessageCircle className="w-6 h-6" /> INTERACTIVE LESSON
                </motion.button>

                <motion.button
                  onClick={generateGuide}
                  disabled={isGenerating}
                  className="px-8 py-4 bg-slate-800 text-slate-300 font-black text-lg border-4 border-slate-700 shadow-[6px_6px_0px_0px_rgba(2,6,23,1)] hover:shadow-[8px_8px_0px_0px_rgba(2,6,23,1)] hover:border-emerald-500/50 hover:text-emerald-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 mx-auto sm:mx-0"
                  whileHover={{ y: -2, x: -2 }}
                  whileTap={{ y: 0, x: 0 }}
                >
                  {isGenerating ? (
                    <><Loader2 className="w-6 h-6 animate-spin" /> GENERATING...</>
                  ) : (
                    <><BookOpen className="w-6 h-6" /> FULL GUIDE</>
                  )}
                </motion.button>
              </div>
            </div>
          ) : lessonActive ? (
            /* Interactive Lesson Mode */
            <div>
              <div className="space-y-4 mb-6">
                {lessonMessages.filter(m => !(m.role === 'user' && lessonMessages.indexOf(m) === 0)).map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'model' && (
                      <div className="w-8 h-8 bg-emerald-500 flex-shrink-0 flex items-center justify-center mt-1 border-2 border-slate-950 rounded-sm">
                        <Bot className="w-4 h-4 text-slate-950" />
                      </div>
                    )}
                    <div className={`max-w-[85%] px-5 py-3 text-sm font-bold leading-relaxed rounded-lg ${
                      msg.role === 'user'
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-800 text-slate-200 border border-slate-700'
                    }`}>
                      {msg.role === 'model' ? (
                        <div className="prose prose-invert prose-emerald prose-sm max-w-none prose-pre:bg-transparent prose-pre:border-0 prose-pre:p-0 prose-headings:font-black prose-strong:text-slate-100">
                          <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ code: CodeBlock }}>
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <div className="whitespace-pre-wrap break-words">{msg.content}</div>
                      )}
                    </div>
                    {msg.role === 'user' && (
                      <div className="w-8 h-8 bg-slate-700 flex-shrink-0 flex items-center justify-center mt-1 border-2 border-slate-600 rounded-sm">
                        <User className="w-4 h-4 text-slate-300" />
                      </div>
                    )}
                  </motion.div>
                ))}

                {isLessonLoading && (
                  <div className="flex gap-3 items-start">
                    <div className="w-8 h-8 bg-emerald-500 flex-shrink-0 flex items-center justify-center border-2 border-slate-950 rounded-sm">
                      <Bot className="w-4 h-4 text-slate-950" />
                    </div>
                    <div className="bg-slate-800 border border-slate-700 px-5 py-3 rounded-lg">
                      <div className="flex gap-1.5">
                        <motion.div className="w-2 h-2 bg-emerald-400 rounded-full" animate={{ y: [0, -6, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} />
                        <motion.div className="w-2 h-2 bg-emerald-400 rounded-full" animate={{ y: [0, -6, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }} />
                        <motion.div className="w-2 h-2 bg-emerald-400 rounded-full" animate={{ y: [0, -6, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }} />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={lessonEndRef} />
              </div>

              {/* Quick reply buttons + input */}
              <div className="sticky bottom-0 bg-slate-900 pt-4 border-t-2 border-slate-800">
                <div className="flex gap-2 mb-3 flex-wrap">
                  {['Continue', 'Explain more', 'Show me code', 'Give me a challenge'].map(q => (
                    <button
                      key={q}
                      onClick={() => sendLessonMessage(q)}
                      disabled={isLessonLoading}
                      className="px-3 py-1.5 bg-slate-800 border border-slate-700 text-xs font-bold text-slate-400 hover:border-emerald-500/50 hover:text-emerald-400 transition-all rounded-full disabled:opacity-50"
                    >
                      {q}
                    </button>
                  ))}
                </div>
                <form onSubmit={(e) => { e.preventDefault(); sendLessonMessage(lessonInput) }} className="flex gap-2">
                  <input
                    type="text"
                    value={lessonInput}
                    onChange={(e) => setLessonInput(e.target.value)}
                    placeholder="Ask a question or type 'continue'..."
                    disabled={isLessonLoading}
                    className="flex-1 bg-slate-800 border-2 border-slate-700 px-4 py-3 text-sm font-bold text-slate-100 focus:border-emerald-500 focus:outline-none transition-colors placeholder:text-slate-600 disabled:opacity-50 rounded-lg"
                  />
                  <motion.button
                    type="submit"
                    disabled={isLessonLoading || !lessonInput.trim()}
                    className="px-4 py-3 bg-emerald-500 text-slate-950 border-2 border-slate-950 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isLessonLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </motion.button>
                </form>
              </div>
            </div>
          ) : (
            <div className="prose prose-invert prose-emerald max-w-none prose-headings:font-black prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-a:text-emerald-400 prose-strong:text-slate-100 prose-li:marker:text-emerald-500 prose-pre:bg-transparent prose-pre:border-0 prose-pre:p-0">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  code: CodeBlock,
                }}
              >
                {guideContent}
              </ReactMarkdown>
              
              <div className="mt-12 pt-8 border-t-4 border-slate-800 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500">Generated by Gemini</span>
                <button 
                  onClick={generateGuide} 
                  disabled={isGenerating}
                  className="text-xs font-black text-emerald-500 hover:text-emerald-400 transition-colors uppercase disabled:opacity-50"
                >
                  {isGenerating ? 'Regenerating...' : 'Regenerate Guide'}
                </button>
              </div>

              {/* Inline Reply Chat */}
              <div className="mt-8 pt-8 border-t-4 border-slate-800">
                <div className="flex items-center gap-2 mb-4">
                  <Bot className="w-5 h-5 text-emerald-500" />
                  <h3 className="font-black text-sm text-slate-300 uppercase tracking-wider">Ask about this guide</h3>
                </div>

                {replyMessages.length > 0 && (
                  <div className="space-y-3 mb-4 max-h-[400px] overflow-y-auto pr-2">
                    {replyMessages.map((msg, i) => (
                      <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'model' && (
                          <div className="w-6 h-6 bg-emerald-500 flex-shrink-0 flex items-center justify-center mt-1 border-2 border-slate-950 rounded-sm">
                            <Bot className="w-3 h-3 text-slate-950" />
                          </div>
                        )}
                        <div className={`max-w-[85%] px-4 py-2.5 text-sm font-bold leading-relaxed rounded-lg ${
                          msg.role === 'user'
                            ? 'bg-emerald-500 text-slate-950'
                            : 'bg-slate-800 text-slate-200 border border-slate-700'
                        }`}>
                          <div className="whitespace-pre-wrap break-words">{msg.content}</div>
                        </div>
                        {msg.role === 'user' && (
                          <div className="w-6 h-6 bg-slate-700 flex-shrink-0 flex items-center justify-center mt-1 border-2 border-slate-600 rounded-sm">
                            <User className="w-3 h-3 text-slate-300" />
                          </div>
                        )}
                      </div>
                    ))}
                    {isReplying && (
                      <div className="flex gap-2 items-start">
                        <div className="w-6 h-6 bg-emerald-500 flex-shrink-0 flex items-center justify-center border-2 border-slate-950 rounded-sm">
                          <Bot className="w-3 h-3 text-slate-950" />
                        </div>
                        <div className="bg-slate-800 border border-slate-700 px-4 py-3 rounded-lg">
                          <div className="flex gap-1.5">
                            <motion.div className="w-2 h-2 bg-emerald-400 rounded-full" animate={{ y: [0, -6, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} />
                            <motion.div className="w-2 h-2 bg-emerald-400 rounded-full" animate={{ y: [0, -6, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }} />
                            <motion.div className="w-2 h-2 bg-emerald-400 rounded-full" animate={{ y: [0, -6, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }} />
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={replyEndRef} />
                  </div>
                )}

                <form onSubmit={async (e) => {
                  e.preventDefault()
                  if (!replyInput.trim() || isReplying) return
                  const text = replyInput.trim()
                  setReplyMessages(prev => [...prev, { role: 'user', content: text }])
                  setReplyInput('')
                  setIsReplying(true)
                  try {
                    const res = await fetch('/api/chat', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        message: text,
                        sessionId: `guide_reply_day_${dayNumber}`,
                        pageContext: `User is reading the AI-generated study guide for Day ${dayNumber}. Topic: ${goal?.topic}. Guide content excerpt: ${guideContent?.substring(0, 2000)}`,
                        history: replyMessages,
                      }),
                    })
                    const data = await res.json()
                    if (res.ok) {
                      setReplyMessages(prev => [...prev, { role: 'model', content: data.response }])
                    } else {
                      setReplyMessages(prev => [...prev, { role: 'model', content: `⚠️ ${data.error || 'Something went wrong.'}` }])
                    }
                  } catch {
                    setReplyMessages(prev => [...prev, { role: 'model', content: '⚠️ Network error. Try again.' }])
                  } finally {
                    setIsReplying(false)
                    setTimeout(() => replyEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
                  }
                }} className="flex gap-2">
                  <input
                    type="text"
                    value={replyInput}
                    onChange={(e) => setReplyInput(e.target.value)}
                    placeholder="Ask a follow-up question about this guide..."
                    disabled={isReplying}
                    className="flex-1 bg-slate-800 border-2 border-slate-700 px-4 py-3 text-sm font-bold text-slate-100 focus:border-emerald-500 focus:outline-none transition-colors placeholder:text-slate-600 disabled:opacity-50 rounded-lg"
                  />
                  <motion.button
                    type="submit"
                    disabled={isReplying || !replyInput.trim()}
                    className="px-4 py-3 bg-emerald-500 text-slate-950 border-2 border-slate-950 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isReplying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </motion.button>
                </form>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      <ChatBot 
        pageContext={`User is viewing Day ${goal.day_number} of 52. 
        Phase: ${goal.phase}. 
        Topic: ${goal.topic}. 
        Description: ${goal.description}. 
        Generated Guide Content excerpt: ${guideContent ? guideContent.substring(0, 1500) + '...' : 'Not generated yet'}`} 
      />
    </main>
  )
}
