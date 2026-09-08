"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MoreVertical } from "lucide-react";
import type { Contact } from "@/features/contacts/types/contact.types";
import { ContactService } from "@/features/contacts/services/ContactService";

interface ContactListProps {
  contacts: Contact[];
  isLoading: boolean;
  onContactDeleted: (id: string) => void;
}

const PAGE_SIZE = 10;

export default function ContactList({ contacts, isLoading, onContactDeleted }: ContactListProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return contacts.filter((c) =>
      `${c.first_name} ${c.last_name} ${c.email}`.toLowerCase().includes(q)
    );
  }, [contacts, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(pageStart, pageStart + PAGE_SIZE);

  async function handleDelete(contact: Contact) {
    setOpenMenuId(null);
    if (!window.confirm(`Delete ${contact.first_name} ${contact.last_name}?`)) return;
    await ContactService.deleteContact(contact.id);
    onContactDeleted(contact.id);
  }

  return (
    <div className="rounded-lg border border-line bg-white">
      <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-xl text-ink">Contacts</h1>
          <p className="text-sm text-ink-soft">
            {filtered.length} total {filtered.length === 1 ? "contact" : "contacts"}
          </p>
        </div>
        <div className="flex gap-2">
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search contacts…"
            className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-slate focus:ring-2 focus:ring-slate-light sm:w-56"
          />
          <Link
            href="/dashboard/contacts/new"
            className="whitespace-nowrap rounded-md bg-amber px-4 py-2 text-sm font-semibold text-ink hover:bg-amber-dark"
          >
            + Create Contact
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3 p-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-10 animate-pulse rounded-md bg-paper" />
          ))}
        </div>
      ) : pageItems.length === 0 ? (
        <div className="flex flex-col items-center gap-3 px-4 py-16 text-center">
          <p className="font-serif text-lg text-ink">No contacts yet</p>
          <p className="max-w-sm text-sm text-ink-soft">
            Contacts you convert from leads, or add directly, show up here.
          </p>
          <Link
            href="/dashboard/contacts/new"
            className="mt-1 rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-ink-2"
          >
            + Create Contact
          </Link>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs font-semibold uppercase tracking-wide text-ink-soft">
                  <th className="w-10 px-4 py-3" />
                  <th className="px-4 py-3">Contact Name</th>
                  <th className="px-4 py-3">Account</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Contact Owner</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((contact) => (
                  <tr key={contact.id} className="group border-b border-line last:border-0 hover:bg-paper">
                    <td className="relative px-4 py-3">
                      <button
                        onClick={() => setOpenMenuId((v) => (v === contact.id ? null : contact.id))}
                        className="rounded p-1 text-ink-soft opacity-0 hover:bg-line group-hover:opacity-100"
                      >
                        <MoreVertical size={16} />
                      </button>
                      {openMenuId === contact.id && (
                        <div className="absolute left-4 top-full z-20 w-32 rounded-md border border-line bg-white py-1 shadow-lg">
                          <button
                            onClick={() => router.push(`/dashboard/contacts/${contact.id}?edit=1`)}
                            className="block w-full px-3 py-1.5 text-left text-sm text-ink hover:bg-paper"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(contact)}
                            className="block w-full px-3 py-1.5 text-left text-sm text-danger hover:bg-danger-soft"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/dashboard/contacts/${contact.id}`}
                        className="font-medium text-slate hover:underline"
                      >
                        {contact.first_name} {contact.last_name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-ink-soft">{contact.account_name || "—"}</td>
                    <td className="px-4 py-3 text-ink-soft">{contact.email || "—"}</td>
                    <td className="px-4 py-3 text-ink-soft">{contact.phone || "—"}</td>
                    <td className="px-4 py-3 text-ink-soft">{contact.owner?.name ?? "Unassigned"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-line px-4 py-3 text-sm text-ink-soft">
            <span>Total Records {filtered.length}</span>
            <div className="flex items-center gap-3">
              <span>
                {pageStart + 1} to {Math.min(pageStart + PAGE_SIZE, filtered.length)}
              </span>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="rounded border border-line px-2 py-1 disabled:opacity-40"
              >
                ‹
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="rounded border border-line px-2 py-1 disabled:opacity-40"
              >
                ›
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
