'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0)
  const [dots, setDots] = useState('')

  // Smooth loading progress
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + Math.random() * 6 + 3
      })
    }, 100)

    return () => clearInterval(interval)
  }, [])

  // Animated dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.')
    }, 500)

    return () => clearInterval(interval)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 flex items-center justify-center z-50 overflow-hidden"
    >
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-400 rounded-full opacity-40"
            initial={{
              x: Math.random() * window.innerWidth,
              y: window.innerHeight + 20,
              scale: Math.random() * 0.5 + 0.5,
            }}
            animate={{
              y: -20,
              x: Math.random() * window.innerWidth,
            }}
            transition={{
              duration: Math.random() * 4 + 3,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center">
        {/* Beautiful animated logo */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            type: "spring", 
            stiffness: 200, 
            damping: 15,
            delay: 0.3 
          }}
          className="w-32 h-32 mx-auto mb-8 relative"
        >
          {/* Main logo container with gradient */}
          <div className="w-full h-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl relative overflow-hidden">
            {/* Animated shimmer effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
            
            {/* M letter with beautiful styling */}
            <motion.span 
              className="text-5xl font-bold text-white relative z-10 drop-shadow-lg"
              animate={{ 
                textShadow: [
                  '0 0 20px rgba(255,255,255,0.8)',
                  '0 0 30px rgba(255,255,255,1)',
                  '0 0 20px rgba(255,255,255,0.8)'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              M
            </motion.span>
          </div>
          
          {/* Outer glow rings */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-pink-500 rounded-3xl blur-xl opacity-40 -z-10"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.div 
            className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-pink-500 rounded-3xl blur-2xl opacity-20 -z-20"
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          />
        </motion.div>

        {/* Loading text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-white mb-2">
            Maulik Joshi
          </h2>
          <p className="text-lg text-gray-300">
            Loading{dots}
          </p>
        </motion.div>

        {/* Progress bar */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="w-64 h-2 bg-gray-700 rounded-full mx-auto overflow-hidden"
        >
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </motion.div>

        {/* Progress percentage */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="mt-4 text-sm text-gray-400"
        >
          {Math.round(progress)}%
        </motion.div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-xl"></div>
      <div className="absolute bottom-10 right-10 w-32 h-32 bg-gradient-to-br from-pink-500/20 to-indigo-500/20 rounded-full blur-xl"></div>
      <div className="absolute top-1/2 right-10 w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-xl"></div>
    </motion.div>
  )
}