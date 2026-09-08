export interface ContactOwner {
  id: string;
  name: string;
  email?: string;
}

export interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  mobile: string | null;
  title: string | null;
  account_name: string | null;
  owner: ContactOwner;
  created_at: string;
  updated_at: string;
}

export interface CreateContactPayload {
  email: string;
  owner_id: string;
  first_name?: string;
  last_name?: string;
  phone?: string | null;
  mobile?: string | null;
  title?: string | null;
  account_name?: string | null;
}

export type UpdateContactPayload = Partial<CreateContactPayload>;
