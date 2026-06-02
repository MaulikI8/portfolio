'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Phone, Send, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

export default function NotifyForm() {
  const [type, setType] = useState<'email' | 'sms' | 'both'>('email')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSending(true)
    setResult(null)

    const to = type === 'sms' ? phone : email
    if (!to) {
      setResult({ success: false, message: 'Please enter a valid email or phone number.' })
      setIsSending(false)
      return
    }

    try {
      const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })

      const body = `
        <h2 style="color: #10b981; margin: 0 0 12px;">📅 ${today}</h2>
        <p style="margin: 0 0 8px; color: #cbd5e1;"><strong>Reminder:</strong> Stay on track with your 52-day sprint!</p>
        <p style="margin: 0; color: #94a3b8;">Check your daily goal at <a href="https://maulikjoshi.dev/goals" style="color: #10b981;">maulikjoshi.dev/goals</a></p>
      `

      const res = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: type === 'both' ? 'both' : type,
          to,
          subject: `🎯 Daily Goal Reminder — ${today}`,
          body,
        }),
      })

      const data = await res.json()
      setResult({
        success: data.success,
        message: data.message || (data.success ? 'Notification sent!' : 'Failed to send.'),
      })
    } catch {
      setResult({ success: false, message: 'Network error. Please try again.' })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 bg-slate-900">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-block px-6 py-3 bg-rose-400 text-slate-950 font-black text-sm mb-6 border-4 border-slate-950 shadow-[4px_4px_0px_0px_rgba(2,6,23,1)]">
              📬 NOTIFICATIONS
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-100 mb-4">
              DAILY
              <span className="text-rose-400"> REMINDERS</span>
            </h2>
            <p className="text-base sm:text-lg font-bold text-slate-400 max-w-xl mx-auto">
              Get notified about your daily goals via email or SMS.
              Never miss a day on your sprint.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-slate-950 border-4 border-rose-400/30 p-6 sm:p-8 shadow-[6px_6px_0px_0px_rgba(2,6,23,1)]">
            {/* Type Selector */}
            <div className="mb-6">
              <label className="text-xs font-black text-slate-500 mb-3 block">NOTIFICATION TYPE</label>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { value: 'email' as const, label: 'EMAIL', icon: Mail },
                  { value: 'sms' as const, label: 'SMS', icon: Phone },
                  { value: 'both' as const, label: 'BOTH', icon: Send },
                ]).map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setType(opt.value)}
                    className={`flex items-center justify-center gap-2 px-3 py-3 border-4 font-black text-xs transition-all ${
                      type === opt.value
                        ? 'border-rose-400 bg-rose-400/10 text-rose-400'
                        : 'border-slate-700 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <opt.icon className="w-4 h-4" />
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Email Input */}
            {(type === 'email' || type === 'both') && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-5"
              >
                <label className="text-xs font-black text-slate-500 mb-2 block">EMAIL ADDRESS</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full bg-slate-800 border-4 border-slate-700 px-4 py-3 text-slate-100 font-bold focus:border-rose-400 focus:outline-none transition-colors placeholder:text-slate-600"
                />
              </motion.div>
            )}

            {/* Phone Input */}
            {(type === 'sms' || type === 'both') && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-5"
              >
                <label className="text-xs font-black text-slate-500 mb-2 block">PHONE NUMBER</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+977 98XXXXXXXX"
                  required
                  className="w-full bg-slate-800 border-4 border-slate-700 px-4 py-3 text-slate-100 font-bold focus:border-rose-400 focus:outline-none transition-colors placeholder:text-slate-600"
                />
              </motion.div>
            )}

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={isSending}
              className="w-full px-6 py-4 bg-rose-400 text-slate-950 font-black text-lg border-4 border-slate-950 shadow-[4px_4px_0px_0px_rgba(2,6,23,1)] flex items-center justify-center gap-3 disabled:opacity-50"
              whileHover={{ x: -4, y: -4, boxShadow: '8px 8px 0px 0px rgba(2,6,23,1)' }}
              whileTap={{ x: 0, y: 0, boxShadow: '4px 4px 0px 0px rgba(2,6,23,1)' }}
            >
              {isSending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
              {isSending ? 'SENDING...' : 'SEND NOTIFICATION'}
            </motion.button>

            {/* Result Feedback */}
            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`mt-4 flex items-center gap-3 px-4 py-3 border-4 font-bold text-sm ${
                    result.success
                      ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                      : 'border-red-500/40 bg-red-500/10 text-red-400'
                  }`}
                >
                  {result.success ? (
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  )}
                  {result.message}
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </motion.div>
      </div>
    </section>
  )
}
