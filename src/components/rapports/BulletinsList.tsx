// Composant liste des bulletins de paie

'use client'

import React, { useState } from 'react'
import { Download, Eye, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface Bulletin {
  id: string
  employee: {
    nom: string
    prenom: string
    matricule: string
  }
  periode: {
    libelle: string
  }
  montants: {
    brut: number
    net: number
  }
  status: {
    genere: boolean
  }
}

interface BulletinsListProps {
  bulletins: Bulletin[]
  periode: string
  onDownload: (id: string) => void
  onView: (id: string) => void
  onDelete?: (id: string) => void
}

export default function BulletinsList({ bulletins, periode, onDownload, onView, onDelete }: BulletinsListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  console.log('BulletinsList rendu - onDelete:', !!onDelete, 'bulletins:', bulletins.length)

  const handleDelete = (id: string, employeeName: string) => {
    console.log('handleDelete appelé avec:', id, employeeName)
    console.log('onDelete existe?', !!onDelete)

    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="font-medium">Supprimer le bulletin de {employeeName} ?</p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => {
              console.log('Annuler cliqué')
              toast.dismiss(t.id)
            }}
            className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"
          >
            Annuler
          </button>
          <button
            onClick={() => {
              console.log('Supprimer cliqué pour:', id)
              setDeletingId(id)
              if (onDelete) {
                console.log('Appel de onDelete')
                onDelete(id)
              } else {
                console.error('onDelete est undefined!')
              }
              toast.dismiss(t.id)
            }}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
          >
            Supprimer
          </button>
        </div>
      </div>
    ), {
      duration: 10000,
      position: 'top-center',
    })
  }

  const formatMontant = (montant: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(montant)
  }

  const formatPeriode = () => {
    const dateStr = new Date(periode + '-01').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
    return dateStr.charAt(0).toUpperCase() + dateStr.slice(1)
  }

  if (bulletins.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Bulletins de paie - <span className="text-indigo-600">{formatPeriode()}</span></h3>
        </div>
        <div className="text-center py-12">
          <p className="text-gray-500">Aucun bulletin trouvé pour cette période</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Bulletins de paie - <span className="text-indigo-600">{formatPeriode()}</span></h3>
        <div className="text-sm text-gray-600">
          {bulletins.length} bulletin{bulletins.length > 1 ? 's' : ''}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employé</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Matricule</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Période</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Salaire brut</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Net à payer</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {bulletins.map((bulletin) => (
              <tr key={bulletin.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {bulletin.employee.prenom} {bulletin.employee.nom}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {bulletin.employee.matricule}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {bulletin.periode.libelle}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                  {formatMontant(bulletin.montants.brut)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                  {formatMontant(bulletin.montants.net)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => onView(bulletin.id)}
                      className="text-indigo-600 hover:text-indigo-800"
                      title="Voir le bulletin"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => onDownload(bulletin.id)}
                      className="text-indigo-600 hover:text-indigo-800"
                      title="Télécharger PDF"
                    >
                      <Download className="h-5 w-5" />
                    </button>
                    {onDelete && (
                      <button
                        onClick={() => handleDelete(bulletin.id, `${bulletin.employee.prenom} ${bulletin.employee.nom}`)}
                        disabled={deletingId === bulletin.id}
                        className="text-red-600 hover:text-red-800 disabled:opacity-50"
                        title="Supprimer le bulletin"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}