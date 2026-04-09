import type {
  Campaign,
  CampaignStatus,
  CampaignType,
  BrandProfile,
  Contact,
  ContactList,
  EmailEvent,
  Template,
  User,
} from "@prisma/client";

// Re-export Prisma types for convenience
export type {
  Campaign,
  CampaignStatus,
  CampaignType,
  BrandProfile,
  Contact,
  ContactList,
  EmailEvent,
  Template,
  User,
};

/** API response wrapper */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  detail?: string;
}

/** Campaign with computed stats */
export interface CampaignWithStats extends Campaign {
  openRate: number;
  clickRate: number;
}

/** Contact list with contact count */
export interface ContactListWithCount extends ContactList {
  _count: {
    contacts: number;
  };
}

/** Email generation request */
export interface GenerateEmailRequest {
  goal: string;
  audience: string;
  keyMessage: string;
  ctaText: string;
  tone?: string;
  additionalNotes?: string;
}

/** Email refinement request */
export interface RefineEmailRequest {
  htmlContent: string;
  instruction: string;
  section?: string;
}

/** Subject line suggestion response */
export interface SubjectLineSuggestion {
  subject: string;
  reasoning: string;
}

/** Campaign brief form data */
export interface CampaignBrief {
  goal: string;
  audience: string;
  keyMessage: string;
  ctaText: string;
  tone?: string;
  additionalNotes?: string;
}

/** Send settings for a campaign */
export interface SendSettings {
  subject: string;
  previewText: string;
  fromName: string;
  fromEmail: string;
  contactListId: string;
  scheduledAt?: string;
}
