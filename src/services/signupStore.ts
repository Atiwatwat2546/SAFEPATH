export interface PendingProfile {
  email?: string;
  password?: string;
  name?: string;
  username?: string;
  idCard?: string;
  phone?: string;
  birthDate?: string;
  gender?: string;
  occupation?: string;
  address?: string;
}

let pendingProfile: PendingProfile | null = null;

export const setPendingProfile = (data: PendingProfile | null) => {
  pendingProfile = data;
};

export const getPendingProfile = (): PendingProfile | null => pendingProfile;

export const clearPendingProfile = () => {
  pendingProfile = null;
};
