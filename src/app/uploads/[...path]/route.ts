import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { stat } from 'fs/promises'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params
    const filepath = join(process.cwd(), 'public', 'uploads', ...path)

    // Vérifier que le fichier existe
    try {
      await stat(filepath)
    } catch {
      return new NextResponse('File not found', { status: 404 })
    }

    // Lire le fichier
    const fileBuffer = await readFile(filepath)

    // Déterminer le type MIME
    const ext = path[path.length - 1].split('.').pop()?.toLowerCase()
    const mimeTypes: Record<string, string> = {
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'gif': 'image/gif',
      'svg': 'image/svg+xml',
      'webp': 'image/webp',
      'pdf': 'application/pdf',
    }
    const contentType = mimeTypes[ext || ''] || 'application/octet-stream'

    // Retourner le fichier avec le bon type MIME
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('Error serving upload file:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
