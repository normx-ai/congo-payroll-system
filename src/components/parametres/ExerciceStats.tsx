interface ExerciceStatsProps {
  counts: {
    total: number
    actifs: number
    ouverts: number
    clos: number
  }
}

export function ExerciceStats({ counts }: ExerciceStatsProps) {
  return (
    <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
      <div className="text-center">
        <div className="text-lg font-bold text-gray-900">{counts.total}</div>
        <div className="text-xs text-gray-600">Total</div>
      </div>
      <div className="text-center">
        <div className="text-lg font-bold text-green-600">{counts.actifs}</div>
        <div className="text-xs text-gray-600">Actif</div>
      </div>
      <div className="text-center">
        <div className="text-lg font-bold text-blue-600">{counts.ouverts}</div>
        <div className="text-xs text-gray-600">Ouverts</div>
      </div>
      <div className="text-center">
        <div className="text-lg font-bold text-gray-600">{counts.clos}</div>
        <div className="text-xs text-gray-600">Clos</div>
      </div>
    </div>
  )
}