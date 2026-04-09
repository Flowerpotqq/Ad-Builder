import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { getClaudeClient, CLAUDE_MODEL } from "@/lib/ai/claude-client";
import { AgentError, type AgentResult } from "@/types/agents";

/**
 * Base function for running a subagent — calls Claude, validates output, returns typed result.
 * Retries once if JSON parsing fails, then throws AgentError.
 */
export async function runAgent<T>(options: {
  agentName: string;
  systemPrompt: string;
  userPrompt: string;
  outputSchema: z.ZodType<T>;
  maxTokens?: number;
  parseAsHtml?: boolean;
}): Promise<AgentResult<T>> {
  const { agentName, systemPrompt, userPrompt, outputSchema, maxTokens = 1024, parseAsHtml = false } = options;
  const client = getClaudeClient();
  const startTime = Date.now();

  let lastRawResponse = "";

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await client.messages.create({
        model: CLAUDE_MODEL,
        max_tokens: maxTokens,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      });

      const textBlock = response.content.find((b) => b.type === "text");
      if (!textBlock || textBlock.type !== "text") {
        throw new Error("No text content in response");
      }

      lastRawResponse = textBlock.text;

      // Calculate token usage
      const tokenUsage = {
        input: response.usage.input_tokens,
        output: response.usage.output_tokens,
        total: response.usage.input_tokens + response.usage.output_tokens,
      };

      if (parseAsHtml) {
        // For HTML output, skip JSON parsing
        const data = lastRawResponse as unknown as T;
        return {
          data,
          tokenUsage,
          durationMs: Date.now() - startTime,
          agentName,
        };
      }

      // Extract JSON from response (handle code fences)
      let jsonStr = lastRawResponse.trim();
      const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1].trim();
      }

      const parsed = JSON.parse(jsonStr);
      const validated = outputSchema.parse(parsed);

      return {
        data: validated,
        tokenUsage,
        durationMs: Date.now() - startTime,
        agentName,
      };
    } catch (error) {
      if (attempt === 0) continue; // Retry once

      throw new AgentError(
        agentName,
        error instanceof Error ? error.message : "Unknown error",
        lastRawResponse
      );
    }
  }

  throw new AgentError(agentName, "Exhausted retries", lastRawResponse);
}
