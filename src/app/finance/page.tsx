'use client'

import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { TopBar } from '@/components/layout/TopBar'
import { Construction, DollarSign } from 'lucide-react'

export default function FinancePage() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <TopBar />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Finance</h1>
            <p className="text-gray-600">Gestion financière et comptabilité</p>
          </div>

          <div className="flex items-center justify-center h-[calc(100vh-300px)]">
            <div className="text-center max-w-md">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 rounded-full mb-6">
                <Construction className="w-10 h-10 text-emerald-600" />
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Module en cours de développement
              </h2>

              <p className="text-gray-600 mb-6">
                Le module Finance est actuellement en développement. Il permettra de gérer :
              </p>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-left space-y-3">
                <div className="flex items-start space-x-3">
                  <DollarSign className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Trésorerie</h3>
                    <p className="text-sm text-gray-600">Suivi des flux de trésorerie et paiements</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <DollarSign className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Budget prévisionnel</h3>
                    <p className="text-sm text-gray-600">Planification et suivi budgétaire</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <DollarSign className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">États financiers</h3>
                    <p className="text-sm text-gray-600">Bilan, compte de résultat, flux de trésorerie</p>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-500 mt-6">
                Cette fonctionnalité sera disponible prochainement
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
