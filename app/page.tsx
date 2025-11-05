'use client'

// Main portfolio page - this is where all the magic happens!
// I've organized it into sections for better maintainability
import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import LoadingScreen from './components/LoadingScreen'
import ScrollProgress from './components/ScrollProgress'
import EasterEggs from './components/EasterEggs'
import LiveCodePlayground from './components/LiveCodePlayground'
import GamifiedExperience from './components/GamifiedExperience'
import UniqueInteractions from './components/UniqueInteractions'
import Hero from './sections/Hero'
import About from './sections/About'
import Skills from './sections/Skills'
import Projects from './sections/Projects'
import TechStack from './sections/TechStack'
import Experience from './sections/Experience'
import Certificates from './sections/Certificates'
import Contact from './sections/Contact'

// Removed CommandLineIntro for a cleaner, more professional experience
// The loading screen provides enough visual interest

export default function Home() {
  // Loading state - gives time for assets to load and creates anticipation
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading time - 2.5s feels right, not too fast, not too slow
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2500)

    return () => clearTimeout(timer)
  }, [])

  // Show loading screen while assets are loading
  if (isLoading) {
    return <LoadingScreen />
  }

  // Main portfolio layout - each section is a separate component
  // This makes the code much more maintainable and easier to work with
  return (
    <>
      {/* Interactive elements that enhance the user experience */}
      <UniqueInteractions />
      <EasterEggs />
      <ScrollProgress />
      
      {/* Main content sections in order of importance */}
      <Hero />
      <About />
      <Skills />
      <Projects />
      
      {/* Fun interactive sections to keep visitors engaged */}
      <LiveCodePlayground />
      <GamifiedExperience />
      
      {/* Professional sections */}
      <TechStack />
      <Experience />
      <Certificates />
      <Contact />
    </>
  )
}
