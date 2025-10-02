// Composant pour le livre de paie (sans colonne CAMP)

'use client'

import React from 'react'
import { FileText, Download } from 'lucide-react'

interface LivrePaieEntry {
  matricule: string
  nom: string
  prenom: string
  salaireBrut: number
  cnss: number
  irpp: number
  camu: number
  tus: number
  autresRetenues: number
  netAPayer: number
  chargesPatronales: number
}

interface LivrePaieProps {
  periode: string
  entries: LivrePaieEntry[]
  onExportPDF: () => void
  onExportExcel: () => void
}

export default function LivrePaie({ periode, entries, onExportPDF, onExportExcel }: LivrePaieProps) {
  const formatMontant = (montant: number) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(Math.round(montant))
  }

  // Calculer les totaux
  const totaux = entries.reduce((acc, entry) => ({
    salaireBrut: acc.salaireBrut + entry.salaireBrut,
    cnss: acc.cnss + entry.cnss,
    irpp: acc.irpp + entry.irpp,
    camu: acc.camu + entry.camu,
    tus: acc.tus + entry.tus,
    autresRetenues: acc.autresRetenues + entry.autresRetenues,
    netAPayer: acc.netAPayer + entry.netAPayer,
    chargesPatronales: acc.chargesPatronales + entry.chargesPatronales
  }), {
    salaireBrut: 0,
    cnss: 0,
    irpp: 0,
    camu: 0,
    tus: 0,
    autresRetenues: 0,
    netAPayer: 0,
    chargesPatronales: 0
  })

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Livre de Paie - <span className="text-indigo-600">{(() => {
          const dateStr = new Date(periode + '-01').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
          return dateStr.charAt(0).toUpperCase() + dateStr.slice(1)
        })()}</span></h3>
        <div className="flex gap-2">
          <button
            onClick={onExportPDF}
            className="flex items-center px-3 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded hover:from-indigo-700 hover:to-indigo-800 shadow-sm"
            title="Export PDF"
          >
            <FileText className="w-4 h-4" />
          </button>
          <button
            onClick={onExportExcel}
            className="flex items-center px-3 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded hover:from-indigo-600 hover:to-indigo-700 shadow-sm"
            title="Export Excel"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Matricule</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Nom</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Prénom</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-700">Salaire Brut</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-700">CNSS</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-700">IRPP</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-700">CAMU</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-700">TUS</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-700">Autres Ret.</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-700 bg-indigo-50">Net à Payer</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-700">Charges Pat.</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {entries.map((entry, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="px-3 py-2 text-sm text-gray-900">{entry.matricule}</td>
                <td className="px-3 py-2 text-sm">{entry.nom}</td>
                <td className="px-3 py-2 text-sm">{entry.prenom}</td>
                <td className="px-3 py-2 text-sm text-right">{formatMontant(entry.salaireBrut)}</td>
                <td className="px-3 py-2 text-sm text-right">{formatMontant(entry.cnss)}</td>
                <td className="px-3 py-2 text-sm text-right">{formatMontant(entry.irpp)}</td>
                <td className="px-3 py-2 text-sm text-right">{formatMontant(entry.camu)}</td>
                <td className="px-3 py-2 text-sm text-right">{formatMontant(entry.tus)}</td>
                <td className="px-3 py-2 text-sm text-right">{formatMontant(entry.autresRetenues)}</td>
                <td className="px-3 py-2 text-sm text-right font-semibold bg-indigo-50">
                  {formatMontant(entry.netAPayer)}
                </td>
                <td className="px-3 py-2 text-sm text-right">{formatMontant(entry.chargesPatronales)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-200">
            <tr className="font-bold">
              <td colSpan={3} className="px-3 py-2 text-sm">TOTAUX</td>
              <td className="px-3 py-2 text-sm text-right">{formatMontant(totaux.salaireBrut)}</td>
              <td className="px-3 py-2 text-sm text-right">{formatMontant(totaux.cnss)}</td>
              <td className="px-3 py-2 text-sm text-right">{formatMontant(totaux.irpp)}</td>
              <td className="px-3 py-2 text-sm text-right">{formatMontant(totaux.camu)}</td>
              <td className="px-3 py-2 text-sm text-right">{formatMontant(totaux.tus)}</td>
              <td className="px-3 py-2 text-sm text-right">{formatMontant(totaux.autresRetenues)}</td>
              <td className="px-3 py-2 text-sm text-right bg-indigo-100">{formatMontant(totaux.netAPayer)}</td>
              <td className="px-3 py-2 text-sm text-right">{formatMontant(totaux.chargesPatronales)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Masse salariale brute:</span>
            <p className="font-semibold">{formatMontant(totaux.salaireBrut)} FCFA</p>
          </div>
          <div>
            <span className="text-gray-600">Total retenues:</span>
            <p className="font-semibold text-red-600">
              {formatMontant(totaux.cnss + totaux.irpp + totaux.camu + totaux.tus + totaux.autresRetenues)} FCFA
            </p>
          </div>
          <div>
            <span className="text-gray-600">Net total à payer:</span>
            <p className="font-semibold text-green-600">{formatMontant(totaux.netAPayer)} FCFA</p>
          </div>
          <div>
            <span className="text-gray-600">Charges patronales:</span>
            <p className="font-semibold">{formatMontant(totaux.chargesPatronales)} FCFA</p>
          </div>
        </div>
      </div>
    </div>
  )
}