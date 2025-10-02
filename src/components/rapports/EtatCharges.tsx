// Composant pour l'état des charges mensuels (basé sur etat_salariaux.png)

'use client'

import React from 'react'
import { Download, FileText } from 'lucide-react'

interface Employee {
  matricule: string
  nom: string
  prenom: string
  salaire: number
  cnssEmp: number
  cnssPat: number
  tus: number
  brut: number
  base: number
  irpp: number
  camu: number
  tol: number
  chargesSal: number
  chargesPat: number
  indemn: number
  reprises: number
  total: number
}

interface EtatChargesProps {
  periode: string
  employees: Employee[]
  onExportPDF: () => void
  onExportExcel: () => void
}

export default function EtatCharges({ periode, employees, onExportPDF, onExportExcel }: EtatChargesProps) {
  const formatMontant = (montant: number) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(Math.round(montant))
  }

  // Calculer les totaux
  const totaux = employees.reduce((acc, emp) => ({
    salaire: acc.salaire + emp.salaire,
    cnssEmp: acc.cnssEmp + emp.cnssEmp,
    cnssPat: acc.cnssPat + emp.cnssPat,
    tus: acc.tus + emp.tus,
    brut: acc.brut + emp.brut,
    base: acc.base + emp.base,
    irpp: acc.irpp + emp.irpp,
    camu: acc.camu + emp.camu,
    tol: acc.tol + emp.tol,
    chargesSal: acc.chargesSal + emp.chargesSal,
    chargesPat: acc.chargesPat + emp.chargesPat,
    indemn: acc.indemn + emp.indemn,
    reprises: acc.reprises + emp.reprises,
    total: acc.total + emp.total
  }), {
    salaire: 0, cnssEmp: 0, cnssPat: 0, tus: 0, brut: 0,
    base: 0, irpp: 0, camu: 0, tol: 0, chargesSal: 0,
    chargesPat: 0, indemn: 0, reprises: 0, total: 0
  })

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">État des Charges - <span className="text-indigo-600">{(() => {
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
        <table className="min-w-full divide-y divide-gray-200 text-xs">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-2 py-2 text-left font-medium text-gray-700">Mat.</th>
              <th className="px-2 py-2 text-left font-medium text-gray-700">Nom / Prénom</th>
              <th className="px-2 py-2 text-right font-medium text-gray-700">Salaire Cat</th>
              <th className="px-2 py-2 text-right font-medium text-gray-700">CNSS Sal</th>
              <th className="px-2 py-2 text-right font-medium text-gray-700">CNSS Pat</th>
              <th className="px-2 py-2 text-right font-medium text-gray-700">TUS</th>
              <th className="px-2 py-2 text-right font-medium text-gray-700">Brut taxable</th>
              <th className="px-2 py-2 text-right font-medium text-gray-700">Base</th>
              <th className="px-2 py-2 text-right font-medium text-gray-700">IRPP</th>
              <th className="px-2 py-2 text-right font-medium text-gray-700">CAMU</th>
              <th className="px-2 py-2 text-right font-medium text-gray-700 whitespace-nowrap">TOL + TUS</th>
              <th className="px-2 py-2 text-right font-medium text-gray-700">Charges Sal</th>
              <th className="px-2 py-2 text-right font-medium text-gray-700">Charges Pat</th>
              <th className="px-2 py-2 text-right font-medium text-gray-700">Indemnité</th>
              <th className="px-2 py-2 text-right font-medium text-gray-700">Reprises</th>
              <th className="px-2 py-2 text-right font-medium text-gray-700 bg-gray-200">TOTAL</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {employees.map((emp, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="px-2 py-2 whitespace-nowrap text-gray-900">{emp.matricule}</td>
                <td className="px-2 py-2 whitespace-nowrap">{emp.nom} {emp.prenom}</td>
                <td className="px-2 py-2 text-right">{formatMontant(emp.salaire)}</td>
                <td className="px-2 py-2 text-right">{formatMontant(emp.cnssEmp)}</td>
                <td className="px-2 py-2 text-right">{formatMontant(emp.cnssPat)}</td>
                <td className="px-2 py-2 text-right">{formatMontant(emp.tus)}</td>
                <td className="px-2 py-2 text-right">{formatMontant(emp.brut)}</td>
                <td className="px-2 py-2 text-right">{formatMontant(emp.base)}</td>
                <td className="px-2 py-2 text-right">{formatMontant(emp.irpp)}</td>
                <td className="px-2 py-2 text-right">{formatMontant(emp.camu)}</td>
                <td className="px-2 py-2 text-right">{formatMontant(emp.tol)}</td>
                <td className="px-2 py-2 text-right">{formatMontant(emp.chargesSal)}</td>
                <td className="px-2 py-2 text-right">{formatMontant(emp.chargesPat)}</td>
                <td className="px-2 py-2 text-right">{formatMontant(emp.indemn)}</td>
                <td className="px-2 py-2 text-right">{formatMontant(emp.reprises)}</td>
                <td className="px-2 py-2 text-right font-bold bg-gray-50">{formatMontant(emp.total)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-200 font-bold">
            <tr>
              <td colSpan={2} className="px-2 py-2">TOTAUX</td>
              <td className="px-2 py-2 text-right">{formatMontant(totaux.salaire)}</td>
              <td className="px-2 py-2 text-right">{formatMontant(totaux.cnssEmp)}</td>
              <td className="px-2 py-2 text-right">{formatMontant(totaux.cnssPat)}</td>
              <td className="px-2 py-2 text-right">{formatMontant(totaux.tus)}</td>
              <td className="px-2 py-2 text-right">{formatMontant(totaux.brut)}</td>
              <td className="px-2 py-2 text-right">{formatMontant(totaux.base)}</td>
              <td className="px-2 py-2 text-right">{formatMontant(totaux.irpp)}</td>
              <td className="px-2 py-2 text-right">{formatMontant(totaux.camu)}</td>
              <td className="px-2 py-2 text-right">{formatMontant(totaux.tol)}</td>
              <td className="px-2 py-2 text-right">{formatMontant(totaux.chargesSal)}</td>
              <td className="px-2 py-2 text-right">{formatMontant(totaux.chargesPat)}</td>
              <td className="px-2 py-2 text-right">{formatMontant(totaux.indemn)}</td>
              <td className="px-2 py-2 text-right">{formatMontant(totaux.reprises)}</td>
              <td className="px-2 py-2 text-right bg-gray-300">{formatMontant(totaux.total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}