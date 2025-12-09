/**
 * Input Validation and Sanitization
 * Prevents SQL injection, XSS, and other injection attacks
 */

// Remove HTML tags and dangerous characters
export function sanitizeString(input: string): string {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers like onclick=
    .trim()
    .slice(0, 1000); // Limit length
}

// Validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate MongoDB ObjectId
export function isValidObjectId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

// Validate number within range
export function isValidNumber(value: any, min?: number, max?: number): boolean {
  const num = Number(value);
  if (isNaN(num)) return false;
  if (min !== undefined && num < min) return false;
  if (max !== undefined && num > max) return false;
  return true;
}

// Sanitize search query (prevent regex injection)
export function sanitizeSearchQuery(query: string): string {
  if (!query || typeof query !== 'string') return '';
  
  // Escape regex special characters
  return query
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    .trim()
    .slice(0, 100);
}

// Validate phone number (basic)
export function isValidPhone(phone: string): boolean {
  return /^[\d\s\-\+\(\)]{7,20}$/.test(phone);
}

// Sanitize filename (prevent path traversal)
export function sanitizeFilename(filename: string): string {
  if (!filename || typeof filename !== 'string') return '';
  
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace non-alphanumeric
    .replace(/\.{2,}/g, '_') // Replace multiple dots
    .replace(/^\.+/, '') // Remove leading dots
    .slice(0, 255);
}

// Validate URL
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

// Sanitize object for MongoDB (prevent NoSQL injection)
export function sanitizeMongoInput(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeMongoInput(item));
  }
  
  if (typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      // Remove keys starting with $ (MongoDB operators)
      if (key.startsWith('$')) continue;
      
      sanitized[key] = sanitizeMongoInput(obj[key]);
    }
    return sanitized;
  }
  
  return obj;
}

// Validate GraphQL input
export function validateGraphQLInput(input: any, rules: ValidationRules): ValidationResult {
  const errors: string[] = [];
  
  for (const [field, rule] of Object.entries(rules)) {
    const value = input[field];
    
    // Required check
    if (rule.required && (value === undefined || value === null || value === '')) {
      errors.push(`${field} is required`);
      continue;
    }
    
    if (value === undefined || value === null) continue;
    
    // Type check
    if (rule.type === 'string' && typeof value !== 'string') {
      errors.push(`${field} must be a string`);
    }
    if (rule.type === 'number' && typeof value !== 'number') {
      errors.push(`${field} must be a number`);
    }
    if (rule.type === 'boolean' && typeof value !== 'boolean') {
      errors.push(`${field} must be a boolean`);
    }
    if (rule.type === 'email' && !isValidEmail(value)) {
      errors.push(`${field} must be a valid email`);
    }
    if (rule.type === 'objectId' && !isValidObjectId(value)) {
      errors.push(`${field} must be a valid ID`);
    }
    
    // Length checks for strings
    if (typeof value === 'string') {
      if (rule.minLength && value.length < rule.minLength) {
        errors.push(`${field} must be at least ${rule.minLength} characters`);
      }
      if (rule.maxLength && value.length > rule.maxLength) {
        errors.push(`${field} must be at most ${rule.maxLength} characters`);
      }
    }
    
    // Range checks for numbers
    if (typeof value === 'number') {
      if (rule.min !== undefined && value < rule.min) {
        errors.push(`${field} must be at least ${rule.min}`);
      }
      if (rule.max !== undefined && value > rule.max) {
        errors.push(`${field} must be at most ${rule.max}`);
      }
    }
    
    // Custom validator
    if (rule.validator && !rule.validator(value)) {
      errors.push(rule.validatorMessage || `${field} is invalid`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

export interface ValidationRule {
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'email' | 'objectId';
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  validator?: (value: any) => boolean;
  validatorMessage?: string;
}

export interface ValidationRules {
  [field: string]: ValidationRule;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}
