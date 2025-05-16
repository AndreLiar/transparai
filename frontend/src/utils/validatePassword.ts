// src/utils/validatePassword.ts
export const validatePassword = (password: string): string | null => {
    if (password.length < 12) {
      return 'Le mot de passe doit contenir au moins 12 caractères (14 recommandés).';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Incluez au moins une majuscule.';
    }
    if (!/[a-z]/.test(password)) {
      return 'Incluez au moins une minuscule.';
    }
    if (!/[0-9]/.test(password)) {
      return 'Incluez au moins un chiffre.';
    }
    if (!/[!@#$%^&*]/.test(password)) {
      return 'Ajoutez un caractère spécial.';
    }
    return null;
  };
  