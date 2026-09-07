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

import { GOALS_DATA } from '../data';

// Fallback data when database is unavailable
const FALLBACK_GOALS: Goal[] = GOALS_DATA as Goal[];

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
    setTimeout(() => lessonEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)

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
                    <div className={`max-w-[85%] px-5 py-4 text-[15px] font-medium leading-relaxed rounded-xl ${
                      msg.role === 'user'
                        ? 'bg-emerald-500 text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-200 border border-slate-700'
                    }`}>
                      {msg.role === 'model' ? (
                        <div className="prose prose-invert prose-emerald max-w-none prose-p:leading-loose prose-p:mb-4 prose-li:mb-2 prose-pre:bg-transparent prose-pre:border-0 prose-pre:p-0 prose-headings:font-black prose-strong:text-emerald-400">
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
                        <div className={`max-w-[85%] px-5 py-4 text-[15px] font-medium leading-relaxed rounded-xl ${
                          msg.role === 'user'
                            ? 'bg-emerald-500 text-slate-950 font-bold'
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
                  setTimeout(() => replyEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
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
