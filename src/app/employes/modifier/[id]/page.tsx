'use client'

import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { TopBar } from '@/components/layout/TopBar'
import { EmployeeEditForm } from '@/components/employees/EmployeeEditForm'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

export default function EditEmployeePage() {
  const params = useParams()
  const employeeId = params.id as string

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <TopBar />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <Link
              href="/employes"
              className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour à la liste
            </Link>
            <h1 className="text-3xl font-bold text-indigo-900">Modifier Employé</h1>
            <p className="text-indigo-600 mt-1">Mettre à jour les informations de l&apos;employé</p>
          </div>

          <EmployeeEditForm employeeId={employeeId} />
        </main>
      </div>
    </div>
  )
}