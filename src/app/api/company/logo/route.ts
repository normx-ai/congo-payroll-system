import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { prisma } from '@/lib/prisma'
import { handleCatchError } from '@/lib/error-handler'

// POST: Upload logo
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('logo') as File
    const tenantId = formData.get('tenantId') as string

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 })
    }

    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant ID manquant' }, { status: 400 })
    }

    // Vérifier le type de fichier
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Type de fichier non autorisé. Utilisez PNG, JPG ou SVG.' }, { status: 400 })
    }

    // Vérifier la taille (max 2MB)
    const maxSize = 2 * 1024 * 1024 // 2MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'Fichier trop volumineux. Taille maximale : 2MB' }, { status: 400 })
    }

    // Générer un nom de fichier unique
    const timestamp = Date.now()
    const extension = file.name.split('.').pop()
    const filename = `logo-${tenantId}-${timestamp}.${extension}`

    // Convertir le fichier en buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Sauvegarder le fichier
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'logos')
    const filepath = join(uploadDir, filename)
    await writeFile(filepath, buffer)

    // Mettre à jour la base de données
    const logoUrl = `/uploads/logos/${filename}`
    await prisma.tenant.update({
      where: { id: tenantId },
      data: { logoUrl }
    })

    return NextResponse.json({
      message: 'Logo téléchargé avec succès',
      logoUrl
    })
  } catch (error) {
    return handleCatchError(error)
  }
}

// DELETE: Delete logo
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tenantId = searchParams.get('tenantId')

    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant ID manquant' }, { status: 400 })
    }

    // Mettre à jour la base de données (supprimer le logo)
    await prisma.tenant.update({
      where: { id: tenantId },
      data: { logoUrl: null }
    })

    return NextResponse.json({ message: 'Logo supprimé avec succès' })
  } catch (error) {
    return handleCatchError(error)
  }
}