'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Loader2, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import CountdownHero from './components/CountdownHero'
import GoalCard from './components/GoalCard'
import ChatBot from './components/ChatBot'
import NotifyForm from './components/NotifyForm'

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

const PHASE_FILTERS = ['All', 'Backend & Cloud', 'AI Engineering', 'Automation', 'Job Prep']

// Fallback data when database is unavailable (e.g., local dev without Vercel Postgres)
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

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [activePhase, setActivePhase] = useState('All')
  const [usingFallback, setUsingFallback] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [passwordInput, setPasswordInput] = useState('')
  const [isDestroyed, setIsDestroyed] = useState(false)

  useEffect(() => {
    // Check if the page has self-destructed (August 1, 2026 or later)
    if (new Date() >= new Date('2026-08-01T00:00:00Z')) {
      setIsDestroyed(true)
    }
    
    // Check if previously authenticated in this session
    if (typeof window !== 'undefined' && sessionStorage.getItem('goals_auth') === 'true') {
      setIsAuthenticated(true)
    }
  }, [])

  const fetchGoals = async () => {
    try {
      const res = await fetch('/api/goals')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      if (data.goals && data.goals.length > 0) {
        setGoals(data.goals)
        setUsingFallback(false)
      } else {
        // No goals in DB yet — use fallback
        setGoals(FALLBACK_GOALS)
        setUsingFallback(true)
      }
    } catch {
      // API error — use fallback
      setGoals(FALLBACK_GOALS)
      setUsingFallback(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGoals()
  }, [])

  const handleUpdateGoal = async (dayNumber: number, updates: { status?: string; hours_spent?: number; notes?: string }) => {
    if (usingFallback) {
      // Optimistic update for fallback mode
      setGoals((prev) =>
        prev.map((g) =>
          g.day_number === dayNumber
            ? {
                ...g,
                status: (updates.status as Goal['status']) || g.status,
                hours_spent: updates.hours_spent ?? g.hours_spent,
                notes: updates.notes ?? g.notes,
                completed_at: updates.status === 'completed' ? new Date().toISOString() : g.completed_at,
              }
            : g
        )
      )
      return
    }

    try {
      const res = await fetch('/api/goals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dayNumber, ...updates }),
      })

      if (res.ok) {
        const data = await res.json()
        setGoals((prev) =>
          prev.map((g) => (g.day_number === dayNumber ? { ...g, ...data.goal } : g))
        )
      }
    } catch (e) {
      console.error('Failed to update goal:', e)
    }
  }

  // Computed stats
  const completedDays = goals.filter((g) => g.status === 'completed').length
  const totalHours = goals.reduce((acc, g) => acc + (Number(g.hours_spent) || 0), 0)

  // Current streak calculation
  const currentStreak = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    let streak = 0
    const sorted = [...goals]
      .filter((g) => g.status === 'completed')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    for (const goal of sorted) {
      const goalDate = new Date(goal.date)
      goalDate.setHours(0, 0, 0, 0)
      const expectedDate = new Date(today)
      expectedDate.setDate(expectedDate.getDate() - streak)

      if (goalDate.getTime() === expectedDate.getTime()) {
        streak++
      } else if (goalDate.getTime() === expectedDate.getTime() - 86400000) {
        // Allow for yesterday check if today isn't completed yet
        streak++
      } else {
        break
      }
    }
    return streak
  }, [goals])

  // Determine today's day number
  const todayStr = new Date().toISOString().split('T')[0]

  // Filter goals
  const filteredGoals = activePhase === 'All' ? goals : goals.filter((g) => g.phase === activePhase)

  // Group goals by phase for section headers
  const phases = ['Backend & Cloud', 'AI Engineering', 'Automation', 'Job Prep']

  if (isDestroyed) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="text-6xl mb-6">💥</div>
          <h1 className="text-3xl md:text-5xl font-black text-rose-500 mb-4 tracking-tight">PAGE DESTROYED</h1>
          <p className="text-slate-400 font-bold max-w-md mx-auto">
            The 52-day sprint has ended. This page self-destructed on August 1st, 2026.
          </p>
          <Link href="/">
            <button className="mt-8 px-6 py-3 bg-slate-800 text-slate-100 font-bold border-2 border-slate-700 hover:border-emerald-500 transition-colors">
              RETURN TO PORTFOLIO
            </button>
          </Link>
        </motion.div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm bg-slate-900 border-4 border-emerald-500/30 p-8 shadow-[8px_8px_0px_0px_rgba(16,185,129,0.2)] text-center"
        >
          <div className="w-12 h-12 bg-emerald-500 flex items-center justify-center mx-auto mb-6 border-2 border-slate-950">
            <span className="text-2xl">🔒</span>
          </div>
          <h2 className="text-xl font-black text-slate-100 mb-2">ACCESS RESTRICTED</h2>
          <p className="text-xs font-bold text-slate-400 mb-6">Enter password to view the sprint.</p>
          
          <form onSubmit={(e) => {
            e.preventDefault();
            if (passwordInput === '2006') {
              setIsAuthenticated(true);
              sessionStorage.setItem('goals_auth', 'true');
            } else {
              alert('Incorrect password');
              setPasswordInput('');
            }
          }}>
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="••••"
              className="w-full bg-slate-800 border-4 border-slate-700 px-4 py-3 text-center text-xl font-bold text-slate-100 focus:border-emerald-500 focus:outline-none transition-colors mb-4"
              autoFocus
            />
            <button
              type="submit"
              className="w-full px-4 py-3 bg-emerald-500 text-slate-950 font-black text-sm border-2 border-slate-950 hover:bg-emerald-400 transition-colors"
            >
              UNLOCK
            </button>
          </form>
        </motion.div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-emerald-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-400 font-bold">Loading your sprint...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="bg-slate-950 text-white antialiased selection:bg-emerald-500/30 min-h-screen">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@700;800;900&display=swap');
        * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }
        ::-webkit-scrollbar { width: 10px; }
        ::-webkit-scrollbar-track { background: #020617; }
        ::-webkit-scrollbar-thumb { background: #10b981; border: 2px solid #020617; }
        ::-webkit-scrollbar-thumb:hover { background: #34d399; }
      `}</style>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur-xl border-b-4 border-emerald-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/">
            <motion.div
              className="flex items-center gap-3 text-slate-400 hover:text-emerald-400 transition-colors"
              whileHover={{ x: -3 }}
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-black text-sm hidden sm:inline">BACK TO PORTFOLIO</span>
            </motion.div>
          </Link>

          <h2 className="font-black text-lg sm:text-xl text-slate-100">
            🎯 <span className="text-emerald-400">GOAL</span> TRACKER
          </h2>

          <motion.button
            onClick={fetchGoals}
            className="p-2 text-slate-400 hover:text-emerald-400 transition-colors"
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.3 }}
          >
            <RefreshCw className="w-5 h-5" />
          </motion.button>
        </div>
      </nav>

      {/* Spacer for fixed nav */}
      <div className="h-16" />

      {/* Hero with Countdown */}
      <CountdownHero
        totalDays={goals.length}
        completedDays={completedDays}
        totalHours={totalHours}
        currentStreak={currentStreak}
      />

      {/* Phase Filter */}
      <section className="sticky top-16 z-30 bg-slate-950/95 backdrop-blur-xl border-b-4 border-slate-800 py-4 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {PHASE_FILTERS.map((phase) => {
            const count =
              phase === 'All'
                ? goals.length
                : goals.filter((g) => g.phase === phase).length
            return (
              <button
                key={phase}
                onClick={() => setActivePhase(phase)}
                className={`flex-shrink-0 px-4 py-2 border-4 font-black text-xs transition-all whitespace-nowrap ${
                  activePhase === phase
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                    : 'border-slate-700 text-slate-500 hover:border-slate-600 hover:text-slate-400'
                }`}
              >
                {phase.toUpperCase()} ({count})
              </button>
            )
          })}
        </div>
      </section>

      {/* Goals Grid */}
      <section className="py-12 sm:py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {activePhase === 'All' ? (
            // Grouped by phase
            phases.map((phase) => {
              const phaseGoals = goals.filter((g) => g.phase === phase)
              if (phaseGoals.length === 0) return null

              const phaseColors: Record<string, string> = {
                'Backend & Cloud': 'text-emerald-400 border-emerald-500',
                'AI Engineering': 'text-purple-400 border-purple-500',
                'Automation': 'text-amber-400 border-amber-400',
                'Job Prep': 'text-rose-400 border-rose-400',
              }

              const completed = phaseGoals.filter((g) => g.status === 'completed').length
              const colors = phaseColors[phase] || 'text-slate-400 border-slate-500'

              return (
                <motion.div
                  key={phase}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="mb-12"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <h3 className={`text-xl sm:text-2xl font-black ${colors.split(' ')[0]}`}>
                      {phase.toUpperCase()}
                    </h3>
                    <div className={`h-1 flex-1 ${colors.split(' ')[1].replace('border', 'bg')}/20`} />
                    <span className="text-sm font-black text-slate-500">
                      {completed}/{phaseGoals.length}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-3">
                    {phaseGoals.map((goal) => (
                      <GoalCard
                        key={goal.day_number}
                        goal={goal}
                        isToday={goal.date === todayStr}
                        onUpdate={handleUpdateGoal}
                      />
                    ))}
                  </div>
                </motion.div>
              )
            })
          ) : (
            // Filtered view
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-3">
              {filteredGoals.map((goal) => (
                <GoalCard
                  key={goal.day_number}
                  goal={goal}
                  isToday={goal.date === todayStr}
                  onUpdate={handleUpdateGoal}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Notification Section */}
      <NotifyForm />

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 bg-emerald-500 border-t-4 border-slate-950">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-950 font-black text-base">
            © 2026 MAULIK JOSHI — 52-DAY SPRINT
          </p>
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 bg-slate-950 rounded-full animate-pulse" />
            <span className="text-slate-950 font-black text-sm">
              {completedDays}/{goals.length} DAYS COMPLETED
            </span>
          </div>
        </div>
      </footer>

      {/* Chatbot */}
      <ChatBot />
    </main>
  )
}
