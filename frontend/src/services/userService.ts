//src/services/userService.ts

export const deleteAccount = async (token: string): Promise<void> => {
  const res = await fetch('/api/user/me', {
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
