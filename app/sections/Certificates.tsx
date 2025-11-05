'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { FaCertificate, FaExternalLinkAlt, FaGraduationCap } from 'react-icons/fa'

export default function Certificates() {
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
