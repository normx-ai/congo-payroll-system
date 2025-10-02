'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { TopBar } from '@/components/layout/TopBar'
import { BulletinForm } from '@/components/bulletins/BulletinForm'
import { BulletinStats } from '@/components/bulletins/BulletinStats'
import { RecentBulletins } from '@/components/bulletins/RecentBulletins'
import { BulletinHistory } from '@/components/bulletins/BulletinHistory'

interface Employee {
  id: string
  firstName: string
  lastName: string
  employeeCode: string
  position: string
}

interface BulletinEmployee {
  id: string
  matricule: string
  nom: string
  prenom: string
  poste: string
  department: string
}

interface BulletinPeriode {
  year: number
  month: number
  libelle: string
}

interface BulletinMontants {
  salaireBase: number
  brut: number
  cotisations: number
  retenues: number
  net: number
}

interface BulletinStatus {
  genere: boolean
  envoye: boolean
  dateCreation: string
}

interface BulletinData {
  id: string
  employee: BulletinEmployee
  periode: BulletinPeriode
  montants: BulletinMontants
  status: BulletinStatus
  notes?: string
}

export default function BulletinsPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [bulletins, setBulletins] = useState<BulletinData[]>([])
  const [loading, setLoading] = useState(false)
  const [, setLoadingBulletins] = useState(false)
  const [selectedMonth] = useState<string>((new Date().getMonth() + 1).toString().padStart(2, '0'))
  const [selectedYear] = useState<string>('2025')
  const [selectedEmployee, setSelectedEmployee] = useState<string>('')

  useEffect(() => {
    fetchEmployees()
    fetchBulletins()
  }, [])

  const fetchEmployees = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/employees?page=1&size=100', {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setEmployees(data.data || [])
      } else if (response.status === 401) {
        // Non authentifié - pas d'employés
        setEmployees([])
      }
    } catch (error) {
      console.error('Erreur récupération employés:', error)
      // Données de test en cas d'erreur
      setEmployees([
        {
          id: '1',
          employeeCode: 'EMP001',
          firstName: 'Jean',
          lastName: 'Mbemba',
          position: 'Développeur Senior'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const fetchBulletins = async () => {
    setLoadingBulletins(true)
    try {
      const response = await fetch('/api/payroll/list', {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setBulletins(data.bulletins || [])
      } else {
        console.error('Erreur récupération bulletins:', response.status)
        setBulletins([])
      }
    } catch (error) {
      console.error('Erreur récupération bulletins:', error)
      setBulletins([])
    } finally {
      setLoadingBulletins(false)
    }
  }

  const generateBulletin = async (employeeId: string, month: string, year: string) => {
    try {
      const response = await fetch('/api/payroll/generate', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employeeId,
          month: parseInt(month),
          year: parseInt(year)
        })
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `bulletin-${employeeId}-${month}-${year}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        alert('Bulletin généré avec succès !')
        // Actualiser la liste des bulletins
        fetchBulletins()
      } else {
        alert('Erreur lors de la génération du bulletin')
      }
    } catch (error) {
      console.error('Erreur génération bulletin:', error)
      alert('Erreur lors de la génération du bulletin')
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <TopBar />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-indigo-900">Bulletins de Paie</h1>
            <p className="text-indigo-600 mt-1">Générer et gérer les bulletins de paie conformes aux normes Congo</p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 space-y-6">
              <BulletinForm
                employees={employees}
                loading={loading}
                onGenerate={generateBulletin}
                onEmployeeChange={setSelectedEmployee}
              />

              <RecentBulletins bulletins={bulletins.slice(0, 5).map(b => ({
                id: b.id,
                employeeName: `${b.employee.prenom} ${b.employee.nom}`,
                month: b.periode.month.toString(),
                year: b.periode.year.toString(),
                generatedAt: new Date(b.status.dateCreation)
              }))} />
            </div>

            <div className="space-y-6">
              <BulletinStats
                selectedMonth={selectedMonth}
                selectedYear={selectedYear}
                employeeCount={employees.length}
                generatedCount={bulletins.length}
              />

              <BulletinHistory
                selectedEmployee={selectedEmployee}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}