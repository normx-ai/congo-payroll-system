import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { unlink } from 'fs/promises'
import { join } from 'path'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id } = await params

    // Récupérer le bulletin pour vérifier l'appartenance au tenant
    const bulletin = await prisma.bulletinPaie.findFirst({
      where: {
        id,
        tenantId: session.user.tenantId
      }
    })

    if (!bulletin) {
      return NextResponse.json({ error: 'Bulletin non trouvé' }, { status: 404 })
    }

    // Supprimer le fichier PDF s'il existe
    if (bulletin.pdfPath) {
      try {
        const pdfFullPath = join(process.cwd(), 'public', bulletin.pdfPath)
        await unlink(pdfFullPath)
      } catch (error) {
        console.error('Erreur lors de la suppression du PDF:', error)
        // Continue même si le fichier n'existe pas
      }
    }

    // Supprimer le bulletin de la base de données
    await prisma.bulletinPaie.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Bulletin supprimé avec succès'
    })
  } catch (error) {
    console.error('Erreur lors de la suppression du bulletin:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du bulletin' },
      { status: 500 }
    )
  }
}