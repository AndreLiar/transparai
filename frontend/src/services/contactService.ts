// src/services/contactService.ts
import { API_BASE_URL } from '@/config/api';

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactResponse {
  success: boolean;
  message: string;
}

/**
 * Submit contact form
 */
export const submitContactForm = async (formData: ContactFormData): Promise<ContactResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/contact/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erreur lors de l\'envoi du message');
    }

    return data;
  } catch (error) {
    console.error('Contact form submission error:', error);
    
    // Return user-friendly error message
    return {
      success: false,
      message: error instanceof Error 
        ? error.message 
        : 'Erreur de connexion. Veuillez réessayer ou nous contacter directement.'
    };
  }
};

/**
 * Test email connection (for debugging)
 */
export const testEmailConnection = async (): Promise<ContactResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/contact/test`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Test de connexion échoué');
    }

    return data;
  } catch (error) {
    console.error('Email connection test error:', error);
    
    return {
      success: false,
      message: error instanceof Error 
        ? error.message 
        : 'Impossible de tester la connexion email'
    };
  }
};