import { runAdBriefAgent, type AdBriefInput } from "./agents/adBriefAgent";
import { runAdCopyAgent } from "./agents/adCopyAgent";
import { runAdLayoutAgent } from "./agents/adLayoutAgent";
import type { VisualPipelineResult } from "@/types/agents";
import type { BrandProfile } from "@prisma/client";

/**
 * Run the visual content pipeline with 3 specialized subagents.
 * Flow: Brief Agent → Copy Agent + Layout Agent (parallel)
 */
export async function runVisualPipeline(
  input: AdBriefInput,
  brandProfile: BrandProfile
): Promise<VisualPipelineResult> {
  const pipelineStart = Date.now();

  // Stage 1: Analyze the ad brief
  const briefResult = await runAdBriefAgent(input);

  // Stage 2: Fan out — Copy + Layout in parallel
  const [copyResult, layoutResult] = await Promise.all([
    runAdCopyAgent(briefResult.data, brandProfile.brandVoice),
    runAdLayoutAgent(briefResult.data, {
      primary: brandProfile.primaryColor,
      accent: brandProfile.accentColor,
      background: brandProfile.backgroundColor,
    }),
  ]);

  const allResults = [briefResult, copyResult, layoutResult];
  const totalTokens = allResults.reduce((sum, r) => sum + r.tokenUsage.total, 0);

  return {
    brief: briefResult,
    copy: copyResult,
    layout: layoutResult,
    totalTokens,
    totalDurationMs: Date.now() - pipelineStart,
  };
}
