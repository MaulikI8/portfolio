'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Clock, Flame, CheckCircle2, Target, Calendar } from 'lucide-react'

interface CountdownHeroProps {
  totalDays: number
  completedDays: number
  totalHours: number
  currentStreak: number
}

export default function CountdownHero({ totalDays, completedDays, totalHours, currentStreak }: CountdownHeroProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  const deadline = new Date('2026-07-24T00:00:00+05:45')
  const progress = totalDays > 0 ? (completedDays / totalDays) * 100 : 0

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date()
      const diff = deadline.getTime() - now.getTime()

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        return
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // SVG Progress Ring
  const radius = 90
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <section className="relative py-16 sm:py-24 px-4 sm:px-6 bg-slate-950 overflow-hidden">
      {/* Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_2px,transparent_2px),linear-gradient(90deg,rgba(16,185,129,0.03)_2px,transparent_2px)] bg-[size:40px_40px]" />

      {/* Floating accent shapes */}
      <motion.div
        className="hidden md:block absolute top-10 right-16 w-20 h-20 border-8 border-emerald-500/20"
        animate={{ rotate: 360 }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="hidden md:block absolute bottom-10 left-16 w-16 h-16 bg-amber-400/10 rounded-full"
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-block px-6 py-3 bg-emerald-500 text-slate-950 font-black text-sm mb-6 border-4 border-slate-950 shadow-[4px_4px_0px_0px_rgba(2,6,23,1)]">
            🎯 52-DAY SPRINT TO HIREABILITY
          </div>
          <h1 className="text-4xl sm:text-6xl md:text-8xl font-black text-slate-100 leading-tight">
            COUNTDOWN
            <br />
            <span className="text-emerald-400 drop-shadow-[0_0_30px_rgba(16,185,129,0.4)]">TO GOAL</span>
          </h1>
        </motion.div>

        {/* Main Grid: Countdown + Progress Ring */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center mb-12">
          {/* Countdown Timer */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="grid grid-cols-4 gap-3 sm:gap-4">
              {[
                { value: timeLeft.days, label: 'DAYS' },
                { value: timeLeft.hours, label: 'HRS' },
                { value: timeLeft.minutes, label: 'MIN' },
                { value: timeLeft.seconds, label: 'SEC' },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="bg-slate-900 border-4 border-emerald-500/30 p-4 sm:p-6 text-center shadow-[4px_4px_0px_0px_rgba(16,185,129,0.3)]"
                >
                  <div className="text-3xl sm:text-5xl md:text-6xl font-black text-emerald-400 tabular-nums">
                    {String(item.value).padStart(2, '0')}
                  </div>
                  <div className="text-xs sm:text-sm font-black text-slate-500 mt-2">
                    {item.label}
                  </div>
                </motion.div>
              ))}
            </div>

            <p className="text-center text-slate-400 font-bold mt-4 text-sm sm:text-base">
              Until July 24, 2026 — My 20th Birthday 🎂
            </p>
          </motion.div>

          {/* Progress Ring */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="flex justify-center"
          >
            <div className="relative">
              <svg width="220" height="220" className="transform -rotate-90">
                {/* Background ring */}
                <circle
                  cx="110"
                  cy="110"
                  r={radius}
                  stroke="#1e293b"
                  strokeWidth="12"
                  fill="none"
                />
                {/* Progress ring */}
                <motion.circle
                  cx="110"
                  cy="110"
                  r={radius}
                  stroke="#10b981"
                  strokeWidth="12"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl sm:text-5xl font-black text-emerald-400">
                  {Math.round(progress)}%
                </span>
                <span className="text-sm font-bold text-slate-400">COMPLETE</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { icon: CheckCircle2, label: 'Days Done', value: completedDays, color: 'text-emerald-400', bg: 'border-emerald-500/30' },
            { icon: Target, label: 'Days Left', value: totalDays - completedDays, color: 'text-amber-400', bg: 'border-amber-400/30' },
            { icon: Clock, label: 'Hours Logged', value: totalHours.toFixed(1), color: 'text-sky-400', bg: 'border-sky-400/30' },
            { icon: Flame, label: 'Day Streak', value: currentStreak, color: 'text-rose-400', bg: 'border-rose-400/30' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + i * 0.1 }}
              className={`bg-slate-900 border-4 ${stat.bg} p-4 sm:p-5 text-center shadow-[3px_3px_0px_0px_rgba(2,6,23,0.8)]`}
            >
              <stat.icon className={`w-6 h-6 ${stat.color} mx-auto mb-2`} />
              <div className={`text-2xl sm:text-3xl font-black ${stat.color}`}>{stat.value}</div>
              <div className="text-xs font-black text-slate-500 mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
