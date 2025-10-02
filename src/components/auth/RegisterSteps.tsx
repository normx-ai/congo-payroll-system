import { Button } from '@/components/ui/button'
import { ENTITY_TYPES } from '@/types/fiscal'
import type { RegisterData } from '@/types'

interface StepOneProps {
  formData: RegisterData
  setFormData: (data: RegisterData) => void
  onNext: () => void
}

export function StepOne({ formData, setFormData, onNext }: StepOneProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-indigo-900">Type d&apos;entité</h3>
      {ENTITY_TYPES.map((type) => (
        <button
          key={type.id}
          type="button"
          onClick={() => {
            setFormData({...formData, entityType: type.id})
            onNext()
          }}
          className="w-full p-4 border-2 border-indigo-200 rounded-lg hover:border-indigo-500 text-left"
        >
          <h4 className="font-semibold text-indigo-900">{type.label}</h4>
          <p className="text-sm text-indigo-600">{type.description}</p>
        </button>
      ))}
    </div>
  )
}

interface StepTwoProps {
  formData: RegisterData
  loading: boolean
  onBack: () => void
  onSubmit: () => void
}

export function StepTwoActions({ formData, loading, onBack, onSubmit }: StepTwoProps) {
  return (
    <>
      <div className="p-3 bg-indigo-50 rounded-lg">
        <p className="text-sm text-indigo-700">
          <strong>Après inscription :</strong> Configurez vos paramètres fiscaux et informations légales dans votre espace
        </p>
        <p className="text-xs text-indigo-600 mt-1">
          {formData.entityType === 'cabinet'
            ? 'Gérez plusieurs entreprises clientes avec leurs propres paramètres'
            : 'NUI, RCCM, choix du régime fiscal et informations légales'
          }
        </p>
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="flex-1 border-indigo-300 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-400 focus:outline-0 focus:ring-0 focus:border-indigo-400"
        >
          Retour
        </Button>
        <Button
          type="submit"
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
          disabled={loading}
          onClick={onSubmit}
        >
          {loading ? 'Création...' : 'Créer le compte'}
        </Button>
      </div>
    </>
  )
}