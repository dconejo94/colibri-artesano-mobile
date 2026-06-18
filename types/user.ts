export type UserRole = "buyer" | "vendor";

export type User = {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  address: string | null;
  avatar_url: string | null;
  bio: string | null;
  is_active: boolean;
  is_admin: boolean;
  role: UserRole;
  created_at: string;
};
