"use client";

import { useEffect, useState, type FormEvent } from "react";
import { userService } from "@/features/users/services/userService";
import type { LeadOwnerOption } from "@/features/auth/types/auth.types";
import { authService } from "@/features/auth/services/authService";
import OwnerPicker from "@/shared/components/OwnerPicker";
import {
  LEAD_INDUSTRIES,
  LEAD_RATINGS,
  LEAD_SOURCES,
  LEAD_STATUSES,
  type CreateLeadPayload,
  type Lead,
  type LeadIndustry,
  type LeadRating,
  type LeadSource,
  type LeadStatus,
} from "@/features/leads/types/lead.types";

interface LeadFormProps {
  mode: "create" | "edit";
  initialLead?: Lead;
  onSubmit: (payload: CreateLeadPayload) => Promise<void>;
  onCancel: () => void;
}

interface FormState {
  owner_id: string;
  ownerLabel: string;
  name: string;
  title: string;
  company_name: string;
  email: string;
  phone: string;
  mobile_number: string;
  fax: string;
  website: string;
  lead_source: LeadSource;
  lead_status: LeadStatus;
  industry: LeadIndustry | "";
  rating: LeadRating | "";
  number_of_employees: string;
  annual_revenue: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  description: string;
}

function emptyForm(): FormState {
  return {
    owner_id: "",
    ownerLabel: "",
    name: "",
    title: "",
    company_name: "",
    email: "",
    phone: "",
    mobile_number: "",
    fax: "",
    website: "",
    lead_source: "None",
    lead_status: "None",
    industry: "",
    rating: "",
    number_of_employees: "",
    annual_revenue: "",
    address: "",
    city: "",
    state: "",
    country: "",
    postal_code: "",
    description: "",
  };
}

function formFromLead(lead: Lead): FormState {
  return {
    owner_id: lead.owner?.id ?? "",
    ownerLabel: lead.owner?.name ?? "",
    name: lead.name ?? "",
    title: lead.title ?? "",
    company_name: lead.company_name ?? "",
    email: lead.email ?? "",
    phone: lead.phone ?? "",
    mobile_number: lead.mobile_number ?? "",
    fax: lead.fax ?? "",
    website: lead.website ?? "",
    lead_source: lead.lead_source ?? "None",
    lead_status: lead.lead_status ?? "None",
    industry: lead.industry ?? "",
    rating: lead.rating ?? "",
    number_of_employees: lead.number_of_employees?.toString() ?? "",
    annual_revenue: lead.annual_revenue?.toString() ?? "",
    address: lead.address ?? "",
    city: lead.city ?? "",
    state: lead.state ?? "",
    country: lead.country ?? "",
    postal_code: lead.postal_code ?? "",
    description: lead.description ?? "",
  };
}

export default function LeadForm({ mode, initialLead, onSubmit, onCancel }: LeadFormProps) {
  const [form, setForm] = useState<FormState>(() =>
    initialLead ? formFromLead(initialLead) : emptyForm()
  );
  const [owners, setOwners] = useState<LeadOwnerOption[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Default the owner to the signed-in user on create, and load the
  // owner picker's options either way.
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
      setError("Email and Lead Owner are required.");
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      await onSubmit({
        email: form.email.trim(),
        owner_id: form.owner_id,
        name: form.name.trim() || undefined,
        title: form.title.trim() || null,
        company_name: form.company_name.trim() || undefined,
        phone: form.phone.trim() || null,
        mobile_number: form.mobile_number.trim() || null,
        fax: form.fax.trim() || null,
        website: form.website.trim() || null,
        lead_source: form.lead_source,
        lead_status: form.lead_status,
        industry: form.industry || null,
        rating: form.rating || null,
        number_of_employees: form.number_of_employees ? Number(form.number_of_employees) : null,
        annual_revenue: form.annual_revenue ? Number(form.annual_revenue) : null,
        address: form.address.trim() || null,
        city: form.city.trim() || null,
        state: form.state.trim() || null,
        country: form.country.trim() || null,
        postal_code: form.postal_code.trim() || null,
        description: form.description.trim() || null,
      });
    } catch {
      setError("Couldn't save this lead. Check the fields and try again.");
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex items-center justify-between border-b border-line pb-4">
        <h1 className="font-serif text-2xl text-ink">
          {mode === "create" ? "Create Lead" : "Edit Lead"}
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

      <Section title="Lead Information">
        <Field label="Lead Owner" required>
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
        <Field label="Company">
          <input
            value={form.company_name}
            onChange={(e) => update("company_name", e.target.value)}
            className={inputClass}
            placeholder="ABC Technologies Pvt Ltd"
          />
        </Field>

        <Field label="Name">
          <input
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            className={inputClass}
            placeholder="John Davis"
          />
        </Field>
        <Field label="Email" required>
          <input
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            className={inputClass}
            placeholder="john.davis@abctech.com"
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
        <Field label="Fax">
          <input
            value={form.fax}
            onChange={(e) => update("fax", e.target.value)}
            className={inputClass}
          />
        </Field>

        <Field label="Phone">
          <input
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            className={inputClass}
            placeholder="+914412345678"
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

        <Field label="Mobile">
          <input
            value={form.mobile_number}
            onChange={(e) => update("mobile_number", e.target.value)}
            className={inputClass}
            placeholder="+919876543210"
          />
        </Field>
        <Field label="Lead Status">
          <select
            value={form.lead_status}
            onChange={(e) => update("lead_status", e.target.value as LeadStatus)}
            className={inputClass}
          >
            {LEAD_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Lead Source">
          <select
            value={form.lead_source}
            onChange={(e) => update("lead_source", e.target.value as LeadSource)}
            className={inputClass}
          >
            {LEAD_SOURCES.map((source) => (
              <option key={source} value={source}>
                {source}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Rating">
          <select
            value={form.rating}
            onChange={(e) => update("rating", e.target.value as LeadRating | "")}
            className={inputClass}
          >
            <option value="">-None-</option>
            {LEAD_RATINGS.map((rating) => (
              <option key={rating} value={rating}>
                {rating}
              </option>
            ))}
          </select>
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
            value={form.number_of_employees}
            onChange={(e) => update("number_of_employees", e.target.value)}
            className={inputClass}
            placeholder="150"
          />
        </Field>

        <Field label="Annual Revenue">
          <input
            type="number"
            min="0"
            value={form.annual_revenue}
            onChange={(e) => update("annual_revenue", e.target.value)}
            className={inputClass}
            placeholder="10000000"
          />
        </Field>
      </Section>

      <Section title="Address Information">
        <Field label="Country / Region">
          <input
            value={form.country}
            onChange={(e) => update("country", e.target.value)}
            className={inputClass}
            placeholder="India"
          />
        </Field>
        <Field label="City">
          <input
            value={form.city}
            onChange={(e) => update("city", e.target.value)}
            className={inputClass}
            placeholder="Chennai"
          />
        </Field>

        <Field label="Address" fullWidth>
          <input
            value={form.address}
            onChange={(e) => update("address", e.target.value)}
            className={inputClass}
            placeholder="12 MG Road"
          />
        </Field>

        <Field label="State / Province">
          <input
            value={form.state}
            onChange={(e) => update("state", e.target.value)}
            className={inputClass}
            placeholder="Tamil Nadu"
          />
        </Field>
        <Field label="Zip / Postal Code">
          <input
            value={form.postal_code}
            onChange={(e) => update("postal_code", e.target.value)}
            className={inputClass}
            placeholder="600001"
          />
        </Field>
      </Section>

      <Section title="Description Information" last>
        <Field label="Description" fullWidth>
          <textarea
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            className={`${inputClass} min-h-[96px] resize-y`}
            placeholder="Potential enterprise software customer."
          />
        </Field>
      </Section>
    </form>
  );
}

const inputClass =
  "w-full rounded-md border border-line bg-white px-3 py-2.5 text-sm text-ink outline-none transition focus:border-slate focus:ring-2 focus:ring-slate-light";

function Section({
  title,
  children,
  last = false,
}: {
  title: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div className={`mt-6 ${last ? "" : "border-b border-line pb-6"}`}>
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-ink-soft">
        {title}
      </h3>
      <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">{children}</div>
    </div>
  );
}

function Field({
  label,
  children,
  required = false,
  fullWidth = false,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  fullWidth?: boolean;
}) {
  return (
    <label className={`block ${fullWidth ? "sm:col-span-2" : ""}`}>
      <span className="mb-1.5 block text-sm font-medium text-ink">
        {label}
        {required && <span className="text-danger"> *</span>}
      </span>
      {children}
    </label>
  );
}
