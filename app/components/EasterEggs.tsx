'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function EasterEggs() {
  const [konamiCode, setKonamiCode] = useState<string[]>([])
  const [isEasterEggActive, setIsEasterEggActive] = useState(false)
  const [showDevConsole, setShowDevConsole] = useState(false)
  const [achievements, setAchievements] = useState<string[]>([])

  // Konami Code: ↑↑↓↓←→←→BA
  const konamiSequence = [
    'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
    'KeyB', 'KeyA'
  ]

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Konami Code detection
      setKonamiCode(prev => {
        const newCode = [...prev, e.code]
        if (newCode.length > konamiSequence.length) {
          newCode.shift()
        }
        
        if (JSON.stringify(newCode) === JSON.stringify(konamiSequence)) {
          setIsEasterEggActive(true)
          setTimeout(() => setIsEasterEggActive(false), 5000)
          if (!achievements.includes('konami')) {
            setAchievements(prev => [...prev, 'konami'])
          }
        }
        
        return newCode
      })

      // Developer Console (Ctrl+Shift+I)
      if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        setShowDevConsole(true)
        setTimeout(() => setShowDevConsole(false), 3000)
        if (!achievements.includes('dev')) {
          setAchievements(prev => [...prev, 'dev'])
        }
      }

      // Secret skill showcase (Ctrl+Alt+S)
      if (e.ctrlKey && e.altKey && e.key === 'S') {
        if (!achievements.includes('skills')) {
          setAchievements(prev => [...prev, 'skills'])
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [achievements])

  return (
    <>
      {/* Konami Code Easter Egg */}
      <AnimatePresence>
        {isEasterEggActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ rotateY: 0 }}
              animate={{ rotateY: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="text-center"
            >
              <motion.h2
                className="text-6xl font-bold text-white mb-4"
                animate={{ 
                  color: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'],
                  textShadow: ['0 0 20px #ff6b6b', '0 0 20px #4ecdc4', '0 0 20px #45b7d1', '0 0 20px #96ceb4', '0 0 20px #feca57']
                }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                🎮 EASTER EGG UNLOCKED! 🎮
              </motion.h2>
              <motion.p
                className="text-xl text-white/80"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                You found the secret! This shows my attention to detail and love for interactive experiences.
              </motion.p>
              <motion.div
                className="mt-8 text-4xl"
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                🚀✨🎯
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Developer Console Easter Egg */}
      <AnimatePresence>
        {showDevConsole && (
          <motion.div
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            className="fixed top-4 right-4 z-50 bg-slate-900 text-green-400 p-4 rounded-lg font-mono text-sm max-w-md"
            style={{ boxShadow: '0 0 20px rgba(34, 197, 94, 0.5)' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="ml-2 text-white">Developer Console</span>
            </div>
            <div className="space-y-1">
              <div>✅ Portfolio loaded successfully</div>
              <div>🎨 3D animations: Active</div>
              <div>⚡ Performance: 60fps</div>
              <div>🔧 Easter eggs: {achievements.length}/3 found</div>
              <div>💻 Tech stack: Next.js + Framer Motion</div>
              <div className="text-green-300">🎯 Console Easter egg unlocked!</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Achievement Notifications */}
      <AnimatePresence>
        {achievements.map((achievement, index) => (
          <motion.div
            key={achievement}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ delay: index * 0.2 }}
            className="fixed top-20 right-4 z-50 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-lg shadow-lg"
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏆</span>
              <div>
                <div className="font-bold">Achievement Unlocked!</div>
                <div className="text-sm opacity-90">
                  {achievement === 'konami' && 'Konami Code Master'}
                  {achievement === 'dev' && 'Developer Console Pro'}
                  {achievement === 'skills' && 'Skill Showcase Expert'}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </>
  )
}
