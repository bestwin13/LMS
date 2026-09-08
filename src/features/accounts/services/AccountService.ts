import type {
  Account,
  CreateAccountPayload,
  UpdateAccountPayload,
} from "@/features/accounts/types/account.types";
import { authStorage } from "@/features/auth/services/authStorage";

const STORAGE_KEY = "crm.accounts";

function readAll(): Account[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Account[];
  } catch {
    return [];
  }
}

function writeAll(accounts: Account[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
}

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), 150));
}

export const AccountService = {
  async getAccounts(): Promise<Account[]> {
    return delay(readAll());
  },

  async getAccount(id: string): Promise<Account> {
    const account = readAll().find((a) => a.id === id);
    if (!account) throw new Error("Account not found");
    return delay(account);
  },

  async createAccount(payload: CreateAccountPayload): Promise<Account> {
    const owner = authStorage.getUser();
    const now = new Date().toISOString();
    const account: Account = {
      id: crypto.randomUUID(),
      account_name: payload.account_name,
      website: payload.website ?? null,
      phone: payload.phone ?? null,
      industry: payload.industry ?? null,
      employees: payload.employees ?? null,
      annual_revenue: payload.annual_revenue ?? null,
      description: payload.description ?? null,
      owner: { id: payload.owner_id, name: owner?.name ?? "Unassigned" },
      created_at: now,
      updated_at: now,
    };
    writeAll([account, ...readAll()]);
    return delay(account);
  },

  async updateAccount(id: string, payload: UpdateAccountPayload): Promise<Account> {
    const all = readAll();
    const index = all.findIndex((a) => a.id === id);
    if (index === -1) throw new Error("Account not found");
    const updated: Account = {
      ...all[index],
      ...payload,
      updated_at: new Date().toISOString(),
    } as Account;
    all[index] = updated;
    writeAll(all);
    return delay(updated);
  },

  async deleteAccount(id: string): Promise<void> {
    writeAll(readAll().filter((a) => a.id !== id));
    return delay(undefined);
  },
};
