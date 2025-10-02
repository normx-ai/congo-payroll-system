export class CongoFormatValidators {

  static validateCNSS(cnss: string): { valid: boolean; error?: string } {
    if (!cnss || cnss.trim() === '') return { valid: true }
    const cleanCnss = cnss.replace(/\s|-/g, '')
    if (!/^\d{10}$/.test(cleanCnss)) {
      return { valid: false, error: 'Le numéro CNSS doit contenir exactement 10 chiffres' }
    }
    if (cleanCnss === '0000000000') {
      return { valid: false, error: 'Numéro CNSS invalide' }
    }
    return { valid: true }
  }

  static validateNUI(nui: string): { valid: boolean; error?: string } {
    if (!nui || nui.trim() === '') return { valid: true }
    const cleanNui = nui.replace(/\s|-/g, '').toUpperCase()
    if (!/^P\d{16}$/.test(cleanNui)) {
      return { valid: false, error: 'Le NUI doit commencer par P suivi de 16 chiffres (ex: P1234567890123456)' }
    }
    return { valid: true }
  }

  static validateEmail(email: string): { valid: boolean; error?: string } {
    if (!email || email.trim() === '') return { valid: true }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!emailRegex.test(email)) {
      return { valid: false, error: 'Format email invalide' }
    }
    if (email.length > 100) {
      return { valid: false, error: 'Email trop long (max 100 caractères)' }
    }
    return { valid: true }
  }

  static validatePhone(phone: string): { valid: boolean; error?: string } {
    if (!phone || phone.trim() === '') return { valid: true }
    const cleanPhone = phone.replace(/[\s\-\.]/g, '')

    if (/^\+?242[0-9]{9}$/.test(cleanPhone)) return { valid: true }
    if (/^0[5-7][0-9]{7}$/.test(cleanPhone)) return { valid: true }

    return {
      valid: false,
      error: 'Format téléphone invalide. Formats acceptés: +242061234567, 242061234567, 061234567'
    }
  }

  static validateSalary(salary: number): { valid: boolean; error?: string } {
    const MIN_SALARY = 50000
    const MAX_SALARY = 50000000

    if (salary <= 0) {
      return { valid: false, error: 'Le salaire doit être supérieur à 0' }
    }
    if (salary < MIN_SALARY) {
      return { valid: false, error: `Salaire trop bas. Minimum: ${MIN_SALARY.toLocaleString()} FCFA` }
    }
    if (salary > MAX_SALARY) {
      return { valid: false, error: `Salaire trop élevé. Maximum: ${MAX_SALARY.toLocaleString()} FCFA` }
    }
    return { valid: true }
  }

  static validateDates(dateOfBirth?: Date, hireDate?: Date, contractStart?: Date, contractEnd?: Date): { valid: boolean; error?: string } {
    const now = new Date()
    const minAge = new Date(now.getFullYear() - 80, now.getMonth(), now.getDate())
    const maxAge = new Date(now.getFullYear() - 16, now.getMonth(), now.getDate())

    if (dateOfBirth) {
      if (dateOfBirth > maxAge) {
        return { valid: false, error: 'Employé trop jeune (moins de 16 ans)' }
      }
      if (dateOfBirth < minAge) {
        return { valid: false, error: 'Employé trop âgé (plus de 80 ans)' }
      }
      if (hireDate && dateOfBirth >= hireDate) {
        return { valid: false, error: 'La date de naissance doit être antérieure à la date d\'embauche' }
      }
    }

    if (hireDate && contractStart && contractStart < hireDate) {
      return { valid: false, error: 'La date de début de contrat ne peut pas être antérieure à la date d\'embauche' }
    }

    if (contractStart && contractEnd && contractEnd <= contractStart) {
      return { valid: false, error: 'La date de fin de contrat doit être postérieure à la date de début' }
    }

    return { valid: true }
  }

  static validateEmployee(data: {
    cnssNumber?: string
    nui?: string
    email?: string
    phone?: string
    baseSalary?: number
    dateOfBirth?: Date
    hireDate?: Date
    contractStartDate?: Date
    contractEndDate?: Date
  }): { valid: boolean; errors: string[] } {

    const errors: string[] = []
    const validations = [
      this.validateCNSS(data.cnssNumber || ''),
      this.validateNUI(data.nui || ''),
      this.validateEmail(data.email || ''),
      this.validatePhone(data.phone || ''),
      data.baseSalary ? this.validateSalary(data.baseSalary) : { valid: true },
      this.validateDates(data.dateOfBirth, data.hireDate, data.contractStartDate, data.contractEndDate)
    ]

    validations.forEach(validation => {
      if (!validation.valid && validation.error) {
        errors.push(validation.error)
      }
    })

    return {
      valid: errors.length === 0,
      errors
    }
  }
}