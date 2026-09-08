"use client";

import { useRouter } from "next/navigation";
import LeadForm from "@/features/leads/components/LeadForm";
import { LeadService } from "@/features/leads/services/LeadService";
import type { CreateLeadPayload } from "@/features/leads/types/lead.types";

export default function NewLeadPage() {
  const router = useRouter();

  async function handleSubmit(payload: CreateLeadPayload) {
    await LeadService.createLead(payload);
    router.push("/dashboard/leads?created=1");
  }

  return (
    <div className="mx-auto max-w-4xl rounded-lg border border-line bg-white p-6">
      <LeadForm mode="create" onSubmit={handleSubmit} onCancel={() => router.back()} />
    </div>
  );
}
