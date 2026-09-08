import type {
  Contact,
  CreateContactPayload,
  UpdateContactPayload,
} from "@/features/contacts/types/contact.types";
import { authStorage } from "@/features/auth/services/authStorage";

/**
 * There's no `/api/contacts/` endpoint on the backend yet. This mirrors the
 * exact async shape LeadService uses (get/create/update/delete) against
 * localStorage, so swapping in real `apiClient` calls later is a
 * find-and-replace, not a rewrite of any screen that uses it.
 */
const STORAGE_KEY = "crm.contacts";

function readAll(): Contact[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Contact[];
  } catch {
    return [];
  }
}

function writeAll(contacts: Contact[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
}

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), 150));
}

export const ContactService = {
  async getContacts(): Promise<Contact[]> {
    return delay(readAll());
  },

  async getContact(id: string): Promise<Contact> {
    const contact = readAll().find((c) => c.id === id);
    if (!contact) throw new Error("Contact not found");
    return delay(contact);
  },

  async createContact(payload: CreateContactPayload): Promise<Contact> {
    const owner = authStorage.getUser();
    const now = new Date().toISOString();
    const contact: Contact = {
      id: crypto.randomUUID(),
      first_name: payload.first_name ?? "",
      last_name: payload.last_name ?? "",
      email: payload.email,
      phone: payload.phone ?? null,
      mobile: payload.mobile ?? null,
      title: payload.title ?? null,
      account_name: payload.account_name ?? null,
      owner: { id: payload.owner_id, name: owner?.name ?? "Unassigned" },
      created_at: now,
      updated_at: now,
    };
    const all = [contact, ...readAll()];
    writeAll(all);
    return delay(contact);
  },

  async updateContact(id: string, payload: UpdateContactPayload): Promise<Contact> {
    const all = readAll();
    const index = all.findIndex((c) => c.id === id);
    if (index === -1) throw new Error("Contact not found");
    const updated: Contact = {
      ...all[index],
      ...payload,
      updated_at: new Date().toISOString(),
    } as Contact;
    all[index] = updated;
    writeAll(all);
    return delay(updated);
  },

  async deleteContact(id: string): Promise<void> {
    writeAll(readAll().filter((c) => c.id !== id));
    return delay(undefined);
  },
};
