import { runBriefAnalyst, type BriefAnalystInput } from "./agents/briefAnalyst";
import { runSubjectLineAgent } from "./agents/subjectLineAgent";
import { runCopyAgent } from "./agents/copyAgent";
import { runLayoutAgent } from "./agents/layoutAgent";
import { runHtmlAssemblyAgent } from "./agents/htmlAssemblyAgent";
import { runQaAgent } from "./agents/qaAgent";
import { buildEmailAgentContextBundle } from "./email-agent-loader";
import type { PipelineResult } from "@/types/agents";
import type { BrandProfile } from "@prisma/client";

/** Progress callback for streaming updates to the client */
export type ProgressCallback = (stage: string, progress: number) => void;

/**
 * Run the full email generation pipeline with 6 specialized subagents.
 *
 * Flow:
 * 1. Brief Analyst (sequential, all others depend on this)
 * 2. Subject Line + Copy + Layout (parallel fan out)
 * 3. HTML Assembly (sequential, needs copy + layout)
 * 4. QA (sequential, needs assembled HTML)
 */
export async function runEmailPipeline(
  input: BriefAnalystInput,
  brandProfile: BrandProfile,
  campaignType: string = "PROMOTIONAL",
  onProgress?: ProgressCallback
): Promise<PipelineResult> {
  const pipelineStart = Date.now();
  const emailAgentBundle = await buildEmailAgentContextBundle({
    campaignType,
    goal: input.goal,
    keyMessage: input.keyMessage,
    additionalNotes: input.additionalNotes,
  });

  // Stage 1: Analyze the brief
  onProgress?.("analyzing", 10);
  const briefResult = await runBriefAnalyst(input, emailAgentBundle.briefContext);

  // Stage 2: Fan out - Subject Lines + Copy + Layout in parallel
  onProgress?.("writing-copy", 30);
  const [subjectResult, copyResult, layoutResult] = await Promise.all([
    runSubjectLineAgent(briefResult.data, emailAgentBundle.subjectContext),
    runCopyAgent(briefResult.data, brandProfile.brandVoice, emailAgentBundle.copyContext),
    runLayoutAgent(briefResult.data, campaignType, emailAgentBundle.layoutContext),
  ]);

  // Stage 3: Assemble HTML
  onProgress?.("assembling", 70);
  const htmlResult = await runHtmlAssemblyAgent(
    copyResult.data,
    layoutResult.data,
    {
      primaryColor: brandProfile.primaryColor,
      secondaryColor: brandProfile.secondaryColor,
      accentColor: brandProfile.accentColor,
      backgroundColor: brandProfile.backgroundColor,
      textColor: brandProfile.textColor,
      fontFamily: brandProfile.fontFamily,
      fontSizeBase: brandProfile.fontSizeBase,
      logoUrl: brandProfile.logoUrl,
      siteUrl: brandProfile.siteUrl,
      ctaStyle: brandProfile.ctaStyle,
    },
    emailAgentBundle.htmlContext
  );

  // Stage 4: QA check
  onProgress?.("qa-check", 90);
  const qaResult = await runQaAgent(htmlResult.data, emailAgentBundle.qaContext);

  // Calculate totals
  const allResults = [briefResult, subjectResult, copyResult, layoutResult, htmlResult, qaResult];
  const totalTokens = allResults.reduce((sum, result) => sum + result.tokenUsage.total, 0);
  const totalDurationMs = Date.now() - pipelineStart;

  onProgress?.("complete", 100);

  return {
    brief: briefResult,
    subjectLines: subjectResult,
    copy: copyResult,
    layout: layoutResult,
    html: htmlResult,
    qa: qaResult,
    totalTokens,
    totalDurationMs,
  };
}
