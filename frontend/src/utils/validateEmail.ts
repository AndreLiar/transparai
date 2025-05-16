export function validateEmail(email: string): string | null {
    const emailRegex = /^\S+@\S+\.\S+$/;
  
    if (!email) return "L’adresse email est requise.";
    if (!emailRegex.test(email)) return "L’adresse email est invalide.";
  
    return null; // valid
  }
  