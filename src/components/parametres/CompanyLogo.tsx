'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'

interface CompanyLogoProps {
  logoUrl?: string
  tenantId: string
  onLogoChange: (logoUrl: string | null) => void
}

export function CompanyLogoCard({ logoUrl, tenantId, onLogoChange }: CompanyLogoProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validation
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      setError('Type de fichier non autorisé. Utilisez PNG, JPG ou SVG.')
      return
    }

    const maxSize = 2 * 1024 * 1024 // 2MB
    if (file.size > maxSize) {
      setError('Fichier trop volumineux. Taille maximale : 2MB')
      return
    }

    setError(null)
    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('logo', file)
      formData.append('tenantId', tenantId)

      const response = await fetch('/api/company/logo', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erreur lors du téléchargement')
      }

      const data = await response.json()
      onLogoChange(data.logoUrl)
    } catch (err) {
      setError(err instanceof Error ? err instanceof Error ? err.message : 'Erreur inconnue' : 'Erreur lors du téléchargement')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Voulez-vous vraiment supprimer le logo ?')) return

    setUploading(true)
    setError(null)

    try {
      const response = await fetch(`/api/company/logo?tenantId=${tenantId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erreur lors de la suppression')
      }

      onLogoChange(null)
    } catch (err) {
      setError(err instanceof Error ? err instanceof Error ? err.message : 'Erreur inconnue' : 'Erreur lors de la suppression')
    } finally {
      setUploading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2 pt-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <ImageIcon className="h-3 w-3" />
          Logo de l&apos;entreprise
        </CardTitle>
        <CardDescription className="text-xs">
          PNG, JPG, SVG - max 2MB
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 pb-3">
        {logoUrl ? (
          <div className="space-y-2">
            <div className="relative w-32 h-32 border rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
              <Image
                src={logoUrl}
                alt="Logo entreprise"
                fill
                className="object-contain p-2"
              />
            </div>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="h-7 text-xs"
              >
                <Upload className="h-3 w-3 mr-1" />
                Remplacer
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                disabled={uploading}
                className="h-7 text-xs"
              >
                <X className="h-3 w-3 mr-1" />
                Supprimer
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="border-2 border-dashed rounded-lg p-4 text-center">
              <ImageIcon className="h-8 w-8 mx-auto text-gray-400 mb-2" />
              <p className="text-xs text-gray-600 mb-2">
                Aucun logo téléchargé
              </p>
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                size="sm"
                className="h-7 text-xs"
              >
                <Upload className="h-3 w-3 mr-1" />
                Télécharger
              </Button>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/svg+xml"
          className="hidden"
          onChange={handleFileSelect}
          disabled={uploading}
        />

        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
            {error}
          </div>
        )}

        {uploading && (
          <div className="text-sm text-blue-600">
            Téléchargement en cours...
          </div>
        )}
      </CardContent>
    </Card>
  )
}