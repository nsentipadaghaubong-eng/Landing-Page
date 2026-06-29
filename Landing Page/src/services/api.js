// src/services/api.js

const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Sends waitlist onboarding parameters to the Express/Prisma backend
 * @param {Object} formData - { pharmacyName, email, address, faxNumber }
 * @returns {Promise<Object>} Backend response payload
 */
export async function submitToWaitlist(formData) {
  try {
    const response = await fetch(`${API_BASE_URL}/waitlist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    // Capture the text response first to protect against non-JSON server crash responses
    const responseText = await response.text();
    let data = {};
    
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      // Fallback if backend responds with plain text (common for 502/504 gateways or severe rate limit strings)
      data = { error: responseText || 'An unexpected server error occurred.' };
    }

    // Catch non-2xx status states safely (400, 409, 429, 500)
    if (!response.ok) {
      throw new Error(data.error || 'An unexpected error occurred during submission.');
    }

    return data; // Returns { success: true, message: "...", payload: ... }
  } catch (error) {
    // Escalate the clean message string directly back to the UI state engine
    throw error;
  }
}