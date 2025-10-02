import { useState, useEffect } from 'react'

interface Tenant {
  id: string
  companyName: string
  companyAddress: string
  companyPhone: string
  companyEmail: string
  nui: string
  rccm: string
  logoUrl?: string
}

export function useTenant() {
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchTenant = async () => {
    console.log('🔄 useTenant: fetching tenant data...')
    try {
      const response = await fetch('/api/parametres/entreprise', {
        cache: 'no-store'
      })
      if (response.ok) {
        const data = await response.json()
        console.log('✅ useTenant: fetched data:', data)
        setTenant({
          id: data.id || '',
          companyName: data.name || '',
          companyAddress: data.address || '',
          companyPhone: data.telephone || '',
          companyEmail: data.email || '',
          nui: data.niu || '',
          rccm: data.rccm || '',
          logoUrl: data.logoUrl || ''
        })
      }
    } catch (error) {
      console.error('❌ useTenant: Error fetching tenant:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    console.log('🎯 useTenant: Setting up event listener')
    fetchTenant()

    // Écouter les mises à jour
    const handleTenantUpdate = () => {
      console.log('📢 useTenant: Received companyInfoUpdated event!')
      fetchTenant()
    }

    window.addEventListener('companyInfoUpdated', handleTenantUpdate)
    return () => {
      console.log('🧹 useTenant: Cleaning up event listener')
      window.removeEventListener('companyInfoUpdated', handleTenantUpdate)
    }
  }, [])

  return { tenant, loading, refetch: fetchTenant }
}