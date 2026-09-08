"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, MoreVertical } from "lucide-react";
import { ContactService } from "@/features/contacts/services/ContactService";
import type { Contact } from "@/features/contacts/types/contact.types";

interface ContactDetailProps {
  contact: Contact;
}

export default function ContactDetail({ contact }: ContactDetailProps) {
  const router = useRouter();
  const [showDetails, setShowDetails] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  async function handleDelete() {
    setIsMenuOpen(false);
    if (!window.confirm(`Delete ${contact.first_name} ${contact.last_name}?`)) return;
    await ContactService.deleteContact(contact.id);
    router.push("/dashboard/contacts");
  }

  return (
    <div className="mx-auto max-w-5xl">
      <Link href="/dashboard/contacts" className="text-sm text-slate hover:text-ink">
        ← Back to Contacts
      </Link>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-light text-lg font-semibold text-slate">
            {(contact.first_name || contact.email || "?").slice(0, 1).toUpperCase()}
          </div>
          <div>
            <h1 className="font-serif text-2xl text-ink">
              {contact.first_name} {contact.last_name}
              {contact.account_name && (
                <span className="ml-2 text-lg text-ink-soft">- {contact.account_name}</span>
              )}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/contacts/${contact.id}?edit=1`}
            className="rounded-md border border-line px-4 py-2 text-sm font-medium text-ink hover:bg-paper"
          >
            Edit
          </Link>
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen((v) => !v)}
              className="rounded-md border border-line p-2 text-ink-soft hover:bg-paper"
            >
              <MoreVertical size={16} />
            </button>
            {isMenuOpen && (
              <div className="absolute right-0 top-full z-20 mt-1 w-36 rounded-md border border-line bg-white py-1 shadow-lg">
                <button
                  onClick={handleDelete}
                  className="block w-full px-3 py-1.5 text-left text-sm text-danger hover:bg-danger-soft"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-line bg-white p-6">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-ink-soft">
          Overview
        </h2>
        <div className="grid grid-cols-1 gap-y-3 sm:grid-cols-2">
          <Row label="Contact Owner" value={contact.owner?.name} />
          <Row label="Email" value={contact.email} />
          <Row label="Phone" value={contact.phone} />
          <Row label="Mobile" value={contact.mobile} />
        </div>
      </div>

      <button
        onClick={() => setShowDetails((v) => !v)}
        className="mt-4 flex items-center gap-1 text-sm font-medium text-slate hover:text-ink"
      >
        {showDetails ? "Hide Details" : "Show Details"}
        <ChevronDown size={14} className={`transition ${showDetails ? "rotate-180" : ""}`} />
      </button>

      {showDetails && (
        <div className="mt-4 rounded-lg border border-line bg-white p-6">
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-ink-soft">
            Contact Information
          </h3>
          <div className="grid grid-cols-1 gap-y-3 sm:grid-cols-2">
            <Row label="Contact Owner" value={contact.owner?.name} />
            <Row label="Account Name" value={contact.account_name} />
            <Row label="First Name" value={contact.first_name} />
            <Row label="Last Name" value={contact.last_name} />
            <Row label="Email" value={contact.email} />
            <Row label="Title" value={contact.title} />
            <Row label="Phone" value={contact.phone} />
            <Row label="Mobile" value={contact.mobile} />
            <Row label="Created At" value={formatDate(contact.created_at)} />
            <Row label="Updated At" value={formatDate(contact.updated_at)} />
          </div>
        </div>
      )}
    </div>
  );
}

function formatDate(value: string): string {
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-xs text-ink-soft">{label}</p>
      <p className="text-sm text-ink">{value?.trim() ? value : "—"}</p>
    </div>
  );
}
