'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Loader2, Sparkles, Bot, User } from 'lucide-react'

interface Message {
  role: 'user' | 'model'
  content: string
}

interface ChatBotProps {
  pageContext?: string
}

export default function ChatBot({ pageContext }: ChatBotProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('chatSessionId')
      if (saved) return saved
      const id = 'session_' + Date.now() + '_' + Math.random().toString(36).substring(7)
      localStorage.setItem('chatSessionId', id)
      return id
    }
    return 'session_default'
  })
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const quickQuestions = [
    "What should I learn today?",
    "Explain Docker to me",
    "Give me a project idea",
    "How do I use the Gemini API?",
  ]

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return

    const userMessage: Message = { role: 'user', content: text.trim() }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text.trim(), sessionId, pageContext }),
      })

      const data = await res.json()

      if (res.ok) {
        setMessages((prev) => [...prev, { role: 'model', content: data.response }])
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'model', content: `⚠️ ${data.error || 'Something went wrong. Try again!'}` },
        ])
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'model', content: '⚠️ Network error. Check your connection and try again.' },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  // Simple markdown-like formatting for code blocks
  const formatMessage = (content: string) => {
    const parts = content.split(/(```[\s\S]*?```)/g)
    return parts.map((part, i) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const code = part.slice(3, -3)
        const firstNewline = code.indexOf('\n')
        const lang = firstNewline > -1 ? code.slice(0, firstNewline).trim() : ''
        const codeBody = firstNewline > -1 ? code.slice(firstNewline + 1) : code
        return (
          <div key={i} className="my-2 rounded overflow-hidden">
            {lang && (
              <div className="bg-slate-700 px-3 py-1 text-[10px] font-bold text-slate-400 uppercase">
                {lang}
              </div>
            )}
            <pre className="bg-slate-800 p-3 overflow-x-auto text-xs text-emerald-300 font-mono leading-relaxed">
              <code>{codeBody}</code>
            </pre>
          </div>
        )
      }

      // Handle inline code
      const inlineParts = part.split(/(`[^`]+`)/g)
      return (
        <span key={i}>
          {inlineParts.map((ip, j) =>
            ip.startsWith('`') && ip.endsWith('`') ? (
              <code key={j} className="bg-slate-700 px-1.5 py-0.5 rounded text-emerald-300 text-xs font-mono">
                {ip.slice(1, -1)}
              </code>
            ) : (
              <span key={j}>{ip}</span>
            )
          )}
        </span>
      )
    })
  }

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 p-4 bg-emerald-500 text-slate-950 border-4 border-slate-950 shadow-[4px_4px_0px_0px_rgba(2,6,23,1)] hover:shadow-[6px_6px_0px_0px_rgba(2,6,23,1)]"
        whileHover={{ x: -2, y: -2 }}
        whileTap={{ scale: 0.95 }}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-4 sm:right-6 z-40 w-[calc(100vw-2rem)] sm:w-[420px] h-[500px] sm:h-[560px] bg-slate-950 border-4 border-emerald-500/40 shadow-[8px_8px_0px_0px_rgba(2,6,23,1)] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-slate-900 border-b-4 border-emerald-500/30 px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-500 flex items-center justify-center border-2 border-slate-950">
                <Sparkles className="w-4 h-4 text-slate-950" />
              </div>
              <div>
                <h3 className="font-black text-sm text-slate-100">AI CODING MENTOR</h3>
                <p className="text-[10px] font-bold text-emerald-400">Powered by Gemini • Online</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <Bot className="w-12 h-12 text-emerald-500/30 mx-auto mb-3" />
                  <p className="text-sm font-bold text-slate-500 mb-4">
                    Ask me anything about coding, the 52-day plan, or your career!
                  </p>
                  <div className="space-y-2">
                    {quickQuestions.map((q) => (
                      <button
                        key={q}
                        onClick={() => sendMessage(q)}
                        className="block w-full text-left px-3 py-2 bg-slate-900 border-2 border-slate-700 text-slate-300 text-xs font-bold hover:border-emerald-500/50 hover:text-emerald-400 transition-all"
                      >
                        💬 {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'model' && (
                    <div className="w-6 h-6 bg-emerald-500 flex-shrink-0 flex items-center justify-center mt-1 border-2 border-slate-950">
                      <Bot className="w-3 h-3 text-slate-950" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] px-3 py-2 text-sm font-bold leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-emerald-500 text-slate-950 border-2 border-slate-950'
                        : 'bg-slate-800 text-slate-200 border-2 border-slate-700'
                    }`}
                  >
                    {msg.role === 'model' ? (
                      <div className="whitespace-pre-wrap break-words">{formatMessage(msg.content)}</div>
                    ) : (
                      msg.content
                    )}
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-6 h-6 bg-slate-700 flex-shrink-0 flex items-center justify-center mt-1 border-2 border-slate-600">
                      <User className="w-3 h-3 text-slate-300" />
                    </div>
                  )}
                </motion.div>
              ))}

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-2 items-start"
                >
                  <div className="w-6 h-6 bg-emerald-500 flex-shrink-0 flex items-center justify-center border-2 border-slate-950">
                    <Bot className="w-3 h-3 text-slate-950" />
                  </div>
                  <div className="bg-slate-800 border-2 border-slate-700 px-4 py-3">
                    <div className="flex gap-1.5">
                      <motion.div
                        className="w-2 h-2 bg-emerald-400 rounded-full"
                        animate={{ y: [0, -6, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                      />
                      <motion.div
                        className="w-2 h-2 bg-emerald-400 rounded-full"
                        animate={{ y: [0, -6, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
                      />
                      <motion.div
                        className="w-2 h-2 bg-emerald-400 rounded-full"
                        animate={{ y: [0, -6, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="border-t-4 border-emerald-500/30 p-3 bg-slate-900 flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
                disabled={isLoading}
                className="flex-1 bg-slate-800 border-3 border-slate-700 px-4 py-3 text-sm font-bold text-slate-100 focus:border-emerald-500 focus:outline-none transition-colors placeholder:text-slate-600 disabled:opacity-50"
              />
              <motion.button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="px-4 py-3 bg-emerald-500 text-slate-950 border-3 border-slate-950 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
