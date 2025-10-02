'use client'

import { useState } from 'react'
import { PersonalFields, ContactFields, PasswordFields } from './PersonalContactFields'
import { CompanyFields } from './CompanyFields'
import { StepOne, StepTwoActions } from './RegisterSteps'
import type { RegisterFormProps, RegisterData } from '@/types'

export function RegisterForm({ onSubmit }: RegisterFormProps) {
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<RegisterData>({
    entityType: 'company',
    tenant: '',
    companyName: '',
    fiscalRegime: 'forfait',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })

  const handleSubmit = async () => {
    if (formData.password !== formData.confirmPassword) {
      alert('Les mots de passe ne correspondent pas')
      return
    }

    setLoading(true)
    try {
      await onSubmit(formData)
    } finally {
      setLoading(false)
    }
  }

  if (step === 1) {
    return <StepOne formData={formData} setFormData={setFormData} onNext={() => setStep(2)} />
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit() }} className="space-y-4">
      <PersonalFields formData={formData} setFormData={setFormData} />
      <CompanyFields formData={formData} setFormData={setFormData} type={formData.entityType} />
      <ContactFields formData={formData} setFormData={setFormData} />
      <PasswordFields formData={formData} setFormData={setFormData} />
      <StepTwoActions
        formData={formData}
        loading={loading}
        onBack={() => setStep(1)}
        onSubmit={handleSubmit}
      />
    </form>
  )
}