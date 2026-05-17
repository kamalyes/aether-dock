import { motion } from 'framer-motion'
import type { SwitchProps } from './typings'

export function Switch({ checked, onClick, disabled = false, size = 'md' }: SwitchProps) {
  const trackW = size === 'sm' ? 32 : 40
  const trackH = size === 'sm' ? 18 : 22
  const thumbSize = size === 'sm' ? 14 : 18
  const thumbX = checked ? trackW - thumbSize - 2 : 2

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="relative inline-flex items-center shrink-0"
      style={{
        width: trackW,
        height: trackH,
        borderRadius: trackH,
        background: checked ? 'var(--c-accent)' : 'var(--c-bg-input)',
        border: `1px solid ${checked ? 'var(--c-accent)' : 'var(--c-border)'}`,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'background 0.2s ease, border-color 0.2s ease',
        padding: 0,
      }}
      type="button"
    >
      <motion.span
        className="block rounded-full"
        style={{
          width: thumbSize,
          height: thumbSize,
          background: '#fff',
          boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
        }}
        animate={{ x: thumbX }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </button>
  )
}
