// Enum values mirrored 1:1 from the backend's domain enums
// (lead_source.py, lead_status.py, lead_rating.py, lead_industry.py)
// so the dropdowns can never send a value the API will reject.

export const LEAD_SOURCES = [
  "None",
  "Advertisement",
  "Cold Call",
  "Employee Referral",
  "External Referral",
  "Online Store",
  "Partner",
  "Public Relations",
  "Sales Email Alias",
  "Seminar Partner",
  "Internal Seminar",
  "Trade Show",
  "Web Download",
  "Web Research",
  "Chat",
  "X (Twitter)",
  "Facebook",
] as const;

export type LeadSource = (typeof LEAD_SOURCES)[number];

export const LEAD_STATUSES = [
  "None",
  "Attempted to Contact",
  "Contact in Future",
  "Contacted",
  "Junk Lead",
  "Lost Lead",
  "Not Contacted",
  "Pre-Qualified",
  "Not Qualified",
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const LEAD_RATINGS = [
  "None",
  "Acquired",
  "Active",
  "Market Failed",
  "Project Cancelled",
  "Shut Down",
] as const;

export type LeadRating = (typeof LEAD_RATINGS)[number];

export const LEAD_INDUSTRIES = [
  "None",
  "ASP (Application Service Provider)",
  "Data/Telecom OEM",
  "ERP (Enterprise Resource Planning)",
  "Government/Military",
  "Large Enterprise",
  "Management",
  "ISV",
  "MSP (Management Service Provider)",
  "Network Equipment Enterprise",
  "Non-management ISV",
  "Optical Networking",
  "Service Provider",
  "Small/Medium Enterprise",
  "Storage Equipment",
  "Storage Service Provider",
  "Systems Integrator",
  "Wireless Industry",
  "ERP",
  "Management ISV",
] as const;

export type LeadIndustry = (typeof LEAD_INDUSTRIES)[number];

/** The pipeline strip shown across the top of a lead's detail page. */
export const LEAD_STATUS_PIPELINE = [
  "Attempted to Contact",
  "Contact in Future",
  "Contacted",
  "Junk Lead",
  "Lost Lead",
  "Not Contacted",
  "Pre-Qualified",
  "Not Qualified",
] as const;

export interface LeadOwner {
  id: string;
  name: string;
  email?: string;
}

export interface Lead {
  id: string;
  name: string;
  title: string | null;
  company_name: string;
  email: string;
  mobile_number: string | null;
  phone: string | null;
  fax: string | null;
  website: string | null;
  lead_source: LeadSource;
  lead_status: LeadStatus;
  industry: LeadIndustry | null;
  rating: LeadRating | null;
  number_of_employees: number | null;
  annual_revenue: number | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postal_code: string | null;
  description: string | null;
  owner: LeadOwner;
  created_at: string;
  updated_at: string;
}

/**
 * Only email and owner_id are mandatory — every other field is optional,
 * matching how the backend team wants lead creation to behave.
 */
export interface CreateLeadPayload {
  email: string;
  owner_id: string;
  name?: string;
  title?: string | null;
  company_name?: string;
  mobile_number?: string | null;
  phone?: string | null;
  fax?: string | null;
  website?: string | null;
  lead_source?: LeadSource;
  lead_status?: LeadStatus;
  industry?: LeadIndustry | null;
  rating?: LeadRating | null;
  number_of_employees?: number | null;
  annual_revenue?: number | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postal_code?: string | null;
  description?: string | null;
}

export type UpdateLeadPayload = Partial<CreateLeadPayload>;
