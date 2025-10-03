import { customAlphabet } from 'nanoid';

// Custom alphabet: only lowercase letters and numbers (no uppercase, no special chars)
const CUSTOM_ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyz';

// Create a custom nanoid generator with lowercase alphanumeric characters and length of 5
const nanoid = customAlphabet(CUSTOM_ALPHABET, 5);

// Create a custom nanoid generator for API keys (28 characters for security)
const apiKeyNanoid = customAlphabet(CUSTOM_ALPHABET, 28);

/**
 * Generate a unique ID with only lowercase letters and numbers
 * @returns string - 5 character ID with only lowercase alphanumeric characters
 */
export function getNanoid(): string {
  return nanoid();
}

/**
 * Generate a unique API key with only lowercase letters and numbers
 * @returns string - 28 character API key with only lowercase alphanumeric characters
 */
export function getApiKeyNanoid(): string {
  return apiKeyNanoid();
}
