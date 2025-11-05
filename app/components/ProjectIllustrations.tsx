'use client'

import { motion } from 'framer-motion'

// Watch store illustration - spent way too long getting the gradients right
export const WatchStoreSVG = () => (
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
export const GymSystemSVG = () => (
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
export const CVCraftSVG = () => (
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
export const TaskFlowSVG = () => (
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
