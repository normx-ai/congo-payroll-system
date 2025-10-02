import { z } from 'zod'
import { CongoFormatValidators } from './format-validators'

// Schema de validation pour l'authentification
export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères')
})

export const registerSchema = z.object({
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  tenantName: z.string().min(2, 'Le nom de l\'entreprise doit contenir au moins 2 caractères')
})

// Validation spécifique Congo Brazzaville - renforcée
export const cnssValidator = z.string().refine((val) => {
  const result = CongoFormatValidators.validateCNSS(val)
  return result.valid
}, { message: 'Format CNSS invalide: 10 chiffres requis' })

export const nuiValidator = z.string().refine((val) => {
  const result = CongoFormatValidators.validateNUI(val)
  return result.valid
}, { message: 'Format NUI invalide: P suivi de 16 chiffres' })

export const phoneValidator = z.string().optional().refine((val) => {
  if (!val) return true
  const result = CongoFormatValidators.validatePhone(val)
  return result.valid
}, { message: 'Format téléphone invalide' })

export const emailValidator = z.string().optional().refine((val) => {
  if (!val) return true
  const result = CongoFormatValidators.validateEmail(val)
  return result.valid
}, { message: 'Format email invalide' })

// Schema de validation pour employé
export const employeeCreateSchema = z.object({
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: emailValidator,
  phone: phoneValidator,
  gender: z.enum(['male', 'female']),
  position: z.string().min(2, 'Le poste doit contenir au moins 2 caractères'),
  hireDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Date d\'embauche invalide'),
  baseSalary: z.number().min(0, 'Le salaire de base doit être un nombre positif'),
  cnssNumber: z.string().optional().refine((val) => {
    // Si vide, accepter
    if (!val || val.trim() === '') return true
    // Format Congo: 8 chiffres + espace + 2 chiffres (ex: "22278401 11")
    return /^\d{8}\s\d{2}$/.test(val) || val.length >= 10
  }, { message: 'Format CNSS Congo invalide (ex: 22278401 11)' }),
  nui: z.string().optional().refine((val) => {
    // Si vide, accepter
    if (!val || val.trim() === '') return true
    // Format Congo: P + 15 chiffres (ex: "P220000001491719")
    return /^P\d{15}$/.test(val) || val.length >= 15
  }, { message: 'Format NUI Congo invalide (ex: P220000001491719)' }),
  departmentId: z.union([
    z.string().uuid(),
    z.literal(''),
    z.null(),
    z.undefined()
  ]).optional(),
  contractType: z.enum(['CDI', 'CDD', 'Stage']),
  salaryCategory: z.string().optional(),
  conventionCollective: z.string().default('Commerce'),
  categorieProfessionnelle: z.number().int().min(1, 'Catégorie professionnelle requise').max(10, 'Catégorie professionnelle invalide (1-10)'),
  echelon: z.number().int().min(1, 'Échelon requis').max(5, 'Échelon invalide (1-5)'),
  maritalStatus: z.enum(['single', 'married', 'divorced', 'widowed']).optional(),
  childrenCount: z.number().int().min(0).default(0),
  isActive: z.boolean().optional()
})

export const employeeUpdateSchema = employeeCreateSchema.partial().omit({ cnssNumber: true, nui: true })

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type EmployeeCreateInput = z.infer<typeof employeeCreateSchema>
export type EmployeeUpdateInput = z.infer<typeof employeeUpdateSchema>