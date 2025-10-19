'use client'

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

export default function UniqueInteractions() {
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
