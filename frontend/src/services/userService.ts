//src/services/userService.ts
import { API_BASE_URL } from '@/config/api';

export const deleteAccount = async (token: string): Promise<void> => {
  const res = await fetch(`${API_BASE_URL}/api/user/me`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Échec de suppression du compte.');
  }
};
