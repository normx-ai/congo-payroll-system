import { useState, useEffect } from 'react'

interface Company {
  name: string
  address: string
  city: string
  niu?: string
  rccm?: string
  telephone?: string
  email?: string
  logoUrl?: string
}

export function useCompany() {
  const [company, setCompany] = useState<Company>({
    name: "",
    address: "",
    city: ""
  })
  const [loading, setLoading] = useState(true)

  const fetchCompany = async () => {
    console.log('🔄 useCompany: fetching company data...')
    try {
      const response = await fetch('/api/parametres/entreprise', {
        cache: 'no-store' // Force fresh data
      })
      if (response.ok) {
        const data = await response.json()
        console.log('✅ useCompany: fetched data:', data)
        setCompany(data)
      } else {
        console.log('⚠️ useCompany: API failed, using localStorage fallback')
        // Utiliser les valeurs stockées localement si disponibles
        const storedCompany = localStorage.getItem('companyInfo')
        if (storedCompany) {
          setCompany(JSON.parse(storedCompany))
        }
      }
    } catch (error) {
      console.error('❌ useCompany: Error fetching company:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    console.log('🎯 useCompany: Setting up event listener')
    fetchCompany()

    // Écouter les mises à jour de companyInfo
    const handleCompanyUpdate = () => {
      console.log('📢 useCompany: Received companyInfoUpdated event!')
      fetchCompany()
    }

    window.addEventListener('companyInfoUpdated', handleCompanyUpdate)
    return () => {
      console.log('🧹 useCompany: Cleaning up event listener')
      window.removeEventListener('companyInfoUpdated', handleCompanyUpdate)
    }
  }, [])

  return { company, loading, refetch: fetchCompany }
}