import { motion } from 'framer-motion'
import type { StaggerContainerProps, StaggerItemProps } from './typings'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: (staggerDelay: number) => ({
    opacity: 1,
    transition: {
      staggerChildren: staggerDelay,
      delayChildren: 0.1,
    },
  }),
}

export const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  },
}

export function StaggerContainer({ children, className = '', staggerDelay = 0.08 }: StaggerContainerProps) {
  return (
    <motion.div className={className} variants={containerVariants} initial="hidden" animate="visible" custom={staggerDelay}>
      {children}
    </motion.div>
  )
}

export function StaggerItem({ children, className = '' }: StaggerItemProps) {
  return (
    <motion.div className={className} variants={itemVariants}>
      {children}
    </motion.div>
  )
}
