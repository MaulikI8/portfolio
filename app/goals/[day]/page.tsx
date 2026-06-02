'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Loader2, Sparkles, BookOpen, Clock, CalendarDays, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

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

export default function DayGuidePage({ params }: { params: { day: string } }) {
  const dayNumber = parseInt(params.day, 10)
  
  const [goal, setGoal] = useState<Goal | null>(null)
  const [loading, setLoading] = useState(true)
  const [guideContent, setGuideContent] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
            // Look for a cached guide in local storage
            const cachedGuide = localStorage.getItem(`guide_day_${dayNumber}`)
            if (cachedGuide) {
              setGuideContent(cachedGuide)
            }
          } else {
            setError('Day not found in your sprint plan.')
          }
        } else {
          setError('Failed to fetch goal data.')
        }
      } catch (err) {
        setError('Network error.')
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
      
      const data = await res.json()
      
      if (res.ok && data.guide) {
        setGuideContent(data.guide)
        // Cache it so we don't regenerate every page load
        localStorage.setItem(`guide_day_${dayNumber}`, data.guide)
      } else {
        setError(data.error || 'Failed to generate guide.')
      }
    } catch (err) {
      setError('Network error while talking to AI.')
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

          {!guideContent ? (
            <div className="text-center py-12">
              <Sparkles className="w-16 h-16 text-emerald-500/30 mx-auto mb-6" />
              <h3 className="text-2xl font-black text-slate-100 mb-4">NO GUIDE GENERATED YET</h3>
              <p className="text-slate-400 font-bold mb-8 max-w-lg mx-auto">
                Ready to learn? Click the button below to have your AI mentor generate a comprehensive, step-by-step tutorial specifically for today's topic.
              </p>
              
              <motion.button
                onClick={generateGuide}
                disabled={isGenerating}
                className="px-8 py-4 bg-emerald-500 text-slate-950 font-black text-lg border-4 border-slate-950 shadow-[6px_6px_0px_0px_rgba(2,6,23,1)] hover:shadow-[8px_8px_0px_0px_rgba(2,6,23,1)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 mx-auto"
                whileHover={{ y: -2, x: -2 }}
                whileTap={{ y: 0, x: 0, shadow: '4px_4px_0px_0px_rgba(2,6,23,1)' }}
              >
                {isGenerating ? (
                  <><Loader2 className="w-6 h-6 animate-spin" /> GENERATING SYLLABUS...</>
                ) : (
                  <><Sparkles className="w-6 h-6" /> GENERATE DETAILED GUIDE</>
                )}
              </motion.button>
            </div>
          ) : (
            <div className="prose prose-invert prose-emerald max-w-none prose-headings:font-black prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-a:text-emerald-400 prose-code:text-emerald-300 prose-code:bg-slate-800 prose-code:px-1 prose-code:py-0.5 prose-pre:bg-slate-950 prose-pre:border-2 prose-pre:border-slate-800 prose-strong:text-slate-100 prose-li:marker:text-emerald-500">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {guideContent}
              </ReactMarkdown>
              
              <div className="mt-12 pt-8 border-t-4 border-slate-800 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500">Generated by Gemini Pro</span>
                <button 
                  onClick={generateGuide} 
                  disabled={isGenerating}
                  className="text-xs font-black text-emerald-500 hover:text-emerald-400 transition-colors uppercase disabled:opacity-50"
                >
                  {isGenerating ? 'Regenerating...' : 'Regenerate Guide'}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </main>
  )
}
