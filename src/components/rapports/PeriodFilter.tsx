// Composant de filtre par période

import React from 'react'

interface PeriodFilterProps {
  periode: string
  onPeriodChange: (periode: string) => void
}

export default function PeriodFilter({ periode, onPeriodChange }: PeriodFilterProps) {
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 3 }, (_, i) => currentYear - i)
  const months = [
    { value: '01', label: 'Janvier' },
    { value: '02', label: 'Février' },
    { value: '03', label: 'Mars' },
    { value: '04', label: 'Avril' },
    { value: '05', label: 'Mai' },
    { value: '06', label: 'Juin' },
    { value: '07', label: 'Juillet' },
    { value: '08', label: 'Août' },
    { value: '09', label: 'Septembre' },
    { value: '10', label: 'Octobre' },
    { value: '11', label: 'Novembre' },
    { value: '12', label: 'Décembre' }
  ]

  const [year, month] = periode.split('-')

  return (
    <div className="flex items-center gap-4">
      <label className="text-sm font-medium text-gray-700">Période :</label>

      <select
        value={month}
        onChange={(e) => onPeriodChange(`${year}-${e.target.value}`)}
        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        {months.map(m => (
          <option key={m.value} value={m.value}>{m.label}</option>
        ))}
      </select>

      <select
        value={year}
        onChange={(e) => onPeriodChange(`${e.target.value}-${month}`)}
        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        {years.map(y => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>

      <button
        onClick={() => {
          const now = new Date()
          const currentMonth = String(now.getMonth() + 1).padStart(2, '0')
          onPeriodChange(`${now.getFullYear()}-${currentMonth}`)
        }}
        className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md"
      >
        Mois actuel
      </button>
    </div>
  )
}