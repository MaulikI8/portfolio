'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Clock, BookOpen, X, Save, Loader2 } from 'lucide-react'
import Link from 'next/link'

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

interface GoalCardProps {
  goal: Goal
  isToday: boolean
  onUpdate: (dayNumber: number, updates: { status?: string; hours_spent?: number; notes?: string }) => Promise<void>
}

const phaseColors: Record<string, { border: string; bg: string; badge: string; text: string }> = {
  'Backend & Cloud': {
    border: 'border-emerald-500/40',
    bg: 'hover:bg-emerald-500/5',
    badge: 'bg-emerald-500 text-slate-950',
    text: 'text-emerald-400',
  },
  'AI Engineering': {
    border: 'border-purple-500/40',
    bg: 'hover:bg-purple-500/5',
    badge: 'bg-purple-500 text-white',
    text: 'text-purple-400',
  },
  'Automation': {
    border: 'border-amber-400/40',
    bg: 'hover:bg-amber-400/5',
    badge: 'bg-amber-400 text-slate-950',
    text: 'text-amber-400',
  },
  'Job Prep': {
    border: 'border-rose-400/40',
    bg: 'hover:bg-rose-400/5',
    badge: 'bg-rose-400 text-slate-950',
    text: 'text-rose-400',
  },
}

const statusConfig = {
  pending: { icon: BookOpen, label: 'PENDING', color: 'text-slate-500', bg: 'bg-slate-700' },
  'in-progress': { icon: Clock, label: 'IN PROGRESS', color: 'text-amber-400', bg: 'bg-amber-400/20' },
  completed: { icon: CheckCircle2, label: 'DONE', color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
}

export default function GoalCard({ goal, isToday, onUpdate }: GoalCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editStatus, setEditStatus] = useState(goal.status)
  const [editHours, setEditHours] = useState(goal.hours_spent)
  const [editNotes, setEditNotes] = useState(goal.notes || '')
  const [isSaving, setIsSaving] = useState(false)

  const colors = phaseColors[goal.phase] || phaseColors['Backend & Cloud']
  const status = statusConfig[goal.status]
  const StatusIcon = status.icon

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onUpdate(goal.day_number, {
        status: editStatus,
        hours_spent: editHours,
        notes: editNotes,
      })
      setIsModalOpen(false)
    } catch (e) {
      console.error('Failed to save:', e)
    } finally {
      setIsSaving(false)
    }
  }

  const formattedDate = new Date(goal.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })

  return (
    <>
      {/* Card */}
      <motion.div
        onClick={() => setIsModalOpen(true)}
        className={`relative cursor-pointer bg-slate-900 border-4 ${colors.border} ${colors.bg} p-4 sm:p-5 transition-all duration-200 shadow-[3px_3px_0px_0px_rgba(2,6,23,0.8)] ${
          isToday ? 'ring-2 ring-emerald-400 ring-offset-2 ring-offset-slate-950' : ''
        }`}
        whileHover={{ x: -3, y: -3, boxShadow: '6px 6px 0px 0px rgba(2,6,23,0.8)' }}
        whileTap={{ scale: 0.98 }}
        layout
      >
        {/* Today indicator */}
        {isToday && (
          <motion.div
            className="absolute -top-2 -right-2 px-2 py-1 bg-emerald-400 text-slate-950 font-black text-[10px] border-2 border-slate-950"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            TODAY
          </motion.div>
        )}

        {/* Day number + date */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-black text-slate-600">DAY {goal.day_number}</span>
          <span className="text-xs font-bold text-slate-600">{formattedDate}</span>
        </div>

        {/* Topic */}
        <h3 className="text-sm sm:text-base font-black text-slate-100 mb-2 leading-tight line-clamp-2">
          {goal.topic}
        </h3>

        {/* Status + Hours */}
        <div className="flex items-center justify-between mt-3">
          <div className={`flex items-center gap-1.5 px-2 py-1 ${status.bg} rounded-sm`}>
            <StatusIcon className={`w-3 h-3 ${status.color}`} />
            <span className={`text-[10px] font-black ${status.color}`}>{status.label}</span>
          </div>
          {goal.hours_spent > 0 && (
            <span className="text-xs font-bold text-slate-500">
              {goal.hours_spent}h
            </span>
          )}
        </div>
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-slate-900 border-4 border-emerald-500/40 p-6 sm:p-8 w-full max-w-lg shadow-[8px_8px_0px_0px_rgba(2,6,23,1)]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <span className={`inline-block px-3 py-1 ${colors.badge} font-black text-xs mb-2`}>
                    {goal.phase} — DAY {goal.day_number}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-100">{goal.topic}</h2>
                  <p className="text-sm text-slate-400 font-bold mt-1">{formattedDate}</p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Description */}
              <p className="text-slate-300 font-bold text-sm leading-relaxed mb-6">
                {goal.description}
              </p>

              {/* Status Selector */}
              <div className="mb-5">
                <label className="text-xs font-black text-slate-500 mb-2 block">STATUS</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['pending', 'in-progress', 'completed'] as const).map((s) => {
                    const cfg = statusConfig[s]
                    const Icon = cfg.icon
                    return (
                      <button
                        key={s}
                        onClick={() => setEditStatus(s)}
                        className={`flex items-center justify-center gap-2 px-3 py-3 border-4 font-black text-xs transition-all ${
                          editStatus === s
                            ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                            : 'border-slate-700 text-slate-400 hover:border-slate-600'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {cfg.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Hours Spent */}
              <div className="mb-5">
                <label className="text-xs font-black text-slate-500 mb-2 block">HOURS SPENT</label>
                <input
                  type="number"
                  min="0"
                  max="24"
                  step="0.5"
                  value={editHours}
                  onChange={(e) => setEditHours(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-800 border-4 border-slate-700 px-4 py-3 text-slate-100 font-bold focus:border-emerald-500 focus:outline-none transition-colors"
                />
              </div>

              {/* Notes */}
              <div className="mb-6">
                <label className="text-xs font-black text-slate-500 mb-2 block">NOTES</label>
                <textarea
                  rows={3}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="What did you learn? Any resources used?"
                  className="w-full bg-slate-800 border-4 border-slate-700 px-4 py-3 text-slate-100 font-bold focus:border-emerald-500 focus:outline-none transition-colors resize-none placeholder:text-slate-600"
                />
              </div>

              {/* Save Button */}
              <motion.button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full px-6 py-4 bg-emerald-500 text-slate-950 font-black text-lg border-4 border-slate-950 shadow-[4px_4px_0px_0px_rgba(2,6,23,1)] flex items-center justify-center gap-3 disabled:opacity-50 mb-4"
                whileHover={{ x: -4, y: -4, boxShadow: '8px 8px 0px 0px rgba(2,6,23,1)' }}
                whileTap={{ x: 0, y: 0, boxShadow: '4px 4px 0px 0px rgba(2,6,23,1)' }}
              >
                {isSaving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                {isSaving ? 'SAVING...' : 'SAVE PROGRESS'}
              </motion.button>

              {/* View Guide Link */}
              <Link href={`/goals/${goal.day_number}`}>
                <button className="w-full px-6 py-4 bg-slate-800 text-emerald-400 font-black text-sm border-4 border-slate-700 hover:border-emerald-500 transition-colors flex items-center justify-center gap-3">
                  <BookOpen className="w-4 h-4" />
                  VIEW DETAILED GUIDE
                </button>
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
