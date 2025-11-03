// src/services/profileService.ts
export interface Profile {
  firstName: string;
  lastName: string;
  phone: string;
  country: string;
  isComplete: boolean;
}

export interface ProfileData {
  email: string;
  profile: Profile;
}

export const getProfile = async (token: string): Promise<ProfileData> => {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Erreur lors de la récupération du profil');
  }

  return response.json();
};

export const updateProfile = async (token: string, profileData: Omit<Profile, 'isComplete'>): Promise<{ message: string; profile: Profile }> => {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/profile`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(profileData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Erreur lors de la mise à jour du profil');
  }

  return response.json();
};