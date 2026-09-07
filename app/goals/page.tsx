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

import { GOALS_DATA } from './data';

// Fallback data when database is unavailable
const FALLBACK_GOALS: Goal[] = GOALS_DATA as Goal[];

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
