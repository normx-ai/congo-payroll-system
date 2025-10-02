import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const tenantId = '9f6f38b2-9258-4563-bd52-b8d2be2e55db'
  const codes = ['CNSS_EMPLOYE', 'CNSS_EMPLOYEUR', 'CNSS_PLAFOND']

  // Date de période: 2024-01
  const [year, month] = ['2024', '01']
  const periodeLocal = new Date(parseInt(year), parseInt(month) - 1, 1)
  const periodeUTC = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, 1))

  console.log('[DEBUG API] periodeLocal:', periodeLocal)
  console.log('[DEBUG API] periodeLocal.toISOString():', periodeLocal.toISOString())
  console.log('[DEBUG API] periodeUTC:', periodeUTC)
  console.log('[DEBUG API] periodeUTC.toISOString():', periodeUTC.toISOString())

  // Test 1: Sans filtres de date
  const test1 = await prisma.fiscalParameter.findMany({
    where: {
      tenantId,
      code: { in: codes },
      isActive: true
    },
    select: {
      code: true,
      value: true,
      dateEffet: true,
      dateFin: true
    }
  })

  // Test 2: Avec filtres de date (UTC)
  const test2 = await prisma.fiscalParameter.findMany({
    where: {
      tenantId,
      code: { in: codes },
      isActive: true,
      dateEffet: { lte: periodeUTC },
      OR: [
        { dateFin: null },
        { dateFin: { gte: periodeUTC } }
      ]
    },
    select: {
      code: true,
      value: true,
      dateEffet: true,
      dateFin: true
    }
  })

  // Test 3: Avec filtres de date (Local)
  const test3 = await prisma.fiscalParameter.findMany({
    where: {
      tenantId,
      code: { in: codes },
      isActive: true,
      dateEffet: { lte: periodeLocal },
      OR: [
        { dateFin: null },
        { dateFin: { gte: periodeLocal } }
      ]
    },
    select: {
      code: true,
      value: true,
      dateEffet: true,
      dateFin: true
    }
  })

  return NextResponse.json({
    periodeLocal: {
      raw: periodeLocal,
      iso: periodeLocal.toISOString()
    },
    periodeUTC: {
      raw: periodeUTC,
      iso: periodeUTC.toISOString()
    },
    test1_sans_filtres_date: {
      count: test1.length,
      results: test1
    },
    test2_avec_filtres_utc: {
      count: test2.length,
      results: test2
    },
    test3_avec_filtres_local: {
      count: test3.length,
      results: test3
    }
  })
}
