/**
 * Utility functions for mobile number formatting and country code handling
 */

// Common country codes and their patterns
const COUNTRY_CODES = {
  '91': { name: 'India', pattern: /^(\+91|91)?[6-9]\d{8,9}$/ },
  '1': { name: 'US/Canada', pattern: /^(\+1|1)?[2-9]\d{2}[2-9]\d{2}\d{4}$/ },
  '44': { name: 'UK', pattern: /^(\+44|44)?[1-9]\d{8,9}$/ },
  '61': { name: 'Australia', pattern: /^(\+61|61)?[2-9]\d{8}$/ },
  '49': { name: 'Germany', pattern: /^(\+49|49)?[1-9]\d{10,11}$/ },
  '33': { name: 'France', pattern: /^(\+33|33)?[1-9]\d{8}$/ },
  '86': { name: 'China', pattern: /^(\+86|86)?1[3-9]\d{9}$/ },
  '81': { name: 'Japan', pattern: /^(\+81|81)?[789]0\d{8}$/ },
  '55': { name: 'Brazil', pattern: /^(\+55|55)?[1-9]\d{10}$/ },
  '7': { name: 'Russia', pattern: /^(\+7|7)?[3-9]\d{9}$/ }
};

/**
 * Detect country code from mobile number
 * @param {string} mobile - Mobile number to analyze
 * @returns {string|null} - Detected country code or null if not found
 */
function detectCountryCode(mobile) {
  if (!mobile || typeof mobile !== 'string') return null;
  
  // Remove any non-digit characters except +
  const cleanMobile = mobile.replace(/[^\d+]/g, '');
  
  // Check each country code pattern
  for (const [code, config] of Object.entries(COUNTRY_CODES)) {
    if (config.pattern.test(cleanMobile)) {
      return code;
    }
  }
  
  // If no pattern matches, try to extract from the beginning
  if (cleanMobile.startsWith('+')) {
    // Extract country code after +
    for (const code of Object.keys(COUNTRY_CODES)) {
      if (cleanMobile.startsWith('+' + code)) {
        return code;
      }
    }
  }
  
  return null;
}

/**
 * Format mobile number with country code
 * @param {string} mobile - Mobile number to format
 * @param {string} defaultCountryCode - Default country code to use if none detected
 * @returns {string} - Formatted mobile number with country code
 */
function formatMobileWithCountryCode(mobile, defaultCountryCode = '91') {
  if (!mobile || typeof mobile !== 'string') return mobile;
  
  // Remove any non-digit characters except +
  const cleanMobile = mobile.replace(/[^\d+]/g, '');
  
  // If already has country code, return as is
  if (cleanMobile.startsWith('+')) {
    return cleanMobile;
  }
  
  // For simplicity, just add the default country code to all numbers
  // This ensures we always get a complete international number
  return '+' + defaultCountryCode + cleanMobile;
}

/**
 * Extract country code from mobile number
 * @param {string} mobile - Mobile number
 * @returns {string|null} - Country code or null if not found
 */
function extractCountryCode(mobile) {
  if (!mobile || typeof mobile !== 'string') return null;
  
  const cleanMobile = mobile.replace(/[^\d+]/g, '');
  
  if (cleanMobile.startsWith('+')) {
    // Find the longest matching country code
    const sortedCodes = Object.keys(COUNTRY_CODES).sort((a, b) => b.length - a.length);
    for (const code of sortedCodes) {
      if (cleanMobile.startsWith('+' + code)) {
        return code;
      }
    }
  }
  
  return null;
}

/**
 * Get country name from country code
 * @param {string} countryCode - Country code
 * @returns {string} - Country name or 'Unknown'
 */
function getCountryName(countryCode) {
  return COUNTRY_CODES[countryCode]?.name || 'Unknown';
}

/**
 * Validate mobile number format
 * @param {string} mobile - Mobile number to validate
 * @returns {boolean} - True if valid format
 */
function validateMobileFormat(mobile) {
  if (!mobile || typeof mobile !== 'string') return false;
  
  const cleanMobile = mobile.replace(/[^\d+]/g, '');
  
  // Check if it matches any country code pattern
  for (const [code, config] of Object.entries(COUNTRY_CODES)) {
    if (config.pattern.test(cleanMobile)) {
      return true;
    }
  }
  
  return false;
}

module.exports = {
  detectCountryCode,
  formatMobileWithCountryCode,
  extractCountryCode,
  getCountryName,
  validateMobileFormat,
  COUNTRY_CODES
};
