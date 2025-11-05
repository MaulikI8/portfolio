'use client'

import { motion } from 'framer-motion'
import { FaGithub, FaLinkedin, FaTwitter } from 'react-icons/fa'
import { MdEmail } from 'react-icons/md'
import { HiArrowUp } from 'react-icons/hi'

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const socialLinks = [
    { name: 'GitHub', icon: FaGithub, href: 'https://github.com/MaulikI8' },
    { name: 'LinkedIn', icon: FaLinkedin, href: 'https://www.linkedin.com/in/maulik-joshi-176418331/' },
    { name: 'Twitter', icon: FaTwitter, href: 'https://twitter.com/maulikjoshi' },
    { name: 'Email', icon: MdEmail, href: 'mailto:jmaulik21@gmail.com' },
  ]

  return (
    <footer className="bg-secondary-900 text-white">
      <div className="container-custom">
        {/* Main Footer Content */}
        <div className="py-12 border-b border-secondary-800">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand Section */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold">MJ</span>
                  </div>
                  <span className="text-2xl font-heading font-bold">Maulik Joshi</span>
                </div>
                <p className="text-secondary-300 mb-6 max-w-md leading-relaxed">
                  Backend-focused full-stack developer passionate about building scalable systems 
                  and seamless web experiences. Let's create something amazing together.
                </p>
                <div className="flex gap-4">
                  {socialLinks.map((social, index) => (
                    <motion.a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1, duration: 0.4 }}
                      viewport={{ once: true }}
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-10 h-10 bg-secondary-800 hover:bg-primary-600 rounded-lg flex items-center justify-center transition-all duration-200"
                    >
                      <social.icon size={18} />
                    </motion.a>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Quick Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-3">
                {[
                  { name: 'About', href: '#about' },
                  { name: 'Skills', href: '#skills' },
                  { name: 'Projects', href: '#projects' },
                  { name: 'Experience', href: '#experience' },
                  { name: 'Certificates', href: '#certificates' },
                  { name: 'Contact', href: '#contact' },
                ].map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-secondary-300 hover:text-primary-400 transition-colors duration-200"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <h3 className="text-lg font-semibold mb-4">Get In Touch</h3>
              <div className="space-y-3 text-secondary-300">
                <p>
                  <a 
                    href="mailto:jmaulik21@gmail.com"
                    className="hover:text-primary-400 transition-colors duration-200"
                  >
                    jmaulik21@gmail.com
                  </a>
                </p>
                <p>
                  <a 
                    href="tel:+9779824616674"
                    className="hover:text-primary-400 transition-colors duration-200"
                  >
                    +977 9824616674
                  </a>
                </p>
                <p>Available Worldwide</p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="py-6 flex flex-col md:flex-row items-center justify-between">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-secondary-400 text-sm"
          >
            © 2024 Maulik Joshi. All rights reserved. Built with Next.js and Tailwind CSS.
          </motion.p>

          {/* Back to Top Button */}
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.9 }}
            onClick={scrollToTop}
            className="mt-4 md:mt-0 w-10 h-10 bg-primary-600 hover:bg-primary-700 rounded-full flex items-center justify-center transition-all duration-200"
          >
            <HiArrowUp size={18} />
          </motion.button>
        </div>
      </div>
    </footer>
  )
}
