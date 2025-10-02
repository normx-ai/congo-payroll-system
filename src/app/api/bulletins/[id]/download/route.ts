import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { handleCatchError } from '@/lib/error-handler'
import { readFile } from 'fs/promises'
import { join } from 'path'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id } = await params

    // Récupérer le bulletin
    const bulletin = await prisma.bulletinPaie.findFirst({
      where: {
        id,
        tenantId: session.user.tenantId
      },
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            employeeCode: true
          }
        }
      }
    })

    if (!bulletin) {
      return NextResponse.json(
        { error: 'Bulletin non trouvé' },
        { status: 404 }
      )
    }

    if (!bulletin.pdfPath) {
      return NextResponse.json(
        { error: 'PDF non disponible' },
        { status: 404 }
      )
    }

    // Lire le fichier PDF
    const filePath = join(process.cwd(), bulletin.pdfPath)
    const pdfBuffer = await readFile(filePath)

    // Générer nom de fichier
    const fileName = `bulletin_${bulletin.employee.employeeCode}_${bulletin.periode}.pdf`

    // Retourner le PDF
    return new NextResponse(pdfBuffer as BodyInit, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': pdfBuffer.length.toString()
      }
    })

  } catch (error) {
    console.error('Erreur téléchargement bulletin:', error)

    if (error instanceof Error && error.message.includes('ENOENT')) {
      return NextResponse.json(
        { error: 'Fichier PDF introuvable' },
        { status: 404 }
      )
    }

    return handleCatchError(error)
  }
}