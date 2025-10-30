'use client'

// Hero section - the first thing visitors see, so it needs to make an impact!
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import { FaGithub, FaLinkedin, FaCode, FaRocket, FaBrain, FaHeart } from 'react-icons/fa'
import { MdEmail } from 'react-icons/md'

export default function Hero() {
  // Mouse tracking for background using motion values (no React re-renders)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const mx = useSpring(mouseX, { stiffness: 200, damping: 30 })
  const my = useSpring(mouseY, { stiffness: 200, damping: 30 })
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
          style={{ x: mx.transform(v => v * 0.05), y: my.transform(v => v * 0.05) }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
        <motion.div
          className="absolute w-80 h-80 bg-gradient-to-r from-blue-700 to-cyan-700 rounded-full blur-3xl opacity-20"
          style={{ x: mx.transform(v => v * -0.03), y: my.transform(v => v * -0.03) }}
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
