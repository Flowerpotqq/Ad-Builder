import { z } from "zod";

// ============================================================================
// Agent Result Wrapper
// ============================================================================

/** Generic wrapper for all agent outputs — includes token usage and timing */
export interface AgentResult<T> {
  data: T;
  tokenUsage: { input: number; output: number; total: number };
  durationMs: number;
  agentName: string;
}

/** Typed error class for agent failures */
export class AgentError extends Error {
  agentName: string;
  rawResponse: string | null;

  constructor(agentName: string, message: string, rawResponse: string | null = null) {
    super(`[${agentName}] ${message}`);
    this.name = "AgentError";
    this.agentName = agentName;
    this.rawResponse = rawResponse;
  }
}

// ============================================================================
// Phase 10 — Email Generation Subagents
// ============================================================================

/** Agent 1: Brief Analyst output */
export const briefAnalystOutputSchema = z.object({
  tone: z.string(),
  primaryGoal: z.string(),
  audienceSegment: z.string(),
  ctaAction: z.string(),
  keyBenefits: z.array(z.string()),
});
export type BriefAnalystOutput = z.infer<typeof briefAnalystOutputSchema>;

/** Agent 2: Subject Line Agent output */
export const subjectLineAgentOutputSchema = z.array(
  z.object({
    subject: z.string(),
    previewText: z.string(),
    tone: z.string(),
  })
);
export type SubjectLineAgentOutput = z.infer<typeof subjectLineAgentOutputSchema>;

/** Agent 3: Copy Agent output */
export const copyAgentOutputSchema = z.object({
  headline: z.string(),
  subheadline: z.string(),
  body: z.string(),
  ctaText: z.string(),
  ps: z.string().optional(),
});
export type CopyAgentOutput = z.infer<typeof copyAgentOutputSchema>;

/** Agent 4: Layout Agent output */
export const layoutAgentOutputSchema = z.object({
  sections: z.array(z.string()),
  layoutNotes: z.string().optional(),
});
export type LayoutAgentOutput = z.infer<typeof layoutAgentOutputSchema>;

/** Agent 5: HTML Assembly Agent output (raw HTML string) */
export type HtmlAssemblyAgentOutput = string;

/** Agent 6: QA Agent output */
export const qaAgentOutputSchema = z.object({
  spamTriggers: z.array(z.string()),
  mobileIssues: z.array(z.string()),
  ctaClarity: z.number(),
  brandConsistency: z.number(),
  suggestedFixes: z.array(z.string()),
  overallScore: z.number(),
});
export type QaAgentOutput = z.infer<typeof qaAgentOutputSchema>;

/** Full email pipeline result */
export interface PipelineResult {
  brief: AgentResult<BriefAnalystOutput>;
  subjectLines: AgentResult<SubjectLineAgentOutput>;
  copy: AgentResult<CopyAgentOutput>;
  layout: AgentResult<LayoutAgentOutput>;
  html: AgentResult<HtmlAssemblyAgentOutput>;
  qa: AgentResult<QaAgentOutput>;
  totalTokens: number;
  totalDurationMs: number;
}

// ============================================================================
// Phase 11 — Visual Content Studio Subagents
// ============================================================================

/** Visual Agent 1: Ad Brief Agent output */
export const adBriefAgentOutputSchema = z.object({
  platform: z.enum(["facebook", "tiktok"]),
  format: z.string(),
  visualType: z.string(),
  headline: z.string(),
  subtext: z.string(),
  ctaText: z.string(),
  statOrProof: z.string().optional(),
  targetAudience: z.string(),
  urgencyLine: z.string().optional(),
  brandTone: z.string(),
});
export type AdBriefAgentOutput = z.infer<typeof adBriefAgentOutputSchema>;

/** Visual Agent 2: Ad Copy Refinement Agent output */
export const adCopyAgentOutputSchema = z.object({
  headline: z.string(),
  subtext: z.string(),
  ctaText: z.string(),
  hook: z.string(),
  urgencyLine: z.string(),
});
export type AdCopyAgentOutput = z.infer<typeof adCopyAgentOutputSchema>;

/** Visual Agent 3: Ad Layout Selector Agent output */
export const adLayoutAgentOutputSchema = z.object({
  template: z.string(),
  colorScheme: z.object({
    background: z.string(),
    text: z.string(),
    accent: z.string(),
    cta: z.string(),
  }),
  iconStyle: z.string(),
  layoutVariant: z.string(),
});
export type AdLayoutAgentOutput = z.infer<typeof adLayoutAgentOutputSchema>;

/** Full visual pipeline result */
export interface VisualPipelineResult {
  brief: AgentResult<AdBriefAgentOutput>;
  copy: AgentResult<AdCopyAgentOutput>;
  layout: AgentResult<AdLayoutAgentOutput>;
  totalTokens: number;
  totalDurationMs: number;
}
