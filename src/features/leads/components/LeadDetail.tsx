"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, MoreVertical } from "lucide-react";
import { LeadService } from "@/features/leads/services/LeadService";
import { LEAD_STATUS_PIPELINE, type Lead, type LeadStatus } from "@/features/leads/types/lead.types";

interface LeadDetailProps {
  lead: Lead;
  onLeadChange: (lead: Lead) => void;
}

export default function LeadDetail({ lead, onLeadChange }: LeadDetailProps) {
  const router = useRouter();
  const [showDetails, setShowDetails] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  async function handleStatusClick(status: LeadStatus) {
    if (status === lead.lead_status || isUpdatingStatus) return;
    setIsUpdatingStatus(true);
    try {
      const updated = await LeadService.updateLead(lead.id, { lead_status: status });
      onLeadChange(updated);
    } catch {
      window.alert("Couldn't update the lead status. Try again.");
    } finally {
      setIsUpdatingStatus(false);
    }
  }

  async function handleDelete() {
    setIsMenuOpen(false);
    if (!window.confirm(`Delete ${lead.name || lead.email}? This can't be undone.`)) return;
    try {
      await LeadService.deleteLead(lead.id);
      router.push("/dashboard/leads");
    } catch {
      window.alert("Couldn't delete this lead. Try again.");
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      <Link href="/dashboard/leads" className="text-sm text-slate hover:text-ink">
        ← Back to Leads
      </Link>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-light text-lg font-semibold text-slate">
            {(lead.name || lead.email || "?").slice(0, 1).toUpperCase()}
          </div>
          <div>
            <h1 className="font-serif text-2xl text-ink">
              {lead.name || "(No name)"}
              {lead.company_name && (
                <span className="ml-2 text-lg text-ink-soft">- {lead.company_name}</span>
              )}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/leads/${lead.id}/edit`}
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

      {/* Status pipeline */}
      <div className="mt-6 flex overflow-x-auto rounded-md border border-line bg-white">
        {LEAD_STATUS_PIPELINE.map((status) => (
          <button
            key={status}
            onClick={() => handleStatusClick(status)}
            className={`flex-1 whitespace-nowrap border-r border-line px-3 py-2.5 text-center text-xs font-medium last:border-r-0 ${
              status === lead.lead_status
                ? "bg-ink text-white"
                : "text-ink-soft hover:bg-paper"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Overview */}
      <div className="mt-4 rounded-lg border border-line bg-white p-6">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-ink-soft">
          Overview
        </h2>
        <div className="grid grid-cols-1 gap-y-3 sm:grid-cols-2">
          <Row label="Lead Owner" value={lead.owner?.name} />
          <Row label="Email" value={lead.email} />
          <Row label="Phone" value={lead.phone} />
          <Row label="Mobile" value={lead.mobile_number} />
          <Row label="Lead Status" value={lead.lead_status} />
        </div>
      </div>

      {/* Hide / show full details */}
      <button
        onClick={() => setShowDetails((v) => !v)}
        className="mt-4 flex items-center gap-1 text-sm font-medium text-slate hover:text-ink"
      >
        {showDetails ? "Hide Details" : "Show Details"}
        <ChevronDown size={14} className={`transition ${showDetails ? "rotate-180" : ""}`} />
      </button>

      {showDetails && (
        <div className="mt-4 space-y-4">
          <DetailSection title="Lead Information">
            <Row label="Lead Owner" value={lead.owner?.name} />
            <Row label="Company" value={lead.company_name} />
            <Row label="Name" value={lead.name} />
            <Row label="Email" value={lead.email} />
            <Row label="Title" value={lead.title} />
            <Row label="Fax" value={lead.fax} />
            <Row label="Phone" value={lead.phone} />
            <Row label="Website" value={lead.website} />
            <Row label="Mobile" value={lead.mobile_number} />
            <Row label="Lead Status" value={lead.lead_status} />
            <Row label="Lead Source" value={lead.lead_source} />
            <Row label="Rating" value={lead.rating} />
            <Row label="Industry" value={lead.industry} />
            <Row label="No. of Employees" value={lead.number_of_employees?.toString()} />
            <Row label="Annual Revenue" value={lead.annual_revenue?.toString()} />
          </DetailSection>

          <DetailSection title="Address Information">
            <Row label="Address" value={lead.address} />
            <Row label="City" value={lead.city} />
            <Row label="State" value={lead.state} />
            <Row label="Country" value={lead.country} />
            <Row label="Zip Code" value={lead.postal_code} />
          </DetailSection>

          <DetailSection title="Description Information">
            <Row label="Description" value={lead.description} fullWidth />
          </DetailSection>

          <DetailSection title="System Information">
            <Row label="Created At" value={formatDate(lead.created_at)} />
            <Row label="Updated At" value={formatDate(lead.updated_at)} />
          </DetailSection>
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

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-line bg-white p-6">
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-ink-soft">{title}</h3>
      <div className="grid grid-cols-1 gap-y-3 sm:grid-cols-2">{children}</div>
    </div>
  );
}

function Row({
  label,
  value,
  fullWidth = false,
}: {
  label: string;
  value?: string | null;
  fullWidth?: boolean;
}) {
  return (
    <div className={fullWidth ? "sm:col-span-2" : ""}>
      <p className="text-xs text-ink-soft">{label}</p>
      <p className="text-sm text-ink">{value?.trim() ? value : "—"}</p>
    </div>
  );
}
