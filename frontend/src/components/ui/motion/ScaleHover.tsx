import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface ScaleHoverProps {
  children: ReactNode
  className?: string
  scale?: number
  y?: number
}

export function ScaleHover({
  children,
  className = '',
  scale = 1.02,
  y = -4,
}: ScaleHoverProps) {
  return (
    <motion.div
      className={className}
      whileHover={{ scale, y }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}
