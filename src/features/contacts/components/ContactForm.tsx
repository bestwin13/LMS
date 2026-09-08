"use client";

import { useEffect, useState, type FormEvent } from "react";
import { userService } from "@/features/users/services/userService";
import type { LeadOwnerOption } from "@/features/auth/types/auth.types";
import { authService } from "@/features/auth/services/authService";
import OwnerPicker from "@/shared/components/OwnerPicker";
import type { Contact, CreateContactPayload } from "@/features/contacts/types/contact.types";

interface ContactFormProps {
  mode: "create" | "edit";
  initialContact?: Contact;
  onSubmit: (payload: CreateContactPayload) => Promise<void>;
  onCancel: () => void;
}

interface FormState {
  owner_id: string;
  ownerLabel: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  mobile: string;
  title: string;
  account_name: string;
}

function emptyForm(): FormState {
  return {
    owner_id: "",
    ownerLabel: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    mobile: "",
    title: "",
    account_name: "",
  };
}

function formFromContact(contact: Contact): FormState {
  return {
    owner_id: contact.owner?.id ?? "",
    ownerLabel: contact.owner?.name ?? "",
    first_name: contact.first_name ?? "",
    last_name: contact.last_name ?? "",
    email: contact.email ?? "",
    phone: contact.phone ?? "",
    mobile: contact.mobile ?? "",
    title: contact.title ?? "",
    account_name: contact.account_name ?? "",
  };
}

export default function ContactForm({ mode, initialContact, onSubmit, onCancel }: ContactFormProps) {
  const [form, setForm] = useState<FormState>(() =>
    initialContact ? formFromContact(initialContact) : emptyForm()
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
    if (!form.email.trim() || !form.owner_id) {
      setError("Email and Contact Owner are required.");
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      await onSubmit({
        email: form.email.trim(),
        owner_id: form.owner_id,
        first_name: form.first_name.trim() || undefined,
        last_name: form.last_name.trim() || undefined,
        phone: form.phone.trim() || null,
        mobile: form.mobile.trim() || null,
        title: form.title.trim() || null,
        account_name: form.account_name.trim() || null,
      });
    } catch {
      setError("Couldn't save this contact. Check the fields and try again.");
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex items-center justify-between border-b border-line pb-4">
        <h1 className="font-serif text-2xl text-ink">
          {mode === "create" ? "Create Contact" : "Edit Contact"}
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
          Contact Information
        </h3>
        <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
          <Field label="Contact Owner" required>
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
          <Field label="Account Name">
            <input
              value={form.account_name}
              onChange={(e) => update("account_name", e.target.value)}
              className={inputClass}
              placeholder="ABC Technologies Pvt Ltd"
            />
          </Field>

          <Field label="First Name">
            <input
              value={form.first_name}
              onChange={(e) => update("first_name", e.target.value)}
              className={inputClass}
              placeholder="Don"
            />
          </Field>
          <Field label="Last Name">
            <input
              value={form.last_name}
              onChange={(e) => update("last_name", e.target.value)}
              className={inputClass}
              placeholder="Davis"
            />
          </Field>

          <Field label="Email" required>
            <input
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              className={inputClass}
              placeholder="don.davis@abctech.com"
            />
          </Field>
          <Field label="Title">
            <input
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              className={inputClass}
              placeholder="IT Manager"
            />
          </Field>

          <Field label="Phone">
            <input
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Mobile">
            <input
              value={form.mobile}
              onChange={(e) => update("mobile", e.target.value)}
              className={inputClass}
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
