import React from 'react'
import { cn } from '@/lib/utils'

interface LogoProps {
  iconOnly?: boolean
  className?: string
  size?: number
  variant?: 'default' | 'white' | 'dim'
}

export const Logo: React.FC<LogoProps> = ({
  iconOnly = false,
  className,
  size = 28,
  variant = 'default',
}) => {
  const iconSize = size
  const textSize = Math.round(size * 0.65)

  const textColors = {
    default: 'text-[#F8FAFC]',
    white: 'text-white',
    dim: 'text-[#94A3B8]',
  }

  return (
    <div className={cn('flex items-center gap-2.5 select-none', className)}>
      {/* Premium SVG Icon */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-300 hover:rotate-6"
      >
        <defs>
          <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="50%" stopColor="#4F46E5" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Forge Chamber / Hexagonal Shield Base */}
        <path
          d="M16 2L28 9V23L16 30L4 23V9L16 2Z"
          fill="url(#logoGrad)"
          fillOpacity="0.1"
          stroke="url(#logoGrad)"
          strokeWidth="1.5"
        />

        {/* Interlocking pipeline nodes */}
        <circle cx="16" cy="9" r="2.5" fill="#6366F1" />
        <circle cx="23" cy="21" r="2.5" fill="#06B6D4" />
        <circle cx="9" cy="21" r="2.5" fill="#10B981" />

        {/* Connection pathways */}
        <path
          d="M16 11.5V17M16 17L21.5 20M16 17L10.5 20"
          stroke="url(#logoGrad)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Core glowing data sphere */}
        <circle
          cx="16"
          cy="17"
          r="3"
          fill="url(#logoGrad)"
          filter="url(#glow)"
        />
        
        {/* Outer orbital pipeline rings */}
        <path
          d="M7 12.5C9.5 8 13.5 6.5 16 6.5C21.5 6.5 25 11.5 25 16"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="1"
          strokeDasharray="2 2"
        />
      </svg>

      {/* Wordmark */}
      {!iconOnly && (
        <span
          className={cn(
            'font-bold tracking-tight select-none font-sans',
            textColors[variant]
          )}
          style={{ fontSize: `${textSize}px` }}
        >
          Data<span className="gradient-text">Forge</span>
        </span>
      )}
    </div>
  )
}
