// src/services/api.js

// In Vite development, this reads from your local instance. 
// When deployed on Vercel, set VITE_API_BASE_URL to your Render web address.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3300';

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
      data = { error: responseText || 'An unexpected server error occurred.' };
    }

    // Catch non-2xx status states safely (400, 409, 429, 500)
    if (!response.ok) {
      throw new Error(data.error || 'An unexpected error occurred during submission.');
    }

    return data; 

  } catch (error) {
    console.error("API Gateway Exception:", error);
    throw error;
  }
}