'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'

export default function CommandLineIntro() {
  const [currentLine, setCurrentLine] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  const commands = [
    '> Initializing portfolio...',
    '> Loading components...',
    '> Connecting to GitHub...',
    '> Setting up development environment...',
    '> Ready to build something amazing!',
    '> Welcome to my portfolio!'
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentLine(prev => {
        if (prev >= commands.length - 1) {
          clearInterval(interval)
          // Hide after showing all commands
          setTimeout(() => setIsVisible(false), 2000)
          return prev
        }
        return prev + 1
      })
    }, 800)

    return () => clearInterval(interval)
  }, [])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.5 }}
          className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40 bg-secondary-800/90 backdrop-blur-sm border border-primary-500/30 rounded-lg p-4 shadow-xl max-w-md w-full mx-4"
        >
          <div className="flex items-center space-x-2 mb-2">
            <div className="flex space-x-1">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <span className="text-secondary-400 text-sm font-mono">Terminal</span>
          </div>
          
          <div className="font-mono text-sm">
            {commands.slice(0, currentLine + 1).map((command, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-center space-x-2"
              >
                <span className="text-primary-400">{command}</span>
                {index === currentLine && (
                  <motion.span
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    className="text-primary-400"
                  >
                    |
                  </motion.span>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
