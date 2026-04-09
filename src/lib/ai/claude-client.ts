import Anthropic from "@anthropic-ai/sdk";

let clientInstance: Anthropic | null = null;

/** Get or create the Anthropic Claude client singleton */
export function getClaudeClient(): Anthropic {
  if (!clientInstance) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY is not configured");
    }
    clientInstance = new Anthropic({ apiKey });
  }
  return clientInstance;
}

/** Model to use for email generation */
export const CLAUDE_MODEL = "claude-sonnet-4-20250514";

/** Maximum tokens for email generation */
export const MAX_TOKENS = 4096;

/** Maximum retries on transient failures */
export const MAX_RETRIES = 3;

/**
 * Call Claude API with retry logic for transient failures.
 * Returns the text content from the response.
 */
export async function callClaude(
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number = MAX_TOKENS
): Promise<string> {
  const client = getClaudeClient();
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await client.messages.create({
        model: CLAUDE_MODEL,
        max_tokens: maxTokens,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: userPrompt,
          },
        ],
      });

      // Extract text content from the response
      const textBlock = response.content.find((block) => block.type === "text");
      if (!textBlock || textBlock.type !== "text") {
        throw new Error("No text content in Claude response");
      }

      return textBlock.text;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry on client errors (4xx)
      if (error instanceof Anthropic.APIError && error.status < 500) {
        throw error;
      }

      // Wait before retry with exponential backoff
      if (attempt < MAX_RETRIES - 1) {
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, attempt) * 1000)
        );
      }
    }
  }

  throw lastError || new Error("Claude API call failed after retries");
}
