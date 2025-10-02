'use client'

import { Input } from '@/components/ui/input'

interface HeuresSupInputProps {
  label: string
  majorationLabel: string
  majorationColor: string
  value: number | undefined
  onChange: (value: string) => void
  max?: number
}

export function HeuresSupInput({
  label,
  majorationLabel,
  majorationColor,
  value,
  onChange,
  max
}: HeuresSupInputProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} <span className={majorationColor}>({majorationLabel})</span>
      </label>
      <Input
        type="number"
        step="0.5"
        min="0"
        max={max}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder="0"
        className="w-full"
      />
    </div>
  )
}