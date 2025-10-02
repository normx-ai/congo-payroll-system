import { Button } from '@/components/ui/button'
import { Loader2, Save, X } from 'lucide-react'
import Link from 'next/link'

interface EmployeeFormActionsProps {
  loading: boolean
  isValid: boolean
}

export function EmployeeFormActions({ loading, isValid }: EmployeeFormActionsProps) {
  return (
    <div className="flex items-center justify-between pt-6 border-t border-indigo-200">
      <Link href="/employes">
        <Button type="button" variant="outline" className="border-gray-300">
          <X className="w-4 h-4 mr-2" />
          Annuler
        </Button>
      </Link>

      <Button
        type="submit"
        disabled={loading || !isValid}
        className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[120px]"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Création...
          </>
        ) : (
          <>
            <Save className="w-4 h-4 mr-2" />
            Créer l&apos;employé
          </>
        )}
      </Button>
    </div>
  )
}