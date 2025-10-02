'use client'

import { EmployeeFormFields } from './form/EmployeeFormFields'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import { Loader2, Save, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEmployeeForm } from './hooks/useEmployeeForm'
import { LoadingState, NotFoundState } from './components/EmployeeFormStates'
import type { Employee } from '@/types/employee'

interface EmployeeEditFormProps {
  employeeId?: string
  employee?: Employee | null
  onSuccess?: () => void
  onCancel?: () => void
}

export function EmployeeEditForm({ employeeId, employee, onSuccess, onCancel }: EmployeeEditFormProps) {
  const { ToastContainer } = useToast()
  const router = useRouter()

  const {
    loading,
    saving,
    formData,
    currentEmployee,
    isEditing,
    handleChange,
    handleSubmit
  } = useEmployeeForm({ employeeId, employee, onSuccess })

  if (loading) {
    return <LoadingState />
  }

  if ((employeeId || employee) && !currentEmployee && !loading) {
    return <NotFoundState />
  }

  return (
    <>
      <Card className="max-w-4xl border-l-4 border-l-indigo-500">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold text-indigo-900">
              {isEditing && currentEmployee ? (
                <>
                  Modifier - {currentEmployee.firstName} {currentEmployee.lastName}
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    ({currentEmployee.employeeCode})
                  </span>
                </>
              ) : (
                "Créer un nouvel employé"
              )}
            </CardTitle>
            <Button
              type="button"
              variant="outline"
              onClick={() => onCancel ? onCancel() : router.push('/employes')}
              disabled={saving}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <EmployeeFormFields
              formData={formData}
              onChange={handleChange}
            />

            <div className="flex justify-end pt-6 border-t">
              <Button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Enregistrer
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      <ToastContainer />
    </>
  )
}