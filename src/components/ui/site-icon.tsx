import React from "react"
import { cn } from "@/lib/utils"

interface SiteIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string
  /** Se deve mostrar o fundo vermelho padrão do projeto */
  showBackground?: boolean
}

export function SiteIcon({ className = "w-6 h-6", showBackground = true, ...props }: SiteIconProps) {
  const svgContent = (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={showBackground ? "w-[75%] h-[75%] pointer-events-none" : "w-full h-full pointer-events-none"}
      {...props}
    >
      <path 
        d="M3 11H21M1 7V15M3 6V16M21 6V16M23 7V15" 
        stroke="white" 
        strokeWidth="3.5" 
        strokeLinecap="square"
      />
    </svg>
  )

  if (!showBackground) {
    return <div className={cn("inline-flex items-center justify-center", className)}>{svgContent}</div>
  }

  return (
    <div 
      className={cn(
        "relative flex items-center justify-center shrink-0 bg-[#ff0033] rounded-lg border-2 border-black shadow-[3px_3px_0_0_#000] aspect-square overflow-hidden",
        className
      )}
    >
      {svgContent}
    </div>
  )
}
