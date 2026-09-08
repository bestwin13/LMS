"use client";

import { useState } from "react";
import { LogOut, Search } from "lucide-react";
import type { AuthUser } from "@/features/auth/types/auth.types";

interface DashboardHeaderProps {
  user: AuthUser;
  onLogout: () => void;
}

/**
 * Persistent top bar shown next to the Sidebar. Navigation between
 * Home/Leads/Contacts/Accounts now lives in the Sidebar — this bar only
 * holds global search and the account menu, same as Zoho's header.
 */
export default function DashboardHeader({ user, onLogout }: DashboardHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="flex items-center justify-between border-b border-line bg-white px-6 py-3">
      <div className="relative w-full max-w-sm">
        <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
        <input
          placeholder="Search records…"
          className="w-full rounded-md border border-line bg-paper py-2 pl-9 pr-3 text-sm outline-none focus:border-slate focus:bg-white focus:ring-2 focus:ring-slate-light"
        />
      </div>

      <div className="relative">
        <button
          onClick={() => setIsMenuOpen((v) => !v)}
          className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-paper"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-light text-sm font-semibold text-slate">
            {user.name.slice(0, 1).toUpperCase()}
          </div>
          <div className="text-left">
            <p className="text-sm font-medium leading-tight text-ink">{user.name}</p>
            <p className="text-xs leading-tight text-ink-soft">{user.role}</p>
          </div>
        </button>

        {isMenuOpen && (
          <div className="absolute right-0 top-full z-20 mt-1 w-40 rounded-md border border-line bg-white p-1 shadow-lg">
            <button
              onClick={onLogout}
              className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm text-danger hover:bg-danger-soft"
            >
              <LogOut size={14} /> Log out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
