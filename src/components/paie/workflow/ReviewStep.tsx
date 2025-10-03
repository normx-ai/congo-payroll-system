'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, CheckCircle, XCircle, Download, Loader } from 'lucide-react'
import { useRubriques } from '@/contexts/RubriquesContext'
import { BulletinPreview } from '../BulletinPreview'
import { useCompany } from '@/hooks/useCompany'
import { useBulletinGeneration } from '@/hooks/useBulletinGeneration'
import { useParametresFiscaux } from '@/hooks/useParametresFiscaux'
import { ReviewStepProps } from './review-types'
import { buildPayrollCalculation } from './payroll-calculation-builder'
import { calculatePayrollTotals } from './totals-calculator'
import { filterRubriquesToShow } from './rubrique-filter'

export function ReviewStep({ selectedEmployeeData, parameters, amounts, month, year, onValidate, onRevise }: ReviewStepProps) {
  const { rubriques } = useRubriques()
  const { company } = useCompany()
  const { generating, success, error, downloadUrl, generateAndSaveBulletin, reset } = useBulletinGeneration()

  // Récupérer les paramètres fiscaux depuis la DB
  const periode = `${year}-${month.padStart(2, '0')}`
  const { parametres: parametresFiscaux, loading: loadingParams } = useParametresFiscaux(periode)

  // Debug log pour voir les données de l'employé
  console.log('ReviewStep - selectedEmployeeData:', {
    id: selectedEmployeeData?.id,
    name: `${selectedEmployeeData?.firstName} ${selectedEmployeeData?.lastName}`,
    baseSalary: selectedEmployeeData?.baseSalary,
    chargesFixes: selectedEmployeeData?.chargesFixes
  })
  console.log('ReviewStep - amounts:', amounts)
  console.log('ReviewStep - rubriques actives:', rubriques.filter(r => r.isActive).map(r => ({ code: r.code, libelle: r.libelle })))

  // Filtrer les rubriques à afficher
  const allRubriquesToShow = filterRubriquesToShow(rubriques, selectedEmployeeData, amounts, parameters)

  // Fonction de génération du bulletin
  const handleValidateAndGenerateBulletin = async () => {
    if (!selectedEmployeeData) return

    try {
      reset()
      const periode = `${year}-${month.padStart(2, '0')}`

      // Récupérer les jours travaillés depuis les paramètres
      const joursTravailles = parameters.find(p => p.employeeId === selectedEmployeeData.id && p.parameter === 'joursTravailles')?.value || 26

      // Préparer toutes les rubriques saisies (montants manuels + charges fixes)
      const rubriquesSaisies = amounts.map(amount => ({
        code: amount.rubriqueCode,
        montant: Number(amount.amount)
      }))

      // Ajouter l'arrondi s'il est activé
      const rubrique9110 = allRubriquesToShow.find(r => r.code === '9110')
      if (rubrique9110) {
        const { montantArrondi } = calculatePayrollTotals(allRubriquesToShow, selectedEmployeeData, parameters, amounts, month, year, parametresFiscaux)
        rubriquesSaisies.push({
          code: '9110',
          montant: montantArrondi
        })
      }

      console.log('📋 Données envoyées à l\'API:', {
        employeeId: selectedEmployeeData.id,
        periode,
        joursTravailles,
        rubriquesSaisies,
        totalRubriques: rubriquesSaisies.length
      })

      await generateAndSaveBulletin({
        employeeId: selectedEmployeeData.id,
        periode,
        joursTravailles,
        rubriquesSaisies,
        chargesDeductibles: 0
      })

      onValidate()
    } catch (err) {
      console.error('Erreur génération bulletin:', err)
    }
  }
  console.log('ReviewStep - rubriques après filtrage:', allRubriquesToShow.map(r => ({
    code: r.code,
    libelle: r.libelle,
    isActive: r.isActive,
    type: r.type
  })))
  // Calculer tous les totaux (avec paramètres fiscaux depuis DB)
  const {
    totalGainsBruts,
    totalGainsNonSoumis,
    totalRetenues,
    netAPayer
  } = calculatePayrollTotals(allRubriquesToShow, selectedEmployeeData, parameters, amounts, month, year, parametresFiscaux)

  // Créer l'objet calculation pour BulletinPreview
  const totals = {
    totalGainsBruts,
    totalGainsNonSoumis,
    totalRetenues,
    netAPayer
  }
  const calculation = buildPayrollCalculation(
    selectedEmployeeData,
    parameters,
    amounts,
    month,
    year,
    allRubriquesToShow,
    totals,
    parametresFiscaux
  )

  return (
    <div className="space-y-6">
      <Card className="shadow-sm border-l-4 border-l-indigo-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <FileText className="w-5 h-5 text-indigo-800" />
            Aperçu du Bulletin de Paie
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mb-6">
            {loadingParams && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-blue-700 text-sm flex items-center gap-2">
                  <Loader className="w-4 h-4 animate-spin" />
                  Chargement des paramètres fiscaux...
                </p>
              </div>
            )}
            <div className="flex gap-4">
              <Button
                onClick={handleValidateAndGenerateBulletin}
                disabled={generating || success || loadingParams}
                className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
              >
                {generating ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Génération en cours...
                  </>
                ) : success ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Bulletin généré
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Valider et Générer Bulletin
                  </>
                )}
              </Button>
              <Button
                onClick={onRevise}
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Réviser les Calculs
              </Button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {success && downloadUrl && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <p className="text-green-700 text-sm">
                    ✅ Bulletin généré et sauvegardé avec succès !
                  </p>
                  <Button
                    onClick={() => window.open(downloadUrl, '_blank')}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Télécharger PDF
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <BulletinPreview
        calculation={calculation}
        month={month}
        year={year}
        employeeId={selectedEmployeeData?.id}
        company={company}
      />
    </div>
  )
}