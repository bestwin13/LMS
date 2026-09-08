"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  ChevronDown,
  Contact2,
  Home,
  Plus,
  Users as UsersIcon,
} from "lucide-react";
import type { AuthUser } from "@/features/auth/types/auth.types";
import { isSuperAdmin } from "@/features/auth/types/auth.types";
import { teamspaceService } from "@/features/teamspace/services/teamspaceService";
import type { Teamspace } from "@/features/teamspace/types/teamspace.types";

interface SidebarProps {
  user: AuthUser;
}

const NAV_ITEMS = [
  { href: "/dashboard/leads", label: "Leads", icon: UsersIcon },
  { href: "/dashboard/contacts", label: "Contacts", icon: Contact2 },
  { href: "/dashboard/accounts", label: "Accounts", icon: Building2 },
];

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const [teamspaces, setTeamspaces] = useState<Teamspace[]>([]);
  const [active, setActive] = useState<Teamspace | null>(null);
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    setTeamspaces(teamspaceService.list());
    setActive(teamspaceService.getActive());
  }, []);

  function handleSelect(teamspace: Teamspace) {
    teamspaceService.setActive(teamspace.id);
    setActive(teamspace);
    setIsSwitcherOpen(false);
  }

  function handleCreate() {
    const name = newName.trim();
    if (!name) return;
    const teamspace = teamspaceService.create(name);
    setTeamspaces(teamspaceService.list());
    setActive(teamspace);
    setNewName("");
    setIsCreating(false);
    setIsSwitcherOpen(false);
  }

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-line bg-white">
      <div className="flex items-center gap-2 px-5 py-5">
        <span className="font-serif text-xl text-ink">Meridian</span>
      </div>

      <nav className="px-3">
        <SidebarLink href="/dashboard" icon={Home} label="Home" isActive={pathname === "/dashboard"} />
      </nav>

      <div className="mt-6 px-3">
        <div className="relative">
          <button
            onClick={() => setIsSwitcherOpen((v) => !v)}
            className="flex w-full items-center justify-between rounded-md px-2 py-2 text-left text-xs font-semibold uppercase tracking-wide text-ink-soft hover:bg-paper"
          >
            <span className="truncate">{active?.name ?? "Teamspace"}</span>
            <ChevronDown size={14} />
          </button>

          {isSwitcherOpen && (
            <div className="absolute left-0 right-0 top-full z-20 mt-1 rounded-md border border-line bg-white p-1 shadow-lg">
              {teamspaces.map((teamspace) => (
                <button
                  key={teamspace.id}
                  onClick={() => handleSelect(teamspace)}
                  className={`block w-full rounded px-2 py-1.5 text-left text-sm ${
                    teamspace.id === active?.id
                      ? "bg-slate-light text-ink"
                      : "text-ink hover:bg-paper"
                  }`}
                >
                  {teamspace.name}
                </button>
              ))}

              {isSuperAdmin(user) && (
                <div className="mt-1 border-t border-line pt-1">
                  {isCreating ? (
                    <div className="flex gap-1 p-1">
                      <input
                        autoFocus
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                        placeholder="Teamspace name"
                        className="w-full rounded border border-line px-2 py-1 text-sm outline-none focus:border-slate"
                      />
                      <button
                        onClick={handleCreate}
                        className="rounded bg-ink px-2 text-xs font-semibold text-white"
                      >
                        Add
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsCreating(true)}
                      className="flex w-full items-center gap-1.5 rounded px-2 py-1.5 text-left text-sm font-medium text-slate hover:bg-paper"
                    >
                      <Plus size={14} /> Create Teamspace
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <nav className="mt-1 space-y-0.5">
          {NAV_ITEMS.map((item) => (
            <SidebarLink
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              isActive={pathname.startsWith(item.href)}
            />
          ))}
        </nav>
      </div>
    </aside>
  );
}

function SidebarLink({
  href,
  icon: Icon,
  label,
  isActive,
}: {
  href: string;
  icon: typeof Home;
  label: string;
  isActive: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition ${
        isActive ? "bg-ink text-white" : "text-ink hover:bg-paper"
      }`}
    >
      <Icon size={16} />
      {label}
    </Link>
  );
}
