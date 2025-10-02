// Hook personnalisé pour la logique des rapports

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'
import { Bulletin } from '@/types/ui'

interface Employee {
  id: string
}

export function useRapports(periode: string) {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [bulletins, setBulletins] = useState<Bulletin[]>([])
  const [stats, setStats] = useState({
    totalBulletins: 0,
    totalBrut: 0,
    totalNet: 0,
    employesDistincts: 0
  })

  const fetchBulletins = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/payroll/list?periode=${periode}`)
      if (!response.ok) throw new Error('Erreur chargement')

      const data = await response.json()
      setBulletins(data.bulletins || [])
      setStats(data.stats || {
        totalBulletins: 0,
        totalBrut: 0,
        totalNet: 0,
        employesDistincts: 0
      })
    } catch {
      toast.error('Erreur lors du chargement des bulletins')
    } finally {
      setLoading(false)
    }
  }, [periode])

  useEffect(() => {
    if (session?.user && periode) {
      fetchBulletins()
    }
  }, [periode, session, fetchBulletins])

  const handleDownloadBulletin = async (bulletinId: string) => {
    try {
      const response = await fetch(`/api/payroll/download/${bulletinId}`)
      if (!response.ok) throw new Error('Erreur téléchargement')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `bulletin-${bulletinId}.pdf`
      a.click()
      window.URL.revokeObjectURL(url)

      toast.success('Bulletin téléchargé avec succès')
    } catch {
      toast.error('Erreur lors du téléchargement')
    }
  }

  const handleViewBulletin = (bulletinId: string) => {
    window.open(`/api/payroll/download/${bulletinId}`, '_blank')
  }

  const handleBatchGeneration = useCallback(async () => {
    const confirmed = confirm('Générer les bulletins pour tous les employés actifs ?')
    if (!confirmed) return

    setLoading(true)
    try {
      const empResponse = await fetch('/api/employees')
      const employees = await empResponse.json()
      const employeeIds = employees.map((e: Employee) => e.id)

      const response = await fetch('/api/payroll/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ periode, employeeIds })
      })

      const result = await response.json()

      if (result.success) {
        toast.success(`${result.résultats.générés} bulletins générés avec succès`)
        fetchBulletins()
      }
    } catch {
      toast.error('Erreur lors de la génération par lot')
    } finally {
      setLoading(false)
    }
  }, [periode, fetchBulletins])

  const handleDeleteBulletin = async (bulletinId: string) => {
    try {
      console.log('Suppression du bulletin:', bulletinId)
      const response = await fetch(`/api/bulletins/${bulletinId}`, {
        method: 'DELETE'
      })

      console.log('Réponse:', response.status, response.ok)

      if (!response.ok) {
        const error = await response.json()
        console.error('Erreur API:', error)
        throw new Error(error.error || 'Erreur suppression')
      }

      toast.success('Bulletin supprimé avec succès')
      fetchBulletins()
    } catch (error) {
      console.error('Erreur suppression:', error)
      toast.error('Erreur lors de la suppression du bulletin')
    }
  }

  return {
    loading,
    bulletins,
    stats,
    handleDownloadBulletin,
    handleViewBulletin,
    handleBatchGeneration,
    handleDeleteBulletin,
    refetch: fetchBulletins
  }
}