import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Masks an email address by showing only the first character and last character before @
 * Example: john.doe@gmail.com -> j***e@gmail.com
 */
export function maskEmail(email) {
  if (!email || typeof email !== 'string') return email || "-";
  
  const [localPart, domain] = email.split('@');
  if (!localPart || !domain) return email;
  
  if (localPart.length <= 2) {
    return `${localPart[0]}***@${domain}`;
  }
  
  const firstChar = localPart[0];
  const lastChar = localPart[localPart.length - 1];
  const masked = `${firstChar}***${lastChar}@${domain}`;
  
  return masked;
}

/**
 * Masks a phone number by showing first 2 and last 4 digits
 * Example: +91 9876543210 -> +91 98****3210
 * Example: 9876543210 -> 98****3210
 */
export function maskPhone(phone) {
  if (!phone || typeof phone !== 'string') return phone || "-";
  
  // Remove all spaces and special characters except + at the start
  const cleaned = phone.replace(/[\s-()]/g, '');
  
  // Check if it starts with + (international format)
  const hasPlus = cleaned.startsWith('+');
  const digitsOnly = hasPlus ? cleaned.slice(1) : cleaned;
  
  // Extract country code if present (assuming 1-3 digits after +)
  if (hasPlus && digitsOnly.length > 7) {
    // Try to detect country code (1-3 digits)
    let countryCode = '';
    let phoneNumber = digitsOnly;
    
    // Common patterns: +91 (India), +1 (US/Canada), etc.
    if (digitsOnly.length >= 10) {
      // If total length is 10+, likely has country code
      if (digitsOnly.length === 12 || digitsOnly.length === 13) {
        // Likely 2-3 digit country code
        countryCode = digitsOnly.slice(0, digitsOnly.length - 10);
        phoneNumber = digitsOnly.slice(digitsOnly.length - 10);
      } else if (digitsOnly.length === 11) {
        // Could be 1 digit country code
        countryCode = digitsOnly.slice(0, 1);
        phoneNumber = digitsOnly.slice(1);
      } else {
        // Assume no country code, use all digits
        phoneNumber = digitsOnly;
      }
    }
    
    if (phoneNumber.length >= 6) {
      const firstTwo = phoneNumber.slice(0, 2);
      const lastOne = phoneNumber.slice(-1);
      const masked = `${hasPlus ? '+' : ''}${countryCode} ${firstTwo}*******${lastOne}`;
      return masked;
    }
  }
  
  // For numbers without + or shorter numbers
  if (digitsOnly.length >= 6) {
    const firstTwo = digitsOnly.slice(0, 2);
    const lastOne = digitsOnly.slice(-1);
    return `${firstTwo}*******${lastOne}`;
  }
  
  // If too short, just mask middle part
  if (digitsOnly.length > 2) {
    const first = digitsOnly[0];
    const last = digitsOnly[digitsOnly.length - 1];
    return `${first}***${last}`;
  }
  
  return phone;
}