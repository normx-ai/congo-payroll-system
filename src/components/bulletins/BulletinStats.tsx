'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Download } from 'lucide-react'

interface BulletinStatsProps {
  selectedMonth: string
  selectedYear: string
  employeeCount: number
  generatedCount: number
}

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
  { value: '12', label: 'Décembre' },
]

export function BulletinStats({
  selectedMonth,
  selectedYear,
  employeeCount,
  generatedCount
}: BulletinStatsProps) {
  const pendingCount = employeeCount - generatedCount
  const currentMonth = months.find(m => m.value === selectedMonth)?.label || '-'

  return (
    <Card className="shadow-sm border-l-4 border-l-indigo-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900">
          <Calendar className="w-5 h-5 text-indigo-600" />
          Période en Cours
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        <div className="text-center bg-gray-50 py-4 rounded-lg">
          <p className="text-2xl font-bold text-gray-900">{currentMonth}</p>
          <p className="text-gray-600">{selectedYear}</p>
        </div>

        <div className="pt-4 border-t space-y-3">
          <div className="flex justify-between items-center px-2 py-1 rounded">
            <span className="text-gray-700 font-medium">Employés actifs</span>
            <span className="font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded">{employeeCount}</span>
          </div>
          <div className="flex justify-between items-center px-2 py-1 rounded">
            <span className="text-gray-700 font-medium">Bulletins générés</span>
            <span className="font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded">{generatedCount}</span>
          </div>
          <div className="flex justify-between items-center px-2 py-1 rounded">
            <span className="text-gray-700 font-medium">En attente</span>
            <span className="font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded">{pendingCount}</span>
          </div>
        </div>

        <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
          <Download className="w-4 h-4 mr-2" />
          Exporter Tous
        </Button>
      </CardContent>
    </Card>
  )
}