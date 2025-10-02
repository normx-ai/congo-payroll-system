import '@testing-library/jest-dom'

// Fix pour setImmediate dans Node.js
global.setImmediate = global.setImmediate || ((fn, ...args) => setTimeout(fn, 0, ...args))

// Mock Web APIs pour Next.js en environnement Node
global.Request = global.Request || class Request {}
global.Response = global.Response || class Response {}
global.Headers = global.Headers || class Headers {}
// eslint-disable-next-line @typescript-eslint/no-require-imports
global.URL = global.URL || require('url').URL

// Mock pour Next Auth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}))

// Mock pour Winston logger
jest.mock('@/lib/logger', () => ({
  logger: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  },
  logError: jest.fn(),
  logInfo: jest.fn(),
  logSecurity: jest.fn(),
  logAudit: jest.fn(),
}))

// Mock pour bcryptjs
jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}))

// Mock pour les services
jest.mock('@/lib/employee-service', () => ({
  EmployeeService: {
    getEmployees: jest.fn(),
    getEmployeeById: jest.fn(),
    createEmployee: jest.fn(),
    updateEmployee: jest.fn(),
    deleteEmployee: jest.fn(),
    checkDuplicate: jest.fn(),
    getEmployeeStats: jest.fn(),
  },
}))

// Mock pour Next Auth
jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(),
}))

jest.mock('@/lib/audit-service', () => ({
  AuditService: {
    log: jest.fn(),
    logEmployeeAction: jest.fn(),
  },
}))

// Mock pour rate limiter
jest.mock('@/lib/rate-limiter', () => ({
  withRateLimit: jest.fn((handler) => handler),
}))

// Mock pour validations
jest.mock('@/lib/validations', () => ({
  registerSchema: {
    parse: jest.fn(),
  },
  employeeCreateSchema: {
    parse: jest.fn(),
  },
}))

// Mock pour Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    fiscalParameter: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      createMany: jest.fn(),
      count: jest.fn(),
    },
    irppTranche: {
      findMany: jest.fn(),
      createMany: jest.fn(),
    },
    employee: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    payroll: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    user: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    tenant: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}))