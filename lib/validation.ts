// Validation utilities for Saudi-specific data

export function validateSaudiPhoneNumber(phone: string): { valid: boolean; error?: string } {
    // Remove any spaces or special characters
    const cleanPhone = phone.replace(/\s/g, "")
  
    // Check if it's exactly 10 digits
    if (cleanPhone.length !== 10) {
      return { valid: false, error: "رقم الجوال يجب أن يكون 10 أرقام" }
    }
  
    // Check if it starts with 05
    if (!cleanPhone.startsWith("05")) {
      return { valid: false, error: "رقم الجوال يجب أن يبدأ بـ 05" }
    }
  
    // Check if the third digit is valid (0,3,4,5,6,7,8,9)
    const thirdDigit = cleanPhone[2]
    if (!["0", "3", "4", "5", "6", "7", "8", "9"].includes(thirdDigit)) {
      return { valid: false, error: "رقم الجوال غير صحيح" }
    }
  
    // Check if all characters are digits
    if (!/^\d+$/.test(cleanPhone)) {
      return { valid: false, error: "يجب أن يحتوي رقم الجوال على أرقام فقط" }
    }
  
    return { valid: true }
  }
  
  export function validateSaudiNationalId(nationalId: string): { valid: boolean; error?: string } {
    // Remove any spaces or special characters
    const cleanId = nationalId.replace(/\s/g, "")
  
    // Check if it's exactly 10 digits
    if (cleanId.length !== 10) {
      return { valid: false, error: "رقم الهوية يجب أن يكون 10 أرقام" }
    }
  
    // Check if all characters are digits
    if (!/^\d+$/.test(cleanId)) {
      return { valid: false, error: "يجب أن يحتوي رقم الهوية على أرقام فقط" }
    }
  
    // Check if first digit is 1 (Saudi) or 2 (Resident)
    const firstDigit = cleanId[0]
    if (firstDigit !== "1" && firstDigit !== "2") {
      return { valid: false, error: "رقم الهوية يجب أن يبدأ بـ 1 (سعودي) أو 2 (مقيم)" }
    }
  
    // Validate using Luhn algorithm (checksum validation)
    let sum = 0
    for (let i = 0; i < 10; i++) {
      let digit = Number.parseInt(cleanId[i])
  
      // Double every second digit from the right
      if ((10 - i) % 2 === 0) {
        digit *= 2
        // If doubling results in a two-digit number, add the digits
        if (digit > 9) {
          digit = digit - 9
        }
      }
  
      sum += digit
    }
  
    // The sum should be divisible by 10
    if (sum % 10 !== 0) {
      return { valid: false, error: "رقم الهوية غير صحيح" }
    }
  
    return { valid: true }
  }
  