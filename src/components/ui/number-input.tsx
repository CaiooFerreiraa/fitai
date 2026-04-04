"use client"

import * as React from "react"
import { Plus, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

interface NumberInputProps {
  id?: string
  name?: string
  defaultValue?: string | number
  value?: number
  onChange?: (val: number) => void
  placeholder?: string
  step?: number
  min?: number
  max?: number
  className?: string
}

export function NumberInput({ 
  id, 
  name, 
  defaultValue, 
  value: controlledValue,
  onChange,
  placeholder, 
  step = 1,
  min,
  max,
  className 
}: NumberInputProps) {
  const [internalValue, setInternalValue] = React.useState<number>(controlledValue ?? Number(defaultValue) ?? 0)
  
  const isControlled = controlledValue !== undefined
  const value = isControlled ? controlledValue : internalValue

  const handleUpdate = (newValue: number) => {
    let finalValue = isNaN(newValue) ? 0 : newValue
    if (min !== undefined) finalValue = Math.max(min, finalValue)
    if (max !== undefined) finalValue = Math.min(max, finalValue)
    
    if (!isControlled) {
      setInternalValue(finalValue)
    }
    onChange?.(finalValue)
  }

  const increment = (e: React.MouseEvent) => {
    e.preventDefault()
    handleUpdate(Number((value + step).toFixed(2)))
  }
  
  const decrement = (e: React.MouseEvent) => {
    e.preventDefault()
    handleUpdate(Number((value - step).toFixed(2)))
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value)
    handleUpdate(val)
  }

  return (
    <div className={cn(
      "group flex items-center bg-[var(--background)] border-2 border-[var(--border)] focus-within:border-[var(--primary)] rounded-2xl overflow-hidden transition-all shadow-[3px_3px_0_0_#000000] sm:shadow-[4px_4px_0_0_#000000] focus-within:shadow-[3px_3px_0_0_#ff003322] sm:focus-within:shadow-[4px_4px_0_0_#ff003322]",
      className
    )}>
      <button
        type="button"
        onClick={decrement}
        className="h-full px-2.5 sm:px-5 flex items-center justify-center bg-[var(--surface)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white transition-all cursor-pointer border-r border-[var(--border)] active:translate-y-0.5 active:shadow-inner shrink-0 min-w-[32px] sm:min-w-[44px]"
      >
        <Minus className="w-3.5 h-3.5 sm:w-5 sm:h-5" strokeWidth={5} />
      </button>
      
      <input
        id={id}
        name={name}
        type="number"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full h-full bg-transparent text-center font-black text-white focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none cursor-text px-1 sm:px-4 italic tracking-tighter"
      />

      <button
        type="button"
        onClick={increment}
        className="h-full px-2.5 sm:px-5 flex items-center justify-center bg-[var(--surface)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white transition-all cursor-pointer border-l border-[var(--border)] active:translate-y-0.5 active:shadow-inner shrink-0 min-w-[32px] sm:min-w-[44px]"
      >
        <Plus className="w-3.5 h-3.5 sm:w-5 sm:h-5" strokeWidth={5} />
      </button>
    </div>
  )
}
