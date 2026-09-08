import { apiClient } from "@/infrastructure/api/client";
import type {
  CreateLeadPayload,
  Lead,
  UpdateLeadPayload,
} from "@/features/leads/types/lead.types";

export const LeadService = {
  async getLeads(): Promise<Lead[]> {
    const { data } = await apiClient.get<Lead[]>("/leads/");
    return data;
  },

  async getLead(id: string): Promise<Lead> {
    const { data } = await apiClient.get<Lead>(`/leads/${id}/`);
    return data;
  },

  async createLead(payload: CreateLeadPayload): Promise<Lead> {
    const { data } = await apiClient.post<Lead>("/leads/create/", payload);
    return data;
  },

  async updateLead(id: string, payload: UpdateLeadPayload): Promise<Lead> {
    const { data } = await apiClient.patch<Lead>(`/leads/${id}/update/`, payload);
    return data;
  },

  async deleteLead(id: string): Promise<void> {
    await apiClient.delete(`/leads/${id}/delete/`);
  },
};
