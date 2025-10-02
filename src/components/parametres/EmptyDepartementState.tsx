'use client'

import React from 'react'
import { Building2 } from 'lucide-react'

export function EmptyDepartementState() {
  return (
    <div className="text-center py-8 text-gray-500">
      <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
      <p>Aucun département configuré</p>
      <p className="text-sm">Ajoutez votre premier département</p>
    </div>
  )
}