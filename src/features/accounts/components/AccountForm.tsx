"use client";

import { useEffect, useState, type FormEvent } from "react";
import { userService } from "@/features/users/services/userService";
import type { LeadOwnerOption } from "@/features/auth/types/auth.types";
import { authService } from "@/features/auth/services/authService";
import OwnerPicker from "@/shared/components/OwnerPicker";
import { LEAD_INDUSTRIES, type LeadIndustry } from "@/features/leads/types/lead.types";
import type { Account, CreateAccountPayload } from "@/features/accounts/types/account.types";

interface AccountFormProps {
  mode: "create" | "edit";
  initialAccount?: Account;
  onSubmit: (payload: CreateAccountPayload) => Promise<void>;
  onCancel: () => void;
}

interface FormState {
  owner_id: string;
  ownerLabel: string;
  account_name: string;
  website: string;
  phone: string;
  industry: LeadIndustry | "";
  employees: string;
  annual_revenue: string;
  description: string;
}

function emptyForm(): FormState {
  return {
    owner_id: "",
    ownerLabel: "",
    account_name: "",
    website: "",
    phone: "",
    industry: "",
    employees: "",
    annual_revenue: "",
    description: "",
  };
}

function formFromAccount(account: Account): FormState {
  return {
    owner_id: account.owner?.id ?? "",
    ownerLabel: account.owner?.name ?? "",
    account_name: account.account_name ?? "",
    website: account.website ?? "",
    phone: account.phone ?? "",
    industry: (account.industry as LeadIndustry) ?? "",
    employees: account.employees?.toString() ?? "",
    annual_revenue: account.annual_revenue?.toString() ?? "",
    description: account.description ?? "",
  };
}

export default function AccountForm({ mode, initialAccount, onSubmit, onCancel }: AccountFormProps) {
  const [form, setForm] = useState<FormState>(() =>
    initialAccount ? formFromAccount(initialAccount) : emptyForm()
  );
  const [owners, setOwners] = useState<LeadOwnerOption[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    userService
      .getLeadOwners()
      .then(setOwners)
      .catch(() => setOwners([]));

    if (mode === "create") {
      const current = authService.getSessionUser();
      if (current) {
        update("owner_id", current.id);
        update("ownerLabel", current.name);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!form.account_name.trim() || !form.owner_id) {
      setError("Account Name and Account Owner are required.");
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      await onSubmit({
        account_name: form.account_name.trim(),
        owner_id: form.owner_id,
        website: form.website.trim() || null,
        phone: form.phone.trim() || null,
        industry: form.industry || null,
        employees: form.employees ? Number(form.employees) : null,
        annual_revenue: form.annual_revenue ? Number(form.annual_revenue) : null,
        description: form.description.trim() || null,
      });
    } catch {
      setError("Couldn't save this account. Check the fields and try again.");
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex items-center justify-between border-b border-line pb-4">
        <h1 className="font-serif text-2xl text-ink">
          {mode === "create" ? "Create Account" : "Edit Account"}
        </h1>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-line px-4 py-2 text-sm font-medium text-ink hover:bg-paper"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-ink-2 disabled:opacity-60"
          >
            {isSubmitting ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-md border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}

      <div className="mt-6">
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-ink-soft">
          Account Information
        </h3>
        <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
          <Field label="Account Owner" required>
            <OwnerPicker
              owners={owners}
              value={form.owner_id}
              label={form.ownerLabel}
              onChange={(id, label) => {
                update("owner_id", id);
                update("ownerLabel", label);
              }}
            />
          </Field>
          <Field label="Account Name" required>
            <input
              value={form.account_name}
              onChange={(e) => update("account_name", e.target.value)}
              className={inputClass}
              placeholder="ABC Technologies Pvt Ltd"
            />
          </Field>

          <Field label="Website">
            <input
              value={form.website}
              onChange={(e) => update("website", e.target.value)}
              className={inputClass}
              placeholder="https://abctech.com"
            />
          </Field>
          <Field label="Phone">
            <input
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              className={inputClass}
            />
          </Field>

          <Field label="Industry">
            <select
              value={form.industry}
              onChange={(e) => update("industry", e.target.value as LeadIndustry | "")}
              className={inputClass}
            >
              <option value="">-None-</option>
              {LEAD_INDUSTRIES.map((industry) => (
                <option key={industry} value={industry}>
                  {industry}
                </option>
              ))}
            </select>
          </Field>
          <Field label="No. of Employees">
            <input
              type="number"
              min="0"
              value={form.employees}
              onChange={(e) => update("employees", e.target.value)}
              className={inputClass}
            />
          </Field>

          <Field label="Annual Revenue">
            <input
              type="number"
              min="0"
              value={form.annual_revenue}
              onChange={(e) => update("annual_revenue", e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>

        <div className="mt-4">
          <Field label="Description">
            <textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              className={`${inputClass} min-h-[88px] resize-y`}
            />
          </Field>
        </div>
      </div>
    </form>
  );
}

const inputClass =
  "w-full rounded-md border border-line bg-white px-3 py-2.5 text-sm text-ink outline-none transition focus:border-slate focus:ring-2 focus:ring-slate-light";

function Field({
  label,
  children,
  required = false,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">
        {label}
        {required && <span className="text-danger"> *</span>}
      </span>
      {children}
    </label>
  );
}
