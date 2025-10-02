// Composant pour afficher les bulletins récents dans le dashboard

'use client'

import React, { useEffect, useState } from 'react'
import { FileText, Download, Eye } from 'lucide-react'
import Link from 'next/link'

interface Bulletin {
  id: string
  employee: {
    nom: string
    prenom: string
  }
  periode: {
    libelle: string
  }
  montants: {
    net: number
  }
  status: {
    dateCreation: string
  }
}

export default function RecentBulletins() {
  const [bulletins, setBulletins] = useState<Bulletin[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecentBulletins()
  }, [])

  const fetchRecentBulletins = async () => {
    try {
      const response = await fetch('/api/payroll/list?limit=5')
      if (response.ok) {
        const data = await response.json()
        setBulletins(data.bulletins || [])
      }
    } catch (error) {
      console.error('Erreur chargement bulletins récents:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatMontant = (montant: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(montant)
  }

  const handleDownload = async (bulletinId: string) => {
    try {
      const response = await fetch(`/api/payroll/download/${bulletinId}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `bulletin-${bulletinId}.pdf`
        a.click()
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Erreur téléchargement:', error)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <FileText className="mr-2 h-5 w-5" />
          Bulletins récents
        </h2>
        <Link
          href="/rapports"
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Voir tout →
        </Link>
      </div>

      {bulletins.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-4">
          Aucun bulletin généré récemment
        </p>
      ) : (
        <div className="space-y-3">
          {bulletins.slice(0, 5).map((bulletin) => (
            <div
              key={bulletin.id}
              className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">
                  {bulletin.employee.prenom} {bulletin.employee.nom}
                </div>
                <div className="text-xs text-gray-500">
                  {bulletin.periode.libelle} • {formatMontant(bulletin.montants.net)}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.open(`/api/payroll/download/${bulletin.id}`, '_blank')}
                  className="text-gray-400 hover:text-blue-600"
                  title="Aperçu"
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDownload(bulletin.id)}
                  className="text-gray-400 hover:text-green-600"
                  title="Télécharger"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}