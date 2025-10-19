'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0) // progress bar state

  // Fake loading progress - makes it feel more real
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + Math.random() * 15 // random increments
      })
    }, 100)

    return () => clearInterval(interval)
  }, [])

  // Get window dimensions safely - SSR fix
  const getWindowDimensions = () => {
    if (typeof window !== 'undefined') {
      return {
        width: window.innerWidth,
        height: window.innerHeight
      }
    }
    return { width: 1200, height: 800 } // fallback for SSR
  }

  const { width, height } = getWindowDimensions()

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed inset-0 bg-gradient-to-br from-primary-900 via-secondary-900 to-accent-900 flex items-center justify-center z-50"
    >
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-primary-400 rounded-full opacity-20"
            initial={{
              x: Math.random() * width,
              y: height + 20,
              scale: Math.random() * 0.5 + 0.5,
            }}
            animate={{
              y: -20,
              x: Math.random() * width,
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center">
                {/* Creative MJ Logo Animation */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  className="mb-8"
                >
                  <div className="relative w-40 h-40 mx-auto">
                    {/* Animated Background Orbs */}
                    <motion.div
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.6, 0.3],
                      }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-full blur-xl"
                    />

                    {/* Main Logo Container */}
                    <motion.div
                      animate={{
                        boxShadow: [
                          "0 0 30px rgba(59, 130, 246, 0.5)",
                          "0 0 50px rgba(147, 51, 234, 0.5)",
                          "0 0 30px rgba(236, 72, 153, 0.5)",
                          "0 0 50px rgba(59, 130, 246, 0.5)"
                        ]
                      }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      className="relative w-40 h-40 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 rounded-2xl border-2 border-white/20 flex items-center justify-center overflow-hidden"
                    >
                      {/* Animated Background Pattern */}
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 opacity-10"
                      >
                        <div className="w-full h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
                      </motion.div>

                      {/* Creative MJ Design */}
                      <div className="relative z-10 flex items-center justify-center">
                        {/* Letter M */}
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5, duration: 0.8, ease: "backOut" }}
                          className="relative"
                        >
                          <motion.div
                            animate={{ 
                              scale: [1, 1.05, 1],
                              rotate: [0, 2, 0]
                            }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            className="w-12 h-16 relative"
                          >
                            {/* M Structure */}
                            <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-blue-400 to-blue-600 rounded-full"></div>
                            <div className="absolute left-0 top-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"></div>
                            <div className="absolute top-1/2 left-1/2 w-1 h-1/2 bg-gradient-to-b from-purple-400 to-purple-600 rounded-full transform -translate-x-1/2"></div>
                            <div className="absolute right-0 top-0 w-1 h-full bg-gradient-to-b from-blue-400 to-blue-600 rounded-full"></div>
                            
                            {/* Animated dots on M */}
                            {[2, 6, 10, 14].map((y, i) => (
                              <motion.div
                                key={i}
                                animate={{
                                  scale: [0, 1, 0],
                                  opacity: [0, 1, 0]
                                }}
                                transition={{
                                  duration: 1.5,
                                  repeat: Infinity,
                                  delay: i * 0.2
                                }}
                                className="absolute w-1 h-1 bg-yellow-400 rounded-full"
                                style={{ top: `${y}px`, left: '6px' }}
                              />
                            ))}
                          </motion.div>
                        </motion.div>

                        {/* Letter J */}
                        <motion.div
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.7, duration: 0.8, ease: "backOut" }}
                          className="relative ml-2"
                        >
                          <motion.div
                            animate={{ 
                              scale: [1, 1.05, 1],
                              rotate: [0, -2, 0]
                            }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                            className="w-8 h-16 relative"
                          >
                            {/* J Structure */}
                            <div className="absolute top-0 left-1/2 w-1 h-8 bg-gradient-to-b from-pink-400 to-pink-600 rounded-full transform -translate-x-1/2"></div>
                            <div className="absolute top-8 left-1/2 w-6 h-1 bg-gradient-to-r from-pink-400 to-pink-600 rounded-full transform -translate-x-1/2"></div>
                            <div className="absolute bottom-0 left-1/2 w-1 h-8 bg-gradient-to-b from-pink-400 to-pink-600 rounded-full transform -translate-x-1/2 rounded-b-full"></div>
                            
                            {/* Animated sparkles around J */}
                            {[4, 8, 12].map((y, i) => (
                              <motion.div
                                key={i}
                                animate={{
                                  scale: [0, 1, 0],
                                  opacity: [0, 1, 0],
                                  rotate: [0, 180, 360]
                                }}
                                transition={{
                                  duration: 2,
                                  repeat: Infinity,
                                  delay: i * 0.3
                                }}
                                className="absolute w-1 h-1 bg-cyan-400 rounded-full"
                                style={{ top: `${y}px`, right: '-8px' }}
                              />
                            ))}
                          </motion.div>
                        </motion.div>
                      </div>

                      {/* Floating Code Symbols */}
                      {['<', '>', '{', '}', '(', ')'].map((symbol, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{
                            opacity: [0, 0.6, 0],
                            scale: [0, 1, 0],
                            y: [0, -20, 0]
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            delay: i * 0.5
                          }}
                          className="absolute text-white/40 font-mono text-lg"
                          style={{
                            top: `${20 + (i % 3) * 30}%`,
                            left: `${15 + (i % 2) * 70}%`,
                          }}
                        >
                          {symbol}
                        </motion.div>
                      ))}

                      {/* Glowing Corner Effects */}
                      <motion.div
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.3, 0.7, 0.3]
                        }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-2 left-2 w-3 h-3 bg-blue-400 rounded-full blur-sm"
                      />
                      <motion.div
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.3, 0.7, 0.3]
                        }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                        className="absolute bottom-2 right-2 w-3 h-3 bg-pink-400 rounded-full blur-sm"
                      />
                    </motion.div>

                    {/* Floating Elements - subtle movement */}
                    {[...Array(4)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-2 h-2 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full"
                        style={{
                          top: '50%',
                          left: '50%',
                        }}
                        animate={{
                          x: [0, Math.cos(i * 90 * Math.PI / 180) * 60],
                          y: [0, Math.sin(i * 90 * Math.PI / 180) * 60],
                          opacity: [0.6, 1, 0.6],
                        }}
                        transition={{
                          duration: 8,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: i * 0.5
                        }}
                      />
                    ))}
                  </div>
                </motion.div>

        {/* Morphing Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="mb-6"
        >
          <motion.div
            className="relative h-16 flex items-center justify-center"
          >
            <motion.h1
              key={progress < 30 ? 'MJ' : progress < 70 ? 'Maulik' : 'Maulik Joshi'}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -20 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="absolute text-3xl md:text-4xl font-heading font-bold text-white"
              style={{ 
                textShadow: "0 0 20px rgba(255,255,255,0.5)",
                background: "linear-gradient(45deg, #ffffff, #e0f2fe, #ffffff)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}
            >
              {progress < 30 ? 'MJ' : progress < 70 ? 'Maulik' : 'Maulik Joshi'}
            </motion.h1>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.5 }}
            className="text-primary-200 text-lg"
          >
            Welcome to my portfolio
          </motion.p>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 2, duration: 0.5 }}
          className="w-64 h-1 bg-secondary-700 rounded-full mx-auto overflow-hidden"
        >
          <motion.div
            className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(progress, 100)}%` }}
            transition={{ duration: 0.1, ease: "linear" }}
          />
        </motion.div>

        {/* Loading Text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5, duration: 0.5 }}
          className="text-secondary-300 text-sm mt-4"
        >
          {Math.round(progress)}% Complete
        </motion.p>
      </div>
    </motion.div>
  )
}
