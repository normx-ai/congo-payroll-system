'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Save, CheckCircle, AlertCircle } from 'lucide-react'
import { CompanyInfoCard } from './CompanyInfo'
import { CompanyAddressCard } from './CompanyAddress'
import { CompanyLegalCard } from './CompanyLegal'
import { CompanyLogoCard } from './CompanyLogo'

interface CompanyInfo {
  id?: string
  name: string
  address: string
  city: string
  postalCode: string
  phone: string
  email: string
  nui: string
  rccm: string
  cnssNumber: string
  taxNumber: string
  logoUrl?: string
}

const initialCompanyInfo: CompanyInfo = {
  name: '',
  address: '',
  city: 'Brazzaville',
  postalCode: '',
  phone: '',
  email: '',
  nui: '',
  rccm: '',
  cnssNumber: '',
  taxNumber: ''
}

export function CompanySettings() {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(initialCompanyInfo)
  const [hasChanges, setHasChanges] = useState(false)
  const [, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'success' | 'error' | null>(null)

  useEffect(() => {
    const fetchCompanySettings = async () => {
      try {
        const response = await fetch('/api/parametres/entreprise')
        if (response.ok) {
          const data = await response.json()
          setCompanyInfo({
            id: data.id || '',
            name: data.name || '',
            address: data.address || '',
            city: 'Brazzaville',
            postalCode: '',
            phone: data.telephone || '',
            email: data.email || '',
            nui: data.niu || '',
            rccm: data.rccm || '',
            cnssNumber: data.cnssNumber || '',
            taxNumber: data.taxNumber || '',
            logoUrl: data.logoUrl || ''
          })
        }
      } catch (error) {
        console.error('Erreur lors du chargement des paramètres:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCompanySettings()
  }, [])

  const handleInputChange = (field: keyof CompanyInfo, value: string) => {
    setCompanyInfo(prev => ({ ...prev, [field]: value }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    setIsSaving(true)
    setSaveStatus(null)
    try {
      const response = await fetch('/api/parametres/entreprise', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: companyInfo.name,
          address: companyInfo.address,
          telephone: companyInfo.phone,
          email: companyInfo.email,
          niu: companyInfo.nui,
          rccm: companyInfo.rccm,
          cnssNumber: companyInfo.cnssNumber
        })
      })

      if (response.ok) {
        setHasChanges(false)
        setSaveStatus('success')
        // Masquer le message de succès après 3 secondes
        setTimeout(() => setSaveStatus(null), 3000)

        // Mettre à jour le localStorage et déclencher un événement personnalisé
        localStorage.setItem('companyInfo', JSON.stringify({
          name: companyInfo.name,
          address: companyInfo.address,
          city: companyInfo.city,
          niu: companyInfo.nui,
          logoUrl: companyInfo.logoUrl
        }))

        // Déclencher un événement personnalisé pour notifier les autres composants
        console.log('📤 CompanySettings: Dispatching companyInfoUpdated event')
        window.dispatchEvent(new CustomEvent('companyInfoUpdated'))
        console.log('✅ CompanySettings: Event dispatched')
      } else {
        const errorData = await response.json()
        console.error('Erreur lors de la sauvegarde:', errorData)
        setSaveStatus('error')
        // Masquer le message d'erreur après 5 secondes
        setTimeout(() => setSaveStatus(null), 5000)
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      setSaveStatus('error')
      setTimeout(() => setSaveStatus(null), 5000)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Message de statut */}
      {saveStatus === 'success' && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center">
          <CheckCircle className="w-5 h-5 mr-2" />
          Les informations de l&apos;entreprise ont été enregistrées avec succès !
        </div>
      )}
      {saveStatus === 'error' && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          Une erreur s&apos;est produite lors de l&apos;enregistrement. Veuillez réessayer.
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Paramètres Entreprise</h2>
          <p className="text-gray-600 mt-1">Informations de votre entreprise</p>
        </div>
        <Button
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
          className={`${
            hasChanges
              ? 'bg-indigo-600 hover:bg-indigo-700'
              : 'bg-gray-400 cursor-not-allowed'
          } text-white transition-colors`}
        >
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Enregistrement...' : 'Enregistrer'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CompanyLogoCard
          logoUrl={companyInfo.logoUrl}
          tenantId={companyInfo.id || ''}
          onLogoChange={(logoUrl) => setCompanyInfo(prev => ({ ...prev, logoUrl: logoUrl || '' }))}
        />
        <CompanyInfoCard
          companyInfo={companyInfo}
          onInputChange={handleInputChange}
        />
        <CompanyAddressCard
          companyInfo={companyInfo}
          onInputChange={handleInputChange}
        />
        <CompanyLegalCard
          companyInfo={companyInfo}
          onInputChange={handleInputChange}
        />
      </div>
    </div>
  )
}