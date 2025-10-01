'use client'
import { useScroll, motion } from "framer-motion"

// Scroll Progress Indicator
export default function ScrollProgress() {
    const { scrollYProgress } = useScroll()
  
    return (
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary/80 z-50"
        style={{ originX: 0, scaleX: scrollYProgress }}
      />
    )
  }