export type User = {
  id?: number;
  email: string;
  password?: string;
  name?: string;
  role?: 'user' | 'admin' | string;
  created_at?: string;
};
