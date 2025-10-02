import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  change?: string
  icon: LucideIcon
  color?: 'indigo' | 'green' | 'blue' | 'purple'
}

const colorVariants = {
  indigo: 'bg-indigo-100 text-indigo-600',
  green: 'bg-green-100 text-green-600',
  blue: 'bg-blue-100 text-blue-600',
  purple: 'bg-purple-100 text-purple-600'
}

export function StatsCard({ title, value, change, icon: Icon, color = 'indigo' }: StatsCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow border-indigo-200">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        <div className={`p-2 rounded-lg ${colorVariants[color]}`}>
          <Icon className="w-4 h-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        {change && (
          <p className="text-xs text-gray-500 mt-1">{change}</p>
        )}
      </CardContent>
    </Card>
  )
}