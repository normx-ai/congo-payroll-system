'use client'

import { EmployeeFormFields } from './form/EmployeeFormFields'
import { EmployeeFormActions } from './form/EmployeeFormActions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useEmployeeForm } from '@/hooks/useEmployeeForm'
import { useToast } from '@/components/ui/toast'

export function EmployeeForm() {
  const { ToastContainer } = useToast()
  const {
    formData,
    loading,
    handleChange,
    handleSubmit,
    isValid
  } = useEmployeeForm()

  return (
    <>
      <Card className="max-w-4xl border-l-4 border-l-indigo-500">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-indigo-900">
            Informations Employé
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <EmployeeFormFields
              formData={formData}
              onChange={handleChange}
            />

            <EmployeeFormActions
              loading={loading}
              isValid={isValid}
            />
          </form>
        </CardContent>
      </Card>
      <ToastContainer />
    </>
  )
}