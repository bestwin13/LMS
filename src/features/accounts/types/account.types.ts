export interface AccountOwner {
  id: string;
  name: string;
  email?: string;
}

export interface Account {
  id: string;
  account_name: string;
  website: string | null;
  phone: string | null;
  industry: string | null;
  employees: number | null;
  annual_revenue: number | null;
  owner: AccountOwner;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateAccountPayload {
  account_name: string;
  owner_id: string;
  website?: string | null;
  phone?: string | null;
  industry?: string | null;
  employees?: number | null;
  annual_revenue?: number | null;
  description?: string | null;
}

export type UpdateAccountPayload = Partial<CreateAccountPayload>;
