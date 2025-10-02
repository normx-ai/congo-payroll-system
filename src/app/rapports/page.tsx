// Page principale des rapports - Next.js App Router

'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { TopBar } from '@/components/layout/TopBar'
import { MonthSelector } from '@/components/paie/MonthSelector'
import TabsNavigation from '@/components/rapports/TabsNavigation'
import PeriodFilter from '@/components/rapports/PeriodFilter'
import BulletinsList from '@/components/rapports/BulletinsList'
import StatsCards from '@/components/rapports/StatsCards'
import EtatCharges from '@/components/rapports/EtatCharges'
import LivrePaie from '@/components/rapports/LivrePaie'
import { useRapports } from '@/hooks/useRapports'
import { useExercices } from '@/hooks/useExercices'
import { useExerciceMonths } from '@/hooks/useExerciceMonths'
import { Loader2, FileText, Download } from 'lucide-react'

export default function RapportsPage() {
  const { status } = useSession()
  const router = useRouter()
  const { exerciceActif } = useExercices()
  const { currentMonthData } = useExerciceMonths()

  const [activeTab, setActiveTab] = useState('bulletins')
  const [selectedMonth, setSelectedMonth] = useState(() => {
    return currentMonthData?.value || `${new Date().getFullYear()}-${(new Date().getMonth() + 1).toString().padStart(2, '0')}`
  })

  // Calculer la période pour compatibilité avec useRapports
  const periode = selectedMonth

  const {
    loading,
    bulletins,
    stats,
    handleDownloadBulletin,
    handleViewBulletin,
    handleBatchGeneration,
    handleDeleteBulletin
  } = useRapports(periode)


  useEffect(() => {
    if (currentMonthData) {
      setSelectedMonth(currentMonthData.value)
    }
  }, [currentMonthData])

  // Vérification authentification
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <TopBar />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-indigo-900 flex items-center">
              <FileText className="mr-3" />
              Rapports et Bulletins
            </h1>
            <p className="text-indigo-600 mt-1">
              Rapports: {selectedMonth ?
                (() => {
                  const dateStr = new Date(selectedMonth + '-01').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
                  return dateStr.charAt(0).toUpperCase() + dateStr.slice(1)
                })()
                : 'Aucun mois sélectionné'}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex justify-between items-center mb-6">
            <TabsNavigation activeTab={activeTab} onTabChange={setActiveTab} />

            {activeTab === 'bulletins' && (
              <button
                onClick={handleBatchGeneration}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                <Download className="mr-2 h-4 w-4" />
                Génération par lot
              </button>
            )}
          </div>

          {/* Contenu principal avec panel mois */}
          <div className="flex h-full">
            {/* Panel de sélection des mois */}
            <div className="w-72 border border-gray-200 bg-gray-50 p-4 rounded-lg overflow-y-auto">
              <MonthSelector
                selectedMonth={selectedMonth}
                onMonthSelect={setSelectedMonth}
              />
            </div>

            {/* Zone de travail principale */}
            <div className="flex-1 overflow-y-auto pl-6">
              <div className="max-w-6xl">
                {loading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <>
                    {activeTab === 'bulletins' && (
                      <>
                        <StatsCards stats={stats} />
                        <BulletinsList
                          bulletins={bulletins}
                          periode={periode}
                          onDownload={handleDownloadBulletin}
                          onView={handleViewBulletin}
                          onDelete={handleDeleteBulletin}
                        />
                      </>
                    )}

                    {activeTab === 'livre-paie' && (
                      <LivrePaie
                        periode={periode}
                        entries={bulletins.map(b => ({
                          matricule: b.employee.matricule,
                          nom: b.employee.nom,
                          prenom: b.employee.prenom,
                          salaireBrut: b.montants.brut,
                          cnss: b.montants.brut * 0.035,
                          irpp: b.montants.brut * 0.15,
                          camu: b.montants.brut * 0.01,
                          tus: b.montants.brut * 0.01,
                          autresRetenues: 0,
                          netAPayer: b.montants.net,
                          chargesPatronales: b.montants.brut * 0.165
                        }))}
                        onExportPDF={() => console.log('Export PDF')}
                        onExportExcel={() => console.log('Export Excel')}
                      />
                    )}

                    {activeTab === 'etat-charges' && (
                      <EtatCharges
                        periode={periode}
                        employees={bulletins.map(b => ({
                          matricule: b.employee.matricule,
                          nom: b.employee.nom,
                          prenom: b.employee.prenom,
                          salaire: b.montants.brut,
                          cnssEmp: b.montants.brut * 0.035,
                          cnssPat: b.montants.brut * 0.165,
                          tus: b.montants.brut * 0.01,
                          brut: b.montants.brut,
                          base: b.montants.brut,
                          irpp: b.montants.brut * 0.15,
                          camu: b.montants.brut * 0.01,
                          tol: b.montants.brut * 0.005,
                          chargesSal: b.montants.brut * 0.205,
                          chargesPat: b.montants.brut * 0.165,
                          indemn: 0,
                          reprises: 0,
                          total: b.montants.net
                        }))}
                        onExportPDF={() => console.log('Export PDF')}
                        onExportExcel={() => console.log('Export Excel')}
                      />
                    )}

                    {activeTab === 'stats' && (
                      <div className="text-center py-12">
                        <p className="text-gray-500">Statistiques détaillées - En cours de développement</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}