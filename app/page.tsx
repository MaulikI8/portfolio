'use client'

// ============================================================================
// COMBINED PORTFOLIO PAGE - ALL SECTIONS AND COMPONENTS IN ONE FILE
// ============================================================================
// This file combines all portfolio sections and components into a single file
// Generated automatically - Original files backed up in page.tsx.backup
// ============================================================================

import { useEffect, useState, useRef, useMemo } from 'react'
import { motion, useScroll, useTransform, useMotionValue, useSpring, useInView, AnimatePresence } from 'framer-motion'
import { 
  FaGithub, FaLinkedin, FaCode, FaRocket, FaBrain, FaHeart, FaHtml5, FaCss3Alt, FaJs, FaPython, FaJava, 
  FaNodeJs, FaDocker, FaGitAlt, FaAws, FaReact, FaTrophy, FaTwitter, FaCertificate, FaExternalLinkAlt, FaGraduationCap
} from 'react-icons/fa'
import { 
  HiExternalLink, HiCode as HiCodeIcon, HiEye, HiMail, HiPhone, HiLocationMarker, HiPaperAirplane,
  HiLightBulb, HiDatabase, HiCloud, HiCog, HiAcademicCap, HiBriefcase, HiCalendar,
  HiPlay, HiRefresh, HiSparkles, HiStar, HiLightningBolt, HiFire
} from 'react-icons/hi'
import { 
  SiMongodb, SiPostgresql, SiDjango, SiNextdotjs, SiTypescript, SiTailwindcss, SiVercel, SiVisualstudiocode
} from 'react-icons/si'
import { MdEmail } from 'react-icons/md'

// ============================================================================
// PROJECT ILLUSTRATIONS
// ============================================================================

// Watch store illustration - spent way too long getting the gradients right
const WatchStoreSVG = () => (
  <motion.svg
    width="100%"
    height="100%"
    viewBox="0 0 400 300"
    className="w-full h-full"
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.6, ease: "easeOut" }}
  >
    {/* Background gradient */}
    <defs>
      <linearGradient id="watchGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#1e293b" />
        <stop offset="100%" stopColor="#334155" />
      </linearGradient>
      <linearGradient id="watchFace" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f8fafc" />
        <stop offset="100%" stopColor="#e2e8f0" />
      </linearGradient>
    </defs>
    
    {/* Background */}
    <rect width="400" height="300" fill="url(#watchGradient)" rx="12" />
    
    {/* Watch 1 */}
    <motion.g
      initial={{ x: -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.8 }}
    >
      <circle cx="120" cy="120" r="45" fill="url(#watchFace)" stroke="#64748b" strokeWidth="2" />
      <circle cx="120" cy="120" r="35" fill="none" stroke="#1e293b" strokeWidth="1" />
      
      {/* Watch hands */}
      <line x1="120" y1="120" x2="120" y2="95" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />
      <line x1="120" y1="120" x2="140" y2="120" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
      <circle cx="120" cy="120" r="4" fill="#dc2626" />
      
      {/* Watch band */}
      <rect x="75" y="120" width="90" height="15" fill="#1e293b" rx="7" />
      <rect x="75" y="135" width="90" height="8" fill="#374151" rx="4" />
    </motion.g>
    
    {/* Watch 2 */}
    <motion.g
      initial={{ x: 50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.4, duration: 0.8 }}
    >
      <circle cx="280" cy="120" r="45" fill="url(#watchFace)" stroke="#64748b" strokeWidth="2" />
      <circle cx="280" cy="120" r="35" fill="none" stroke="#1e293b" strokeWidth="1" />
      
      {/* Watch hands */}
      <line x1="280" y1="120" x2="280" y2="95" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />
      <line x1="280" y1="120" x2="300" y2="120" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
      <circle cx="280" cy="120" r="4" fill="#dc2626" />
      
      {/* Watch band */}
      <rect x="235" y="120" width="90" height="15" fill="#1e293b" rx="7" />
      <rect x="235" y="135" width="90" height="8" fill="#374151" rx="4" />
    </motion.g>
    
    {/* Floating elements */}
    <motion.circle
      cx="200" cy="200" r="8"
      fill="#3b82f6"
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
      transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
    />
    <motion.circle
      cx="100" cy="220" r="6"
      fill="#10b981"
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
      transition={{ duration: 2, repeat: Infinity, delay: 1 }}
    />
    <motion.circle
      cx="300" cy="210" r="5"
      fill="#f59e0b"
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
      transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
    />
  </motion.svg>
)

// Gym system - had to look up SVG path syntax for this one
const GymSystemSVG = () => (
  <motion.svg
    width="100%"
    height="100%"
    viewBox="0 0 400 300"
    className="w-full h-full"
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.6, ease: "easeOut" }}
  >
    <defs>
      <linearGradient id="gymGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0f172a" />
        <stop offset="100%" stopColor="#1e293b" />
      </linearGradient>
    </defs>
    
    {/* Background */}
    <rect width="400" height="300" fill="url(#gymGradient)" rx="12" />
    
    {/* Dumbbell */}
    <motion.g
      initial={{ x: -30, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.8 }}
    >
      <rect x="80" y="140" width="8" height="40" fill="#64748b" rx="4" />
      <rect x="70" y="145" width="28" height="30" fill="#475569" rx="15" />
      <rect x="65" y="150" width="8" height="20" fill="#64748b" rx="4" />
      <rect x="95" y="150" width="8" height="20" fill="#64748b" rx="4" />
    </motion.g>
    
    {/* Barbell */}
    <motion.g
      initial={{ x: 30, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.4, duration: 0.8 }}
    >
      <rect x="200" y="150" width="120" height="6" fill="#64748b" rx="3" />
      <rect x="190" y="147" width="8" height="12" fill="#475569" rx="4" />
      <rect x="270" y="147" width="8" height="12" fill="#475569" rx="4" />
    </motion.g>
    
    {/* Computer/Monitor */}
    <motion.g
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.6, duration: 0.8 }}
    >
      <rect x="120" y="80" width="60" height="40" fill="#1e293b" rx="4" />
      <rect x="125" y="85" width="50" height="30" fill="#3b82f6" rx="2" />
      <rect x="135" y="125" width="30" height="8" fill="#374151" rx="2" />
      <rect x="140" y="133" width="20" height="4" fill="#4b5563" rx="2" />
    </motion.g>
    
    {/* Floating icons */}
    <motion.text
      x="50" y="50"
      fill="#10b981"
      fontSize="20"
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
      transition={{ duration: 2, repeat: Infinity, delay: 0.8 }}
    >
      💪
    </motion.text>
    <motion.text
      x="320" y="60"
      fill="#f59e0b"
      fontSize="16"
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
      transition={{ duration: 2, repeat: Infinity, delay: 1.2 }}
    >
      🏋️
    </motion.text>
    <motion.text
      x="300" y="250"
      fill="#ef4444"
      fontSize="18"
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
      transition={{ duration: 2, repeat: Infinity, delay: 1.6 }}
    >
      📊
    </motion.text>
  </motion.svg>
)

// CV builder - this one was fun to animate
const CVCraftSVG = () => (
  <motion.svg
    width="100%"
    height="100%"
    viewBox="0 0 400 300"
    className="w-full h-full"
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.6, ease: "easeOut" }}
  >
    <defs>
      <linearGradient id="cvGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#1e293b" />
        <stop offset="100%" stopColor="#334155" />
      </linearGradient>
    </defs>
    
    {/* Background */}
    <rect width="400" height="300" fill="url(#cvGradient)" rx="12" />
    
    {/* Laptop */}
    <motion.g
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.8 }}
    >
      <rect x="120" y="100" width="160" height="100" fill="#1e293b" rx="8" stroke="#475569" strokeWidth="2" />
      <rect x="130" y="110" width="140" height="80" fill="#0ea5e9" rx="4" />
      <rect x="180" y="205" width="40" height="6" fill="#374151" rx="3" />
      <rect x="170" y="211" width="60" height="4" fill="#4b5563" rx="2" />
    </motion.g>
    
    {/* Document/Resume */}
    <motion.g
      initial={{ x: -30, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.4, duration: 0.8 }}
    >
      <rect x="60" y="120" width="40" height="60" fill="#f8fafc" rx="4" stroke="#e2e8f0" strokeWidth="1" />
      <rect x="65" y="130" width="30" height="2" fill="#64748b" rx="1" />
      <rect x="65" y="135" width="25" height="2" fill="#64748b" rx="1" />
      <rect x="65" y="140" width="30" height="2" fill="#64748b" rx="1" />
      <rect x="65" y="145" width="20" height="2" fill="#64748b" rx="1" />
      <rect x="65" y="150" width="28" height="2" fill="#64748b" rx="1" />
      <rect x="65" y="155" width="15" height="2" fill="#64748b" rx="1" />
    </motion.g>
    
    {/* AI/Magic wand */}
    <motion.g
      initial={{ x: 30, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.6, duration: 0.8 }}
    >
      <line x1="320" y1="130" x2="350" y2="100" stroke="#a855f7" strokeWidth="3" strokeLinecap="round" />
      <circle cx="350" cy="100" r="8" fill="#fbbf24" />
      
      {/* Sparkles */}
      <motion.circle
        cx="330" cy="120" r="2"
        fill="#fbbf24"
        animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: 0.8 }}
      />
      <motion.circle
        cx="340" cy="110" r="1.5"
        fill="#fbbf24"
        animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: 1.2 }}
      />
      <motion.circle
        cx="345" cy="125" r="1"
        fill="#fbbf24"
        animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: 1.6 }}
      />
    </motion.g>
    
    {/* Floating elements */}
    <motion.text
      x="50" y="50"
      fill="#10b981"
      fontSize="20"
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
      transition={{ duration: 2, repeat: Infinity, delay: 1 }}
    >
      ✨
    </motion.text>
    <motion.text
      x="320" y="250"
      fill="#3b82f6"
      fontSize="18"
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
      transition={{ duration: 2, repeat: Infinity, delay: 1.4 }}
    >
      📄
    </motion.text>
  </motion.svg>
)

// Task manager - kanban board vibes
const TaskFlowSVG = () => (
  <motion.svg
    width="100%"
    height="100%"
    viewBox="0 0 400 300"
    className="w-full h-full"
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.6, ease: "easeOut" }}
  >
    <defs>
      <linearGradient id="taskGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#1e293b" />
        <stop offset="100%" stopColor="#334155" />
      </linearGradient>
    </defs>
    
    {/* Background */}
    <rect width="400" height="300" fill="url(#taskGradient)" rx="12" />
    
    {/* To Do Column */}
    <motion.g
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.8 }}
    >
      <rect x="40" y="60" width="80" height="120" fill="#ef4444" rx="8" />
      <rect x="50" y="70" width="60" height="25" fill="#fef2f2" rx="4" />
      <rect x="50" y="105" width="60" height="25" fill="#fef2f2" rx="4" />
      <rect x="50" y="140" width="60" height="25" fill="#fef2f2" rx="4" />
      <text x="80" y="25" fill="#f8fafc" fontSize="14" textAnchor="middle">To Do</text>
    </motion.g>
    
    {/* Doing Column */}
    <motion.g
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.4, duration: 0.8 }}
    >
      <rect x="160" y="60" width="80" height="120" fill="#f59e0b" rx="8" />
      <rect x="170" y="70" width="60" height="25" fill="#fffbeb" rx="4" />
      <rect x="170" y="105" width="60" height="25" fill="#fffbeb" rx="4" />
      <text x="200" y="25" fill="#f8fafc" fontSize="14" textAnchor="middle">Doing</text>
    </motion.g>
    
    {/* Done Column */}
    <motion.g
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.6, duration: 0.8 }}
    >
      <rect x="280" y="60" width="80" height="120" fill="#10b981" rx="8" />
      <rect x="290" y="70" width="60" height="25" fill="#f0fdf4" rx="4" />
      <rect x="290" y="105" width="60" height="25" fill="#f0fdf4" rx="4" />
      <rect x="290" y="140" width="60" height="25" fill="#f0fdf4" rx="4" />
      <text x="320" y="25" fill="#f8fafc" fontSize="14" textAnchor="middle">Done</text>
    </motion.g>
    
    {/* Arrows between columns */}
    <motion.path
      d="M 130 120 Q 145 120 150 120"
      stroke="#64748b"
      strokeWidth="2"
      fill="none"
      markerEnd="url(#arrowhead)"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ delay: 0.8, duration: 1 }}
    />
    <motion.path
      d="M 250 120 Q 265 120 270 120"
      stroke="#64748b"
      strokeWidth="2"
      fill="none"
      markerEnd="url(#arrowhead)"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ delay: 1, duration: 1 }}
    />
    
    {/* Arrow marker definition */}
    <defs>
      <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
        <polygon points="0 0, 10 3.5, 0 7" fill="#64748b" />
      </marker>
    </defs>
    
    {/* Floating icons */}
    <motion.text
      x="50" y="250"
      fill="#3b82f6"
      fontSize="16"
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
      transition={{ duration: 2, repeat: Infinity, delay: 1.2 }}
    >
      👥
    </motion.text>
    <motion.text
      x="320" y="250"
      fill="#8b5cf6"
      fontSize="18"
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
      transition={{ duration: 2, repeat: Infinity, delay: 1.6 }}
    >
      ⚡
    </motion.text>
  </motion.svg>
)


// ============================================================================
// LOADINGSCREEN COMPONENT
// ============================================================================

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

function LoadingScreen() {
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
      {/* Animated background particles - reduced count for perf */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-400 rounded-full opacity-40"
            initial={{
              x: Math.random() * 1200,
              y: 800 + 20,
              scale: Math.random() * 0.5 + 0.5,
            }}
            animate={{
              y: -20,
              x: Math.random() * 1200,
            }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
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

// ============================================================================
// SCROLLPROGRESS COMPONENT
// ============================================================================

import { motion, useScroll, useSpring } from 'framer-motion'

function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  })

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 z-50 origin-left"
      style={{ scaleX }}
    />
  )
}


// ============================================================================
// EASTEREGGS COMPONENT
// ============================================================================

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

function EasterEggs() {
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


// ============================================================================
// UNIQUEINTERACTIONS COMPONENT
// ============================================================================

import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

interface Particle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  color: string
}

function UniqueInteractions() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [particles, setParticles] = useState<Particle[]>([])
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [isInteracting, setIsInteracting] = useState(false)

  // Magnetic cursor values - optimized for 60fps
  const cursorX = useMotionValue(0)
  const cursorY = useMotionValue(0)
  const springX = useSpring(cursorX, { stiffness: 300, damping: 30 })
  const springY = useSpring(cursorY, { stiffness: 300, damping: 30 })

  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3']

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Initialize particles - reduced for better performance
    const initParticles = () => {
      const newParticles: Particle[] = []
      for (let i = 0; i < 20; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 1,
          vy: (Math.random() - 0.5) * 1,
          size: Math.random() * 2 + 1,
          opacity: Math.random() * 0.3 + 0.1,
          color: colors[Math.floor(Math.random() * colors.length)]
        })
      }
      setParticles(newParticles)
    }

    initParticles()

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      setParticles(prevParticles => 
        prevParticles.map(particle => {
          // Update position
          let newX = particle.x + particle.vx
          let newY = particle.y + particle.vy

          // Mouse interaction - simplified for better performance
          const dx = mousePos.x - particle.x
          const dy = mousePos.y - particle.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 80 && isInteracting) {
            const force = (80 - distance) / 80
            newX -= dx * force * 0.01
            newY -= dy * force * 0.01
          }

          // Bounce off walls
          if (newX < 0 || newX > canvas.width) particle.vx *= -1
          if (newY < 0 || newY > canvas.height) particle.vy *= -1

          // Keep in bounds
          newX = Math.max(0, Math.min(canvas.width, newX))
          newY = Math.max(0, Math.min(canvas.height, newY))

          // Draw particle
          ctx.beginPath()
          ctx.arc(newX, newY, particle.size, 0, Math.PI * 2)
          ctx.fillStyle = particle.color + Math.floor(particle.opacity * 255).toString(16).padStart(2, '0')
          ctx.fill()

          // Draw connections - simplified for performance
          if (Math.random() > 0.95) { // Only draw connections occasionally
            prevParticles.forEach(otherParticle => {
              if (particle.id !== otherParticle.id) {
                const dx = newX - otherParticle.x
                const dy = newY - otherParticle.y
                const distance = Math.sqrt(dx * dx + dy * dy)

                if (distance < 80) {
                  ctx.beginPath()
                  ctx.moveTo(newX, newY)
                  ctx.lineTo(otherParticle.x, otherParticle.y)
                  ctx.strokeStyle = particle.color + '20'
                  ctx.lineWidth = 0.3
                  ctx.stroke()
                }
              }
            })
          }

          return {
            ...particle,
            x: newX,
            y: newY
          }
        })
      )

      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [mousePos, isInteracting])

  const handleMouseMove = (e: MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY })
    cursorX.set(e.clientX)
    cursorY.set(e.clientY)
  }

  const handleMouseEnter = () => setIsInteracting(true)
  const handleMouseLeave = () => setIsInteracting(false)

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseenter', handleMouseEnter)
    window.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseenter', handleMouseEnter)
      window.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  return (
    <>
      {/* Particle Canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-10"
        style={{ background: 'transparent' }}
      />

      {/* Magnetic Cursor */}
      <motion.div
        className="fixed pointer-events-none z-50"
        style={{
          x: springX,
          y: springY,
          left: -8,
          top: -8,
        }}
      >
        <motion.div
          className="w-4 h-4 bg-white/20 rounded-full"
          animate={{
            scale: isInteracting ? 1.2 : 1,
            opacity: isInteracting ? 0.6 : 0.3,
          }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      </motion.div>

      {/* Interactive Elements */}
      <div className="fixed inset-0 pointer-events-none z-20">
        {/* Floating Code Elements - Smooth floating only */}
        {Array.from({ length: 4 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-white/10 font-mono text-sm pointer-events-none"
            initial={{
              x: 100 + i * 300,
              y: 200 + i * 200,
            }}
            animate={{
              y: [200 + i * 200, 150 + i * 200, 200 + i * 200],
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {['<div>', '{ }', 'const', 'import'][i]}
          </motion.div>
        ))}

        {/* Interactive Glow Effects */}
        <motion.div
          className="absolute w-96 h-96 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%)',
            left: mousePos.x - 192,
            top: mousePos.y - 192,
          }}
          animate={{
            scale: isInteracting ? 1.2 : 0.8,
            opacity: isInteracting ? 0.3 : 0.1,
          }}
          transition={{ duration: 0.3 }}
        />

        {/* Magnetic Elements - Simplified */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 3 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-purple-500/30 rounded-full pointer-events-none"
              style={{
                left: 200 + i * 400,
                top: 150 + i * 200,
              }}
              animate={{
                scale: isInteracting ? 1.2 : 1,
              }}
              transition={{
                duration: 0.3,
                ease: "easeOut",
              }}
            />
          ))}
        </div>
      </div>


      {/* Subtle Background Effect */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-0"
        animate={{
          opacity: isInteracting ? 0.05 : 0,
        }}
        transition={{
          duration: 0.5,
          ease: "easeOut",
        }}
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)'
        }}
      />
    </>
  )
}


// ============================================================================
// LIVECODEPLAYGROUND COMPONENT
// ============================================================================

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HiPlay, HiRefresh, HiCode, HiSparkles } from 'react-icons/hi'

interface CodeSnippet {
  id: string
  title: string
  description: string
  language: string
  code: string
  expectedOutput: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
}

const codeSnippets: CodeSnippet[] = [
  {
    id: '1',
    title: 'JavaScript Array Methods',
    description: 'Learn modern JavaScript array manipulation',
    language: 'javascript',
    code: `const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
const filtered = doubled.filter(n => n > 5);
console.log(filtered);`,
    expectedOutput: '[6, 8, 10]',
    difficulty: 'Easy'
  },
  {
    id: '2',
    title: 'React Component',
    description: 'A simple React component with hooks',
    language: 'jsx',
    code: `import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}`,
    expectedOutput: 'Interactive counter component',
    difficulty: 'Medium'
  },
  {
    id: '3',
    title: 'Python Algorithm',
    description: 'Binary search implementation',
    language: 'python',
    code: `def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    
    return -1

result = binary_search([1, 2, 3, 4, 5], 3)
print(f"Found at index: {result}")`,
    expectedOutput: 'Found at index: 2',
    difficulty: 'Hard'
  }
]

function LiveCodePlayground() {
  const [selectedSnippet, setSelectedSnippet] = useState<CodeSnippet>(codeSnippets[0])
  const [output, setOutput] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [showResult, setShowResult] = useState(false)

  const executeCode = async () => {
    setIsRunning(true)
    setShowResult(false)

    // Simulate code execution with typing effect
    const typeWriter = (text: string, speed: number = 50) => {
      let i = 0
      const timer = setInterval(() => {
        if (i < text.length) {
          setOutput(prev => prev + text.charAt(i))
          i++
        } else {
          clearInterval(timer)
          setIsRunning(false)
          setShowResult(true)
        }
      }, speed)
    }

    // Clear previous output
    setOutput('')
    
    // Simulate execution time based on difficulty
    const executionTime = selectedSnippet.difficulty === 'Easy' ? 1000 : 
                         selectedSnippet.difficulty === 'Medium' ? 1500 : 2000

    setTimeout(() => {
      typeWriter(selectedSnippet.expectedOutput)
    }, executionTime)
  }

  const resetCode = () => {
    setOutput('')
    setShowResult(false)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-500 bg-green-100'
      case 'Medium': return 'text-yellow-500 bg-yellow-100'
      case 'Hard': return 'text-red-500 bg-red-100'
      default: return 'text-gray-500 bg-gray-100'
    }
  }

  return (
    <section id="code-playground" className="section-padding bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 bg-purple-600/20 text-purple-300 rounded-full text-sm font-medium mb-4">
            <HiCode className="inline mr-2" />
            Live Code Playground
          </span>
          <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6 text-white">
            Try My <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Code</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Interactive code snippets showcasing my programming skills. Click run to see the magic happen!
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Code Selection */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-4"
          >
            <h3 className="text-2xl font-bold text-white mb-6">Choose a Challenge</h3>
            {codeSnippets.map((snippet) => (
              <motion.div
                key={snippet.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
                  selectedSnippet.id === snippet.id
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                }`}
                onClick={() => setSelectedSnippet(snippet)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-lg font-semibold text-white">{snippet.title}</h4>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(snippet.difficulty)}`}>
                    {snippet.difficulty}
                  </span>
                </div>
                <p className="text-gray-400 text-sm">{snippet.description}</p>
                <div className="mt-2 text-xs text-gray-500">
                  Language: <span className="text-purple-400">{snippet.language}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Code Editor */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-white">Code Editor</h3>
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={executeCode}
                  disabled={isRunning}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors duration-200"
                >
                  <HiPlay size={16} />
                  {isRunning ? 'Running...' : 'Run Code'}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={resetCode}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors duration-200"
                >
                  <HiRefresh size={16} />
                  Reset
                </motion.button>
              </div>
            </div>

            {/* Code Display */}
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="ml-2 text-gray-400 text-sm font-mono">{selectedSnippet.language}</span>
              </div>
              <pre className="text-green-400 font-mono text-sm overflow-x-auto">
                <code>{selectedSnippet.code}</code>
              </pre>
            </div>

            {/* Output */}
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center gap-2 mb-3">
                <HiSparkles className="text-yellow-400" size={16} />
                <span className="text-gray-400 text-sm">Output</span>
              </div>
              <div className="min-h-[60px]">
                <AnimatePresence mode="wait">
                  {output ? (
                    <motion.div
                      key="output"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-white font-mono"
                    >
                      {output}
                      {isRunning && <span className="animate-pulse">|</span>}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="placeholder"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-gray-500 font-mono"
                    >
                      Click "Run Code" to see the output...
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Success Message */}
            <AnimatePresence>
              {showResult && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="p-4 bg-green-600/20 border border-green-500/50 rounded-lg"
                >
                  <div className="flex items-center gap-2 text-green-400">
                    <HiSparkles size={20} />
                    <span className="font-semibold">Code executed successfully!</span>
                  </div>
                  <p className="text-green-300 text-sm mt-1">
                    This demonstrates my {selectedSnippet.language} skills and problem-solving approach.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  )
}


// ============================================================================
// GAMIFIEDEXPERIENCE COMPONENT
// ============================================================================

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HiStar, HiLightningBolt, HiFire, HiSparkles, HiAcademicCap } from 'react-icons/hi'
import { FaTrophy } from 'react-icons/fa'

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlocked: boolean
  points: number
  category: 'exploration' | 'interaction' | 'skill'
}

interface SkillNode {
  id: string
  name: string
  level: number
  maxLevel: number
  icon: string
  unlocked: boolean
  xp: number
  maxXp: number
}

const achievements: Achievement[] = [
  {
    id: 'portfolio_explorer',
    title: 'Portfolio Explorer',
    description: 'Visited all sections of the portfolio',
    icon: '🗺️',
    unlocked: false,
    points: 50,
    category: 'exploration'
  },
  {
    id: 'code_runner',
    title: 'Code Runner',
    description: 'Executed code in the playground',
    icon: '💻',
    unlocked: false,
    points: 75,
    category: 'skill'
  },
  {
    id: 'easter_egg_hunter',
    title: 'Easter Egg Hunter',
    description: 'Found at least 2 easter eggs',
    icon: '🥚',
    unlocked: false,
    points: 100,
    category: 'interaction'
  },
  {
    id: 'scroll_master',
    title: 'Scroll Master',
    description: 'Scrolled through the entire portfolio',
    icon: '📜',
    unlocked: false,
    points: 25,
    category: 'exploration'
  },
  {
    id: 'project_inspector',
    title: 'Project Inspector',
    description: 'Viewed all project details',
    icon: '🔍',
    unlocked: false,
    points: 60,
    category: 'exploration'
  },
  {
    id: 'interaction_expert',
    title: 'Interaction Expert',
    description: 'Triggered 10+ animations',
    icon: '⚡',
    unlocked: false,
    points: 80,
    category: 'interaction'
  }
]

const skillNodes: SkillNode[] = [
  {
    id: 'frontend',
    name: 'Frontend Development',
    level: 4,
    maxLevel: 5,
    icon: '🎨',
    unlocked: true,
    xp: 320,
    maxXp: 400
  },
  {
    id: 'backend',
    name: 'Backend Development',
    level: 4,
    maxLevel: 5,
    icon: '⚙️',
    unlocked: true,
    xp: 350,
    maxXp: 400
  },
  {
    id: 'databases',
    name: 'Database Management',
    level: 3,
    maxLevel: 5,
    icon: '🗄️',
    unlocked: true,
    xp: 240,
    maxXp: 300
  },
  {
    id: 'devops',
    name: 'DevOps & Tools',
    level: 2,
    maxLevel: 5,
    icon: '🚀',
    unlocked: true,
    xp: 120,
    maxXp: 200
  },
  {
    id: 'cloud',
    name: 'Cloud Computing',
    level: 2,
    maxLevel: 5,
    icon: '☁️',
    unlocked: false,
    xp: 80,
    maxXp: 200
  },
  {
    id: 'ai',
    name: 'AI Integration',
    level: 1,
    maxLevel: 5,
    icon: '🤖',
    unlocked: false,
    xp: 40,
    maxXp: 100
  }
]

function GamifiedExperience() {
  const [userLevel, setUserLevel] = useState(1)
  const [totalXp, setTotalXp] = useState(0)
  const [userAchievements, setUserAchievements] = useState<Achievement[]>(achievements)
  const [userSkills, setUserSkills] = useState<SkillNode[]>(skillNodes)
  const [showLevelUp, setShowLevelUp] = useState(false)
  const [recentAchievement, setRecentAchievement] = useState<Achievement | null>(null)

  // Remove automatic progress simulation - too annoying

  const unlockAchievement = (achievementId: string) => {
    setUserAchievements(prev => 
      prev.map(achievement => {
        if (achievement.id === achievementId && !achievement.unlocked) {
          setRecentAchievement(achievement)
          setTimeout(() => setRecentAchievement(null), 3000)
          setTotalXp(prevXp => prevXp + achievement.points)
          return { ...achievement, unlocked: true }
        }
        return achievement
      })
    )
  }

  // Remove automatic skill progression - too distracting

  const getTotalUnlockedAchievements = () => {
    return userAchievements.filter(a => a.unlocked).length
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'exploration': return 'from-blue-500 to-cyan-500'
      case 'interaction': return 'from-purple-500 to-pink-500'
      case 'skill': return 'from-green-500 to-emerald-500'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  return (
    <section id="gamified-experience" className="section-padding bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 bg-purple-600/20 text-purple-300 rounded-full text-sm font-medium mb-4">
            <FaTrophy className="inline mr-2" />
            Gamified Experience
          </span>
          <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6 text-white">
            Level Up Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">Exploration</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Turn portfolio browsing into an adventure! Unlock achievements, level up skills, and discover hidden features.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Progress Overview */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            {/* User Stats */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <HiStar className="text-yellow-400" />
                Your Progress
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Level</span>
                  <span className="text-2xl font-bold text-white">{userLevel}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Total XP</span>
                  <span className="text-xl font-bold text-purple-400">{totalXp}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Achievements</span>
                  <span className="text-xl font-bold text-green-400">
                    {getTotalUnlockedAchievements()}/{userAchievements.length}
                  </span>
                </div>
              </div>

              {/* XP Progress Bar */}
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-400 mb-1">
                  <span>Next Level</span>
                  <span>{Math.floor(totalXp / 100)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <motion.div
                    className="h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(totalXp % 100)}%` }}
                    transition={{ duration: 1 }}
                  />
                </div>
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <FaTrophy className="text-yellow-400" />
                Achievements
              </h3>
              
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {userAchievements.map((achievement) => (
                  <motion.div
                    key={achievement.id}
                    className={`p-3 rounded-lg border transition-all duration-300 ${
                      achievement.unlocked
                        ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/50'
                        : 'bg-gray-800/50 border-gray-700'
                    }`}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{achievement.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold ${achievement.unlocked ? 'text-white' : 'text-gray-400'}`}>
                            {achievement.title}
                          </span>
                          {achievement.unlocked && (
                            <HiSparkles className="text-yellow-400" size={16} />
                          )}
                        </div>
                        <p className={`text-sm ${achievement.unlocked ? 'text-gray-300' : 'text-gray-500'}`}>
                          {achievement.description}
                        </p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          achievement.unlocked ? 'bg-yellow-500/20 text-yellow-400' : 'bg-gray-700 text-gray-500'
                        }`}>
                          +{achievement.points} XP
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Skill Tree */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <HiLightningBolt className="text-blue-400" />
                Skill Tree
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                {userSkills.map((skill) => (
                  <motion.div
                    key={skill.id}
                    className={`p-4 rounded-lg border transition-all duration-300 ${
                      skill.unlocked
                        ? 'bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-blue-500/50'
                        : 'bg-gray-800/50 border-gray-700 opacity-50'
                    }`}
                    whileHover={{ scale: skill.unlocked ? 1.05 : 1 }}
                  >
                    <div className="text-center">
                      <span className="text-3xl mb-2 block">{skill.icon}</span>
                      <h4 className={`font-semibold mb-2 ${skill.unlocked ? 'text-white' : 'text-gray-500'}`}>
                        {skill.name}
                      </h4>
                      <div className="text-sm text-gray-400 mb-2">
                        Level {skill.level}/{skill.maxLevel}
                      </div>
                      
                      {skill.unlocked && (
                        <div className="space-y-1">
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <motion.div
                              className="h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${(skill.xp / skill.maxXp) * 100}%` }}
                              transition={{ duration: 1 }}
                            />
                          </div>
                          <div className="text-xs text-gray-400">
                            {skill.xp}/{skill.maxXp} XP
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Achievement Notification */}
        <AnimatePresence>
          {recentAchievement && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.8 }}
              className="fixed bottom-8 right-8 z-50 bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-6 rounded-xl shadow-2xl max-w-sm"
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{recentAchievement.icon}</span>
                <div>
                  <div className="font-bold text-lg">Achievement Unlocked!</div>
                  <div className="text-sm opacity-90">{recentAchievement.title}</div>
                  <div className="text-xs mt-1">+{recentAchievement.points} XP</div>
                </div>
                <HiSparkles className="text-white animate-pulse" size={24} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Level Up Notification */}
        <AnimatePresence>
          {showLevelUp && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            >
              <motion.div
                initial={{ rotate: -10 }}
                animate={{ rotate: 10 }}
                transition={{ duration: 0.5, repeat: 5, repeatType: "reverse" }}
                className="text-center bg-gradient-to-r from-purple-600 to-pink-600 p-8 rounded-2xl shadow-2xl"
              >
                <HiFire className="text-6xl text-white mb-4 mx-auto" />
                <h2 className="text-4xl font-bold text-white mb-2">LEVEL UP!</h2>
                <p className="text-xl text-white/90">Skill progression detected!</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}


// ============================================================================
// HERO SECTION
// ============================================================================

// Hero section - the first thing visitors see, so it needs to make an impact!
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import { FaGithub, FaLinkedin, FaCode, FaRocket, FaBrain, FaHeart } from 'react-icons/fa'
import { MdEmail } from 'react-icons/md'

function HeroSection() {
  // Mouse tracking for background using motion values (no React re-renders)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const mx = useSpring(mouseX, { stiffness: 200, damping: 30 })
  const my = useSpring(mouseY, { stiffness: 200, damping: 30 })

  // Derived motion values for background parallax
  const x05 = useTransform(mx, (v) => v * 0.05)
  const y05 = useTransform(my, (v) => v * 0.05)
  const xNeg003 = useTransform(mx, (v) => v * -0.03)
  const yNeg003 = useTransform(my, (v) => v * -0.03)
  const [isTyping, setIsTyping] = useState(true)
  const [currentText, setCurrentText] = useState('')
  const [textIndex, setTextIndex] = useState(0)
  const containerRef = useRef(null)
  
  // Scroll-based animations for parallax effect
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  })

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  // Rotating text messages - I change these occasionally to keep it fresh
  const texts = [
    "Building Scalable Systems",
    "Learning & Growing Daily", 
    "Creating Practical Solutions",
    "Solving Problems Step by Step",
    "Exploring New Technologies"
  ]

  // Mouse move handler optimized: update motion values inside rAF
  useEffect(() => {
    let frame = 0
    const onMove = (e: MouseEvent) => {
      if (frame) return
      frame = requestAnimationFrame(() => {
        mouseX.set(e.clientX)
        mouseY.set(e.clientY)
        frame = 0
      })
    }
    window.addEventListener('mousemove', onMove)
    return () => {
      window.removeEventListener('mousemove', onMove)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [mouseX, mouseY])

  useEffect(() => {
    const typeText = () => {
      if (textIndex < texts.length) {
        const currentFullText = texts[textIndex]
        if (currentText.length < currentFullText.length) {
          setCurrentText(currentFullText.slice(0, currentText.length + 1))
        } else {
          setTimeout(() => {
            if (currentText.length > 0) {
              setCurrentText(currentText.slice(0, -1))
            } else {
              setTextIndex((prev) => (prev + 1) % texts.length)
            }
          }, 1500) // pause before deleting
        }
      }
    }

    const timer = setTimeout(typeText, 100)
    return () => clearTimeout(timer)
  }, [currentText, textIndex, texts]) // typing animation dependencies

  // Simple scroll function - nothing fancy
  const scrollToSection = (sectionId: string) => {
    const element = document.querySelector(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section ref={containerRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0">
        {/* Animated gradient orbs that follow mouse */}
        <motion.div
          className="absolute w-96 h-96 bg-gradient-to-r from-purple-700 to-pink-700 rounded-full blur-3xl opacity-20"
          style={{ x: x05, y: y05 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
        <motion.div
          className="absolute w-80 h-80 bg-gradient-to-r from-blue-700 to-cyan-700 rounded-full blur-3xl opacity-20"
          style={{ x: xNeg003, y: yNeg003 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
        
        {/* Floating code symbols - subtle movement only */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-white/5 text-3xl"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              y: [null, -50],
              x: [null, Math.random() * 20 - 10],
            }}
            transition={{
              duration: Math.random() * 15 + 20,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 5,
            }}
          >
            {i % 4 === 0 ? '{' : i % 4 === 1 ? '}' : i % 4 === 2 ? '<' : '>'}
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <motion.div
        style={{ y, opacity }}
        className="relative z-10 text-center max-w-6xl mx-auto px-4 flex flex-col items-center justify-center min-h-screen"
      >
        {/* Interactive Name */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="mb-8"
        >
          <motion.div
            className="text-8xl md:text-9xl font-heading font-black mb-4"
            style={{
              background: `linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57, #ff9ff3)`,
              backgroundSize: '400% 400%',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'gradient 3s ease infinite'
            }}
            whileHover={{ scale: 1.05 }}
          >
            MAULIK
          </motion.div>
          <motion.div
            className="text-6xl md:text-7xl font-heading font-bold text-white/80"
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            JOSHI
          </motion.div>
        </motion.div>

        {/* Dynamic Typing Text */}
        <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.8, ease: "easeOut" }}
          className="mb-8"
        >
          <div className="text-2xl md:text-4xl font-light text-white/90 mb-2">
            {currentText}
            <motion.span
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="text-yellow-400"
            >
              |
            </motion.span>
          </div>
          <p className="text-lg text-white/60">
            Full-Stack Developer • BSc Hons Computing • Islington College Kathmandu (London Metropolitan University)
          </p>
        </motion.div>

        {/* Interactive Skill Icons */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="flex justify-center gap-8 mb-12"
        >
          {[
            { icon: FaCode, label: "Develop", color: "from-red-600 to-pink-600" },
            { icon: FaRocket, label: "Build", color: "from-blue-600 to-cyan-600" },
            { icon: FaBrain, label: "Learn", color: "from-green-600 to-emerald-600" },
            { icon: FaHeart, label: "Collaborate", color: "from-purple-600 to-violet-600" }
          ].map((skill, index) => (
            <motion.div
              key={skill.label}
              className="group cursor-pointer"
              whileHover={{ scale: 1.2, rotate: 10 }}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.7 + index * 0.1 }}
            >
              <div className={`w-20 h-20 bg-gradient-to-r ${skill.color} rounded-full flex items-center justify-center shadow-lg group-hover:shadow-2xl transition-all duration-300`}>
                <skill.icon className="text-white text-2xl" />
              </div>
              <p className="text-sm text-white/70 mt-2 font-medium">{skill.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16"
        >
          <motion.button
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => scrollToSection('#projects')}
            className="group relative px-8 py-4 bg-gradient-to-r from-purple-700 to-pink-700 rounded-full font-semibold text-white shadow-lg hover:shadow-purple-600/25 transition-all duration-300 overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              Explore My Work
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                🚀
              </motion.div>
            </span>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              initial={{ x: "-100%" }}
              whileHover={{ x: "0%" }}
              transition={{ duration: 0.3 }}
            />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => scrollToSection('#contact')}
            className="px-8 py-4 border-2 border-white/30 rounded-full font-semibold text-white hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
          >
            Let's Connect ✨
          </motion.button>
        </motion.div>

        {/* Bottom Section - Perfectly Balanced */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.5, duration: 0.8 }}
          className="flex flex-col items-center gap-6 mt-8"
        >
          {/* Social Links */}
          <div className="flex items-center justify-center gap-6">
            {[
              { icon: FaGithub, href: "https://github.com/MaulikI8", label: "GitHub" },
              { icon: FaLinkedin, href: "https://www.linkedin.com/in/maulik-joshi-176418331/", label: "LinkedIn" },
              { icon: MdEmail, href: "mailto:jmaulik21@gmail.com", label: "Email" }
            ].map((social, index) => (
              <motion.a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.15, y: -3 }}
                whileTap={{ scale: 0.9 }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 2.7 + index * 0.1, type: "spring", stiffness: 200 }}
                className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300 border border-white/20 hover:border-white/40"
              >
                <social.icon size={18} />
              </motion.a>
            ))}
          </div>

          {/* Scroll Indicator */}
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center text-white/60 cursor-pointer group"
            onClick={() => scrollToSection('#about')}
          >
            <span className="text-sm mb-3 group-hover:text-white/80 transition-colors duration-300">Discover more</span>
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center group-hover:border-white/60 transition-colors duration-300"
            >
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="w-1 h-3 bg-white/60 rounded-full mt-2 group-hover:bg-white/80 transition-colors duration-300"
              />
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>

      <style jsx>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </section>
  )
}


// ============================================================================
// ABOUT SECTION
// ============================================================================

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { HiLightBulb, HiCode, HiDatabase, HiCloud, HiCog, HiAcademicCap } from 'react-icons/hi'

function AboutSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" }) // trigger animation when in view

  // My learning timeline - from beginner to full-stack developer
  const learningJourney = [
    { year: '2023', skill: 'HTML', description: 'Learned web fundamentals', icon: HiCode, color: 'from-orange-400 to-orange-600' },
    { year: '2023', skill: 'CSS', description: 'Basic styling and layouts', icon: HiCode, color: 'from-blue-400 to-blue-600' },
    { year: '2023', skill: 'Python (First Half)', description: 'Started with programming fundamentals', icon: HiCode, color: 'from-yellow-400 to-yellow-600' },
    { year: '2024', skill: 'JavaScript', description: 'Dynamic web development', icon: HiCode, color: 'from-green-400 to-green-600' },
    { year: '2024', skill: 'Python (Second Half)', description: 'Completed Python mastery', icon: HiCode, color: 'from-yellow-400 to-yellow-600' },
    { year: '2024', skill: 'Databases', description: 'SQL and data management', icon: HiDatabase, color: 'from-teal-400 to-teal-600' },
    { year: '2025', skill: 'Java', description: 'Object-oriented programming', icon: HiCode, color: 'from-red-400 to-red-600' },
    { year: '2025', skill: 'Django', description: 'Python web framework', icon: HiCode, color: 'from-emerald-400 to-emerald-600' },
    { year: '2025', skill: 'React', description: 'Modern frontend library', icon: HiCode, color: 'from-cyan-400 to-cyan-600' },
    { year: '2025', skill: 'CI/CD', description: 'Automation pipelines', icon: HiCog, color: 'from-pink-400 to-pink-600' },
    { year: '2025', skill: 'Cloud Computing', description: 'Scalable infrastructure', icon: HiCloud, color: 'from-indigo-400 to-indigo-600' },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
      },
    },
  }

  return (
    <section id="about" className="relative min-h-screen flex items-center py-20 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              scale: 0,
            }}
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="container-custom relative z-10">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mb-6"
          >
            <span className="inline-block px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white font-medium">
              About Me
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-5xl md:text-7xl font-heading font-bold mb-8"
            style={{
              background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57)',
              backgroundSize: '400% 400%',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'gradient 4s ease infinite'
            }}
          >
            The Story Behind
            <br />
            <span className="text-white">The Code</span>
          </motion.h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Column - Interactive Story */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="relative"
            >
              <div className="p-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-500">
                <h3 className="text-2xl font-bold mb-4 text-white">The Student</h3>
                <p className="text-white/80 leading-relaxed">
                  I'm a dedicated <span className="text-yellow-400 font-semibold">2nd-year BSc Hons Computing student</span> at London Metropolitan University, studying at Islington College Kathmandu. I balance academic learning with hands-on project development.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="relative"
            >
              <div className="p-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-500">
                <h3 className="text-2xl font-bold mb-4 text-white">The Journey</h3>
                <p className="text-white/80 leading-relaxed">
                  Started coding in 2023 with <span className="text-orange-400 font-semibold">HTML, CSS, and the first half of Python</span>, then in 2024 completed <span className="text-green-400 font-semibold">the other half of Python, JavaScript, and Databases</span>. Now in 2025, I'm expanding into <span className="text-blue-400 font-semibold">Java, Cloud Computing, CI/CD, Django, and React</span> - building a comprehensive full-stack toolkit.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 1, duration: 0.6 }}
              className="relative"
            >
              <div className="p-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-500">
                <h3 className="text-2xl font-bold mb-4 text-white">The Passion</h3>
                <p className="text-white/80 leading-relaxed">
                  What drives me is learning to build <span className="text-purple-400 font-semibold">reliable systems</span> that can handle real-world demands while writing clean, maintainable code. Each project teaches me something new.
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column - Interactive Timeline */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="mb-8"
            >
              <h3 className="text-3xl font-heading font-bold mb-4 text-white">
                My Learning Adventure
              </h3>
              <p className="text-white/60">
                Two years of focused learning and growing
              </p>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              className="space-y-6"
            >
              {learningJourney.map((item, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="group cursor-pointer"
                >
                  <motion.div
                    whileHover={{ scale: 1.02, x: 10 }}
                    className="relative p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl hover:bg-white/10 transition-all duration-300"
                  >
                    <div className="flex items-center gap-4">
                      <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                        className={`w-12 h-12 bg-gradient-to-r ${item.color} rounded-full flex items-center justify-center shadow-lg`}
                      >
                        <item.icon className="text-white" size={20} />
                      </motion.div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold text-white text-lg">{item.skill}</h4>
                          <span className="text-sm font-medium text-yellow-400 bg-yellow-400/20 px-3 py-1 rounded-full">
                            {item.year}
                          </span>
                        </div>
                        <p className="text-white/70 text-sm">{item.description}</p>
                      </div>
                    </div>

                    {/* Progress bar animation */}
                    <motion.div
                      initial={{ width: 0 }}
                      animate={isInView ? { width: "100%" } : { width: 0 }}
                      transition={{ delay: 0.5 + index * 0.1, duration: 1 }}
                      className="mt-3 h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full"
                    />
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}


// ============================================================================
// SKILLS SECTION
// ============================================================================

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { HiCode, HiServer, HiDatabase, HiCog } from 'react-icons/hi'
import { 
  FaHtml5,
  FaCss3Alt,
  FaJs,
  FaPython,
  FaJava,
  FaNodeJs,
  FaDocker,
  FaGitAlt,
  FaAws,
  FaReact
} from 'react-icons/fa'
import { SiMongodb, SiPostgresql, SiDjango } from 'react-icons/si'

function SkillsSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" }) // animate when visible

  // Skill levels - being honest here, always learning
  const skillCategories = [
    {
      title: 'Frontend',
      icon: HiCode,
      color: 'from-blue-600 to-cyan-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      skills: [
        { name: 'HTML', level: 95, icon: FaHtml5 },
        { name: 'CSS', level: 90, icon: FaCss3Alt },
        { name: 'JavaScript', level: 85, icon: FaJs },
        { name: 'React', level: 80, icon: FaReact },
      ]
    },
    {
      title: 'Backend',
      icon: HiServer,
      color: 'from-green-600 to-emerald-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      skills: [
        { name: 'Python', level: 90, icon: FaPython },
        { name: 'Java', level: 85, icon: FaJava },
        { name: 'Django', level: 75, icon: SiDjango },
      ]
    },
    {
      title: 'Databases',
      icon: HiDatabase,
      color: 'from-purple-600 to-violet-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      skills: [
        { name: 'SQL', level: 75, icon: SiPostgresql },
        { name: 'MongoDB', level: 70, icon: SiMongodb },
      ]
    },
    {
      title: 'DevOps & Tools',
      icon: HiCog,
      color: 'from-orange-600 to-red-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      skills: [
        { name: 'Git', level: 85, icon: FaGitAlt },
        { name: 'Deployment', level: 75, icon: FaDocker },
        { name: 'CI/CD', level: 70, icon: HiCog },
        { name: 'Cloud Computing', level: 65, icon: FaAws },
      ]
    }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const categoryVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
      },
    },
  }

  const skillVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.4,
      },
    },
  }

  return (
    <section id="skills" className="relative min-h-screen flex items-center py-20 overflow-hidden">
      {/* Subtle Background */}
      <div className="absolute inset-0">
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-white/3 text-5xl"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              y: [null, -30],
              opacity: [0.3, 0.1, 0.3],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: Math.random() * 5 }}
          >
            {i % 3 === 0 ? '{}' : i % 3 === 1 ? '[]' : '()'}
          </motion.div>
        ))}
      </div>

      <div className="container-custom relative z-10">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mb-6"
          >
            <span className="inline-block px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white font-medium">
              My Arsenal
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-5xl md:text-7xl font-heading font-bold mb-8"
            style={{
              background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57)',
              backgroundSize: '400% 400%',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'gradient 4s ease infinite'
            }}
          >
            Skills That
            <br />
            <span className="text-white">Make Magic</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="text-xl text-white/70 max-w-3xl mx-auto"
          >
            From frontend development to backend systems - here's what I work with
          </motion.p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid md:grid-cols-2 gap-8"
        >
          {skillCategories.map((category, categoryIndex) => (
            <motion.div
              key={category.title}
              variants={categoryVariants}
              className="group relative p-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-500"
            >
              {/* Category Header */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                transition={{ delay: categoryIndex * 0.2, duration: 0.6 }}
                className="flex items-center gap-4 mb-8"
              >
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                  className={`w-16 h-16 bg-gradient-to-r ${category.color} rounded-2xl flex items-center justify-center shadow-lg`}
                >
                  <category.icon className="text-white" size={28} />
                </motion.div>
                <div>
                  <h3 className="text-3xl font-heading font-bold text-white mb-2">
                    {category.title}
                  </h3>
                  <div className="h-1 w-20 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full"></div>
                </div>
              </motion.div>

              {/* Skills List */}
              <motion.div
                variants={containerVariants}
                className="space-y-6"
              >
                {category.skills.map((skill, skillIndex) => (
                  <motion.div
                    key={skill.name}
                    variants={skillVariants}
                    className="group/skill"
                  >
                    <motion.div
                      whileHover={{ scale: 1.02, x: 10 }}
                      className="relative p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-300"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <motion.div
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.3 }}
                            className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center"
                          >
                            <skill.icon className="text-white" size={16} />
                          </motion.div>
                          <span className="font-semibold text-white text-lg">
                            {skill.name}
                          </span>
                        </div>
                        <motion.span
                          initial={{ opacity: 0, scale: 0 }}
                          animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
                          transition={{ delay: 0.8 + (categoryIndex * 0.2) + (skillIndex * 0.1) }}
                          className="text-sm font-bold text-yellow-400 bg-yellow-400/20 px-3 py-1 rounded-full"
                        >
                          {skill.level}%
                        </motion.span>
                      </div>
                      
                      {/* Animated Progress Bar */}
                      <div className="relative h-3 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          className="absolute inset-y-0 left-0 bg-gradient-to-r from-transparent via-white/60 to-transparent rounded-full"
                          initial={{ width: 0 }}
                          animate={isInView ? { width: `${skill.level}%` } : { width: 0 }}
                          transition={{ 
                            delay: 0.5 + (categoryIndex * 0.2) + (skillIndex * 0.1),
                            duration: 1.5,
                            ease: "easeOut"
                          }}
                        />
                        <motion.div
                          className="absolute inset-y-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-full"
                          initial={{ width: 0 }}
                          animate={isInView ? { width: `${skill.level}%` } : { width: 0 }}
                          transition={{ 
                            delay: 0.5 + (categoryIndex * 0.2) + (skillIndex * 0.1),
                            duration: 1.5,
                            ease: "easeOut"
                          }}
                        />
                      </div>
                    </motion.div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {/* Additional Skills Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-16 text-center"
        >
          <h3 className="text-2xl font-heading font-bold mb-8 text-secondary-800 dark:text-white">
            Additional Skills & Learning
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {[
              'Problem Solving',
              'Team Collaboration',
              'Agile Methodology',
              'Code Review',
              'Documentation',
              'Testing',
              'Performance Optimization',
              'Security Best Practices'
            ].map((skill, index) => (
              <motion.div
                key={skill}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                transition={{ delay: 1 + (index * 0.1), duration: 0.4 }}
                whileHover={{ scale: 1.05, y: -2 }}
                className="p-3 bg-secondary-100 dark:bg-secondary-800 rounded-lg text-sm font-medium text-secondary-700 dark:text-secondary-300 hover:bg-primary-100 dark:hover:bg-primary-900/30 hover:text-primary-700 dark:hover:text-primary-300 transition-all duration-200"
              >
                {skill}
              </motion.div>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 1.5, duration: 0.6 }}
            className="mt-8 text-secondary-600 dark:text-secondary-400"
          >
            Always expanding my knowledge and staying up-to-date with the latest technologies and best practices
          </motion.p>
        </motion.div>
      </div>
    </section>
  )
}


// ============================================================================
// PROJECTS SECTION
// ============================================================================

function ProjectsSection() {
  const ref = useRef(null)
  // Using intersection observer to trigger animations when section comes into view
  // The -100px margin gives a nice early trigger effect
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  
  // Hover tracking for per-card emphasis
  const [isHovered, setIsHovered] = useState(false)
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)

  // Removed global mousemove tracking to avoid re-renders every frame

  // Project data (memoized to avoid re-creation)
  const projects = useMemo(() => [
    {
      title: 'Imperial Watch Store',
      description: 'One of my first college group projects where I served as project lead. A luxury e-commerce website for high-end watches built with HTML, CSS, and JavaScript. Features responsive design, shopping cart functionality, advanced filtering, and smooth animations. Showcased modern web development practices and e-commerce functionality.',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=400&fit=crop',
      technologies: ['HTML', 'CSS', 'JavaScript', 'Responsive Design'],
      github: 'https://github.com/MaulikI8/imperialwatch',
      live: null,
      category: 'E-commerce',
      featured: true
    },
    {
      title: 'Gym Management System',
      description: 'My Java project from early 2025 that I enhanced even more. A comprehensive desktop application built with Java Swing for managing gym memberships, attendance tracking, payment processing, and plan upgrades. Features modern UI with dark theme, dashboard analytics, and data persistence.',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop',
      technologies: ['Java', 'Swing'],
      github: 'https://github.com/MaulikI8/GYM',
      live: null,
      category: 'Desktop App',
      featured: true
    },
    {
      title: 'CV Craft Pro',
      description: 'An AI-powered resume builder that helps users create professional resumes with intelligent suggestions and modern templates. Built with React frontend, Django backend, and PostgreSQL database hosted on Render.',
      image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&h=400&fit=crop',
      technologies: ['React', 'Django', 'PostgreSQL', 'AI Integration'],
      github: 'https://github.com/MaulikI8',
      live: 'https://cvcraftproapp.vercel.app',
      category: 'Web App',
      featured: true
    },
    {
      title: 'TaskFlow Manager',
      description: 'A collaborative task management tool with real-time updates, team collaboration features, and project tracking capabilities.',
      image: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=600&h=400&fit=crop',
      technologies: ['Next.js', 'TypeScript', 'Prisma', 'PostgreSQL'],
      github: 'https://github.com/MaulikI8',
      live: 'https://taskflow-manager.vercel.app',
      category: 'SaaS',
      featured: false
    }
  ], [])

  // Animation variants for the container - staggered children animation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2, // Each child animates 0.2s after the previous one
      },
    },
  }

  // Animation variants for individual project cards
  const projectVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6, // Smooth 0.6s animation
      },
    },
  }

  return (
    <section id="projects" className="section-padding bg-secondary-50 dark:bg-secondary-800/50">
      <div className="container-custom">
        {/* Section header with animated entrance */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium mb-4">
            Featured Projects
          </span>
          <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6 text-secondary-800 dark:text-white">
            My <span className="gradient-text">Creative Work</span>
          </h2>
          <p className="text-xl text-secondary-600 dark:text-secondary-400 max-w-3xl mx-auto">
            A showcase of projects that demonstrate my skills in full-stack development, from e-commerce solutions to desktop applications
          </p>
        </motion.div>

        {/* Projects grid with staggered animations */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid lg:grid-cols-2 gap-8"
        >
          {projects.map((project, index) => (
            <motion.div
              key={project.title}
              variants={projectVariants}
              className={`group relative transition-all duration-300 ${
                hoveredCard === index ? 'z-10' : ''
              }`}
              style={{
                // Opacity is cheaper than filter blur for de-emphasis
                opacity: hoveredCard !== null && hoveredCard !== index ? 0.85 : 1,
                perspective: 1000,
                transformStyle: 'preserve-3d',
                willChange: 'transform'
              }}
              // Subtle transform-only hover to stay at 60fps on low-end devices
              whileHover={{ 
                scale: 1.01,
                rotateY: 3,
                rotateX: 3
              }}
              transition={{ type: 'tween', duration: 0.12 }}
              onHoverStart={() => {
                setIsHovered(true)
                setHoveredCard(index)
              }}
              onHoverEnd={() => {
                setIsHovered(false)
                setHoveredCard(null)
              }}
            >
              <motion.div 
                className="card overflow-hidden h-full shadow-lg group-hover:shadow-xl transition-shadow duration-200"
                style={{
                  transformStyle: 'preserve-3d',
                  willChange: 'transform'
                }}
              >
                {/* Project illustration area - using custom SVGs instead of stock photos */}
                <div className="relative h-64 overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900">
                  {/* Conditional rendering for each project's custom illustration */}
                  {project.title === 'Imperial Watch Store' && <WatchStoreSVG />}
                  {project.title === 'Gym Management System' && <GymSystemSVG />}
                  {project.title === 'CV Craft Pro' && <CVCraftSVG />}
                  {project.title === 'TaskFlow Manager' && <TaskFlowSVG />}
                  
                  {/* Overlay buttons that appear on hover */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20">
                    <div className="flex gap-4">
                      {/* Live demo button - only show if project has a live URL */}
                      {project.live && (
                        <motion.a
                          href={project.live}
                          target="_blank"
                          rel="noopener noreferrer"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-3 bg-white/90 backdrop-blur-sm rounded-full text-secondary-800 hover:bg-white transition-colors duration-200"
                        >
                          <HiExternalLink size={20} />
                        </motion.a>
                      )}
                      {/* GitHub link button */}
                      <motion.a
                        href={project.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-3 bg-white/90 rounded-full text-secondary-800 hover:bg-white transition-colors duration-200"
                      >
                        <FaGithub size={20} />
                      </motion.a>
                    </div>
                  </div>

                  {/* Project category badge */}
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-primary-600 text-white text-xs font-medium rounded-full">
                      {project.category}
                    </span>
                  </div>

                  {/* Featured badge for special projects */}
                  {project.featured && (
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 bg-accent-600 text-white text-xs font-medium rounded-full">
                        Featured
                      </span>
                    </div>
                  )}
                </div>

                {/* Project content area */}
                <div className="p-6">
                  <h3 className="text-2xl font-heading font-bold mb-3 text-secondary-800 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200">
                    {project.title}
                  </h3>
                  
                  <p className="text-secondary-600 dark:text-secondary-400 mb-4 leading-relaxed">
                    {project.description}
                  </p>

                  {/* Technology tags */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {project.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="px-3 py-1 bg-secondary-100 dark:bg-secondary-700 text-secondary-700 dark:text-secondary-300 text-sm rounded-full"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-3">
                    {/* Live demo button */}
                    {project.live && (
                      <motion.a
                        href={project.live}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors duration-200"
                      >
                        <HiEye size={16} />
                        Live Demo
                      </motion.a>
                    )}
                    {/* GitHub code button */}
                    <motion.a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-2 px-4 py-2 bg-secondary-200 dark:bg-secondary-700 hover:bg-secondary-300 dark:hover:bg-secondary-600 text-secondary-800 dark:text-white rounded-lg font-medium transition-colors duration-200"
                    >
                      <HiCode size={16} />
                      View Code
                    </motion.a>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {/* Call-to-action to view more projects on GitHub */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="text-center mt-12"
        >
          <motion.a
            href="https://github.com/MaulikI8"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-secondary-200 dark:bg-secondary-700 hover:bg-primary-600 hover:text-white text-secondary-800 dark:text-white rounded-lg font-medium transition-all duration-300"
          >
            <FaGithub size={20} />
            View All Projects on GitHub
            <HiExternalLink size={16} />
          </motion.a>
        </motion.div>
      </div>
    </section>
  )
}


// ============================================================================
// TECHSTACK SECTION
// ============================================================================

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { 
  FaReact, 
  FaNodeJs, 
  FaPython, 
  FaJava, 
  FaJs, 
  FaHtml5, 
  FaCss3Alt, 
  FaGitAlt, 
  FaDocker, 
  FaAws,
  FaGithub
} from 'react-icons/fa'
import { 
  SiNextdotjs,
  SiTypescript,
  SiMongodb,
  SiPostgresql,
  SiTailwindcss,
  SiVercel,
  SiVisualstudiocode
} from 'react-icons/si'

function TechStackSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const techStack = [
    { name: 'React', icon: FaReact, color: 'from-blue-400 to-blue-600', category: 'Frontend' },
    { name: 'Next.js', icon: SiNextdotjs, color: 'from-gray-600 to-gray-800', category: 'Frontend' },
    { name: 'TypeScript', icon: SiTypescript, color: 'from-blue-600 to-blue-800', category: 'Frontend' },
    { name: 'JavaScript', icon: FaJs, color: 'from-yellow-400 to-yellow-600', category: 'Frontend' },
    { name: 'HTML', icon: FaHtml5, color: 'from-orange-400 to-orange-600', category: 'Frontend' },
    { name: 'CSS', icon: FaCss3Alt, color: 'from-blue-600 to-blue-800', category: 'Frontend' },
    { name: 'Tailwind CSS', icon: SiTailwindcss, color: 'from-cyan-400 to-cyan-600', category: 'Frontend' },
    { name: 'Node.js', icon: FaNodeJs, color: 'from-green-600 to-green-800', category: 'Backend' },
    { name: 'Python', icon: FaPython, color: 'from-yellow-600 to-blue-700', category: 'Backend' },
    { name: 'Java', icon: FaJava, color: 'from-red-600 to-red-800', category: 'Backend' },
    { name: 'MongoDB', icon: SiMongodb, color: 'from-green-600 to-green-800', category: 'Database' },
    { name: 'PostgreSQL', icon: SiPostgresql, color: 'from-blue-600 to-blue-800', category: 'Database' },
    { name: 'Git', icon: FaGitAlt, color: 'from-orange-600 to-red-600', category: 'Tools' },
    { name: 'GitHub', icon: FaGithub, color: 'from-gray-600 to-gray-800', category: 'Tools' },
    { name: 'Docker', icon: FaDocker, color: 'from-blue-600 to-blue-800', category: 'DevOps' },
    { name: 'AWS', icon: FaAws, color: 'from-orange-600 to-orange-800', category: 'Cloud' },
    { name: 'Vercel', icon: SiVercel, color: 'from-gray-600 to-gray-800', category: 'Deployment' },
    { name: 'VS Code', icon: SiVisualstudiocode, color: 'from-blue-600 to-blue-800', category: 'Tools' },
  ]

  const categories = ['All', 'Frontend', 'Backend', 'Database', 'Tools', 'DevOps', 'Cloud', 'Deployment']

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.8 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
      },
    },
  }

  return (
    <section className="section-padding">
      <div className="container-custom">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium mb-4">
            Tech Stack & Tools
          </span>
          <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6 text-secondary-800 dark:text-white">
            Technologies I <span className="gradient-text">Work With</span>
          </h2>
          <p className="text-xl text-secondary-600 dark:text-secondary-400 max-w-3xl mx-auto">
            A comprehensive collection of tools and technologies that power my development workflow
          </p>
        </motion.div>

        {/* Tech Stack Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 mb-12"
        >
          {techStack.map((tech, index) => (
            <motion.div
              key={tech.name}
              variants={itemVariants}
              whileHover={{ 
                scale: 1.1, 
                y: -10,
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.95 }}
              className="group cursor-pointer"
            >
              <div className="card p-6 text-center hover:shadow-xl transition-all duration-300 h-full">
                <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-r ${tech.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
                  <tech.icon className="text-white" size={32} />
                </div>
                <h3 className="font-semibold text-secondary-800 dark:text-white mb-1">
                  {tech.name}
                </h3>
                <p className="text-xs text-secondary-500 dark:text-secondary-400">
                  {tech.category}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Animated Carousel Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="relative overflow-hidden bg-gradient-to-r from-primary-50 to-accent-50 dark:from-secondary-800 dark:to-secondary-700 rounded-2xl p-8"
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-heading font-bold mb-4 text-secondary-800 dark:text-white">
              Continuous Learning & Growth
            </h3>
            <p className="text-secondary-600 dark:text-secondary-400">
              Always exploring new technologies and expanding my skill set
            </p>
          </div>

          {/* Scrolling Carousel */}
          <div className="relative">
            <div className="flex space-x-8 animate-scroll">
              {/* First set */}
              {techStack.map((tech, index) => (
                <motion.div
                  key={`first-${index}`}
                  initial={{ opacity: 0, x: -50 }}
                  animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
                  transition={{ delay: 0.7 + (index * 0.1), duration: 0.5 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="flex-shrink-0"
                >
                  <div className={`w-20 h-20 bg-gradient-to-r ${tech.color} rounded-xl flex items-center justify-center shadow-lg`}>
                    <tech.icon className="text-white" size={40} />
                  </div>
                </motion.div>
              ))}
              {/* Duplicate set for seamless loop */}
              {techStack.map((tech, index) => (
                <motion.div
                  key={`second-${index}`}
                  initial={{ opacity: 0, x: -50 }}
                  animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
                  transition={{ delay: 0.7 + (index * 0.1), duration: 0.5 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="flex-shrink-0"
                >
                  <div className={`w-20 h-20 bg-gradient-to-r ${tech.color} rounded-xl flex items-center justify-center shadow-lg`}>
                    <tech.icon className="text-white" size={40} />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Learning Focus */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="mt-8 grid md:grid-cols-3 gap-6"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaReact className="text-white" size={32} />
              </div>
              <h4 className="font-semibold text-secondary-800 dark:text-white mb-2">Frontend Focus</h4>
              <p className="text-sm text-secondary-600 dark:text-secondary-400">
                React, Next.js, and modern CSS frameworks
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaNodeJs className="text-white" size={32} />
              </div>
              <h4 className="font-semibold text-secondary-800 dark:text-white mb-2">Backend Expertise</h4>
              <p className="text-sm text-secondary-600 dark:text-secondary-400">
                Node.js, Python, Java, and database design
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-violet-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaAws className="text-white" size={32} />
              </div>
              <h4 className="font-semibold text-secondary-800 dark:text-white mb-2">DevOps & Cloud</h4>
              <p className="text-sm text-secondary-600 dark:text-secondary-400">
                CI/CD, Docker, AWS, and deployment strategies
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* Custom CSS for scrolling animation */}
        <style jsx>{`
          @keyframes scroll {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-50%);
            }
          }
          
          .animate-scroll {
            animation: scroll 30s linear infinite;
          }
          
          .animate-scroll:hover {
            animation-play-state: paused;
          }
        `}</style>
      </div>
    </section>
  )
}


// ============================================================================
// EXPERIENCE SECTION
// ============================================================================

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { HiAcademicCap, HiBriefcase, HiCalendar, HiLocationMarker } from 'react-icons/hi'

function ExperienceSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const experience = [
    {
      title: 'Student Developer & Freelancer',
      company: 'Self-Employed & Academic Projects',
      period: '2024 - Present',
      type: 'work',
      description: 'Working on various web development projects including e-commerce sites, desktop applications, and web tools. Building expertise in full-stack development through hands-on experience and academic projects.',
      achievements: [
        'Developed multiple client websites with responsive design',
        'Built Django web applications and React frontends',
        'Created Java desktop applications with GUI interfaces',
        'Implemented database solutions and API integrations'
      ]
    },
    {
      title: 'Tech Enthusiast & Self-Learner',
      company: 'Personal Projects & Coursework',
      period: '2024 - Present',
      type: 'work',
      description: 'Developed multiple projects including Django web applications, React frontends, Java desktop applications, and database management systems. Continuously expanding skills through self-directed learning and university coursework.',
      achievements: [
        'Mastered Python, HTML, CSS, JavaScript in 2024',
        'Advanced into Java, Django, React, CI/CD, Cloud in 2025',
        'Built comprehensive full-stack applications',
        'Participated in university coursework and projects'
      ]
    }
  ]

  const education = [
    {
      title: 'BSc Hons in Computing',
      institution: 'London Metropolitan University (via Islington College, Kathmandu)',
      period: '2024 - Present',
      type: 'education',
      status: '2nd Year',
      description: 'Currently in my 2nd year of BSc Hons Computing program, focusing on software development, computer science fundamentals, and practical application of modern technologies.',
      achievements: [
        'Maintaining strong academic performance',
        'Participating in coding competitions and hackathons',
        'Building practical projects alongside coursework',
        'Exploring advanced programming concepts and frameworks'
      ]
    }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
      },
    },
  }

  return (
    <section id="experience" className="section-padding bg-secondary-50 dark:bg-secondary-800/50">
      <div className="container-custom">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium mb-4">
            Experience & Education
          </span>
          <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6 text-secondary-800 dark:text-white">
            My <span className="gradient-text">Journey</span>
          </h2>
          <p className="text-xl text-secondary-600 dark:text-secondary-400 max-w-3xl mx-auto">
            A combination of hands-on experience, academic learning, and continuous self-improvement
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Experience Section */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mb-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                  <HiBriefcase className="text-white" size={24} />
                </div>
                <h3 className="text-3xl font-heading font-bold text-secondary-800 dark:text-white">
                  Experience
                </h3>
              </div>
            </motion.div>

            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary-500 to-accent-500"></div>

              {experience.map((exp, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="relative flex items-start gap-6 mb-8"
                >
                  {/* Timeline Dot */}
                  <motion.div
                    whileHover={{ scale: 1.2 }}
                    className="relative z-10 w-12 h-12 bg-white dark:bg-secondary-800 rounded-full border-4 border-primary-500 flex items-center justify-center shadow-lg"
                  >
                    <HiBriefcase className="text-primary-500" size={20} />
                  </motion.div>

                  {/* Content */}
                  <motion.div
                    whileHover={{ x: 10 }}
                    className="flex-1 bg-white dark:bg-secondary-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-secondary-200 dark:border-secondary-700"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
                      <h4 className="text-xl font-semibold text-secondary-800 dark:text-white mb-1">
                        {exp.title}
                      </h4>
                      <span className="text-sm font-medium text-primary-600 dark:text-primary-400 bg-primary-100 dark:bg-primary-900/30 px-3 py-1 rounded-full">
                        {exp.period}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <HiLocationMarker className="text-secondary-500" size={16} />
                      <span className="text-secondary-600 dark:text-secondary-400 font-medium">
                        {exp.company}
                      </span>
                    </div>

                    <p className="text-secondary-600 dark:text-secondary-400 mb-4 leading-relaxed">
                      {exp.description}
                    </p>

                    <div>
                      <h5 className="font-semibold text-secondary-800 dark:text-white mb-2">Key Achievements:</h5>
                      <ul className="space-y-1">
                        {exp.achievements.map((achievement, achIndex) => (
                          <li key={achIndex} className="flex items-start gap-2 text-sm text-secondary-600 dark:text-secondary-400">
                            <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-2 flex-shrink-0"></span>
                            {achievement}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Education Section */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="mb-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-accent-500 to-primary-500 rounded-lg flex items-center justify-center">
                  <HiAcademicCap className="text-white" size={24} />
                </div>
                <h3 className="text-3xl font-heading font-bold text-secondary-800 dark:text-white">
                  Education
                </h3>
              </div>
            </motion.div>

            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-accent-500 to-primary-500"></div>

              {education.map((edu, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="relative flex items-start gap-6 mb-8"
                >
                  {/* Timeline Dot */}
                  <motion.div
                    whileHover={{ scale: 1.2 }}
                    className="relative z-10 w-12 h-12 bg-white dark:bg-secondary-800 rounded-full border-4 border-accent-500 flex items-center justify-center shadow-lg"
                  >
                    <HiAcademicCap className="text-accent-500" size={20} />
                  </motion.div>

                  {/* Content */}
                  <motion.div
                    whileHover={{ x: 10 }}
                    className="flex-1 bg-white dark:bg-secondary-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-secondary-200 dark:border-secondary-700"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
                      <h4 className="text-xl font-semibold text-secondary-800 dark:text-white mb-1">
                        {edu.title}
                      </h4>
                      <div className="flex flex-col sm:items-end gap-1">
                        <span className="text-sm font-medium text-accent-600 dark:text-accent-400 bg-accent-100 dark:bg-accent-900/30 px-3 py-1 rounded-full">
                          {edu.period}
                        </span>
                        <span className="text-xs font-medium text-primary-600 dark:text-primary-400">
                          {edu.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <HiLocationMarker className="text-secondary-500" size={16} />
                      <span className="text-secondary-600 dark:text-secondary-400 font-medium">
                        {edu.institution}
                      </span>
                    </div>

                    <p className="text-secondary-600 dark:text-secondary-400 mb-4 leading-relaxed">
                      {edu.description}
                    </p>

                    <div>
                      <h5 className="font-semibold text-secondary-800 dark:text-white mb-2">Current Focus:</h5>
                      <ul className="space-y-1">
                        {edu.achievements.map((achievement, achIndex) => (
                          <li key={achIndex} className="flex items-start gap-2 text-sm text-secondary-600 dark:text-secondary-400">
                            <span className="w-1.5 h-1.5 bg-accent-500 rounded-full mt-2 flex-shrink-0"></span>
                            {achievement}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Additional Information */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-16 text-center"
        >
          <div className="bg-white dark:bg-secondary-800 p-8 rounded-2xl shadow-lg border border-secondary-200 dark:border-secondary-700">
            <h3 className="text-2xl font-heading font-bold mb-4 text-secondary-800 dark:text-white">
              Continuous Learning & Growth
            </h3>
            <p className="text-secondary-600 dark:text-secondary-400 mb-6 max-w-2xl mx-auto">
              I believe in lifelong learning and staying updated with the latest technologies. 
              Currently focusing on expanding my knowledge in cloud computing, CI/CD practices, 
              and advanced backend architectures.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold text-lg">100%</span>
                </div>
                <h4 className="font-semibold text-secondary-800 dark:text-white">Dedication</h4>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold text-lg">24/7</span>
                </div>
                <h4 className="font-semibold text-secondary-800 dark:text-white">Learning</h4>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-violet-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold text-lg">∞</span>
                </div>
                <h4 className="font-semibold text-secondary-800 dark:text-white">Growth</h4>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}


// ============================================================================
// CERTIFICATES SECTION
// ============================================================================

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { FaCertificate, FaExternalLinkAlt, FaGraduationCap } from 'react-icons/fa'

function CertificatesSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const certificates = [
    {
      title: "Meta Backend Developer Certificate",
      issuer: "Meta",
      platform: "Coursera",
      date: "2025",
      description: "Comprehensive backend development course covering APIs, databases, and server-side technologies",
      url: "https://coursera.org/share/1725d006a6476fc3f1129f0899b7f4d9",
      icon: FaGraduationCap,
      color: "from-blue-500 to-indigo-600"
    },
    {
      title: "Python for Everybody",
      issuer: "University of Michigan", 
      platform: "Coursera",
      date: "2025",
      description: "Complete Python programming course covering fundamentals to advanced concepts",
      url: "https://coursera.org/share/ff3930e0f4ef016276d73598d5654c61",
      icon: FaCertificate,
      color: "from-green-500 to-emerald-600"
    }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
      },
    },
  }

  return (
    <section id="certificates" className="relative min-h-screen flex items-center py-20 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3 bg-white/10 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              scale: 0,
            }}
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>

      <div className="container-custom relative z-10">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mb-6"
          >
            <span className="inline-block px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white font-medium">
              Certifications
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-5xl md:text-7xl font-heading font-bold mb-8"
            style={{
              background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57)',
              backgroundSize: '400% 400%',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'gradient 4s ease infinite'
            }}
          >
            Learning
            <br />
            <span className="text-white">Achievements</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="text-xl text-white/70 max-w-3xl mx-auto"
          >
            Professional certifications that validate my technical expertise and continuous learning journey
          </motion.p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid md:grid-cols-2 gap-8 mb-12"
        >
          {certificates.map((cert, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="group"
            >
              <motion.div
                whileHover={{ scale: 1.02, y: -5 }}
                className="relative p-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-500 overflow-hidden"
              >
                {/* Certificate Icon */}
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                  className={`w-16 h-16 bg-gradient-to-r ${cert.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}
                >
                  <cert.icon className="text-white" size={28} />
                </motion.div>

                {/* Certificate Info */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-yellow-400 transition-colors duration-300">
                      {cert.title}
                    </h3>
                    <div className="flex items-center gap-4 text-white/70">
                      <span className="font-semibold">{cert.issuer}</span>
                      <span>•</span>
                      <span>{cert.platform}</span>
                      <span>•</span>
                      <span>{cert.date}</span>
                    </div>
                  </div>

                  <p className="text-white/80 leading-relaxed">
                    {cert.description}
                  </p>

                  {/* Action Button */}
                  <motion.a
                    href={cert.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white font-medium transition-all duration-300"
                  >
                    View Certificate
                    <FaExternalLinkAlt size={14} />
                  </motion.a>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-xl"></div>
                <div className="absolute bottom-4 left-4 w-16 h-16 bg-gradient-to-tr from-white/5 to-transparent rounded-full blur-xl"></div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {/* View More Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="text-center"
        >
          <motion.a
            href="https://www.linkedin.com/in/maulik-joshi-176418331/details/certifications/"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full font-semibold transition-all duration-300 shadow-lg hover:shadow-purple-500/25"
          >
            <FaGraduationCap size={20} />
            View All Certifications
            <FaExternalLinkAlt size={16} />
          </motion.a>
          <p className="text-white/60 text-sm mt-4">
            Explore my complete certification portfolio on LinkedIn
          </p>
        </motion.div>
      </div>
    </section>
  )
}


// ============================================================================
// CONTACT SECTION
// ============================================================================

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef, useState } from 'react'
import { HiMail, HiPhone, HiLocationMarker, HiPaperAirplane } from 'react-icons/hi'
import { FaGithub, FaLinkedin, FaTwitter } from 'react-icons/fa'
import emailjs from '@emailjs/browser'

function ContactSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const contactInfo = [
    {
      icon: HiMail,
      title: 'Email',
      value: 'jmaulik21@gmail.com',
      link: 'mailto:jmaulik21@gmail.com'
    },
    {
      icon: HiPhone,
      title: 'Phone',
      value: '+977 9824616674',
      link: 'tel:+9779824616674'
    },
    {
      icon: HiLocationMarker,
      title: 'Location',
      value: 'Available Worldwide',
      link: null
    }
  ]

  const socialLinks = [
    { name: 'GitHub', icon: FaGithub, href: 'https://github.com/MaulikI8', color: 'hover:text-gray-800 dark:hover:text-gray-200' },
    { name: 'LinkedIn', icon: FaLinkedin, href: 'https://www.linkedin.com/in/maulik-joshi-176418331/', color: 'hover:text-blue-600' },
    { name: 'Twitter', icon: FaTwitter, href: 'https://twitter.com/maulikjoshi', color: 'hover:text-blue-400' },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')
    
    try {
      // For demo purposes, we'll use a simple approach
      // In production, you'd set up EmailJS with your service credentials
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setSubmitStatus('success')
        setFormData({ name: '', email: '', message: '' })
        
        // Reset success status after 5 seconds
        setTimeout(() => setSubmitStatus('idle'), 5000)
      } else {
        throw new Error('Failed to send message')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      setSubmitStatus('error')
      
      // Reset error status after 5 seconds
      setTimeout(() => setSubmitStatus('idle'), 5000)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <section id="contact" className="section-padding">
      <div className="container-custom">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium mb-4">
            Get In Touch
          </span>
          <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6 text-secondary-800 dark:text-white">
            Let's <span className="gradient-text">Build Something</span> Great Together
          </h2>
          <p className="text-xl text-secondary-600 dark:text-secondary-400 max-w-3xl mx-auto">
            Ready to turn your ideas into reality? I'd love to hear about your project and discuss how we can work together.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h3 className="text-2xl font-heading font-bold mb-8 text-secondary-800 dark:text-white">
              Let's Connect
            </h3>
            
            <div className="space-y-6 mb-8">
              {contactInfo.map((info, index) => (
                <motion.div
                  key={info.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ delay: 0.4 + (index * 0.1), duration: 0.6 }}
                  className="flex items-center gap-4 p-4 bg-secondary-50 dark:bg-secondary-800 rounded-lg hover:shadow-md transition-all duration-300"
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                    <info.icon className="text-white" size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-secondary-800 dark:text-white">{info.title}</h4>
                    {info.link ? (
                      <a 
                        href={info.link}
                        className="text-secondary-600 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
                      >
                        {info.value}
                      </a>
                    ) : (
                      <p className="text-secondary-600 dark:text-secondary-400">{info.value}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Social Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <h4 className="text-lg font-semibold text-secondary-800 dark:text-white mb-4">
                Follow Me
              </h4>
              <div className="flex gap-4">
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
                    transition={{ delay: 1 + (index * 0.1), duration: 0.4 }}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.9 }}
                    className={`w-12 h-12 bg-secondary-100 dark:bg-secondary-700 rounded-lg flex items-center justify-center text-secondary-600 dark:text-secondary-400 transition-all duration-200 ${social.color}`}
                  >
                    <social.icon size={20} />
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {/* Availability Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 1.2, duration: 0.6 }}
              className="mt-8 p-6 bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 rounded-xl border border-primary-200 dark:border-primary-700"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <h4 className="font-semibold text-secondary-800 dark:text-white">Available for Work</h4>
              </div>
              <p className="text-secondary-600 dark:text-secondary-400 text-sm">
                Currently available for freelance projects and full-time opportunities. 
                Let's discuss how I can help bring your vision to life.
              </p>
            </motion.div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="card p-8">
              <h3 className="text-2xl font-heading font-bold mb-6 text-secondary-800 dark:text-white">
                Send a Message
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-secondary-700 text-secondary-800 dark:text-white transition-all duration-200"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-secondary-700 text-secondary-800 dark:text-white transition-all duration-200"
                    placeholder="your.email@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-secondary-700 text-secondary-800 dark:text-white transition-all duration-200 resize-none"
                    placeholder="Tell me about your project..."
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Message
                      <HiPaperAirplane size={20} />
                    </>
                  )}
                </motion.button>

                {/* Status Messages */}
                {submitStatus === 'success' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-4 bg-green-500/20 border border-green-500/30 rounded-lg"
                  >
                    <p className="text-green-400 text-center font-medium">
                      ✅ Message saved successfully! I'll get back to you soon.
                    </p>
                  </motion.div>
                )}

                {submitStatus === 'error' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg"
                  >
                    <p className="text-red-400 text-center font-medium">
                      ❌ Something went wrong. Please try again or email me directly.
                    </p>
                  </motion.div>
                )}
              </form>
            </div>
          </motion.div>
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 rounded-2xl p-8 border border-primary-200 dark:border-primary-700">
            <h3 className="text-2xl md:text-3xl font-heading font-bold mb-4 text-secondary-800 dark:text-white">
              Ready to Start Your Next Project?
            </h3>
            <p className="text-lg text-secondary-600 dark:text-secondary-400 mb-6 max-w-2xl mx-auto">
              Whether you need a full-stack web application, a backend API, or help with your existing project, 
              I'm here to help you succeed.
            </p>
            <motion.a
              href="mailto:jmaulik21@gmail.com"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 text-white rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <HiMail size={20} />
              Start a Conversation
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}


// ============================================================================
// MAIN PORTFOLIO COMPONENT
// ============================================================================

export default function Home() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2500)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) return <LoadingScreen />

  return (
    <>
      <ScrollProgress />
      <EasterEggs />
      <UniqueInteractions />
      <HeroSection />
      <AboutSection />
      <SkillsSection />
      <ProjectsSection />
      <LiveCodePlayground />
      <GamifiedExperience />
      <TechStackSection />
      <ExperienceSection />
      <CertificatesSection />
      <ContactSection />
    </>
  )
}
