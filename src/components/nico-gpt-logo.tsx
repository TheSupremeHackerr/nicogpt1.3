import React from 'react'

interface NicoGPTLogoProps {
  className?: string
}

export default function NicoGPTLogo({ className = "" }: NicoGPTLogoProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="currentColor"
    >
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="45" fill="url(#logoGradient)" />
      <text
        x="50"
        y="50"
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize="40"
        fontWeight="bold"
        fill="white"
        fontFamily="Arial, sans-serif"
      >
        N
      </text>
      <path
        d="M25,70 Q50,90 75,70"
        fill="none"
        stroke="white"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle cx="30" cy="40" r="5" fill="white" />
      <circle cx="70" cy="40" r="5" fill="white" />
    </svg>
  )
}
