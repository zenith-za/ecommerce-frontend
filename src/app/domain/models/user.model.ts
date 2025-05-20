export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'customer';
  billing_address?: string;
}