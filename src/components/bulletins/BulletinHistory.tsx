'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { History, Download, Eye, Calendar } from 'lucide-react'

interface BulletinHistoryProps {
  selectedEmployee: string
}

interface BulletinRecord {
  id: string
  period: string
  year: string
  generatedAt: string
  status: 'generated' | 'sent' | 'printed'
  size: string
}

const mockBulletins: BulletinRecord[] = [
  {
    id: '1',
    period: '08/2024',
    year: '2024',
    generatedAt: '2024-09-01',
    status: 'sent',
    size: '245 KB'
  },
  {
    id: '2',
    period: '07/2024',
    year: '2024',
    generatedAt: '2024-08-01',
    status: 'generated',
    size: '238 KB'
  },
  {
    id: '3',
    period: '06/2024',
    year: '2024',
    generatedAt: '2024-07-01',
    status: 'printed',
    size: '242 KB'
  },
  {
    id: '4',
    period: '05/2024',
    year: '2024',
    generatedAt: '2024-06-01',
    status: 'sent',
    size: '239 KB'
  },
  {
    id: '5',
    period: '04/2024',
    year: '2024',
    generatedAt: '2024-05-01',
    status: 'generated',
    size: '244 KB'
  }
]

export function BulletinHistory({ selectedEmployee }: BulletinHistoryProps) {
  const [bulletins] = useState<BulletinRecord[]>(mockBulletins)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-green-100 text-green-800'
      case 'generated':
        return 'bg-blue-100 text-blue-800'
      case 'printed':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'sent':
        return 'Envoyé'
      case 'generated':
        return 'Généré'
      case 'printed':
        return 'Imprimé'
      default:
        return 'Inconnu'
    }
  }

  const handleDownload = (bulletinId: string) => {
    alert(`Téléchargement du bulletin ${bulletinId}`)
  }

  const handlePreview = (bulletinId: string) => {
    alert(`Aperçu du bulletin ${bulletinId}`)
  }

  if (!selectedEmployee) {
    return (
      <Card className="shadow-sm border-l-4 border-l-gray-400 opacity-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-500">
            <History className="w-5 h-5" />
            Historique des Bulletins
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-4">
            Sélectionnez d&apos;abord un employé
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-sm border-l-4 border-l-indigo-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900">
          <History className="w-5 h-5 text-indigo-600" />
          Historique des Bulletins
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {bulletins.map((bulletin) => (
              <div
                key={bulletin.id}
                className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="font-semibold text-sm">{bulletin.period}</span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(bulletin.status)}`}
                    >
                      {getStatusLabel(bulletin.status)}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-gray-500 mb-3">
                  <div>Généré le {new Date(bulletin.generatedAt).toLocaleDateString('fr-FR')}</div>
                  <div>Taille: {bulletin.size}</div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePreview(bulletin.id)}
                    className="flex-1 text-xs"
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    Aperçu
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(bulletin.id)}
                    className="flex-1 text-xs"
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Télécharger
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="mt-4 pt-4 border-t">
          <p className="text-sm text-gray-600">
            <span className="font-semibold">{bulletins.length}</span> bulletins dans l&apos;historique
          </p>
          <Button variant="outline" size="sm" className="w-full mt-2">
            <Download className="w-4 h-4 mr-2" />
            Télécharger tous les bulletins
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}