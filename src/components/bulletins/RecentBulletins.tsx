'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Bulletin {
  id: string
  employeeName: string
  month: string
  year: string
  generatedAt: Date
}

interface RecentBulletinsProps {
  bulletins: Bulletin[]
}

export function RecentBulletins({ bulletins }: RecentBulletinsProps) {
  return (
    <Card className="shadow-sm border-l-4 border-l-indigo-500">
      <CardHeader>
        <CardTitle className="text-gray-900">Bulletins Récents</CardTitle>
      </CardHeader>
      <CardContent>
        {bulletins.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Aucun bulletin généré récemment
          </div>
        ) : (
          <div className="space-y-2">
            {bulletins.map(bulletin => (
              <div key={bulletin.id} className="flex justify-between p-2 hover:bg-gray-50 rounded">
                <span>{bulletin.employeeName}</span>
                <span className="text-gray-500">
                  {bulletin.month}/{bulletin.year}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}